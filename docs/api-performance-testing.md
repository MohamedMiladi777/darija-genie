# API Performance Testing Process

Documented, repeatable process for measuring and improving the performance of
the external APIs used by Darija Genie. Primary focus: **Vochai speech
recognition** (the most user-visible and quality-sensitive API), with a
section for the **chat LLM** (GenieChat).

## 1. Why this exists

- Voice input accuracy ("transcript doesn't match what I said") is the most
  fragile part of the app. It depends on three layers: **system mic levels →
  browser capture → Vochai model**. When something degrades, we need to know
  *which layer* is responsible before changing anything.
- Latency sets the feel of the voice UX (users wait during "Transcribing…").
- Vochai responses are **non-deterministic** (verified: identical audio can
  produce `كي داير` vs `كيف داير` on different runs). Any accuracy claim
  needs multiple runs.

## 2. What we measure

| Metric | Definition | Tool |
|---|---|---|
| **WER %** | Word Error Rate: normalized reference vs transcript, Levenshtein over words | benchmark script |
| **CER %** | Character Error Rate — same over characters. *More robust for Arabic*, where word-spacing variants (`لا باس` / `لاباس`) inflate WER without real errors | benchmark script |
| **upload ms** | `POST /upload` round trip (multipart file transfer) | benchmark script |
| **transcribe ms** | `POST /transcribe` round trip (the model actually runs here) | benchmark script |
| **total ms** | upload + transcribe (user-perceived server latency) | benchmark script |

**Arabic normalization used before scoring** (so trivial differences don't
count as errors): strip diacritics/punctuation, unify `أ إ آ → ا`, `ى → ي`,
`ة → ه`, lowercase Latin, collapse whitespace.

## 3. Corpus

Samples live in `benchmarks/vochai/samples/`. Each sample is an audio file
(mp3/wav/m4a/webm, ≤50 MB) **plus a reference transcript** with the same
stem and a `.txt` extension (one line, what was actually said).

Current corpus:

| File | Duration | Content | Why it's in the corpus |
|---|---|---|---|
| `salam.mp3` | 4.1 s | Darija greeting (`سلام كي داير لا باس بخير`) | Real user voice, short casual phrase — the app's main use case |
| `test-speech.mp3` | 7.0 s | Formal MSA restaurant request | Clean synthetic speech, longer sentence — accuracy ceiling reference |

