// A&E asset library. ONE illustration style for every slide and scene:
// flat fills, one ink outline (6 px on screen, non-scaling), no gradients,
// no photo textures, no glossy highlights. Every prop comes from here.
// Do not draw new trees, houses or props inline in a spec or template.
// Add them here, in this style, and run the asset sheet QA.
export const C = {
  ink: '#151A2B', navy: '#202840', navy2: '#181E31', orange: '#FF7D2E', orangeD: '#E5651A', gold: '#FFBA25',
  cream: '#F6EAD3', creamD: '#E6D3B1', white: '#FFFFFF', sky: '#CFE4F5', skyStorm: '#6B7F9E',
  cloud: '#FFFFFF', cloudStorm: '#AEB9CB', grass: '#69B36F', grassD: '#4E9757',
  leaf: '#3F9E5E', leafD: '#2D7C47', trunk: '#C18B57', trunkD: '#9C6A3C',
  shingle: '#556274', shingleD: '#3E4959', tile: '#D86A3D', tileD: '#B4532C', metal: '#A9BBCE', metalD: '#8197AE',
  water: '#4FA3E0', stain: '#C9A27A', red: '#E03B3B', green: '#2FA35B', grey: '#C9D2DE', paper: '#FFFFFF',
};
const S = 6; // ink stroke on screen (px)
const st = `stroke="${C.ink}" stroke-width="${S}" stroke-linejoin="round" stroke-linecap="round"`;
const svg = (vb, w, body, extra = '') => {
  const [, , vw, vh] = vb.split(' ').map(Number);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${Math.round(w * vh / vw)}" ${extra}>${body}</svg>`;
};

// ---------- seeded random (deterministic renders) ----------
export function rng(seed = 1) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- HOUSE: the only house. Roof types: shingle | tile | metal ----------
// viewBox 0 0 600 430. Ground contact at y=420. Named parts carry ids (prefix).
export function house({ w = 600, roof = 'shingle', id = 'h', damage = [] } = {}) {
  const roofFill = { shingle: C.shingle, tile: C.tile, metal: C.metal }[roof];
  const roofLine = { shingle: C.shingleD, tile: C.tileD, metal: C.metalD }[roof];
  let pattern = '';
  if (roof === 'shingle') {
    for (let r = 0; r < 5; r++) {
      const y = 92 + r * 26, x0 = 300 - (y - 40) * 1.6, x1 = 300 + (y - 40) * 1.6;
      pattern += `<line x1="${x0 + 6}" y1="${y}" x2="${x1 - 6}" y2="${y}" stroke="${roofLine}" stroke-width="3"/>`;
      for (let x = x0 + 30 + (r % 2) * 18; x < x1 - 20; x += 36) pattern += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 26}" stroke="${roofLine}" stroke-width="2.5"/>`;
    }
  } else if (roof === 'tile') {
    for (let r = 0; r < 5; r++) {
      const y = 96 + r * 26, x0 = 300 - (y - 40) * 1.6, x1 = 300 + (y - 40) * 1.6;
      let d = `M${x0 + 8} ${y}`; for (let x = x0 + 8; x < x1 - 30; x += 30) d += ` q15 14 30 0`;
      pattern += `<path d="${d}" fill="none" stroke="${roofLine}" stroke-width="3"/>`;
    }
  } else {
    for (let x = 120; x <= 480; x += 30) {
      const ytop = 40 + Math.abs(x - 300) / 1.6;
      pattern += `<line x1="${x}" y1="${Math.max(ytop + 6, 50)}" x2="${x}" y2="${200}" stroke="${roofLine}" stroke-width="3"/>`;
    }
  }
  const dmg = new Set(damage);
  const extras = [
    dmg.has('lifted') ? `<g id="${id}-lifted"><path d="M360 128 l42 -4 l4 22 l-42 6 z" fill="${C.shingleD}" ${st}/></g>` : '',
    dmg.has('missing') ? `<g id="${id}-missing"><rect x="210" y="150" width="40" height="24" fill="${C.creamD}" ${st}/></g>` : '',
    dmg.has('streaks') ? `<g id="${id}-streaks" opacity=".85"><path d="M180 150 q6 30 -2 52 M200 140 q8 34 0 62 M222 132 q6 36 -2 70" stroke="#26303D" stroke-width="10" fill="none" stroke-linecap="round"/></g>` : '',
    dmg.has('nailpop') ? `<g id="${id}-nailpop"><circle cx="330" cy="118" r="9" fill="${C.grey}" ${st}/></g>` : '',
  ].join('');
  const body = `
  <g id="${id}">
    <rect x="70" y="190" width="460" height="230" fill="${C.cream}" ${st}/>
    <rect x="70" y="190" width="460" height="18" fill="${C.creamD}" stroke="none"/>
    <polygon points="30,200 300,36 570,200" fill="${roofFill}" ${st}/>
    <g clip-path="url(#${id}-rc)">${pattern}</g>
    <clipPath id="${id}-rc"><polygon points="36,198 300,40 564,198"/></clipPath>
    <rect x="22" y="196" width="556" height="16" rx="4" fill="${C.orange}" ${st}/>
    <rect x="390" y="64" width="38" height="70" fill="${C.creamD}" ${st}/>
    <rect x="260" y="290" width="80" height="130" rx="6" fill="${C.navy}" ${st}/>
    <circle cx="324" cy="358" r="6" fill="${C.orange}"/>
    <g><rect x="112" y="250" width="110" height="90" rx="6" fill="#BFE0F7" ${st}/><line x1="167" y1="252" x2="167" y2="338" ${st}/><line x1="114" y1="295" x2="220" y2="295" ${st}/></g>
    <g><rect x="378" y="250" width="110" height="90" rx="6" fill="#BFE0F7" ${st}/><line x1="433" y1="252" x2="433" y2="338" ${st}/><line x1="380" y1="295" x2="486" y2="295" ${st}/></g>
    <rect x="96" y="340" width="150" height="14" rx="4" fill="${C.creamD}" ${st}/><rect x="354" y="340" width="150" height="14" rx="4" fill="${C.creamD}" ${st}/>
    ${extras}
  </g>`;
  return svg('0 0 600 430', w, body);
}

