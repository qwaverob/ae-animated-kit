#!/usr/bin/env python3
"""Contact sheets for QA. Uses ffmpeg only (no extra Python packages)."""
import sys, subprocess, glob, os
kind, out = sys.argv[1], sys.argv[2]
qa = os.path.join(out, 'qa'); os.makedirs(qa, exist_ok=True)
def run(*a): subprocess.run(a, check=True)
if kind == 'carousel':
    slides = sorted(glob.glob(os.path.join(out, 'final', 'slide-*.mp4')))
    tiles = []
    for s in slides:
        for t in (0, 1.5, 3, 4.9):
            p = os.path.join(qa, f"t-{os.path.basename(s)[:-4]}-{t}.png")
            run('ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', s, '-frames:v', '1', '-vf', 'scale=270:-1', p); tiles.append(p)
    ins = []; [ins.extend(['-i', p]) for p in tiles]
    n = len(slides)
    layout = '|'.join(f"{c*270}_{r*338}" for r in range(n) for c in range(4))
    run('ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', f"xstack=inputs={len(tiles)}:layout={layout}:fill=white", os.path.join(qa, 'contact-sheet.png'))
    for p in tiles: os.remove(p)
else:
    v = os.path.join(out, 'final', 'video-silent.mp4')
    run('ffmpeg', '-v', 'error', '-y', '-i', v, '-vf', 'fps=1,scale=216:-1,tile=8x5', '-frames:v', '1', os.path.join(qa, 'contact-sheet.png'))
print('contact sheet:', os.path.join(qa, 'contact-sheet.png'))