**Adding samples:** record the audio, transcribe it *by hand* (not with
Vochai!) into the `.txt`, and use a descriptive filename. Aim for coverage:
short phrases (2–5 s), medium sentences (5–15 s), noisy/quiet conditions,
code-switching (Darija + French/English words — Vochai's specialty).

## 4. Running the benchmark

```bash
bash scripts/benchmark-vochai.sh        # 1 run per sample  (quick check)
bash scripts/benchmark-vochai.sh 3      # 3 runs per sample (latency + variance)
```

The script reads `VOCHAI_API_KEY` from the environment or
`apps/web/.env.local`, runs upload → transcribe for every sample, scores
against the reference, and prints a **markdown table** ready to paste into
this document.

> Note: each run uploads fresh (like the app does). Repeated transcribes of
> an existing `audio_uri` would skip the upload cost — use the appendix
> one-liners if you want to isolate transcribe-only latency.

## 5. Baseline results

Recorded **2026-11-10**, 2 runs per sample (network: local fiber, server:
`aui-transcription-api.fly.dev`):

| sample | run | WER % | CER % | upload ms | transcribe ms | total ms | transcript |
|---|---|---|---|---|---|---|---|
| salam.mp3 | 1 | 16.7 | 5.3 | 505 | 3442 | 3947 | سلام كيف داير لا باس بخير |
| salam.mp3 | 2 | 16.7 | 5.3 | 583 | 3484 | 4067 | سلام، كيف داير؟ لا بأس؟ بخير؟ |
| test-speech.mp3 | 1 | 0.0 | 0.0 | 382 | 7412 | 7794 | مرحبا أريد أن أطلب طعاما للعشاء الفاتورة من فضلك |
| test-speech.mp3 | 2 | 0.0 | 0.0 | 430 | 4430 | 4860 | مرحبا أريد أن أطلب طعاما للعشاء الفاتورة من فضلك |

### Baseline findings

1. **Accuracy ceiling is high** — clean 7 s audio transcribes *perfectly*
   (CER 0.0). The model is not the bottleneck for well-recorded input.
2. **Short casual phrases are good but not perfect** — CER ≈ 5% on the 4 s
   Darija greeting. Non-determinism is real: `كي داير` vs `كيف داير` across
   runs of the same file.
3. **Transcribe latency is variable** — 3.4–7.4 s for the same file. The
   docs promise 4–8 s for 60 s audio; our sub-10 s clips sometimes exceed
   that, so treat latency as noisy and always report medians over ≥3 runs.
4. **Upload is cheap and stable** (~0.4–0.6 s at 130 KB). It is not a
   latency concern at our clip sizes.

## 6. Improvement loop

When a benchmark run looks worse than the baseline, work through the layers
in order — cheapest hypothesis first:

### Layer 1: the recording (most common culprit — verified 2026-11-10)

- **System mic levels**: `amixer -c 1 cget name='Capture Volume'` and
  `'Internal Mic Boost Volume'`. Max gain on this laptop clipped ~18% of
  speech samples — distortion that ASR cannot read. Use
  `/tmp/opencode/mic-check.sh` to verify no clipping (`clipped < 0.5%`)
  with a healthy peak (roughly 20–80% of full scale).
- **Browser DSP**: `getUserMedia` in `genie-chat-dialogue.tsx` runs with
  `echoCancellation/noiseSuppression/autoGainControl` **disabled** —
  Chrome's AGC pumps gain mid-sentence and measurably degraded transcripts.
  Do not re-enable them without re-benchmarking.
- **Clip length**: recordings < 0.8 s are rejected in the UI (accidental
  taps produce garbage transcripts).

### Layer 2: our route (`src/app/api/geniechat/transcribe/route.ts`)

- **Retry policy**: Vochai docs say to retry only `429` (after
  `Retry-After`), `502`, `504`, `500` with backoff. The route currently
  propagates all errors as 502. *Improvement idea:* add the documented
  retry with backoff.
- **Caching**: `audio_uri` is stable per upload. If a user re-records
  within a turn, we could reuse/upload less. Low priority.
- **Timeouts**: route uses 120 s (upload) / 600 s (transcribe) — matches
  Vochai's guidance. No change needed.

### Layer 3: the Vochai service itself

Only escalate to Vochai support after 1 & 2 are cleared, and bring
evidence: sample file, reference, ≥3 runs, CER/WER, timestamps, and request
IDs if available. Non-determinism *within* reasonable variance is not a
bug; a *systematic* mis-transcription of clean audio (CER > 20% on the
ceiling sample) is.

## 7. Chat LLM quick test

The chat API is a single `POST` — no corpus needed, just representative
conversations. Latency + format-compliance check:

```bash
time curl -sS -X POST http://localhost:3000/api/geniechat \
  -H "Content-Type: application/json" \
  -d '{"history":[{"assistant":{"utterance":"سلام! شحال من واحد؟","slots":{"slots":{"greeting":"سلام","action":"ask_slot"}}}},{"user":{"utterance":"سلام، جوج ناس"}}]}'
```

Check per response: (a) reply is Darija Arabic script, (b) `translation`
present, (c) `slots` JSON parses and fills `party_size: 2`, (d) wall time.
Current stack: OpenAI `gpt-4o-mini` (paid, ~1–2 s) with a free Gemini
`gemini-3.8-flash` fallback behind demand spikes.

## 8. Appendix: one-liners

```bash
# Single upload
curl -sS -X POST https://aui-transcription-api.fly.dev/api/v1/upload \
  -H "Authorization: Bearer $VOCHAI_API_KEY" -F "file=@myclip.mp3"

# Transcribe an existing audio_uri
curl -sS -X POST https://aui-transcription-api.fly.dev/api/v1/transcribe \
  -H "Authorization: Bearer $VOCHAI_API_KEY" -H "Content-Type: application/json" \
  -d '{"audio_uri":"vaip://aurora/..."}'

# Service health (no auth)
curl -s https://aui-transcription-api.fly.dev/api/v1/health
```

Rate limits: 60 req/min per token (sliding 60 s window) — keep benchmark
repeats modest, watch the `X-RateLimit-Remaining` header.
