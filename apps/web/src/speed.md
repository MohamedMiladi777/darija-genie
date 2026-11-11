# ⚡ Voice API Speed Log

> Live record of the voice→text pipeline performance (Vochai ASR behind the
> Genie Chat mic button). **Baseline is frozen** — every improvement gets a
> new row below it, measured the same way, so progress stays honest.
>
> Full methodology & commands: [`docs/voice-api-performance.md`](../../docs/voice-api-performance.md)

---

## 📊 At a glance

| | |
|---|---|
| **User wait (4 s clip, app route)** | **~3.5 s** *(was 4.5 s before cycle 1)* |
| Direct API, same clip | ~3.3 s |
| Our overhead to eliminate | ~0 s ✅ |
| Dominant cost | Vochai `transcribe` (2.5–10 s, variable — not ours) |
| Real-time factor | ≈ 0.9× |

---

## 🧪 Baseline runs — 2026-11-10

Test clip: `benchmarks/vochai/samples/salam.mp3` (4.08 s Darija greeting) —
the app's typical use case.

### A · Direct Vochai (no app in between)

`bash scripts/benchmark-vochai.sh 3`

| sample | run | WER % | CER % | upload ms | transcribe ms | total ms |
|---|---|---:|---:|---:|---:|---:|
| salam.mp3 | 1 | 83.3 | 31.6 ⚠️ | 567 | 3967 | 4534 |
| salam.mp3 | 2 | 50.0 | 5.3 | 586 | 3142 | 3728 |
| salam.mp3 | 3 | 50.0 | 5.3 | 588 | 2837 | 3425 |
| test-speech.mp3 | 1 | 0.0 | 0.0 | 417 | 2899 | 3316 |
| test-speech.mp3 | 2 | 0.0 | 0.0 | 386 | 9897 | 10283 |
| test-speech.mp3 | 3 | 0.0 | 0.0 | 391 | 2484 | 2875 |

> ⚠️ Run 1 of `salam.mp3` produced a degraded transcript from the *same
> clean file* — Vochai is non-deterministic. Medians only, never single runs.
> (`test-speech.mp3` = 7.0 s formal MSA clip — the clean-audio ceiling.)

### B · Through our route (what users actually wait)

```bash
curl -X POST http://localhost:3000/api/geniechat/transcribe \
  -F "file=@benchmarks/vochai/samples/salam.mp3"
```

| run | route total | Vochai `processing_time` | transcript |
|---|---:|---:|---|
| 1 | 4.23 s | 2.32 s | سلام كيف داير؟ لاباس؟ بخير؟ |
| 2 | 4.45 s | 3.98 s | سلام كيف داير؟ لا باس؟ بخير؟ |
| 3 | 5.05 s | 4.50 s | سلام كيف داير لاباس بخير |

**Median: 4.45 s** → our overhead vs direct API ≈ **0.7 s**
(upload ≈ 0.58 s stable · transcribe ≈ 2.5–10 s, dominant & variable)

---

## 🔄 Improvement log

> **Rules:** one change per cycle · re-measure with the exact commands in
> the methodology doc · fill a row *after* the numbers exist · never edit
> past rows. Baseline (cycle 0) stays as the reference.

| Cycle | Date | Change | Route median (4 s clip) | Direct median | CER spot-check | Verdict |
|---|---|---|---|---|---|---|
| **0** | 2026-11-10 | *baseline (no changes)* | **4.45 s** | **3.32 s** | 5.3% | 📌 reference |
| 1 | 2026-11-11 | Route fast-path: stream browser body straight to Vochai, skip `formData()` parse + re-encode | **3.54 s** (warm: 3.55, 2.97, 4.80, 3.53) | 3.32 s | 0.0% | ✅ **−0.9 s (−20%)** |
| 2 | 2026-11-11 | *A/B only, no code change:* silence-trimmed clip vs original | n/a | 3.21 s (trimmed) | **21.1%** ⚠️ | ❌ **rejected** — no speed gain, accuracy worse |
| 3 | 2026-11-11 | Preconnect to Vochai on page load (`react-dom/preconnect`) | 3.67 s — unchanged | 3.32 s | ~0–5% | ✅ accepted — browser first-call gain only (not visible to curl harness) |
| 4 | 2026-11-11 | Retry policy: 429/500/502/504 with `Retry-After` backoff, max 2 retries | 3.67 s — unchanged | 3.32 s | ~0–5% | ✅ accepted — reliability, no happy-path change |
| 5 | — | — | — | — | — | — |

> **Cycle 1 notes:** first request measured 13.6 s — that is dev-mode
> recompilation of the changed route, excluded as a warm-up artifact.
> With the fast path the route is now **no slower than calling Vochai
> directly**: the ~0.7 s implementation overhead is gone. CER 0.0% is a
> favorable Vochai variance draw, not a proven accuracy change (see §4 of
> the methodology doc).
>
> **Cycle 2 notes (negative result, kept as evidence):** trimmed 0.74 s of
> lead-in silence off `salam.mp3` (4.08 s → 3.35 s). Vochai got **no
> faster** (transcribe 3.4–5.1 s vs 3.3–5.3 s untrimmed) and transcribed
> *worse* — CER 21.1% on both runs, hallucinating extra words
> (`كل شيء بخير` / `كلشي بخير`). Lead-in audio appears to carry useful
> acoustic context for the model. Browser-side trimming (backlog #3) is
> therefore **dropped**, not implemented.

### Candidate backlog

| # | Idea | Expected gain | Status |
|---|---|---|---|
| 1 | Route fast-path (stream file through, skip re-parsing) | ~0.3–0.5 s/call | ✅ **done — cycle 1: −0.9 s measured** |
| 2 | Preconnect to `aui-transcription-api.fly.dev` | ~0.1–0.3 s (first call) | ✅ **done — cycle 3** |
| 3 | Trim silence in browser before upload (Web Audio API) | unknown — A/B required | ❌ **rejected — cycle 2: no speed gain, CER 5% → 21%** |
| 4 | Retry policy per Vochai docs (429/500/502/504 + backoff) | reliability | ✅ **done — cycle 4** |
| 5 | Transcribe-stage variance → honest UI expectations | perceived speed | ☐ pending (last controllable item) |

*Rejected: parallel upload — Vochai's `/transcribe` requires the `audio_uri`
from `/upload`; the pipeline is inherently sequential.*

**Where we stand:** the wait is now ≈100% Vochai processing time (2.5–10 s,
variable). Our controllable slice is optimized. The only remaining lever is
#5 — manage expectations in the UI during the long tail.
