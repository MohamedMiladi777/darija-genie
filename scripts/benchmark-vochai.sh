#!/usr/bin/env bash
# Vochai ASR benchmark runner.
#
# Usage:
#   bash scripts/benchmark-vochai.sh              # 1 run per sample
#   bash scripts/benchmark-vochai.sh 3            # 3 runs per sample (latency stats)
#
# Samples live in benchmarks/vochai/samples/. Each sample must have a
# reference transcript next to it: <name>.txt (plain text, one line).
# Output: a markdown table row per run (WER%, upload ms, transcribe ms).

set -euo pipefail
cd "$(dirname "$0")/.."

SAMPLES_DIR="benchmarks/vochai/samples"
REPEATS="${1:-1}"

if [ -z "${VOCHAI_API_KEY:-}" ]; then
  # shellcheck disable=SC1091
  VOCHAI_API_KEY=$(grep '^VOCHAI_API_KEY' apps/web/.env.local | cut -d= -f2)
  export VOCHAI_API_KEY
fi

BASE="https://aui-transcription-api.fly.dev/api/v1"

echo "| sample | run | WER % | CER % | upload ms | transcribe ms | total ms | transcript |"
echo "|---|---|---|---|---|---|---|---|"

shopt -s nullglob
for audio in "$SAMPLES_DIR"/*.mp3 "$SAMPLES_DIR"/*.wav "$SAMPLES_DIR"/*.m4a "$SAMPLES_DIR"/*.webm; do
  name=$(basename "$audio")
  ref_file="${audio%.*}.txt"
  ref=""
  [ -f "$ref_file" ] && ref=$(cat "$ref_file")

  for run in $(seq 1 "$REPEATS"); do
    # --- upload (timed) ---
    upload_start=$(date +%s%N)
    upload_payload=$(curl -sS -X POST "$BASE/upload" \
      -H "Authorization: Bearer $VOCHAI_API_KEY" \
      -F "file=@$audio")
    upload_end=$(date +%s%N)
    upload_ms=$(( (upload_end - upload_start) / 1000000 ))

    uri=$(printf '%s' "$upload_payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('audio_uri',''))")
    if [ -z "$uri" ]; then
      echo "| $name | $run | ERROR | $upload_ms | - | - | upload failed: $(printf '%s' "$upload_payload" | head -c 120) |"
      continue
    fi

    # --- transcribe (timed) ---
    transcribe_start=$(date +%s%N)
    transcript_payload=$(curl -sS -X POST "$BASE/transcribe" \
      -H "Authorization: Bearer $VOCHAI_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"audio_uri\":\"$uri\"}")
    transcribe_end=$(date +%s%N)
    transcribe_ms=$(( (transcribe_end - transcribe_start) / 1000000 ))

    printf '%s' "$transcript_payload" > /tmp/opencode/vochai-payload.json
    python3 - "$name" "$run" "$upload_ms" "$transcribe_ms" "$ref" <<'PY'
import sys, json

name, run, upload_ms, transcribe_ms, ref = sys.argv[1:6]
with open("/tmp/opencode/vochai-payload.json") as f:
    payload = json.load(f)
transcript = payload.get("transcript", "")

def normalize_ar(text: str) -> str:
    """Aggressive Arabic normalization: drop diacritics/punct, unify letters."""
    import unicodedata
    text = unicodedata.normalize("NFKC", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    for src, dst in [("أ","ا"),("إ","ا"),("آ","ا"),("ى","ي"),("ة","ه"),("ـ","")]:
        text = text.replace(src, dst)
    keep = set("ابتثجحخدذرزسشصضطظعغفقكلمنهوي 0123456789abcdefghijklmnopqrstuvwxyz")
    text = "".join(ch for ch in text.lower() if ch in keep)
    return " ".join(text.split())

def wer(ref: str, hyp: str) -> float:
    """Word error rate via Levenshtein distance on word lists."""
    r, h = normalize_ar(ref).split(), normalize_ar(hyp).split()
    if not r:
        return 0.0 if not h else 1.0
    return levenshtein(r, h) / len(r)

def cer(ref: str, hyp: str) -> float:
    """Character error rate — robust to Arabic word-spacing variants."""
    r, h = normalize_ar(ref).replace(" ", ""), normalize_ar(hyp).replace(" ", "")
    if not r:
        return 0.0 if not h else 1.0
    return levenshtein(r, h) / len(r)

def levenshtein(r, h) -> float:
    d = [[i + j if i * j == 0 else 0 for j in range(len(h) + 1)] for i in range(len(r) + 1)]
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i][j] = min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (r[i-1] != h[j-1]))
    return d[-1][-1]

wer_pct = round(wer(ref, transcript) * 100, 1) if ref else float("nan")
cer_pct = round(cer(ref, transcript) * 100, 1) if ref else float("nan")
total_ms = int(upload_ms) + int(transcribe_ms)
# escape pipes in transcript for the markdown table
safe = transcript.replace("|", "\\|")
print(f"| {name} | {run} | {wer_pct} | {cer_pct} | {upload_ms} | {transcribe_ms} | {total_ms} | {safe} |")
PY
  done
done
