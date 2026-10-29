#!/usr/bin/env bash
# Render a built carousel or video, then make PNG stills and a contact sheet for QA.
#   engine/render.sh carousel <slug> [draft|delivery]
#   engine/render.sh video    <slug> [draft|delivery]
set -euo pipefail
. "$(dirname "$0")/env.sh"
KIND="$1"; SLUG="$2"; Q="${3:-delivery}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; OUT="$ROOT/out/$SLUG"
HF="npx -y hyperframes@0.8"; command -v hyperframes >/dev/null 2>&1 && HF="hyperframes"
if [ "$KIND" = carousel ]; then
  mkdir -p "$OUT/final" "$OUT/qa"
  for d in "$OUT"/carousel/slide-*/; do
    n="$(basename "$d")"
    ( cd "$d" && $HF render --quality "$Q" --fps 30 --output "../$n.raw.mp4" >/dev/null )
    # silent MP4 (no audio track at all, so Instagram lets you add a sound)
    ffmpeg -v error -y -i "$OUT/carousel/$n.raw.mp4" -an -c:v copy -movflags +faststart "$OUT/final/$n.mp4"
    rm -f "$OUT/carousel/$n.raw.mp4"
    # PNG fallback = the finished last frame; frame 0 kept for the cover check
    ffmpeg -v error -y -sseof -0.1 -i "$OUT/final/$n.mp4" -frames:v 1 "$OUT/final/$n.png"
    ffmpeg -v error -y -i "$OUT/final/$n.mp4" -frames:v 1 "$OUT/qa/$n-frame0.png"
    echo "rendered $n"
  done
  # contact sheet: each slide at 0 s, 1.5 s, 3 s, end
  python3 "$ROOT/engine/sheet.py" carousel "$OUT"
else
  mkdir -p "$OUT/final" "$OUT/qa"
  ( cd "$OUT/video" && $HF render --quality "$Q" --fps 30 --output "../final/video-raw.mp4" >/dev/null )
  ffmpeg -v error -y -i "$OUT/final/video-raw.mp4" -an -c:v copy -movflags +faststart "$OUT/final/video-silent.mp4"
  rm -f "$OUT/final/video-raw.mp4"
  if [ -f "$OUT/video/voice.wav" ]; then
    ffmpeg -v error -y -i "$OUT/final/video-silent.mp4" -i "$OUT/video/voice.wav" -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT/final/video-with-voice.mp4"
    echo "made video-with-voice.mp4"
  fi
  ffmpeg -v error -y -i "$OUT/final/video-silent.mp4" -frames:v 1 "$OUT/final/cover.png"
  python3 "$ROOT/engine/sheet.py" video "$OUT"
fi
echo "done: $OUT/final  (QA sheet: $OUT/qa/contact-sheet.png)"
