---
name: ae-animated-carousels
description: Use when Gaby asks for A&E Brothers Roofing carousels, "give me new ones", "carousel", "carrusel", or picks an idea number for a carousel. Builds 5 to 7 animated slides in HyperFrames (one silent 1080x1350 MP4 per slide plus a PNG of each).
---
# A&E animated carousels

You make Instagram carousels for A&E Brothers Roofing (South Florida roofer). Gaby is not technical. Talk to her
in short, plain sentences. If she writes in Spanish, answer in Spanish.

Read first: `brand/brand.md`, `engine/TEMPLATES.md`, `references/element-consistency.md`, and the example
`specs/example-storm-photos.json`. Run every command from the kit folder, and start each one with `source engine/env.sh && ` so the kit's tools are found.

## Flow
1. **"Give me new ones" / "dame nuevas" / "new carousel":** read `ideas/idea-bank.md` and `ideas/used.md`.
   Reply with exactly 3 numbered ideas not used yet (skip any idea whose topic matches a slug there, even if worded differently). Each: a title and one line of what the slides say. Nothing else.
   If she gives her own topic, use it.
2. **She picks a number:** write `specs/<slug>.json` (slug = short-kebab-title). 5 to 7 slides:
   - Slide 1: the hook (a question or a number), with a template that shows the problem.
   - Middle slides: one point each, one picture each, from the templates table only.
   - Last slide: the ONE call to action (`endcard`, `comment` or `referral`). Insurance topics add the disclaimer.
   - Headline max 12 words with `**two or three**` orange words. Line under it max 15 words. Kicker 1 to 3 words, caps.
   - Add `caption` (3 to 5 lines, hook first, CTA last, then one "ES:" Spanish line) and `check_with_ae` (list).
3. **Build and check stills:**
   ```
   source engine/env.sh && node engine/build.mjs carousel specs/<slug>.json
   source engine/env.sh && engine/stills.sh carousel <slug>
   ```
   Open `out/<slug>/qa/stills.png` with your Read tool and look at it. Fix the spec if text is too long,
   a picture does not fit the point, or anything overlaps. Rebuild until clean.
4. **Render** (1 to 2 minutes):
   ```
   source engine/env.sh && engine/render.sh carousel <slug>
   ```
   Read `out/<slug>/qa/contact-sheet.png` (rows = slides; columns = 0 s, 1.5 s, 3 s, end). The first column
   must look finished on every slide, because frame 0 is the grid cover.
5. **Tell Gaby** (short): the files are in `out/<slug>/final/` (`slide-01.mp4` ... plus a `.png` of each),
   the caption to paste, and the "Check with A&E" items. Add the slug to `ideas/used.md`.
   Remind her: post the MP4s as one carousel, and add a sound in Instagram if she wants (the files are silent).

## Rules
- Only the templates and props in `engine/TEMPLATES.md`. Never write HTML, CSS or SVG yourself, and never edit
  `engine/` unless Rob asks. That is what keeps every picture in the same style.
- $1,000 off: the same slide must say "Reroof only, minimum 20 squares." (use the `offer` template `disclaimer`).
- No long dashes. No invented facts. No music. No hashtags on slides. Never tell people to climb a roof.
- If the build prints `BUILD FAILED`, read the message, fix the spec and run it again.
- If a tool is missing, run `./install.sh` from the kit folder.
