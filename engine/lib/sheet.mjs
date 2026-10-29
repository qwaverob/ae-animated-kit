// Asset sheet: every prop in the library on one page, for style QA.
import * as A from './assets.mjs';
import { writeFileSync } from 'fs';
import { fontCss } from './page.mjs';
const items = [
  ['house shingle', A.house({ w: 420, roof: 'shingle', damage: ['lifted', 'nailpop'] })], ['house tile', A.house({ w: 420, roof: 'tile' })], ['house metal', A.house({ w: 420, roof: 'metal', damage: ['streaks'] })],
  ['palm', A.palm({ w: 200 })], ['palm 0.8 flip', A.palm({ w: 160, flip: true })], ['cloud', A.cloud({ w: 240 })], ['storm cloud', A.cloud({ w: 240, storm: true })], ['sun', A.sun({ w: 140 })], ['bolt', A.bolt({ w: 70 })],
  ['magnifier', A.magnifier({ w: 200 })], ['phone', A.phone({ w: 160 })], ['camera', A.camera({ w: 200 })], ['photo', A.photoCard({ w: 170, roof: 'tile' })], ['check', A.check({ w: 110 })], ['cross', A.cross({ w: 110 })],
  ['no sign', A.noSign({ w: 180 })], ['ladder', A.ladder({ w: 90 })], ['shield', A.shield({ w: 160 })], ['clipboard', A.clipboard({ w: 200 })], ['calendar', A.calendar({ w: 200 })], ['gift', A.gift({ w: 160 })],
  ['tag', A.tag({ w: 300 })], ['nail', A.nail({ w: 60 })], ['drop', A.drop({ w: 60 })], ['gutter', A.gutter({ w: 360 })], ['swatch shingle', A.swatch({ w: 180 })], ['swatch tile', A.swatch({ w: 180, kind: 'tile' })], ['swatch metal', A.swatch({ w: 180, kind: 'metal' })],
  ['ceiling', A.ceiling({ w: 360 })], ['bubble', A.bubble({ w: 300, text: 'Here is my roof' })],
];
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss('vendor/fonts')}
body{margin:0;background:${A.C.sky};font-family:Poppins;width:1600px}
.g{display:flex;flex-wrap:wrap;gap:24px;padding:24px}.c{background:#fff;border:3px solid #dfe6ee;border-radius:16px;padding:14px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-width:150px}
.c b{font:600 18px Poppins;margin-top:8px;color:#13294B} svg *{vector-effect:non-scaling-stroke}</style></head><body>
<div style="padding:24px 24px 0;font:800 34px Poppins;color:#13294B">A&amp;E asset library (one style, one 6 px outline)</div>
<div style="padding:8px 24px;background:#13294B;margin:12px 24px;border-radius:12px">${A.wordmark({ h: 40 })}</div>
<div class="g">${items.map(([n, s]) => `<div class="c">${s}<b>${n}</b></div>`).join('')}</div></body></html>`;
writeFileSync(process.argv[2] || 'asset-sheet.html', html);
