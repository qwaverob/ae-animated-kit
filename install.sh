#!/usr/bin/env bash
# A&E animated kit installer for macOS. No admin password needed.
# Checks first and only adds what is missing. Tools it adds go in ~/.ae-kit (nothing system-wide).
#   ./install.sh            install, then write .installed
#   ./install.sh --check    only report
set -uo pipefail
KIT="$(cd "$(dirname "$0")" && pwd)"; CHECK=0; [ "${1:-}" = "--check" ] && CHECK=1
T="$HOME/.ae-kit"; BIN="$T/bin"; mkdir -p "$BIN"
. "$KIT/engine/env.sh"
FAILED=0; ok(){ echo "  OK    $1"; }; add(){ echo "  ADD   $1"; }; bad(){ echo "  FAIL  $1"; FAILED=1; }
ARCH=$(uname -m); [ "$ARCH" = x86_64 ] && NARCH=x64 || NARCH=arm64
OS=$(uname | tr '[:upper:]' '[:lower:]')

echo "1. Node.js 22+"
NM=$(node -v 2>/dev/null | sed 's/v\([0-9]*\).*/\1/')
if [ -n "$NM" ] && [ "$NM" -ge 22 ]; then ok "node $(node -v)"
elif [ $CHECK = 1 ]; then add "node"
else add "node (download from nodejs.org into ~/.ae-kit)"
  F=$(curl -fsSL https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt | awk '{print $2}' | grep -E "^node-v22\.[0-9.]+-${OS}-${NARCH}\.tar\.gz$" | head -1)
  if [ -n "$F" ] && curl -fsSL "https://nodejs.org/dist/latest-v22.x/$F" -o "$T/node.tgz" && rm -rf "$T/node" && mkdir -p "$T/node" && tar -xzf "$T/node.tgz" -C "$T/node" --strip-components 1; then
    rm -f "$T/node.tgz"; for b in node npm npx; do ln -sf "$T/node/bin/$b" "$BIN/$b"; done; hash -r; ok "node $(node -v)"
  else bad "could not download Node.js"; fi
fi

echo "2. FFmpeg"
if command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; then ok "ffmpeg found"
elif [ $CHECK = 1 ]; then add "ffmpeg"
else add "ffmpeg (static build via npm into ~/.ae-kit)"
  if npm install --prefix "$T/ff" --no-audit --no-fund ffmpeg-static ffprobe-static >/dev/null 2>&1; then
    ln -sf "$T/ff/node_modules/ffmpeg-static/ffmpeg" "$BIN/ffmpeg"
    ln -sf "$(ls "$T"/ff/node_modules/ffprobe-static/bin/"$OS"/"$NARCH"/ffprobe 2>/dev/null | head -1)" "$BIN/ffprobe"; hash -r
    ffmpeg -version >/dev/null 2>&1 && ffprobe -version >/dev/null 2>&1 && ok "ffmpeg ready" || bad "ffmpeg did not start"
  else bad "could not install ffmpeg"; fi
fi

echo "3. HyperFrames (animation engine)"
if command -v hyperframes >/dev/null 2>&1; then ok "hyperframes $(hyperframes --version 2>/dev/null | head -1) (already there, left as is)"
elif [ $CHECK = 1 ]; then add "hyperframes"
else add "hyperframes (into ~/.ae-kit)"
  if npm install --prefix "$T/hf" --no-audit --no-fund hyperframes@0.8 >/dev/null 2>&1; then ln -sf "$T/hf/node_modules/.bin/hyperframes" "$BIN/hyperframes"; hash -r; ok "hyperframes $(hyperframes --version 2>/dev/null | head -1)"
  else bad "could not install hyperframes"; fi
fi

echo "4. Chrome for rendering"
if [ $CHECK = 1 ]; then hyperframes browser path >/dev/null 2>&1 && ok "found" || add "render browser"
else hyperframes browser ensure >/dev/null 2>&1 && ok "ready" || bad "could not get the render browser"; fi

if [ $CHECK = 0 ]; then
  echo "5. Skills"
  if [ "${AE_KIT_NO_GLOBAL:-0}" = 1 ]; then echo "  skipped global skill copy (test mode)"
  else
    hyperframes skills >/dev/null 2>&1 && ok "HyperFrames animation skills" || echo "  HyperFrames skills skipped (the kit works without them)"
    mkdir -p "$HOME/.claude/skills"
    for s in ae-animated-carousels ae-animated-videos; do d="$HOME/.claude/skills/$s"
      [ -d "$d" ] && mv "$d" "$d.backup-$(date +%Y%m%d%H%M%S)"
      mkdir -p "$d" && cp -R "$KIT/.claude/skills/$s/." "$d/" && printf "\n## Kit folder on this Mac\n%s\nRun every command from there, starting with: source engine/env.sh\n" "$KIT" >> "$d/SKILL.md" && ok "$s"
    done
  fi
  # so a new Claude session in the parent project folder finds the kit
  P="$(dirname "$KIT")"; if [ ! -f "$P/CLAUDE.md" ] && [ -w "$P" ]; then
    printf "# A&E content\nThe kit is in ./%s. Read ./%s/CLAUDE.md and follow it for anything about carousels, videos or \"make a new one\".\n" "$(basename "$KIT")" "$(basename "$KIT")" > "$P/CLAUDE.md"; ok "project note (CLAUDE.md) in $(basename "$P")"; fi
  chmod +x "$KIT"/engine/*.sh "$KIT/install.sh" 2>/dev/null
  echo "6. Test build"
  if (cd "$KIT" && node engine/build.mjs carousel specs/example-storm-photos.json >/dev/null && cd out/example-storm-photos/carousel/slide-01 && hyperframes lint >/dev/null 2>&1); then ok "engine works"; else bad "test build failed"; fi
  [ $FAILED = 0 ] && date > "$KIT/.installed"
fi
echo "Voice: $([ -n "${ELEVENLABS_API_KEY:-}" ] && echo 'key saved (not shown)' || echo 'no key saved yet')"
[ $FAILED = 0 ] && echo "INSTALL_OK" || { echo "INSTALL_FAILED"; exit 1; }
