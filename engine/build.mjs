#!/usr/bin/env node
// Build HyperFrames projects from a spec.
//   node engine/build.mjs carousel specs/<slug>.json   -> out/<slug>/carousel/slide-NN/index.html
//   node engine/build.mjs video    specs/<slug>.json   -> out/<slug>/video/index.html
// Uses only the shared asset library + scene templates, so every piece matches.
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as A from './lib/assets.mjs';
import { T, BOX, TEMPLATES } from './lib/templates.mjs';
import { fontCss } from './lib/page.mjs';
const HERE = dirname(fileURLToPath(import.meta.url));
const { C } = A;
const [, , kind, specPath] = process.argv;
if (!['carousel', 'video'].includes(kind) || !specPath) { console.error('usage: node engine/build.mjs carousel|video specs/<slug>.json'); process.exit(2); }
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const ROOT = resolve(HERE, '..');
const OUT = join(ROOT, 'out', spec.slug);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const accent = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<span class="acc">$1</span>');
const fail = m => { console.error('BUILD FAILED: ' + m); process.exit(1); };

// ---------- checks every spec must pass ----------
function lint(items, isVideo) {
  const all = JSON.stringify(spec);
  if (/[\u2014\u2013]/.test(all)) fail('long dash found (use a period or comma)');
  if (/\$1,?000/.test(all) && !/minimum 20 squares/i.test(all)) fail('$1,000 off needs "Reroof only, minimum 20 squares." on screen');
  items.forEach((it, i) => {
    if (!TEMPLATES.includes(it.template)) fail(`item ${i + 1}: unknown template "${it.template}". Use one of: ${TEMPLATES.join(', ')}`);
    if (!isVideo && it.headline && it.headline.replace(/\*/g, '').split(/\s+/).length > 12) fail(`slide ${i + 1}: headline over 12 words`);
    if (!isVideo && it.line && it.line.split(/\s+/).length > 15) fail(`slide ${i + 1}: line under over 15 words`);
    if (it.template === 'offer' && /\$1,?000/.test(JSON.stringify(it)) && !/minimum 20 squares/i.test(JSON.stringify(it))) fail(`item ${i + 1}: offer slide/scene must show "Reroof only, minimum 20 squares."`);
  });
}
const CSS = (fontDir) => `${fontCss(fontDir)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{overflow:hidden;background:${C.navy}}
#root{position:relative;width:100%;height:100%;overflow:hidden;background:${C.navy};font-family:Poppins}
svg *{vector-effect:non-scaling-stroke}
.el{position:absolute}.center{display:flex;align-items:center;justify-content:center}
.stage{position:absolute;overflow:hidden}.box{position:absolute;width:${BOX.w}px;height:${BOX.h}px;transform-origin:0 0}
.grass{position:absolute;left:0;right:0;bottom:0;background:${C.grass};border-top:6px solid ${C.ink}}
.pill{display:inline-block;background:${C.orange};color:#fff;border:5px solid ${C.ink};border-radius:999px;padding:6px 22px;font-weight:800;white-space:nowrap;line-height:1.2}
.num{width:120px;height:120px;border-radius:50%;background:${C.orange};border:6px solid ${C.ink};color:#fff;font:400 72px/108px Anton;text-align:center}
.card{background:#fff;border:6px solid ${C.ink};border-radius:28px;display:flex;flex-direction:column;align-items:center;padding-top:24px}
.clabel{font:800 40px Poppins;color:${C.navy};margin-top:18px}.cnote{font:600 26px/1.25 Poppins;color:#46566E;text-align:center;padding:6px 18px}
.clip-board{background:${C.cream};border:6px solid ${C.ink};border-radius:30px;padding-top:70px}
.cbclip{position:absolute;left:250px;top:-26px;width:200px;height:60px;border-radius:14px;background:${C.navy};border:6px solid ${C.ink}}
.crow{display:flex;align-items:center;gap:26px;margin:0 44px 30px}.cbox{width:78px;height:78px;flex:none;border:6px solid ${C.ink};border-radius:16px;background:#fff;position:relative}
.tick{position:absolute;left:1px;top:1px}.ctext{font:700 38px/1.15 Poppins;color:${C.navy}}
.kw{display:inline-block;background:${C.orange};color:#fff;border:6px solid ${C.ink};border-radius:26px;padding:6px 40px;font:400 96px/1.15 Anton;letter-spacing:.02em;box-shadow:0 8px 0 ${C.ink}}
.kw.big{font-size:190px}.kw.big2{font-size:110px;text-align:center;text-wrap:balance;max-width:880px}
.discl{width:680px;font:600 26px/1.2 Poppins;color:${C.navy};background:#fff;border:5px solid ${C.ink};border-radius:16px;padding:8px 16px;text-align:center}
.discl2{font:600 30px/1.3 Poppins;color:#C9D6EA;text-align:center}
.acc{color:${C.orange}}
.kicker{display:inline-block;background:${C.orange};color:#fff;border-radius:999px;padding:6px 20px;font:800 26px/1.2 Poppins;letter-spacing:.06em;white-space:nowrap}
`;
function copyVendor(dir) { mkdirSync(dir, { recursive: true }); cpSync(join(HERE, 'vendor'), join(dir, 'assets'), { recursive: true }); }
function stage(P, it, mode, x, y, w, h) {
  const t = T[it.template](P, it.props || {}, mode);
  const s = Math.min(w / BOX.w, h / BOX.h);
  const bx = (w - BOX.w * s) / 2, by = mode === 'video' ? 10 : (h - BOX.h * s) / 2;
  const groundY = by + BOX.ground * s;
  const html = `<div class="stage" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${t.sky}${mode === 'slide' ? `;border:6px solid ${C.ink};border-radius:36px` : ''}">
    ${t.noGround ? '' : `<div class="grass" style="top:${groundY}px"></div>`}
    <div class="box" style="left:${bx}px;top:${by}px;transform:scale(${s})">${t.html}</div></div>`;
  return { html, anim: t.anim, hero: t.hero };
}

