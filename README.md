# A&E animated kit

Animated carousels and animated videos for A&E Brothers Roofing, built with HyperFrames + GSAP and run by an AI
coding agent (Claude Code, including the Code tab in the Claude desktop app, or Codex).

## How to use (3 steps)
1. **Open the Claude app** on your Mac and click **Code** at the top. Under the message box, choose **Local**,
   then click the folder control, choose **Open folder...**, and make or pick an empty folder (for example
   "A&E Content"). The Code tab needs a paid Claude plan.
2. **Paste in** everything from [PROMPT.txt](PROMPT.txt) and press Return. If Claude asks to run something,
   click Allow. The first time it downloads this kit and installs what it needs (about 5 minutes, no password).
3. **Whenever you want**, type: **make a new one**. Pick a number. It makes the files.

A plain Claude chat or Claude Project cannot do this: it has to run commands on your Mac.

## What is inside
| Folder | What |
|---|---|
| `PROMPT.md` / `PROMPT.txt` | The one paste-in prompt |
| `install.sh` | Checks and installs Node 22, FFmpeg, HyperFrames and its render browser into `~/.ae-kit` (no admin rights), copies the skills |
| `.claude/skills/` | `ae-animated-carousels` (5 to 7 slides, 1080x1350 MP4 + PNG) and `ae-animated-videos` (30 to 40 s, 1080x1920, 30 fps, ElevenLabs stock voice) |
| `engine/` | `build.mjs` (spec to HyperFrames), `stills.sh`, `render.sh`, `vo.mjs` (voice), `save-key.sh`, `lib/assets.mjs` (one-style asset library), `lib/templates.mjs` (14 scene templates) |
| `brand/`, `ideas/`, `specs/` | Brand rules, idea bank, example specs |
| `references/` | Element consistency rules and the kinetic explainer reel reference |
| `docs/before-after.png` | Old preview frames vs this kit |

The voice key is saved only in the local, git-ignored `.env`. Fonts: Poppins and Anton (SIL Open Font License).
GSAP: free standard license. No music, no image generators, no cloned voices.

If anything ever looks off, tell it: use the A&E logo and colors on everything.
