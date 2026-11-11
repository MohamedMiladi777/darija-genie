#!/usr/bin/env bash
# Direct Vochai live test — record from the mic, verify quality, transcribe.
#
# Usage:
#   bash scripts/vochai-live-test.sh          # 5 s recording
#   bash scripts/vochai-live-test.sh 10       # 10 s recording
#
# Records via PipeWire (the same input your browser/meeting app uses),
# checks for clipping (the #1 ASR killer), then uploads + transcribes
# directly against the Vochai API and prints the transcript.

set -euo pipefail
cd "$(dirname "$0")/.."

SECONDS_TO_RECORD="${1:-5}"
OUT="/tmp/opencode/vochai-live-test.wav"
BASE="https://aui-transcription-api.fly.dev/api/v1"

if [ -z "${VOCHAI_API_KEY:-}" ]; then
  # shellcheck disable=SC1091
  VOCHAI_API_KEY=$(grep '^VOCHAI_API_KEY' apps/web/.env.local | cut -d= -f2)
  export VOCHAI_API_KEY
fi

echo "🎙️  Recording ${SECONDS_TO_RECORD}s — SPEAK NOW (or stay silent to test the noise floor)"
timeout "$SECONDS_TO_RECORD" parecord \
  --format=s16le --rate=44100 --channels=2 \
  --device=alsa_input.pci-0000_06_00.6.analog-stereo \
  "$OUT" 2>/dev/null || true

# --- quality check: clipping + level -------------------------------------
python3 - "$OUT" <<'PY'
import sys, wave, struct
w = wave.open(sys.argv[1], 'r')
n = w.getnframes()
raw = w.readframes(n)
samples = struct.unpack('<%dh' % (len(raw) // 2), raw)
peak = max(abs(s) for s in samples)
clipped = sum(1 for s in samples if abs(s) >= 32000) / max(1, len(samples)) * 100
duration = n / w.getframerate()
print(f"\n📋 Audio check: {duration:.1f}s, peak {peak}/32767 ({100*peak/32767:.0f}%), clipped {clipped:.2f}%")
if clipped >= 0.5:
    print("   ❌ CLIPPING — turn down the mic input level; ASR will struggle")
elif peak < 500:
    print("   ⚠️  very quiet — speak louder/closer or raise input level")
else:
    print("   ✅ healthy level, no clipping")
PY

# --- upload + transcribe --------------------------------------------------
echo "⏳ Uploading to Vochai..."
UPLOAD_START=$(date +%s%N)
UPLOAD=$(curl -sS -X POST "$BASE/upload" \
  -H "Authorization: Bearer $VOCHAI_API_KEY" \
  -F "file=@$OUT")
UPLOAD_MS=$(( ($(date +%s%N) - UPLOAD_START) / 1000000 ))

URI=$(printf '%s' "$UPLOAD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('audio_uri',''))")
if [ -z "$URI" ]; then
  echo "❌ Upload failed: $(printf '%s' "$UPLOAD" | head -c 200)"
  exit 1
fi
echo "   uploaded in ${UPLOAD_MS}ms"

echo "⏳ Transcribing..."
TRANS_START=$(date +%s%N)
RESULT=$(curl -sS -X POST "$BASE/transcribe" \
  -H "Authorization: Bearer $VOCHAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"audio_uri\":\"$URI\"}")
TRANS_MS=$(( ($(date +%s%N) - TRANS_START) / 1000000 ))

printf '%s' "$RESULT" | python3 - "$UPLOAD_MS" "$TRANS_MS" <<'PY'
import sys, json
upload_ms, transcribe_ms = sys.argv[1], sys.argv[2]
d = json.load(sys.stdin)
t = d.get("transcript", "")
print("\n" + "=" * 50)
print(f"📝 TRANSCRIPT ({d.get('duration_seconds', '?')}s audio, "
      f"Vochai processed in {d.get('processing_time', '?')}s):")
print(t if t.strip() else "   (empty — no speech detected)")
print(f"   [upload {upload_ms}ms + transcribe {transcribe_ms}ms]")
print("=" * 50)
PY