if (kind === 'carousel') {
  const slides = spec.slides || [];
  if (slides.length < 5 || slides.length > 7) fail(`carousel needs 5 to 7 slides (got ${slides.length})`);
  lint(slides, false);
  const W = 1080, H = 1350, D = 5, SETTLE = 3.6;
  slides.forEach((sl, i) => {
    const dir = join(OUT, 'carousel', `slide-${String(i + 1).padStart(2, '0')}`); copyVendor(dir);
    const st = stage('s', sl, 'slide', 40, 40, 1000, 760);
    const last = i === slides.length - 1;
    const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/><title>${esc(spec.title)} ${i + 1}</title>
<script src="assets/gsap.min.js"></script><style>${CSS('assets/fonts')}
.txt{position:absolute;left:56px;top:836px;width:968px}.hl{font:800 70px/1.1 Poppins;color:#fff;margin-top:22px;letter-spacing:-.01em;text-wrap:balance}.ln{font:500 36px/1.3 Poppins;color:#C9D6EA;margin-top:18px}
.foot{position:absolute;left:56px;right:56px;bottom:40px;display:flex;align-items:center;justify-content:space-between}.ctr{font:700 28px Poppins;color:#C9D6EA;border:3px solid #3A5078;border-radius:999px;padding:4px 18px}
.sd{position:absolute;left:56px;width:968px;bottom:104px;font:600 24px/1.25 Poppins;color:#AFC0DA}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-duration="${D}">
 <div id="slide" class="clip" data-start="0" data-duration="${D}" data-track-index="1" style="position:absolute;inset:0">
  ${st.html}
  <div class="txt">${sl.kicker ? `<div class="kicker">${esc(sl.kicker)}</div>` : ''}<div class="hl">${accent(sl.headline)}</div>${sl.line ? `<div class="ln">${accent(sl.line)}</div>` : ''}</div>
  ${sl.disclaimer ? `<div class="sd">${esc(sl.disclaimer)}</div>` : ''}
  <div class="foot">${A.wordmark({ h: 72 })}<div class="ctr">${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}${last ? '' : ' &rarr;'}</div></div>
 </div>
</div>
<script>/* frame 0 must be a finished still (it is the grid cover): the scene is built on an inner
timeline, and the slide starts ${SETTLE} s into it, after every entrance has landed. The 5 s that follow are accents. */
const tl=gsap.timeline({paused:true});const inner=gsap.timeline({paused:true});{const tl=inner;${st.anim(0, D + SETTLE)}${st.hero ? `tl.fromTo("${st.hero} > *",{scale:1},{scale:1.07,duration:0.45,yoyo:true,repeat:3,ease:"sine.inOut"},${SETTLE + 0.7});` : ''}tl.set({}, {}, ${D + SETTLE});}
tl.fromTo(inner,{time:${SETTLE}},{time:${D + SETTLE},duration:${D},ease:"none"},0);window.__timelines["main"]=tl;</script></body></html>`;
    writeFileSync(join(dir, 'index.html'), html);
  });
  console.log(`built ${slides.length} slides -> ${join(OUT, 'carousel')}`);
}

if (kind === 'video') {
  const scenes = spec.scenes || [];
  if (scenes.length < 4) fail('video needs at least 4 scenes');
  lint(scenes, true);
  const W = 1080, H = 1920;
  const timingPath = join(OUT, 'video', 'timing.json');
  const timing = existsSync(timingPath) ? JSON.parse(readFileSync(timingPath, 'utf8')) : null;
  // scene windows: from the voiceover timing if it exists, else from word counts (about 2.7 words a second)
  let t = 0; const win = scenes.map((sc, i) => {
    if (timing) return timing.scenes[i];
    const n = (sc.say || '').split(/\s+/).filter(Boolean).length; const d = Math.min(7, Math.max(2.6, n / 2.7 + 0.6));
    const w = { start: +t.toFixed(3), end: +(t + d).toFixed(3) }; t += d; return w;
  });
  const total = +(win[win.length - 1].end + (timing ? 0.6 : 0)).toFixed(3);
  win[win.length - 1].end = total;
  // captions: 1 to 3 words, broken at punctuation
  const keys = new Set(); scenes.forEach(s => { (s.keys || []).forEach(k => keys.add(k.toLowerCase())); (s.headline || '').replace(/\*\*(.+?)\*\*/g, (_, k) => k.split(/\s+/).forEach(x => keys.add(x.toLowerCase().replace(/[^a-z0-9$,']/g, '')))); });
  const caps = [];
  scenes.forEach((sc, i) => {
    const words = (sc.say || '').replace(/\bA and E\b/g, 'A&E').split(/\s+/).filter(Boolean); if (!words.length) return;
    let chunks = [], cur = [];
    const SMALL = /^(a|an|the|and|or|of|to|with|your|for|in|on|at|is|we|you|it)$/i;
    words.forEach((w, wi) => { cur.push(w); const end = /[.,!?;:]$/.test(w);
      if (end || cur.length === 3) { let carry = null; if (!end && cur.length === 3 && SMALL.test(w) && wi < words.length - 1) carry = cur.pop(); chunks.push(cur); cur = carry ? [carry] : []; } });
    if (cur.length) chunks.push(cur);
    let tw = timing ? timing.words.filter(w => w.scene === i) : null;
    if (tw) { const m = []; for (let q = 0; q < tw.length; q++) { if (tw[q].text === 'A' && tw[q + 1]?.text === 'and' && /^E\b/.test(tw[q + 2]?.text || '')) { m.push({ ...tw[q], text: 'A&E' + tw[q + 2].text.slice(1), end: tw[q + 2].end }); q += 2; } else m.push(tw[q]); } tw = m; }
    let k = 0; const s0 = win[i].start + 0.12, s1 = win[i].end - 0.2, total = chunks.reduce((a, c) => a + c.join(' ').length, 0); let acc = 0;
    chunks.forEach((c, ci) => {
      let a, b;
      if (tw && tw.length >= words.length) { a = tw[k].start; b = ci === chunks.length - 1 ? win[i].end - 0.05 : tw[k + c.length].start; }
      else { a = s0 + (s1 - s0) * acc / total; acc += c.join(' ').length; b = ci === chunks.length - 1 ? win[i].end - 0.02 : s0 + (s1 - s0) * acc / total; }
      k += c.length; caps.push({ a: +a.toFixed(3), b: +Math.max(a + 0.25, b).toFixed(3), words: c });
    });
  });
  const dir = join(OUT, 'video'); copyVendor(dir);
  let scHtml = '', js = '';
  scenes.forEach((sc, i) => {
    const { start, end } = win[i]; const d = +(end - start).toFixed(3); const P = `s${i}`;
    const st = stage(P, sc, 'video', 0, 470, 1080, 1130);
    scHtml += `<div id="sc${i}" class="clip" data-start="${start}" data-duration="${d}" data-track-index="1" style="position:absolute;inset:0"><div id="sc${i}-in" style="position:absolute;inset:0">
      ${st.html}
      <div class="hd">${sc.kicker ? `<div class="kicker">${esc(sc.kicker)}</div>` : ''}<div id="${P}-hl" class="vh">${accent(sc.headline || '')}</div></div></div></div>`;
    if (i > 0) js += `tl.fromTo("#sc${i}-in",{opacity:0,scale:1.04},{opacity:1,scale:1,duration:0.2,ease:"power2.out"},${start});tl.fromTo("#${P}-hl",{y:30,opacity:0},{y:0,opacity:1,duration:0.35,ease:"expo.out"},${start + 0.05});`;
    js += st.anim(start, d);
  });
  let capHtml = '';
  caps.forEach((c, i) => {
    const inner = c.words.map(w => { const k = keys.has(w.toLowerCase().replace(/[^a-z0-9$,']/g, '').replace(/,$/, '')); return `<span class="cw${k ? ' ck' : ''}">${esc(w.replace(/[.,!?;:]+$/, ''))}</span>`; }).join(' ');
    capHtml += `<div id="cap${i}" class="clip" data-start="${c.a}" data-duration="${(c.b - c.a).toFixed(3)}" data-track-index="3" style="position:absolute;left:60px;top:1300px;width:960px;height:180px"><div id="cap${i}-in" class="capin">${inner}</div></div>`;
    js += `tl.fromTo("#cap${i}-in",{scale:0.8},{scale:1,duration:0.12,ease:"back.out(2)"},${c.a});`;
  });
  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/><title>${esc(spec.title)}</title>
<script src="assets/gsap.min.js"></script><style>${CSS('assets/fonts')}
.top{position:absolute;left:0;top:0;width:1080px;height:470px;background:${C.navy}}
.wm{position:absolute;left:60px;top:52px}.hd{position:absolute;left:60px;top:172px;width:960px}
.vh{font:800 68px/1.1 Poppins;color:#fff;margin-top:18px;letter-spacing:-.01em;text-wrap:balance}
.site{position:absolute;left:0;width:1080px;top:1660px;text-align:center;font:600 34px Poppins;color:#8FA3C2}.prog{position:absolute;left:60px;top:1630px;width:960px;height:10px;border-radius:5px;background:#24406A}.progbar{width:100%;height:100%;border-radius:5px;background:${C.orange};transform-origin:0 50%}
.bot{position:absolute;left:0;top:1600px;width:1080px;height:320px;background:${C.navy};border-top:6px solid ${C.ink}}
.capin{width:960px;height:180px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:0 22px;font:400 104px/1.05 Anton;text-transform:uppercase;color:#fff;-webkit-text-stroke:14px ${C.ink};paint-order:stroke fill}
.cw{display:inline-block}.ck{background:${C.orange};border:6px solid ${C.ink};border-radius:18px;padding:0 16px;-webkit-text-stroke:0;color:#fff}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-duration="${total}">
 <div id="frame" class="clip" data-start="0" data-duration="${total}" data-track-index="0" style="position:absolute;inset:0"><div class="top"></div><div class="bot"></div><div class="wm">${A.wordmark({ h: 104 })}</div><div class="site">aebrothersroofing.com</div><div class="prog"><div id="progbar" class="progbar"></div></div></div>
 ${scHtml}
 ${capHtml}
</div>
<script>const tl=gsap.timeline({paused:true});tl.fromTo("#progbar",{scaleX:0},{scaleX:1,duration:${total},ease:"none"},0);${js}tl.set({}, {}, ${total});window.__timelines["main"]=tl;</script></body></html>`;
  writeFileSync(join(dir, 'index.html'), html);
  writeFileSync(join(dir, 'plan.json'), JSON.stringify({ total, scenes: win, captions: caps }, null, 1));
  console.log(`built video (${total.toFixed(1)} s, ${scenes.length} scenes, ${caps.length} captions) -> ${dir}`);
  if (total < 30 || total > 40) console.log(`NOTE: length ${total.toFixed(1)} s is outside 30 to 40 s. Add or trim voiceover words.`);
}
