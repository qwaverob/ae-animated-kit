#!/usr/bin/env node
// Optional voiceover with ElevenLabs (stock voice only, never a cloned voice).
//   ELEVENLABS_API_KEY must be set in your shell. The key is never written to disk or printed.
//   node engine/vo.mjs specs/<slug>.json
// Writes out/<slug>/video/voice.wav + timing.json, then re-run build.mjs so scenes and captions follow the voice.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// key: ELEVENLABS_API_KEY from the shell, or from this kit's git-ignored .env (written by engine/save-key.sh)
let KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY && existsSync(join(ROOT, '.env'))) { const m = readFileSync(join(ROOT, '.env'), 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m); if (m) KEY = m[1].trim(); }
if (!KEY) { console.error('NO_KEY: no ElevenLabs key saved yet. Run engine/save-key.sh once (see the skill), or make the video silent.'); process.exit(3); }
// Default: "Brian", an ElevenLabs stock voice. Override with ELEVENLABS_VOICE_ID (stock/library voices only).
// quick check:  node engine/vo.mjs --line "Short test line." out/voice-test.mp3
const VOICE0 = process.env.ELEVENLABS_VOICE_ID || 'nPczCjzI2devNBz1zQrb', MODEL0 = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
if (process.argv[2] === '--line') {
  const out = process.argv[4] || join(ROOT, 'out', 'voice-test.mp3'); mkdirSync(dirname(resolve(out)), { recursive: true });
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE0}?output_format=mp3_44100_128`, { method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: process.argv[3] || 'This is a voice test.', model_id: MODEL0 }) });
  if (!r.ok) { console.error(`ElevenLabs error: HTTP ${r.status}. Check the key and your ElevenLabs credits.`); process.exit(1); }
  writeFileSync(out, Buffer.from(await r.arrayBuffer())); console.log('voice test saved: ' + out); process.exit(0);
}
const spec = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const VOICE = process.env.ELEVENLABS_VOICE_ID || 'nPczCjzI2devNBz1zQrb';
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const dir = join(ROOT, 'out', spec.slug, 'video'); const tmp = join(dir, 'vo-parts'); mkdirSync(tmp, { recursive: true });
const GAP = 0.25; // seconds of breath between scenes
let t = 0; const scenes = [], words = [], list = [];
for (const [i, sc] of (spec.scenes || []).entries()) {
  const text = (sc.say || '').trim();
  if (!text) { const p = join(tmp, `s${i}.wav`); execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', '2.5', p]); scenes.push({ start: +t.toFixed(3), end: +(t + 2.5).toFixed(3) }); list.push({ file: p, pad: 0 }); t += 2.5; continue; }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2 } }) });
  if (!res.ok) { console.error(`ElevenLabs error on scene ${i + 1}: HTTP ${res.status}. Check the key and your ElevenLabs credits.`); process.exit(1); }
  const j = await res.json();
  const mp3 = join(tmp, `s${i}.mp3`); writeFileSync(mp3, Buffer.from(j.audio_base64, 'base64'));
  const a = j.alignment, ch = a.characters; let cur = '', st = null, en = 0;
  const push = () => { if (cur.trim()) words.push({ scene: i, text: cur.trim(), start: +(t + st).toFixed(3), end: +(t + en).toFixed(3) }); cur = ''; st = null; };
  ch.forEach((c, k) => { if (/\s/.test(c)) { push(); return; } if (st === null) st = a.character_start_times_seconds[k]; cur += c; en = a.character_end_times_seconds[k]; }); push();
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).toString());
  scenes.push({ start: +t.toFixed(3), end: +(t + dur + GAP).toFixed(3) }); list.push({ file: mp3, pad: GAP }); t += dur + GAP;
  console.log(`scene ${i + 1}: ${dur.toFixed(2)} s`);
}
const inputs = [], filt = [];
list.forEach((p, k) => { inputs.push('-i', p.file); filt.push(`[${k}:a]aresample=48000,aformat=channel_layouts=stereo,apad=pad_dur=${p.pad}[a${k}]`); });
const cat = list.map((_, k) => `[a${k}]`).join('') + `concat=n=${list.length}:v=0:a=1[out]`;
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', filt.join(';') + ';' + cat, '-map', '[out]', join(dir, 'voice.wav')]);
writeFileSync(join(dir, 'timing.json'), JSON.stringify({ voice: VOICE, scenes, words }, null, 1));
console.log(`voice.wav ${t.toFixed(1)} s, ${words.length} words timed. Now run: node engine/build.mjs video ${process.argv[2]}`);
if (t < 28 || t > 42) console.log('NOTE: voice is outside 30 to 40 s. Trim or add words in the "say" lines.');
