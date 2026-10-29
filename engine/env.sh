# Source this before running kit commands:  source engine/env.sh
# Adds the kit's own tools (installed without admin rights in ~/.ae-kit) and Homebrew to PATH,
# and loads the ElevenLabs key from this kit's .env file if it exists. Never prints the key.
_dirs="/opt/homebrew/bin /usr/local/bin $HOME/.local/bin"; [ "${AE_KIT_CLEAN_TEST:-0}" = 1 ] && _dirs=""  # test mode: pretend nothing is installed
for _b in $_dirs "$HOME/.ae-kit/bin"; do
  [ -d "$_b" ] && case ":$PATH:" in *":$_b:"*) ;; *) PATH="$_b:$PATH";; esac
done; export PATH; unset _b _dirs
_kit="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." 2>/dev/null && pwd)"
if [ -z "${ELEVENLABS_API_KEY:-}" ] && [ -f "$_kit/.env" ]; then set -a; . "$_kit/.env"; set +a; fi
unset _kit
