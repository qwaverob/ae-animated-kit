#!/usr/bin/env bash
# One-time: save the ElevenLabs key in this kit's .env (git-ignored, only on this Mac).
#   engine/save-key.sh            reads the key from the clipboard (pbpaste), so it is never typed into a command
#   engine/save-key.sh --stdin    reads it from standard input
set -euo pipefail
KIT="$(cd "$(dirname "$0")/.." && pwd)"
if [ "${1:-}" = "--stdin" ]; then read -r KEY; else KEY="$(pbpaste 2>/dev/null | tr -d '[:space:]')"; fi
case "$KEY" in sk_*|[A-Za-z0-9]*) ;; *) echo "No key found. Copy the ElevenLabs key first, then run this again."; exit 1;; esac
[ ${#KEY} -ge 20 ] || { echo "That does not look like an ElevenLabs key (too short). Nothing saved."; exit 1; }
umask 077; printf "ELEVENLABS_API_KEY=%s\n" "$KEY" > "$KIT/.env"
echo "Saved the voice key in $KIT/.env (only on this Mac, not shared)."
