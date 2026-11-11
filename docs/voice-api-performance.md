# Voice API Performance — Baseline & Improvement Loop

Measures and improves the **speed of the voice→text pipeline** (the Vochai
API behind the Genie Chat mic button). Companion to
[api-performance-testing.md](./api-performance-testing.md) (accuracy
methodology); this file tracks **speed**, the current baseline, and every
improvement iteration.

## 1. What we measure

The user-perceived flow is: *release mic button → wait → text appears*.
That wait is composed of:

```
[recording happens live — not part of the wait]
 └── browser uploads blob ─→ Next.js route (/api/geniechat/transcribe)
      └── route uploads to Vochai /upload      (~0.4–0.6 s, stable)
           └── Vochai /transcribe              (2.5–10 s, variable ← dominant)
                └── response back through the route
```

Metrics:

| Metric | Meaning | How measured |
|---|---|---|
| `upload ms` | app→Vochai `POST /upload` round trip | benchmark script |
| `transcribe ms` | `POST /transcribe` round trip (model runs here) | benchmark script |
| `route total s` | full request through **our** route (what the user waits) | curl to `localhost:3000` |
| **RTF** | real-time factor: `wait ÷ audio duration` (1.0 = wait equals clip length) | derived |
| `CER %` | accuracy spot-check — speed work must not degrade it | benchmark script |

## 2. Current speed — baseline (2026-11-10)

Test clip: `salam.mp3`, **4.08 s** of speech (the app's typical use case).

### A. Direct Vochai (no app in between) — `bash scripts/benchmark-vochai.sh 3`

| sample | run | CER % | upload ms | transcribe ms | total ms |
|---|---|---|---|---|---|
| salam.mp3 | 1 | 31.6* | 567 | 3967 | 4534 |
| salam.mp3 | 2 | 5.3 | 586 | 3142 | 3728 |
| salam.mp3 | 3 | 5.3 | 588 | 2837 | 3425 |
| test-speech.mp3 | 1 | 0.0 | 417 | 2899 | 3316 |
| test-speech.mp3 | 2 | 0.0 | 386 | 9897 | 10283 |
| test-speech.mp3 | 3 | 0.0 | 391 | 2484 | 2875 |

\* one degraded run — see §4.

### B. Through our route (the number users actually feel)

```bash
curl -X POST http://localhost:3000/api/geniechat/transcribe \
  -F "file=@benchmarks/vochai/samples/salam.mp3"   # timed 3×
```

| run | route total | Vochai's own `processing_time` |
|---|---|---|
| 1 | 4.23 s | 2.32 s |
| 2 | 4.45 s | 3.98 s |
| 3 | 5.05 s | 4.50 s |

### Baseline summary

| Figure | Value |
|---|---|
| **User wait for a 4 s clip (median)** | **~4.5 s** |
| Direct API equivalent (median) | ~3.7 s |
| **Our implementation overhead** | **~0.7 s** |
| Upload stage (median) | ~0.58 s — stable, not the problem |
| Transcribe stage (range) | **2.5–10 s — highly variable, dominant cost** |
| Real-time factor (app path) | **≈ 1.1× — user waits slightly longer than the clip lasts** |
| Accuracy spot-check | CER 5.3% typical, 0% clean-audio ceiling (unchanged) |

## 3. Where the time goes (and what we can control)

| Segment | Share of 4.5 s wait | In our control? |
|---|---|---|
| Vochai processing (inside /transcribe) | ~2.3–4.5 s | ❌ their model/queue |
| Vochai upload round trip | ~0.4–0.6 s | ⚠️ partially (smaller payloads) |
| Our route overhead (Next.js hop, JSON, TLS) | ~0.7 s | ✅ yes |
| Mic recording time itself | live, user holds button | ✅ UX only |

## 4. Known quality observation from this session

Run A1 produced a degraded transcript (`سلام كيف راك لباس بيخير`, CER 31.6%)
from the *same file* that scored CER 5.3% twice. **Vochai occasionally
mis-transcribes even clean input** — non-determinism isn't just cosmetic
(`كيف` vs `كي`), it can produce structurally different text. Practical
consequences: (a) report medians, never single runs; (b) don't optimize
speed at the cost of retrying fewer/shorter samples that would mask this.

## 5. Improvement backlog (the iteration plan)

Work top-down; one change per cycle, re-measure §2 after each.

| # | Idea | Expected gain | Cost/risk | Status |
|---|---|---|---|---|
| 1 | **Trim silence** before upload: Web Audio API strips leading/trailing silence in the browser before the blob is sent. Shorter audio → smaller upload, possibly faster Vochai processing | **A/B result: rejected** — no speed gain (3.4–5.1 s vs 3.3–5.3 s) and CER degraded 5% → 21%; lead-in audio carries useful context for the model | low | ❌ rejected (2026-11-11, cycle 2) |
| 2 | **Route fast-path**: skip JSON re-parse; stream the file through | measured **−0.9 s** (4.45 → 3.54 s median) | low | ✅ done (2026-11-11, cycle 1) |
| 3 | **Preconnect**: `<link rel="preconnect">` to `aui-transcription-api.fly.dev` so the browser opens TLS early | ~0.1–0.3 s on first call (browser-side; invisible to the curl harness) | trivial | ✅ done (2026-11-11, cycle 3) |
| 4 | **Retry policy** (from Vochai docs: retry 429/500/502/504 only, with backoff) — reliability, not speed, but prevents user-visible failures from eating "speed" retries in the UI | reliability | low | ✅ done (2026-11-11, cycle 4) |
| 5 | **UX smoothing**: show elapsed timer during "Transcribing…" (exists), disable input minimally — perception of speed when the 10 s tail hits | perceived only | trivial | ☐ not started |
| 6 | Batch/parallel — ❌ rejected: transcribe needs the upload's `audio_uri`; API is inherently sequential | — | — | rejected |

Not controllable: Vochai's processing time and its variance. If the
transcribe stage stays at 2.5–10 s after our improvements, the honest lever
left is **expectation management in the UI**, not engineering.

## 6. Iteration log

> One row per change. Re-run both §2 measurements after each change and
> fill in; keep the *baseline row* untouched as the reference point.

| Cycle | Date | Change | salam route median | test-speech direct median | CER salam | Verdict |
|---|---|---|---|---|---|---|
| 0 | 2026-11-10 | — baseline — | 4.45 s | 3.32 s | 5.3% | reference |
| 1 | | | | | | |
| 2 | | | | | | |

## 7. Re-measuring (exact commands)

```bash
# A) direct API (3 runs/sample)
bash scripts/benchmark-vochai.sh 3

# B) through our route (user-perceived wait), 3× — dev server must be running
KEY=$(grep '^VOCHAI_API_KEY' apps/web/.env.local | cut -d= -f2)
for i in 1 2 3; do
  curl -sS -o /dev/null -w 'route total: %{time_total}s\n' -X POST \
    http://localhost:3000/api/geniechat/transcribe \
    -H "Authorization: Bearer $KEY" \
    -F "file=@benchmarks/vochai/samples/salam.mp3"
done

# health / rate budget
curl -s https://aui-transcription-api.fly.dev/api/v1/health
```

Rate limit: 60 req/min/token — cycles of ~12–20 requests are safe.
