# Element consistency rules (adapted from our "Tofu" animated explainer engine)

The Tofu engine gets every element right because the model never draws freely. It fills a script, and the
engine draws from fixed, shared parts. This kit works the same way.

1. **One style, one library.** Every picture comes from `engine/lib/assets.mjs`: flat fills, one 6 px dark ink
   outline (#0F1E36), one palette. No gradients, no photo textures, no 3D, no clip art, no AI images mixed in.
2. **Same model every time.** One house model, one palm model, one cloud. Size and position are set by the
   template, not by you. Max 2 palms per scene, always fully in the frame, never cropped by an edge.
3. **Shared scene kit.** Scenes are templates (`engine/lib/templates.mjs`). You choose a template and props in a
   JSON spec. A template that does not exist makes the build fail loudly instead of guessing.
4. **One weather set per scene.** Sun, clear, rain or storm. Rain and motion are seeded, so every render matches.
5. **Text has its own bands.** Headline band, stage, caption band. Caption keyword highlights cover the whole word.
6. **Stills first.** Run `engine/stills.sh` and look at every slide or scene before the full render.
7. **Contact sheet last.** After render, read `out/<slug>/qa/contact-sheet.png`. Check: nothing clipped, no
   empty frame for more than 1 s, no spelling mistakes, no long dashes, frame 0 of each slide is a finished picture.
8. **Do not invent.** No made-up prices, reviews, warranties or UI. Unknown facts go on the "Check with A&E" list.
9. **No lookalikes.** No copyrighted characters, no real people's faces, no cloned voices, no unlicensed music.
