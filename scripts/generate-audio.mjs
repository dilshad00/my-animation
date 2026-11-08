#!/usr/bin/env node
/**
 * Synthesises royalty-free sound effects and a calm background-music loop
 * into public/sfx/ and public/music/. No external services are used.
 *
 *   npm run audio:generate
 */
import fs from "node:fs";
import path from "node:path";
import { generateDocumentarySfx } from "./audio/sfx-documentary.mjs";
import { generateDocumentaryMusic } from "./audio/music-documentary.mjs";

const RATE = 44100;
const root = path.resolve(import.meta.dirname, "..");
const sfxDir = path.join(root, "public", "sfx");
const musicDir = path.join(root, "public", "music");
fs.mkdirSync(sfxDir, { recursive: true });
fs.mkdirSync(musicDir, { recursive: true });

let seed = 12345;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const writeWav = (file, channels) => {
  const n = channels[0].length;
  const ch = channels.length;
  const buf = Buffer.alloc(44 + n * 2 * ch);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2 * ch, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(ch, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2 * ch, 28);
  buf.writeUInt16LE(2 * ch, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2 * ch, 40);
  let peak = 1e-9;
  for (const c of channels) for (const v of c) peak = Math.max(peak, Math.abs(v));
  const norm = peak > 0.95 ? 0.95 / peak : 1;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < ch; c++) {
      const v = Math.max(-1, Math.min(1, channels[c][i] * norm));
      buf.writeInt16LE(Math.round(v * 32767), 44 + (i * ch + c) * 2);
    }
  }
  fs.writeFileSync(file, buf);
  console.log("  ✓", path.relative(root, file));
};

const make = (secs, fn) => {
  const n = Math.floor(secs * RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / RATE, i);
  return out;
};

const lowpass = (data, k) => {
  const out = new Float32Array(data.length);
  let y = 0;
  for (let i = 0; i < data.length; i++) {
    const kk = typeof k === "function" ? k(i / RATE) : k;
    y += kk * (data[i] - y);
    out[i] = y;
  }
  return out;
};

console.log("Generating sound effects…");
const TAU = Math.PI * 2;

// pop – quick pitched blip
{
  let ph = 0;
  writeWav(path.join(sfxDir, "pop.wav"), [
    make(0.16, (t) => {
      const f = 900 * Math.exp(-t * 18) + 180;
      ph += (TAU * f) / RATE;
      return Math.sin(ph) * Math.exp(-t * 26) * 0.9;
    }),
  ]);
}
// swoosh – band-limited noise sweep
{
  const noise = make(0.55, () => rand() * 2 - 1);
  const filtered = lowpass(noise, (t) => 0.02 + 0.25 * Math.sin(Math.min(1, t / 0.55) * Math.PI));
  writeWav(path.join(sfxDir, "swoosh.wav"), [filtered.map((v, i) => v * Math.sin(Math.min(1, i / RATE / 0.55) * Math.PI) * 2.2)]);
}
// chime – bell partials
writeWav(path.join(sfxDir, "chime.wav"), [
  make(1.6, (t) => [1, 2.01, 3.02, 4.2].reduce((a, m, k) => a + Math.sin(TAU * 880 * m * t) * Math.exp(-t * (2.5 + k * 1.5)) / (k + 1), 0) * 0.6),
]);
// riser
{
  let ph = 0;
  const noise = lowpass(make(1.6, () => rand() * 2 - 1), (t) => 0.02 + 0.2 * (t / 1.6));
  writeWav(path.join(sfxDir, "riser.wav"), [
    make(1.6, (t, i) => {
      const f = 200 + 900 * Math.pow(t / 1.6, 2);
      ph += (TAU * f) / RATE;
      const env = Math.pow(t / 1.6, 1.5) * (t > 1.55 ? (1.6 - t) / 0.05 : 1);
      return (Math.sin(ph) * 0.35 + noise[i] * 1.6) * env;
    }),
  ]);
}
// impact – sub thump + noise
{
  let ph = 0;
  const noise = lowpass(make(0.8, () => rand() * 2 - 1), 0.08);
  writeWav(path.join(sfxDir, "impact.wav"), [
    make(0.8, (t, i) => {
      const f = 40 + 90 * Math.exp(-t * 12);
      ph += (TAU * f) / RATE;
      return Math.sin(ph) * Math.exp(-t * 5) + noise[i] * 2 * Math.exp(-t * 14);
    }),
  ]);
}
// tick
writeWav(path.join(sfxDir, "tick.wav"), [make(0.05, (t) => Math.sin(TAU * 2400 * t) * Math.exp(-t * 160))]);
// bubble
{
  let ph = 0;
  writeWav(path.join(sfxDir, "bubble.wav"), [
    make(0.14, (t) => {
      const f = 300 + 1400 * (t / 0.14);
      ph += (TAU * f) / RATE;
      return Math.sin(ph) * Math.sin((t / 0.14) * Math.PI) * 0.8;
    }),
  ]);
}
// sparkle – random high pings
{
  const pings = Array.from({ length: 7 }, (_, k) => ({ at: k * 0.07 + rand() * 0.03, f: 2000 + rand() * 2500 }));
  writeWav(path.join(sfxDir, "sparkle.wav"), [
    make(1.0, (t) => pings.reduce((a, p) => (t >= p.at ? a + Math.sin(TAU * p.f * (t - p.at)) * Math.exp(-(t - p.at) * 9) : a), 0) * 0.35),
  ]);
}

