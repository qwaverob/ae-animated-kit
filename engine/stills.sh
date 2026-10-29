#!/usr/bin/env bash
# QA stills BEFORE the full render (fast). Look at the sheet, fix, then render.
#   engine/stills.sh carousel <slug>   -> out/<slug>/qa/stills.png (every slide at 0 s and 2.5 s)
#   engine/stills.sh video <slug>      -> out/<slug>/qa/stills.png (every scene at its middle)
set -euo pipefail
. "$(dirname "$0")/env.sh"
KIND="$1"; SLUG="$2"; ROOT="$(cd "$(dirname "$0")/.." && pwd)"; OUT="$ROOT/out/$SLUG"; S="$OUT/qa/stills"
HF="npx -y hyperframes@0.8"; command -v hyperframes >/dev/null 2>&1 && HF="hyperframes"
rm -rf "$S"; mkdir -p "$S"
if [ "$KIND" = carousel ]; then
  for d in "$OUT"/carousel/slide-*/; do n="$(basename "$d")"
    $HF snapshot "$d" --at 0,2.5 --no-end -o "$S/$n" >/dev/null 2>&1 || { echo "snapshot failed for $n"; exit 1; }
  done
  python3 - "$S" "$OUT/qa/stills.png" 4 360 450 'slide-*/*.png' <<'PY'
import sys,glob,subprocess
S,out,cols,w,h,pat=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),int(sys.argv[5]),sys.argv[6]
tiles=sorted(t for t in glob.glob(S+'/'+pat) if '/frame-' in t)
ins=[];[ins.extend(['-i',t]) for t in tiles]; n=len(tiles)
lay='|'.join(f"{(i%cols)*w}_{(i//cols)*h}" for i in range(n))
subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',''.join(f'[{i}:v]scale={w}:{h}[v{i}];' for i in range(n))+''.join(f'[v{i}]' for i in range(n))+f'xstack=inputs={n}:layout={lay}:fill=white',out],check=True)
PY
else
  AT=$(node -e "const p=require('$OUT/video/plan.json');console.log(p.scenes.map(s=>((s.start+s.end)/2).toFixed(2)).join(','))")
  $HF snapshot "$OUT/video" --at "$AT" --no-end -o "$S" >/dev/null 2>&1 || { echo "snapshot failed"; exit 1; }
  python3 - "$S" "$OUT/qa/stills.png" 5 270 480 '*.png' <<'PY'
import sys,glob,subprocess
S,out,cols,w,h,pat=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),int(sys.argv[5]),sys.argv[6]
tiles=sorted(t for t in glob.glob(S+'/'+pat) if '/frame-' in t)
ins=[];[ins.extend(['-i',t]) for t in tiles]; n=len(tiles)
lay='|'.join(f"{(i%cols)*w}_{(i//cols)*h}" for i in range(n))
subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',''.join(f'[{i}:v]scale={w}:{h}[v{i}];' for i in range(n))+''.join(f'[v{i}]' for i in range(n))+f'xstack=inputs={n}:layout={lay}:fill=white',out],check=True)
PY
fi
echo "stills sheet: $OUT/qa/stills.png  (open it and check every frame before rendering)"
