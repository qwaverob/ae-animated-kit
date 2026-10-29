---
name: kinetic-ios-explainer-reel
description: Use when making a short vertical explainer in the "voice memo to kinetic iOS motion graphics" style (light canvas, white iOS-like cards, grotesk sans with an italic serif accent word, words landing on the spoken word, spring pop-ins, shape morphs, one full-bleed colour break, chat-UI keyword CTA), or when remaking a reference reel in that style. Not for talking-head edits or pixel-character reels.
---

# Kinetic iOS explainer reel

A 30 to 40 s, voiceover-only motion graphics reel. No on-camera person and no characters. The VO drives everything: every visual lands on its spoken word. Built with code (HyperFrames: HTML + CSS + GSAP), so stills and the final render come from the same file.

## When to use
- The brief is "animated explainer, no face", "turn a voice memo into a video", or a reference reel built from iOS-style cards, kinetic type and 3D props.
- Remaking a reference in this format. Load the reference-format-remake skill first: borrow the format, never the script, art, samples, music or voice.

## Hard rules
- Stills before render: build 3 to 4 key frames, put them side by side with the reference (if any), and get the owner's OK before rendering the full video.
- Never post, schedule or upload. Render a preview and hand it over; publishing needs the owner's explicit OK through the scheduling skill.
- Voice: a stock TTS voice, or the owner's own consented clone only if they ask. Never a clone or imitation of anyone else.
- No copyrighted characters, mascots or real people's likeness. Fictional data and invented brand names only, flagged for approval.
- No em dashes in any script, caption or on-screen text.
- Never print API keys. Read them from env files only inside the command that needs them.

