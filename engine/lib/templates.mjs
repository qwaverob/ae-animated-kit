// Scene templates. Every slide and every video scene is ONE of these, drawn in a
// fixed 1000 x 800 box (ground line at y = 640) using ONLY props from assets.mjs.
// Rules baked in: same house model everywhere, max 2 palms per scene, palms
// always fully inside the frame (never cropped), one weather set per scene,
// labels are orange pills with an ink outline, nothing overlaps the caption band.
import * as A from './assets.mjs';
const { C } = A;
export const BOX = { w: 1000, h: 800, ground: 640 };
export const TEMPLATES = ['house', 'closeup', 'inside', 'icon', 'compare', 'checklist', 'photos', 'offer', 'referral', 'yearly', 'phone', 'nogo', 'comment', 'endcard'];

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const at = (id, x, y, inner, extra = '') => `<div id="${id}" class="el" style="left:${x}px;top:${y}px;${extra}">${inner}</div>`;
const pill = (txt, size = 30) => `<div class="pill" style="font-size:${size}px">${esc(txt)}</div>`;

// Weather layer (sky props). weather: sun | clear | rain | storm
function weather(P, w, seed = 7) {
  let h = '';
  if (w === 'sun') h += at(`${P}-sun`, 800, 40, A.sun({ w: 140 })) + at(`${P}-cl1`, 80, 70, A.cloud({ w: 220 }));
  if (w === 'clear') h += at(`${P}-cl1`, 90, 60, A.cloud({ w: 220 })) + at(`${P}-cl2`, 700, 110, A.cloud({ w: 180 }));
  if (w === 'rain' || w === 'storm') {
    const st = w === 'storm';
    h += at(`${P}-cl1`, 40, 20, A.cloud({ w: 300, storm: st })) + at(`${P}-cl2`, 640, 50, A.cloud({ w: 280, storm: st }));
    if (st) h += at(`${P}-bolt`, 470, 60, A.bolt({ w: 70 }), 'opacity:0');
    const R = A.rng(seed); let lines = '';
    for (let i = 0; i < 46; i++) { const x = Math.round(R() * 1000), y = Math.round(R() * 560); lines += `<line x1="${x}" y1="${y}" x2="${x - 10}" y2="${y + 34}"/>`; }
    h += `<div id="${P}-rain" class="el rain" style="left:0;top:0"><svg width="1000" height="640" viewBox="0 0 1000 640" overflow="hidden"><g id="${P}-rainA" stroke="${C.white}" stroke-width="4" stroke-linecap="round" opacity=".75">${lines}</g></svg></div>`;
  }
  return h;
}
function weatherAnim(P, w, t0, d) {
  let j = '';
  if (w !== 'sun') j += `tl.fromTo("#${P}-cl1",{x:-20},{x:30,duration:${d},ease:"none"},${t0});tl.fromTo("#${P}-cl2",{x:20},{x:-30,duration:${d},ease:"none"},${t0});`;
  if (w === 'sun') j += `tl.fromTo("#${P}-sun",{rotation:0},{rotation:40,duration:${d},ease:"none"},${t0});tl.fromTo("#${P}-cl1",{x:-10},{x:40,duration:${d},ease:"none"},${t0});`;
  if (w === 'rain' || w === 'storm') {
    const n = Math.max(1, Math.round(d / 0.5));
    j += `tl.fromTo("#${P}-rainA",{y:-60},{y:20,duration:0.5,ease:"none",repeat:${n - 1}},${t0});`;
    if (w === 'storm') j += `tl.fromTo("#${P}-bolt",{opacity:0},{opacity:1,duration:0.06,yoyo:true,repeat:3},${t0 + Math.min(1.2, d * 0.4)});`;
  }
  return j;
}
function palms(P, n, windy) {
  if (!n) return '';
  let h = at(`${P}-palm1`, 10, BOX.ground - 300, A.palm({ w: 230, id: `${P}-pa` }));
  if (n > 1) h += at(`${P}-palm2`, 780, BOX.ground - 250, A.palm({ w: 192, id: `${P}-pb`, flip: true }));
  return h;
}
function palmsAnim(P, n, windy, t0, d) {
  if (!n) return '';
  const amp = windy ? 5 : 2, cyc = windy ? 0.8 : 1.6, rep = Math.max(1, Math.round(d / cyc));
  let j = `tl.fromTo("#${P}-pa-fronds",{rotation:-${amp}},{rotation:${amp},duration:${cyc / 2},ease:"sine.inOut",yoyo:true,repeat:${rep * 2 - 1}},${t0});`;
  if (n > 1) j += `tl.fromTo("#${P}-pb-fronds",{rotation:${amp}},{rotation:-${amp},duration:${cyc / 2},ease:"sine.inOut",yoyo:true,repeat:${rep * 2 - 1}},${t0});`;
  return j;
}
// house sits at x 200, bottom on ground; house svg is 600 x 430
const HX = 200, HY = BOX.ground - 430;
const SPOTS = { lifted: [584, 345], nailpop: [530, 328], streaks: [410, 380], missing: [430, 372], gutter: [500, 420], chimney: [609, 276], window: [367, 505] };

