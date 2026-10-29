---
name: ae-animated-videos
description: Use when Gaby asks for an A&E animated video or reel, or gives any video idea. Turns the idea into a 30 to 40 second 9:16 animated MP4 (1080x1920, 30 fps) in HyperFrames, with an ElevenLabs stock-voice voiceover by default and a silent copy.
---
# A&E animated videos (reels)

Same art and engine as the carousels, but one vertical video with big word-by-word captions, like Rob's
explainer reels. Gaby is not technical. Short, plain answers. Spanish if she writes in Spanish.

Run every command from the kit folder, and start each one with `source engine/env.sh && `.

Read first: `brand/brand.md`, `engine/TEMPLATES.md`, `references/element-consistency.md`, and the example
`specs/example-granule-loss.json`. Style background: `references/kinetic-ios-explainer-reel/SKILL.md` (pacing,
stills first, QA). In this kit the A&E look replaces the iOS look, and only stock voices are allowed.

## Flow
1. **"Give me new ones" for videos:** 3 numbered ideas from `ideas/idea-bank.md` not in `ideas/used.md` (skip any idea whose topic matches a slug there, even if worded differently),
   one line each. Or take her idea as given.
2. **Write `specs/<slug>.json`** with 6 to 9 scenes:
   - Scene 1 hook lands in 2 seconds (a question or a surprising fact). Last scene = one CTA (`endcard`).
   - `say`: the voiceover line, 8 to 14 words, simple spoken English (or Spanish if asked). 85 to 105 words total.
     Write numbers the way they are said ("three", "A and E Brothers Roofing").
   - `headline`: 6 words max with `**one or two**` orange words. Not the same text as the logo.
   - `keys`: 1 or 2 words from `say` to highlight in the captions.
   - Add `caption` and `check_with_ae` like the carousels.
3. **Voice (on by default):**
   ```
   source engine/env.sh && node engine/vo.mjs specs/<slug>.json      # stock voice "Brian"; writes voice.wav + timing.json
   ```
   If it prints `NO_KEY`, ask her once: "Copy the ElevenLabs key Rob sent you (select it, press Cmd+C), then tell me
   when it is copied." Then run `engine/save-key.sh` (it reads the clipboard and saves the key in the kit's
   git-ignored `.env`, so the key never goes in the chat). Run the voice step again. Never print the key, never
   ask her to paste it into the chat. If she says "no voice" or has no key yet, skip this step: the video comes out silent.
4. **Build and check stills:**
   ```
   source engine/env.sh && node engine/build.mjs video specs/<slug>.json
   source engine/env.sh && engine/stills.sh video <slug>
   ```
   Read `out/<slug>/qa/stills.png` (one still per scene). Fix and rebuild until clean.
5. **Render** (1 to 3 minutes):
   ```
   source engine/env.sh && engine/render.sh video <slug>
   ```
   Read `out/<slug>/qa/contact-sheet.png` (1 frame per second). Check: captions readable and in their band,
   no empty frames, length 30 to 40 s.
6. **Tell Gaby:** `out/<slug>/final/video-with-voice.mp4` (the one to post) and `video-silent.mp4` (if she wants her own audio). Paste the caption and the "Check with A&E" items. Add the slug to `ideas/used.md`.

## Rules
- Only templates and props from `engine/TEMPLATES.md`. Never hand-write HTML or edit `engine/` unless Rob asks.
- Stock ElevenLabs voices only. No cloned voices, no real people's voices, no music downloaded from the internet.
- Same brand rules as carousels: $1,000 needs "Reroof only, minimum 20 squares." on screen, no long dashes,
  no invented facts, never tell people to climb a roof.