// ---------- PALM: the only tree. Full plant always in frame. Sizes: 1 (full) or 0.8 ----------
// viewBox 0 0 400 520, base at (200,516). Fronds grouped (#id-fronds) for sway.
export function palm({ w = 260, id = 'p', flip = false } = {}) {
  const cx = 204, cy = 150;
  const leaf = (a, len, wd) => {
    const r = a * Math.PI / 180, ex = cx + Math.cos(r) * len, ey = cy + Math.sin(r) * len + len * 0.28;
    const nx = -Math.sin(r), ny = Math.cos(r); const mx = cx + Math.cos(r) * len * 0.5, my = cy + Math.sin(r) * len * 0.5 - len * 0.06;
    const c1x = mx + nx * wd, c1y = my + ny * wd, c2x = mx - nx * wd, c2y = my - ny * wd;
    return `<path d="M${cx} ${cy} Q${c1x.toFixed(1)} ${c1y.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${c2x.toFixed(1)} ${c2y.toFixed(1)} ${cx} ${cy} Z" fill="${C.leaf}" ${st}/>` +
      `<path d="M${cx} ${cy} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${C.leafD}" stroke-width="3"/>`;
  };
  // back fronds first, then front fronds: symmetric, same length family, all drooping the same way
  const back = [[-150, 150, 46], [-30, 150, 46], [-95, 120, 40]].map(a => leaf(...a)).join('');
  const front = [[180, 170, 50], [0, 170, 50], [-160, 120, 40], [-20, 120, 40], [150, 125, 42], [30, 125, 42]].map(a => leaf(...a)).join('');
  let rings = ''; for (let i = 0; i < 8; i++) { const y = 196 + i * 40; const x = 200 + Math.sin((y - 150) / 300) * 10; rings += `<path d="M${x - 16} ${y} q16 8 32 0" fill="none" stroke="${C.trunkD}" stroke-width="3"/>`; }
  const body = `<g ${flip ? 'transform="translate(400 0) scale(-1 1)"' : ''}>
    <path d="M186 516 C190 400 182 290 192 160 L218 160 C210 290 220 400 216 516 Z" fill="${C.trunk}" ${st}/>${rings}
    <g id="${id}-fronds" class="fronds" style="transform-box:view-box;transform-origin:${cx}px ${cy}px">${back}${front}
      <circle cx="194" cy="162" r="12" fill="${C.trunkD}" ${st}/><circle cx="216" cy="164" r="12" fill="${C.trunkD}" ${st}/></g>
  </g>`;
  return svg('0 0 400 520', w, body);
}

