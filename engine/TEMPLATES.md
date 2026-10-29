# Scene templates (the only pictures you can use)

Every slide (carousel) and every scene (video) uses exactly one template. Pictures come only from the shared
asset library, so everything matches. Do not write HTML or SVG. If you need a picture that is not here, pick the
closest template and say so in your reply.

| template | what it shows | props (all optional) |
|---|---|---|
| `house` | The A&E house with ground, palms and weather | `roof`: shingle, tile, metal. `weather`: sun, clear, rain, storm. `palms`: 0, 1, 2. `damage`: list of lifted, missing, streaks, nailpop. `callouts`: up to 3 of `{"label":"Lifted","at":"lifted"}` where `at` is lifted, missing, streaks, nailpop, gutter, chimney, window |
| `closeup` | Close-up of roof material with a magnifier | `roof`. `detail`: nail, granules, lifted, crack, streaks. `label`: short pill text |
| `inside` | Ceiling with a growing stain and a drip | `label` |
| `icon` | One big icon on a disc | `icon`: shield, camera, calendar, gift, clipboard, check, cross, ladder, drop, nail, magnifier, tag. `text` (calendar label), `big`/`small` (tag), `number` (a step number like "1") |
| `compare` | 2 or 3 cards side by side | `items`: list of `{"kind":"shingle|tile|metal","label":"...","note":"..."}` or `{"icon":"check|cross","label":"..."}` |
| `checklist` | Clipboard, boxes tick one by one | `items`: 2 to 5 short lines (5 words max each) |
| `photos` | Camera flashes, 3 photos pop out | `roof` |
| `offer` | House plus a big price tag | `big` (default $1,000), `small` (default OFF A REROOF), `roof`, `disclaimer` (required with $1,000: "Reroof only, minimum 20 squares.") |
| `referral` | Two houses, arrow, gift | `keyword` (default REFER) |
| `yearly` | House plus a calendar with a check | `roof`, `text` (default EVERY YEAR) |
| `phone` | Phone with a roof photo and a reply bubble | `roof`, `reply` (one short sentence) |
| `nogo` | House, ladder and a no sign | `roof`, `label` (example: "Stay on the ground") |
| `comment` | Comment bubble and a big keyword stamp | `keyword` (example: REFER) |
| `endcard` | Wordmark and one call to action | `cta` (example: DM US A PHOTO), `disclaimer` |

## Carousel spec (`specs/<slug>.json`)
See `specs/example-storm-photos.json`. 5 to 7 slides. Each slide: `template`, `props`, `kicker` (1 to 3 words),
`headline` (12 words max, `**orange words**`), `line` (15 words max), optional `disclaimer` (small print).
Top level: `slug`, `title`, `caption`, `check_with_ae` (list).

## Video spec
See `specs/example-granule-loss.json`. 6 to 9 scenes. Each scene: `template`, `props`, optional `kicker`,
`headline` (6 words max), `say` (voiceover and captions, 8 to 14 words), `keys` (words to highlight).
85 to 105 spoken words total = 30 to 40 s.