// pop helper: entrance used by video scenes; in slides, accents still pop (frame 0 stays a finished still)
const pop = (sel, t, dur = 0.35) => `tl.fromTo("${sel}",{scale:0.6,opacity:0},{scale:1,opacity:1,duration:${dur},ease:"back.out(2)"},${t.toFixed(3)});`;
const rise = (sel, t) => `tl.fromTo("${sel}",{y:40,opacity:0},{y:0,opacity:1,duration:0.4,ease:"expo.out"},${t.toFixed(3)});`;

export const T = {
  house(P, p, m) {
    const w = p.weather || 'clear', n = Math.min(2, p.palms ?? 2), windy = w === 'storm' || p.windy;
    let h = weather(P, w) + palms(P, n, windy) + at(`${P}-house`, HX, HY, A.house({ w: 600, roof: p.roof || 'shingle', id: `${P}-h`, damage: p.damage || [] }));
    (p.callouts || []).slice(0, 3).forEach((c, i) => {
      const [sx, sy] = SPOTS[c.at] || SPOTS.chimney; const right = sx > 500; const lx = right ? Math.min(sx + 40, 760) : Math.max(sx - 300, 30), ly = Math.max(sy - 150 - i * 10, 230);
      h += `<div id="${P}-co${i}" class="el" style="left:0;top:0;opacity:0"><svg width="1000" height="800" viewBox="0 0 1000 800"><line x1="${sx}" y1="${sy}" x2="${right ? lx + 20 : lx + 240}" y2="${ly + 40}" stroke="${C.ink}" stroke-width="5"/><circle cx="${sx}" cy="${sy}" r="12" fill="${C.orange}" stroke="${C.ink}" stroke-width="5"/></svg>
      <div style="position:absolute;left:${lx}px;top:${ly}px">${pill(c.label, 30)}</div></div>`;
    });
    const anim = (t0, d) => {
      let j = weatherAnim(P, w, t0, d) + palmsAnim(P, n, windy, t0, d);
      if (m === 'video') j += pop(`#${P}-house`, t0, 0.4);
      (p.callouts || []).slice(0, 3).forEach((c, i) => { j += pop(`#${P}-co${i}`, t0 + 0.5 + i * Math.min(0.9, (d - 1) / 3)); });
      if ((p.damage || []).includes('lifted')) j += `tl.fromTo("#${P}-h-lifted",{rotation:0,transformOrigin:"0% 100%"},{rotation:-14,duration:0.3,yoyo:true,repeat:${Math.max(1, Math.round(d / 0.6)) * 2 - 1},ease:"sine.inOut"},${t0 + 0.3});`;
      if ((p.damage || []).includes('nailpop')) j += `tl.fromTo("#${P}-h-nailpop",{scale:1,transformOrigin:"50% 50%"},{scale:1.6,duration:0.35,yoyo:true,repeat:${Math.max(1, Math.round(d / 0.7)) * 2 - 1}},${t0 + 0.3});`;
      return j;
    };
    return { html: h, anim, sky: w === 'storm' ? C.skyStorm : w === 'rain' ? '#9FB4CC' : C.sky };
  },
  closeup(P, p, m) {
    const roof = p.roof || 'shingle', f = { shingle: C.shingle, tile: C.tile, metal: C.metal }[roof], d = { shingle: C.shingleD, tile: C.tileD, metal: C.metalD }[roof];
    let rows = '';
    if (roof === 'shingle') for (let r = 0; r < 6; r++) { const y = 40 + r * 110; rows += `<rect x="-20" y="${y}" width="1040" height="110" fill="${f}" stroke="${C.ink}" stroke-width="6"/>`; for (let x = (r % 2) * 100 - 20; x < 1040; x += 200) rows += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 110}" stroke="${C.ink}" stroke-width="6"/>`; }
    if (roof === 'tile') for (let r = 0; r < 6; r++) { const y = 40 + r * 110; let dd = `M-20 ${y + 110}`; for (let x = -20; x < 1040; x += 125) dd += ` q62 -150 125 0`; rows += `<path d="M-20 ${y} L1040 ${y} L1040 ${y + 110} L-20 ${y + 110} Z" fill="${f}" stroke="${C.ink}" stroke-width="6"/><path d="${dd}" fill="none" stroke="${d}" stroke-width="6"/>`; }
    if (roof === 'metal') { rows += `<rect x="-20" y="40" width="1040" height="700" fill="${f}" stroke="${C.ink}" stroke-width="6"/>`; for (let x = 60; x < 1000; x += 140) rows += `<rect x="${x}" y="40" width="22" height="700" fill="${d}" stroke="${C.ink}" stroke-width="6"/>`; }
    const det = p.detail || 'nail';
    let detail = '';
    if (det === 'nail') detail = at(`${P}-nail`, 470, 280, A.nail({ w: 70 }));
    if (det === 'granules') { const R = A.rng(11); let g = ''; for (let i = 0; i < 40; i++) g += `<circle cx="${(R() * 300).toFixed(0)}" cy="${(R() * 120).toFixed(0)}" r="${(5 + R() * 4).toFixed(1)}" fill="#2B3440" stroke="${C.ink}" stroke-width="2"/>`; detail = `<div id="${P}-gran" class="el" style="left:350px;top:560px"><svg width="300" height="130" viewBox="0 0 300 130">${g}</svg></div>`; }
    if (det === 'lifted') detail = at(`${P}-tab`, 380, 260, `<svg width="240" height="120" viewBox="0 0 240 120"><rect x="6" y="6" width="228" height="108" fill="${C.shingleD}" stroke="${C.ink}" stroke-width="6"/></svg>`);
    if (det === 'crack') detail = at(`${P}-crack`, 380, 250, `<svg width="260" height="220" viewBox="0 0 260 220"><path d="M20 20 L90 80 L70 120 L150 160 L130 200 L240 210" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
    if (det === 'streaks') detail = at(`${P}-streak`, 300, 120, `<svg width="400" height="520" viewBox="0 0 400 520"><path d="M60 0 q20 260 -10 520 M170 0 q24 260 0 520 M290 0 q18 260 -8 520" stroke="#26303D" stroke-width="40" fill="none" stroke-linecap="round" opacity=".7"/></svg>`);
    const h = `<div class="el" style="left:0;top:0"><svg width="1000" height="800" viewBox="0 0 1000 800">${rows}</svg></div>${detail}
      ${at(`${P}-mag`, 560, 120, A.magnifier({ w: 300 }))}${p.label ? at(`${P}-lab`, 80, 640, pill(p.label, 34), 'opacity:0') : ''}`;
    const anim = (t0, dd) => {
      let j = `tl.fromTo("#${P}-mag",{x:180,y:120},{x:-160,y:60,duration:${Math.min(1.2, dd * 0.4)},ease:"power2.inOut"},${t0 + 0.1});`;
      if (det === 'nail') j += `tl.fromTo("#${P}-nail",{y:60},{y:0,duration:0.5,ease:"back.out(2)"},${t0 + 0.4});`;
      if (det === 'granules') j += `tl.fromTo("#${P}-gran",{y:-200,opacity:0},{y:0,opacity:1,duration:0.8,ease:"power2.in"},${t0 + 0.3});`;
      if (det === 'lifted') j += `tl.fromTo("#${P}-tab",{rotation:0,transformOrigin:"0% 0%"},{rotation:-12,duration:0.3,yoyo:true,repeat:${Math.max(1, Math.round(dd / 0.6)) * 2 - 1}},${t0 + 0.3});`;
      if (det === 'crack') j += `tl.fromTo("#${P}-crack",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.6,ease:"power2.out"},${t0 + 0.3});`;
      if (det === 'streaks') j += `tl.fromTo("#${P}-streak",{clipPath:"inset(0 0 100% 0)"},{clipPath:"inset(0 0 0% 0)",duration:0.9,ease:"power1.out"},${t0 + 0.2});`;
      if (p.label) j += pop(`#${P}-lab`, t0 + 0.9);
      return j;
    };
    return { html: h, anim, sky: f, noGround: true };
  },
  inside(P, p, m) {
    const h = `${at(`${P}-room`, 0, 0, A.ceiling({ w: 1000 }))}
      <div id="${P}-stain" class="el" style="left:380px;top:40px"><svg width="300" height="140" viewBox="0 0 300 140"><ellipse cx="150" cy="60" rx="140" ry="56" fill="${C.stain}" stroke="${C.ink}" stroke-width="6"/></svg></div>
      ${at(`${P}-drip`, 505, 120, A.drop({ w: 46 }))}${p.label ? at(`${P}-lab`, 600, 220, pill(p.label, 32), 'opacity:0') : ''}`;
    const anim = (t0, d) => {
      let j = `tl.fromTo("#${P}-stain",{scale:0.3,transformOrigin:"50% 40%"},{scale:1,duration:${Math.min(2, d * 0.6)},ease:"power1.out"},${t0});`;
      const n = Math.max(1, Math.floor((d - 0.6) / 0.9)); j += `tl.fromTo("#${P}-drip",{y:0,opacity:1},{y:300,opacity:0,duration:0.8,ease:"power2.in",repeat:${n - 1},repeatDelay:0.1},${t0 + 0.5});`;
      if (p.label) j += pop(`#${P}-lab`, t0 + 0.8);
      return j;
    };
    return { hero: `#${P}-lab`, html: h, anim, sky: C.cream, noGround: true };
  },
  icon(P, p, m) {
    const ic = { shield: A.shield({ w: 300 }), camera: A.camera({ w: 380 }), calendar: A.calendar({ w: 360, label: p.text || '1 YEAR' }), gift: A.gift({ w: 320 }), clipboard: A.clipboard({ w: 300 }), check: A.check({ w: 300 }), cross: A.cross({ w: 300 }), ladder: A.ladder({ w: 150 }), drop: A.drop({ w: 220 }), nail: A.nail({ w: 120 }), magnifier: A.magnifier({ w: 340 }), tag: A.tag({ w: 520, big: p.big || '$1,000', small: p.small || 'OFF' }) }[p.icon || 'shield'];
    const h = `<div id="${P}-disc" class="el" style="left:250px;top:110px;width:500px;height:500px;border-radius:50%;background:${C.cream};border:6px solid ${C.ink}"></div>
      <div id="${P}-ic" class="el center" style="left:250px;top:110px;width:500px;height:500px">${ic}</div>
      ${p.number ? at(`${P}-num`, 220, 90, `<div class="num">${esc(p.number)}</div>`) : ''}`;
    const anim = (t0, d) => {
      let j = m === 'video' ? pop(`#${P}-disc`, t0, 0.3) + pop(`#${P}-ic`, t0 + 0.15, 0.4) : '';
      j += `tl.fromTo("#${P}-ic",{rotation:-3},{rotation:3,duration:0.8,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.round(d / 0.8)) - 1}},${t0 + 0.5});`;
      if (p.number) j += pop(`#${P}-num`, t0 + 0.3);
      return j;
    };
    return { html: h, anim, sky: C.sky, noGround: true };
  },
  compare(P, p, m) {
    const items = (p.items || [{ kind: 'shingle', label: 'Shingle' }, { kind: 'tile', label: 'Tile' }, { kind: 'metal', label: 'Metal' }]).slice(0, 3);
    const n = items.length, cw = n === 3 ? 290 : 400, gap = n === 3 ? 30 : 60, x0 = (1000 - (n * cw + (n - 1) * gap)) / 2;
    let h = '';
    items.forEach((it, i) => {
      const art = it.kind ? A.swatch({ w: cw - 50, kind: it.kind }) : it.icon === 'check' ? A.check({ w: 200 }) : A.cross({ w: 200 });
      h += `<div id="${P}-c${i}" class="el card" style="left:${x0 + i * (cw + gap)}px;top:90px;width:${cw}px;height:520px">${art}<div class="clabel">${esc(it.label)}</div>${it.note ? `<div class="cnote">${esc(it.note)}</div>` : ''}</div>`;
    });
    const anim = (t0, d) => items.map((_, i) => m === 'video' || i > 0 ? `tl.fromTo("#${P}-c${i}",{y:60,opacity:${m === 'video' ? 0 : 1}},{y:0,opacity:1,duration:0.45,ease:"back.out(1.6)"},${(t0 + i * 0.25).toFixed(2)});` : '').join('') +
      `tl.fromTo("#${P}-c${n - 1}",{rotation:0},{rotation:2,duration:0.6,yoyo:true,repeat:${Math.max(1, Math.round(d / 0.6)) - 1},ease:"sine.inOut"},${t0 + 1.2});`;
    return { html: h, anim, sky: C.sky, noGround: true };
  },
  checklist(P, p, m) {
    const items = (p.items || []).slice(0, 5);
    let rows = items.map((t, i) => `<div class="crow" id="${P}-r${i}"><div class="cbox"><div id="${P}-k${i}" class="tick">${A.check({ w: 64 })}</div></div><div class="ctext">${esc(t)}</div></div>`).join('');
    const h = `<div id="${P}-cb" class="el clip-board" style="left:150px;top:40px;width:700px;height:${Math.max(420, 120 + items.length * 108)}px"><div class="cbclip"></div>${rows}</div>`;
    const anim = (t0, d) => items.map((_, i) => pop(`#${P}-k${i}`, t0 + 0.3 + i * Math.min(0.7, (d - 0.8) / Math.max(1, items.length)), 0.3)).join('');
    return { hero: `#${P}-cb`, html: h, anim, sky: C.sky, noGround: true };
  },
  photos(P, p, m) {
    const roof = p.roof || 'shingle';
    const h = `${at(`${P}-cam`, 330, 380, A.camera({ w: 340 }))}
      ${at(`${P}-f0`, 120, 60, `<div style="transform:rotate(-8deg)">${A.photoCard({ w: 230, roof })}</div>`)}${at(`${P}-f1`, 390, 30, A.photoCard({ w: 230, roof: 'tile' }))}${at(`${P}-f2`, 650, 60, `<div style="transform:rotate(8deg)">${A.photoCard({ w: 230, roof: 'metal' })}</div>`)}
      <div id="${P}-flash" class="el" style="left:0;top:0;width:1000px;height:800px;background:#fff;opacity:0"></div>`;
    const anim = (t0, d) => {
      let j = m === 'video' ? pop(`#${P}-cam`, t0, 0.35) : '';
      [0, 1, 2].forEach(i => { const t = t0 + 0.4 + i * Math.min(0.7, (d - 0.8) / 3); j += `tl.fromTo("#${P}-flash",{opacity:0},{opacity:0.6,duration:0.05,yoyo:true,repeat:1},${t.toFixed(2)});` + `tl.fromTo("#${P}-f${i}",{y:300,opacity:0,scale:0.5},{y:0,opacity:1,scale:1,duration:0.4,ease:"back.out(1.7)"},${(t + 0.05).toFixed(2)});`; });
      return j;
    };
    return { hero: `#${P}-f1`, html: h, anim, sky: C.sky, noGround: true };
  },
  offer(P, p, m) {
    const h = `${weather(P, 'sun')}${at(`${P}-house`, HX, HY, A.house({ w: 600, roof: p.roof || 'tile', id: `${P}-h` }))}
      ${at(`${P}-tag`, 250, 250, `<div style="transform:rotate(-6deg)">${A.tag({ w: 500, big: p.big || '$1,000', small: p.small || 'OFF A REROOF' })}</div>`)}
      ${p.disclaimer ? at(`${P}-disc`, 160, 680, `<div class="discl">${esc(p.disclaimer)}</div>`) : ''}`;
    const anim = (t0, d) => weatherAnim(P, 'sun', t0, d) + (m === 'video' ? pop(`#${P}-house`, t0, 0.4) : '') +
      `tl.fromTo("#${P}-tag",{scale:${m === 'video' ? 0.3 : 1},opacity:${m === 'video' ? 0 : 1}},{scale:1,opacity:1,duration:0.45,ease:"back.out(2)"},${t0 + 0.3});tl.fromTo("#${P}-tag",{y:0},{y:-14,duration:0.6,yoyo:true,repeat:${Math.max(1, Math.round(d / 0.6)) - 1},ease:"sine.inOut"},${t0 + 0.8});`;
    return { html: h, anim, sky: C.sky };
  },
  referral(P, p, m) {
    const h = `${at(`${P}-h1`, 20, BOX.ground - 280, A.house({ w: 390, roof: 'shingle', id: `${P}-ha` }))}${at(`${P}-h2`, 590, BOX.ground - 280, A.house({ w: 390, roof: 'tile', id: `${P}-hb` }))}
      <div id="${P}-arc" class="el" style="left:0;top:0"><svg width="1000" height="800" viewBox="0 0 1000 800"><path id="${P}-arcp" d="M230 330 Q500 60 770 330" fill="none" stroke="${C.ink}" stroke-width="10" stroke-dasharray="26 18" stroke-linecap="round"/><polygon points="770,330 740,300 790,296" fill="${C.ink}"/></svg></div>
      ${at(`${P}-gift`, 420, 90, A.gift({ w: 160 }))}${at(`${P}-kw`, 360, 660, `<div class="kw">${esc(p.keyword || 'REFER')}</div>`)}`;
    const anim = (t0, d) => (m === 'video' ? pop(`#${P}-h1`, t0) + pop(`#${P}-h2`, t0 + 0.15) : '') +
      `tl.fromTo("#${P}-arc",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.7,ease:"power2.inOut"},${t0 + 0.3});` + pop(`#${P}-gift`, t0 + 0.8, 0.4) + pop(`#${P}-kw`, t0 + 1.1, 0.35);
    return { hero: `#${P}-gift`, html: h, anim, sky: C.sky };
  },
  yearly(P, p, m) {
    const h = `${weather(P, 'sun')}${at(`${P}-house`, 40, BOX.ground - 330, A.house({ w: 460, roof: p.roof || 'tile', id: `${P}-h` }))}
      ${at(`${P}-cal`, 560, 150, A.calendar({ w: 380, label: p.text || 'EVERY YEAR' }))}${at(`${P}-ok`, 820, 120, A.check({ w: 120 }))}`;
    const anim = (t0, d) => weatherAnim(P, 'sun', t0, d) + (m === 'video' ? pop(`#${P}-house`, t0) + pop(`#${P}-cal`, t0 + 0.2) : '') + pop(`#${P}-ok`, t0 + 0.7, 0.35);
    return { hero: `#${P}-ok`, html: h, anim, sky: C.sky };
  },
  phone(P, p, m) {
    const h = `${at(`${P}-ph`, 320, 20, A.phone({ w: 360 }))}
      ${at(`${P}-b1`, 360, 150, `<div style="width:280px">${A.photoCard({ w: 250, roof: p.roof || 'shingle' })}</div>`)}
      ${at(`${P}-b2`, 345, 450, A.bubble({ w: 310, text: esc(p.reply || 'Thanks! Here is what we see.') }))}`;
    const anim = (t0, d) => (m === 'video' ? `tl.fromTo("#${P}-ph",{y:500},{y:0,duration:0.5,ease:"power3.out"},${t0});` : '') + pop(`#${P}-b1`, t0 + 0.4) + pop(`#${P}-b2`, t0 + 1.0);
    return { hero: `#${P}-b2`, html: h, anim, sky: C.sky, noGround: true };
  },
  nogo(P, p, m) {
    const h = `${at(`${P}-house`, HX, HY, A.house({ w: 600, roof: p.roof || 'shingle', id: `${P}-h` }))}${at(`${P}-lad`, 640, 230, `<div style="transform:rotate(-14deg)">${A.ladder({ w: 130 })}</div>`)}
      ${at(`${P}-no`, 560, 300, A.noSign({ w: 300 }))}${p.label ? at(`${P}-lab`, 40, 40, pill(p.label, 34)) : ''}`;
    const anim = (t0, d) => (m === 'video' ? pop(`#${P}-house`, t0) : '') + `tl.fromTo("#${P}-no",{scale:2.2,opacity:0},{scale:1,opacity:1,duration:0.3,ease:"power4.in"},${t0 + 0.5});`;
    return { hero: `#${P}-no`, html: h, anim, sky: C.sky };
  },
  comment(P, p, m) {
    const h = `${at(`${P}-bub`, 170, 120, A.bubble({ w: 660, text: `Comment <b style="color:${C.orange}">${esc(p.keyword || 'REFER')}</b> and we'll send you the link` }))}
      ${`<div id="${P}-kw" class="el center" style="left:0;top:380px;width:1000px;height:300px"><div class="kw big">${esc(p.keyword || 'REFER')}</div></div>`}`;
    const anim = (t0, d) => pop(`#${P}-bub`, t0 + 0.1) + pop(`#${P}-kw`, t0 + 0.5, 0.4) + `tl.fromTo("#${P}-kw",{rotation:-3},{rotation:3,duration:0.25,yoyo:true,repeat:3},${t0 + 1});`;
    return { hero: `#${P}-kw`, html: h, anim, sky: C.sky, noGround: true };
  },
  endcard(P, p, m) {
    const h = `<div id="${P}-wm" class="el center" style="left:0;top:40px;width:1000px;height:300px;display:flex;justify-content:center">${A.wordmark({ h: 290 })}</div>
      <div id="${P}-cta" class="el center" style="left:60px;top:360px;width:880px;height:220px"><div class="kw big2" style="font-size:${Math.max(64, Math.min(110, Math.floor(1500 / Math.max(10, (p.cta || 'DM US A PHOTO').length))))}px">${esc(p.cta || 'DM US A PHOTO')}</div></div>
      ${p.disclaimer ? `<div class="el center discl2" style="left:60px;top:620px;width:880px">${esc(p.disclaimer)}</div>` : ''}`;
    const anim = (t0, d) => pop(`#${P}-wm`, t0, 0.3) + pop(`#${P}-cta`, t0 + 0.3, 0.4);
    return { hero: `#${P}-cta`, html: h, anim, sky: C.navy, noGround: true };
  },
};