// ---------- WEATHER ----------
export function cloud({ w = 260, storm = false } = {}) {
  const f = storm ? C.cloudStorm : C.cloud;
  return svg('0 0 260 130', w, `<path d="M40 112 Q8 112 10 86 Q12 60 44 60 Q50 22 92 22 Q128 22 140 50 Q160 34 186 42 Q214 50 214 76 Q250 78 250 98 Q250 114 222 114 Z" fill="${f}" ${st}/>`);
}
export function sun({ w = 150 } = {}) {
  let rays = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; rays += `<line x1="${75 + Math.cos(a) * 50}" y1="${75 + Math.sin(a) * 50}" x2="${75 + Math.cos(a) * 68}" y2="${75 + Math.sin(a) * 68}" ${st}/>`; }
  return svg('0 0 150 150', w, `${rays}<circle cx="75" cy="75" r="38" fill="#FFC94A" ${st}/>`);
}
export function bolt({ w = 70 } = {}) { return svg('0 0 70 120', w, `<polygon points="38,4 8,66 32,66 22,116 62,48 38,48 50,4" fill="#FFD43B" ${st}/>`); }

// ---------- PROPS ----------
export function magnifier({ w = 220, inner = '' } = {}) {
  return svg('0 0 220 220', w, `<line x1="140" y1="140" x2="204" y2="204" stroke="${C.ink}" stroke-width="22" stroke-linecap="round"/>
  <line x1="140" y1="140" x2="204" y2="204" stroke="${C.orange}" stroke-width="10" stroke-linecap="round"/>
  <circle cx="88" cy="88" r="72" fill="#E4F0FA" fill-opacity=".55" ${st}/>${inner}<path d="M44 70 A48 48 0 0 1 80 38" fill="none" stroke="${C.white}" stroke-width="10" stroke-linecap="round"/><circle cx="88" cy="88" r="72" fill="none" ${st}/>`);
}
export function phone({ w = 300, id = 'ph' } = {}) {
  return svg('0 0 300 560', w, `<rect x="6" y="6" width="288" height="548" rx="44" fill="${C.ink}"/>
  <rect x="20" y="22" width="260" height="516" rx="32" fill="${C.white}"/><rect x="110" y="34" width="80" height="14" rx="7" fill="${C.ink}"/>`);
}
export function camera({ w = 220 } = {}) {
  return svg('0 0 220 160', w, `<rect x="8" y="34" width="204" height="118" rx="18" fill="${C.navy}" ${st}/><rect x="70" y="14" width="80" height="30" rx="8" fill="${C.navy}" ${st}/>
  <circle cx="110" cy="92" r="40" fill="${C.white}" ${st}/><circle cx="110" cy="92" r="20" fill="${C.water}" ${st}/><circle cx="178" cy="60" r="8" fill="${C.orange}"/>`);
}
export function photoCard({ w = 200, roof = 'shingle', tilt = 0 } = {}) {
  return svg('0 0 200 220', w, `<rect x="6" y="6" width="188" height="208" rx="10" fill="${C.white}" ${st}/>
  <rect x="20" y="20" width="160" height="140" fill="${C.sky}" stroke="none"/>
  <polygon points="34,120 100,64 166,120" fill="${{ shingle: C.shingle, tile: C.tile, metal: C.metal }[roof]}" ${st}/>
  <rect x="48" y="118" width="104" height="42" fill="${C.cream}" ${st}/><rect x="20" y="20" width="160" height="140" fill="none" ${st}/>`, tilt ? `style="transform:rotate(${tilt}deg)"` : '');
}
export function check({ w = 120, color = C.green } = {}) {
  return svg('0 0 120 120', w, `<circle cx="60" cy="60" r="52" fill="${color}" ${st}/><path d="M36 62 L54 80 L86 44" fill="none" stroke="${C.white}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`);
}
export function cross({ w = 120 } = {}) {
  return svg('0 0 120 120', w, `<circle cx="60" cy="60" r="52" fill="${C.red}" ${st}/><path d="M40 40 L80 80 M80 40 L40 80" stroke="${C.white}" stroke-width="12" stroke-linecap="round"/>`);
}
export function noSign({ w = 260 } = {}) {
  return svg('0 0 260 260', w, `<circle cx="130" cy="130" r="112" fill="none" stroke="${C.ink}" stroke-width="34"/><circle cx="130" cy="130" r="112" fill="none" stroke="${C.red}" stroke-width="22"/>
  <line x1="52" y1="52" x2="208" y2="208" stroke="${C.ink}" stroke-width="34" stroke-linecap="round"/><line x1="52" y1="52" x2="208" y2="208" stroke="${C.red}" stroke-width="22" stroke-linecap="round"/>`);
}
export function ladder({ w = 160 } = {}) {
  let rungs = ''; for (let y = 60; y < 420; y += 60) rungs += `<line x1="34" y1="${y}" x2="126" y2="${y}" ${st}/>`;
  return svg('0 0 160 460', w, `<rect x="18" y="10" width="20" height="440" rx="6" fill="#E9B44C" ${st}/><rect x="122" y="10" width="20" height="440" rx="6" fill="#E9B44C" ${st}/>${rungs}`);
}
export function shield({ w = 200 } = {}) {
  return svg('0 0 200 230', w, `<path d="M100 10 L184 42 L184 112 Q184 186 100 222 Q16 186 16 112 L16 42 Z" fill="${C.navy}" ${st}/>
  <path d="M64 116 L92 144 L142 88" fill="none" stroke="${C.orange}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`);
}
export function clipboard({ w = 300, lines = 4, id = 'cb' } = {}) {
  let rows = ''; for (let i = 0; i < lines; i++) { const y = 120 + i * 70; rows += `<g id="${id}-row${i}"><rect x="58" y="${y}" width="40" height="40" rx="8" fill="${C.white}" ${st}/><rect x="118" y="${y + 12}" width="150" height="16" rx="8" fill="${C.grey}"/></g>`; }
  return svg('0 0 320 420', w, `<rect x="20" y="40" width="280" height="370" rx="20" fill="${C.cream}" ${st}/><rect x="110" y="18" width="100" height="44" rx="12" fill="${C.navy}" ${st}/>${rows}`);
}
function calText(label) {
  const L = String(label).toUpperCase(), parts = L.split(' ');
  const t = (x, y, fs, txt) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="${fs}" fill="${C.navy}">${txt}</text>`;
  if (L.length > 7 && parts.length > 1) { const a = parts.slice(0, Math.ceil(parts.length / 2)).join(' '), b = parts.slice(Math.ceil(parts.length / 2)).join(' ');
    const fs = Math.min(50, Math.floor(215 / (Math.max(a.length, b.length) * 0.66))); return t(130, 158, fs, a) + t(130, 158 + fs + 6, fs, b); }
  return t(130, 186, Math.min(58, Math.floor(215 / (L.length * 0.66))), L);
}
export function calendar({ w = 260, label = '1 YEAR' } = {}) {
  return svg('0 0 260 250', w, `<rect x="10" y="30" width="240" height="210" rx="18" fill="${C.white}" ${st}/><rect x="10" y="30" width="240" height="60" rx="18" fill="${C.orange}" ${st}/>
  <rect x="62" y="10" width="16" height="44" rx="8" fill="${C.ink}"/><rect x="182" y="10" width="16" height="44" rx="8" fill="${C.ink}"/>
  ${calText(label)}`);
}
export function gift({ w = 200 } = {}) {
  return svg('0 0 200 200', w, `<rect x="20" y="80" width="160" height="110" rx="8" fill="${C.orange}" ${st}/><rect x="10" y="54" width="180" height="40" rx="8" fill="${C.orangeD}" ${st}/>
  <rect x="88" y="54" width="24" height="136" fill="${C.navy}" ${st}/><path d="M100 54 Q60 10 50 40 Q44 60 100 54 Q156 60 150 40 Q140 10 100 54" fill="${C.navy}" ${st}/>`);
}
export function tag({ w = 360, big = '$1,000', small = 'OFF' } = {}) {
  return svg('0 0 360 200', w, `<path d="M70 14 L340 14 Q350 14 350 24 L350 176 Q350 186 340 186 L70 186 L10 100 Z" fill="${C.orange}" ${st}/><circle cx="62" cy="100" r="14" fill="${C.white}" ${st}/>
  <text x="208" y="112" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="76" fill="${C.white}">${big}</text>
  <text x="208" y="162" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="36" fill="${C.navy}">${small}</text>`);
}
export function nail({ w = 80 } = {}) {
  return svg('0 0 80 220', w, `<rect x="6" y="6" width="68" height="20" rx="8" fill="${C.grey}" ${st}/><path d="M30 26 L50 26 L46 190 L40 214 L34 190 Z" fill="${C.grey}" ${st}/>`);
}
export function drop({ w = 70 } = {}) { return svg('0 0 70 100', w, `<path d="M35 6 Q64 48 64 64 Q64 94 35 94 Q6 94 6 64 Q6 48 35 6 Z" fill="${C.water}" ${st}/>`); }
export function bubble({ w = 420, text = '', mine = false } = {}) {
  const f = mine ? C.orange : '#E9EEF5', tc = mine ? C.white : C.ink;
  return `<div style="width:${w}px;background:${f};color:${tc};border:${S}px solid ${C.ink};border-radius:28px;padding:18px 24px;font:600 30px/1.25 Poppins;">${text}</div>`;
}
export function gutter({ w = 600, granules = true, seed = 3 } = {}) {
  const R = rng(seed); let g = '';
  if (granules) for (let i = 0; i < 46; i++) g += `<circle cx="${(30 + R() * 540).toFixed(0)}" cy="${(62 + R() * 22).toFixed(0)}" r="${(4 + R() * 3).toFixed(1)}" fill="#2B3440"/>`;
  return svg('0 0 600 120', w, `<path d="M10 30 L590 30 L570 100 L30 100 Z" fill="${C.metal}" ${st}/>${g}<line x1="10" y1="30" x2="590" y2="30" ${st}/>`);
}
export function swatch({ w = 280, kind = 'shingle' } = {}) {
  const f = { shingle: C.shingle, tile: C.tile, metal: C.metal }[kind], d = { shingle: C.shingleD, tile: C.tileD, metal: C.metalD }[kind];
  let p = '';
  if (kind === 'shingle') for (let r = 0; r < 5; r++) { p += `<line x1="20" y1="${50 + r * 40}" x2="260" y2="${50 + r * 40}" stroke="${d}" stroke-width="4"/>`; for (let x = 50 + (r % 2) * 30; x < 260; x += 60) p += `<line x1="${x}" y1="${50 + r * 40}" x2="${x}" y2="${90 + r * 40}" stroke="${d}" stroke-width="4"/>`; }
  if (kind === 'tile') for (let r = 0; r < 5; r++) { let dd = `M20 ${60 + r * 40}`; for (let x = 20; x < 250; x += 40) dd += ' q20 22 40 0'; p += `<path d="${dd}" fill="none" stroke="${d}" stroke-width="4"/>`; }
  if (kind === 'metal') for (let x = 60; x < 260; x += 50) p += `<line x1="${x}" y1="20" x2="${x}" y2="260" stroke="${d}" stroke-width="5"/>`;
  return svg('0 0 280 280', w, `<rect x="10" y="10" width="260" height="260" rx="22" fill="${f}" ${st}/><g clip-path="inset(0)">${p}</g><rect x="10" y="10" width="260" height="260" rx="22" fill="none" ${st}/>`);
}
export function ceiling({ w = 1000, id = 'cl' } = {}) {
  return svg('0 0 1000 700', w, `<rect x="0" y="0" width="1000" height="700" fill="${C.cream}"/><rect x="0" y="0" width="1000" height="150" fill="#FBF4E6"/>
  <line x1="0" y1="150" x2="1000" y2="150" ${st}/><rect x="380" y="380" width="240" height="200" rx="8" fill="#BFE0F7" ${st}/><line x1="500" y1="382" x2="500" y2="578" ${st}/>
  <rect x="80" y="560" width="250" height="120" rx="24" fill="${C.navy}" ${st}/><rect x="60" y="600" width="290" height="80" rx="20" fill="${C.navy}" ${st}/>`);
}
export function wordmark({ h = 40, base = 'assets' } = {}) {
  // A&E's official logo (from aebrothersroofing.com), transparent PNG for dark backgrounds. Never redraw or recolor it.
  return `<img class="wordmark" src="${base}/ae-logo.png" alt="A&amp;E Brothers Roofing" style="display:block;height:${h}px;width:auto">`;
}
export const ASSET_NAMES = ['house', 'palm', 'cloud', 'sun', 'bolt', 'magnifier', 'phone', 'camera', 'photoCard', 'check', 'cross', 'noSign', 'ladder', 'shield', 'clipboard', 'calendar', 'gift', 'tag', 'nail', 'drop', 'bubble', 'gutter', 'swatch', 'ceiling', 'wordmark'];