## Stack setup
1. **Renderer:** HyperFrames CLI (`npx hyperframes`, Apache-2.0, https://github.com/heygen-com/hyperframes). Needs Node 22+, Chrome, FFmpeg. Run `npx hyperframes skills update` once so coding agents get the hyperframes skills.
2. **Animation:** GSAP 3 (free incl. SplitText, MorphSVG, Flip; https://gsap.com/community/standard-license/). Vendor `gsap.min.js` locally next to the composition.
3. **Word times:** faster-whisper (medium or medium.en, float32, word_timestamps) on the final VO. Pass a decoded numpy array if PyAV rejects file paths.
4. **Stills:** Playwright Chromium screenshot of the composition at `?t=<seconds>` (see `templates/shoot_stills.py`). The composition seeks its paused timeline from the query string.
5. **Starter:** `templates/composition-starter.html` (paused GSAP timeline registered on `window.__timelines`, scenes as `.scene` divs with `data-start` / `data-duration`, scene visibility set on the timeline).

### Asset sources (all free for commercial use; keep licence files next to assets)
- **3D props:** Microsoft Fluent Emoji 3D (MIT, https://github.com/microsoft/fluentui-emoji; PNGs are 256 px, keep them at or under about 400 px on screen) and 3dicons (CC0, https://3dicons.co, larger renders for hero props).
- **UI glyphs:** Lucide (ISC) or Phosphor (MIT). Never SF Symbols or Apple design-kit assets in marketing video.
- **Lottie micro-animations:** LottieFiles free animations (Lottie Simple License) played through the HyperFrames Lottie adapter.
- **Fonts (SIL OFL):** Inter / Inter Tight (sans), Instrument Serif Italic (accent). Alternatives: Geist, Playfair Display, DM Serif Display.
- **SFX:** synthesize your own (pop, thump, whoosh, tick, typing) or use Kenney Interface Sounds / UI Audio (CC0, https://kenney.nl/assets/interface-sounds); Pixabay SFX are fine embedded in a video (no standalone redistribution); Freesound with the CC0 filter.
- **Photos (only if needed):** Unsplash Licence, or one generated image per batch. Prefer code-rendered cards.
- **Music:** usually none. If a bed or tail is used: owned, synthesized, or CC BY with the credit line in the caption.

## Scene and timing template (13 beats, about 35 s)
VO pace about 2.8 words/s (about 93 words). Pauses of 0.3 to 0.6 s at beat changes. Something changes every 0.5 to 1.0 s inside a beat.

| # | Beat | Length | Pattern |
|---|------|--------|---------|
| 1 | HOOK | 3 to 3.5 s | Black frame. Stacked text builds per word, last word in serif italic. Raw-input object below (voice-memo pill, note, prompt box). Hook lands by 2 s |
| 2 | LEAD | 2.5 s | Cut to light canvas. Name the raw input; the object morphs into a phone or device |
| 3 | BODY 1 | 4.5 s | Three counter cards ("X: 0"), one per item, a 3D prop drops in and shrinks into the first tile, numbers pop on the spoken number |
| 4 | Payoff | 2 s | Cards shrink into a phone/feed (zoom-out reveal) to show the result |
| 5 | Thesis setup | 2 s | "Doesn't need X": single glyph + typed line |
| 6 | PATTERN BREAK | 1.4 s | Hard cut to full-bleed accent colour, one huge serif word, pulsing bars. Only full-bleed frame in the reel, near the midpoint |
| 7 to 9 | Proof x3 | 1.7 to 2.7 s each | "Every X, a Y": each line demos its own technique (counter ring; icon to 3D object push-through; karaoke words with a scrubber) |
| 10 | Turn to viewer | 2.5 s | "Your business...": fictional business cards fan in |
| 11 | OFFER | 2.5 s | Callback to the beat 1 object; morph into the delivered result |
| 12 | ID | 1.8 s | Dark frame, brand name, accent serif on the last word |
| 13 | CTA | 4.5 s | Huge keyword, comment/DM thread UI, typing dots, hold about 1.5 to 2 s after the last word |

Scene JSON per line: `{beat, start, end, text, accent_word, elements:[[element_id, anchor_word]]}`. Anchor every element to a forced-aligned word; never time by guess.

## Motion rules
- Entrances: `back.out(2)` pop 0 to about 106% to 100% in 6 to 9 frames; text rises 20 to 40 px with blur(8 to 10 px) to sharp in about 0.3 s (`expo.out`).
- Exits: blur + fade in 4 to 6 frames, or the next beat's hard cut. Two flash/whiteouts per reel at most, one push-through.
- Signature transitions: shape morphs (pill to phone, icon to 3D prop, card stack into a screen). Use MorphSVG or matched scale/position tweens.
- Counters: `ease: "power2.inOut"`, snap to integers, tabular numerals.
- No camera shake, no neon, no glow except a warm "light on" moment.
- Animate transform/opacity/filter only; use `fromTo` with explicit positions so random seeks render right.

## Typography rules
- Sans (Inter Tight / Inter): kicker line weight 500, about 60 px, grey; emphasis 700 to 800, 110 to 150 px, tracking about -0.035em; CTA keyword 230 to 250 px, weight 800.
- Accent: Instrument Serif Italic on the last word of nearly every phrase, about 1.2x the sans size.
- Centred, text block in y 450 to 800 (of 1920), objects in y 850 to 1450. Keep y 1500 to 1920 and the right edge clear of IG UI.
- The kinetic text is the caption. It must match the VO word for word (allowed: dropping filler words). No second subtitle track.
- Karaoke: unspoken `#D1CFD3`, spoken `#1B1A1D`.

## Palette rules
- Canvas `#F4F3F6`, cards `#FDFDFD` with soft shadow (0 18px 40px rgba(20,20,30,.08)), text `#1B1A1D`, kicker grey `#929194`, unspoken grey `#D1CFD3`, hook/ID black `#000000`.
- ONE brand accent for pills, the full-bleed break, CTA bubbles and accent serif on dark (brand colour, for example cyan `#0891B2`). Icon tiles may use neutrals plus tints of the accent. A single warm tone is allowed for "glow" props.

## SFX approach
- Soft low thump on each object landing and on the full-bleed break; light pop on card/bubble pop-ins; tick or typing on typed text; one whoosh/riser into the "your business" turn; optional short music tail under the CTA.
- No continuous music bed by default. SFX ducked under the VO, never on top of a stressed word.

## QA checklist (PASS / FAIL each, before handing over)
- [ ] ffprobe: 1080x1920, 30 fps CFR, H.264 + AAC, duration within the plan (about 33 to 40 s).
- [ ] Loudness: about -14 LUFS integrated (`ebur128=peak=true`), true peak at or under -1 dBTP, no click in the first or last 100 ms.
- [ ] On-screen text matches the VO transcript word for word (re-run faster-whisper on the final mix and diff); spelling checked; no em dashes.
- [ ] Sync: sample 10 anchor words, each visual within 1 frame of its word.
- [ ] 1 fps contact sheet: no blank or frozen stretch over about 1 s, text never clipped, nothing under the IG UI zones.
- [ ] Exactly one full-bleed accent frame; one accent colour; one hero object per beat.
- [ ] Pop-ins settle in 9 frames or less; no shake, neon or motion blur smear.
- [ ] Every invented brand, number and UI string listed for the owner's approval; licence files present for every third-party asset; caption credits any CC BY music.
- [ ] Voice is a stock voice (or the owner's consented clone on request), one continuous take.

## Approval gates
1. Breakdown + script approved.
2. 3 to 4 key-frame stills (and a side-by-side with the reference) approved.
3. Full render preview + QA sheet approved.
4. Only then schedule/post, through the scheduling skill, with the owner's explicit OK. Never from this skill.