console.log("Generating music loop…");
{
  // Calm, warm explainer bed: Cmaj9 – Am9 – Fmaj7 – G6sus, 84 bpm, 8 bars per chord cycle ×2.
  const bpm = 84;
  const beat = 60 / bpm;
  const bar = beat * 4;
  const chords = [
    [48, 55, 59, 62, 64],
    [45, 52, 55, 59, 60],
    [41, 48, 52, 55, 57],
    [43, 50, 55, 57, 62],
  ];
  const bars = 16;
  const secs = bars * bar;
  const n = Math.floor(secs * RATE);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // pads
  for (let b = 0; b < bars; b++) {
    const chord = chords[Math.floor(b / 2) % 4];
    const start = b * bar;
    for (let i = Math.floor(start * RATE); i < Math.min(n, Math.floor((start + bar + 0.6) * RATE)); i++) {
      const t = i / RATE - start;
      const env = Math.min(1, t / 0.8) * (t > bar ? Math.max(0, 1 - (t - bar) / 0.6) : 1);
      let vl = 0;
      let vr = 0;
      chord.forEach((m, k) => {
        const f = mtof(m + 12);
        vl += Math.sin(TAU * f * 1.002 * (i / RATE)) * 0.09 + Math.sin(TAU * f * 2 * (i / RATE)) * 0.012;
        vr += Math.sin(TAU * f * 0.998 * (i / RATE) + k) * 0.09 + Math.sin(TAU * f * 2 * (i / RATE) + k) * 0.012;
      });
      L[i] += vl * env;
      R[i] += vr * env;
    }
    // soft bass
    const root = chord[0] - 12;
    for (let i = Math.floor(start * RATE); i < Math.min(n, Math.floor((start + bar) * RATE)); i++) {
      const t = i / RATE - start;
      const v = Math.sin(TAU * mtof(root) * (i / RATE)) * 0.22 * Math.min(1, t / 0.05) * Math.exp(-((t % (beat * 2)) * 0.9));
      L[i] += v;
      R[i] += v;
    }
    // plucked arpeggio (8th notes)
    for (let s = 0; s < 8; s++) {
      const m = chord[[1, 2, 3, 4, 3, 2, 4, 3][s]] + 24;
      const at = start + s * (beat / 2);
      const pan = 0.5 + 0.35 * Math.sin(s * 1.3 + b);
      for (let i = Math.floor(at * RATE); i < Math.min(n, Math.floor((at + 1.2) * RATE)); i++) {
        const t = i / RATE - at;
        const v = (Math.sin(TAU * mtof(m) * t) + Math.sin(TAU * mtof(m) * 2 * t) * 0.3) * Math.exp(-t * 4.5) * 0.07 * Math.min(1, t / 0.004);
        L[i] += v * (1 - pan);
        R[i] += v * pan;
      }
    }
  }
  // gentle stereo delay / room
  const d = Math.floor(beat * 0.75 * RATE);
  for (let i = d; i < n; i++) {
    L[i] += R[i - d] * 0.18;
    R[i] += L[i - d] * 0.18;
  }
  // make the loop seamless: crossfade the tail into the head
  const xf = Math.floor(0.6 * RATE);
  for (let i = 0; i < xf; i++) {
    const k = i / xf;
    L[i] = L[i] * k + L[n - xf + i] * (1 - k);
    R[i] = R[i] * k + R[n - xf + i] * (1 - k);
  }
  writeWav(path.join(musicDir, "calm-explainer.wav"), [L.slice(0, n - xf), R.slice(0, n - xf)]);
}
console.log("Generating documentary SFX…");
generateDocumentarySfx(sfxDir, (n) => console.log("  ✓", "public/" + n));
console.log("Generating documentary music (takes a minute)…");
generateDocumentaryMusic(musicDir, (n) => console.log("  ✓", "public/" + n));
console.log("Done.");
