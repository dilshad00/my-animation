/**
 * Tiny offline DSP toolkit used by scripts/generate-audio.mjs to synthesise
 * royalty-free music and sound effects. Everything is deterministic (seeded).
 */
import fs from "node:fs";

export const RATE = 44100;
export const TAU = Math.PI * 2;
export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/** Seeded PRNG (LCG) so files are identical on every run. */
export const makeRand = (seed = 1) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

export const buffer = (secs) => new Float32Array(Math.floor(secs * RATE));

/** Fills a mono buffer from fn(t, i). */
export const make = (secs, fn) => {
  const out = buffer(secs);
  for (let i = 0; i < out.length; i++) out[i] = fn(i / RATE, i);
  return out;
};

/** One-pole lowpass. k (0..1) or k(t). */
export const lowpass = (data, k) => {
  const out = new Float32Array(data.length);
  let y = 0;
  for (let i = 0; i < data.length; i++) {
    const kk = typeof k === "function" ? k(i / RATE) : k;
    y += kk * (data[i] - y);
    out[i] = y;
  }
  return out;
};
/** Two cascaded one-poles (12 dB/oct). */
export const lowpass2 = (data, k) => lowpass(lowpass(data, k), k);
export const highpass = (data, k) => {
  const lp = lowpass(data, k);
  return data.map((v, i) => v - lp[i]);
};
/** Crude band-pass: highpass(lo) of lowpass(hi). */
export const bandpass = (data, kLo, kHi) => highpass(lowpass2(data, kHi), kLo);

/** Converts a cutoff in Hz to a one-pole coefficient. */
export const hz = (f) => 1 - Math.exp((-TAU * f) / RATE);

export const noise = (secs, rand) => make(secs, () => rand() * 2 - 1);
/** Brown noise (integrated white), good for rumbles. */
export const brown = (secs, rand) => {
  let y = 0;
  return make(secs, () => {
    y = (y + (rand() * 2 - 1) * 0.02) * 0.998;
    return y * 3.5;
  });
};

/** Adds src into dst at sample offset (gain, optional pan → stereo pair). */
export const mixInto = (dst, src, at = 0, gain = 1) => {
  const o = Math.floor(at * RATE);
  for (let i = 0; i < src.length && o + i < dst.length; i++) if (o + i >= 0) dst[o + i] += src[i] * gain;
};
export const mixStereo = (L, R, src, at = 0, gain = 1, pan = 0.5) => {
  mixInto(L, src, at, gain * Math.cos((pan * Math.PI) / 2) * 1.414);
  mixInto(R, src, at, gain * Math.sin((pan * Math.PI) / 2) * 1.414);
};

/** Band-limited-ish sawtooth (naive saw softened with a one-pole). */
export const saw = (freq, secs, detune = 0, phase = 0) => {
  let ph = phase;
  const raw = make(secs, () => {
    ph += (freq * (1 + detune)) / RATE;
    ph -= Math.floor(ph);
    return ph * 2 - 1;
  });
  return lowpass(raw, 0.6);
};

/** ADSR envelope generator. */
export const adsr = (secs, a, d, s, r, hold = secs - a - d - r) =>
  make(secs, (t) => {
    if (t < a) return t / a;
    if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
    if (t < a + d + Math.max(0, hold)) return s;
    const rt = t - (a + d + Math.max(0, hold));
    return Math.max(0, s * (1 - rt / r));
  });

export const mul = (a, b) => a.map((v, i) => v * (b[i] ?? 0));

/** Warm pad note: 3 detuned saws, lowpassed, slow envelope. */
export const padNote = (midi, secs, { cutoff = 1200, attack = 1.2, release = 1.5, gain = 0.12 } = {}) => {
  const f = mtof(midi);
  const n = Math.floor(secs * RATE);
  const sum = new Float32Array(n);
  for (const dt of [-0.006, 0, 0.0065]) {
    const s = saw(f, secs, dt, Math.abs(dt) * 37);
    for (let i = 0; i < n; i++) sum[i] += s[i];
  }
  const filtered = lowpass2(sum, hz(cutoff));
  const env = adsr(secs, attack, 0.5, 0.85, release);
  return filtered.map((v, i) => v * env[i] * gain);
};

/** Soft piano / music-box tone: decaying harmonics with slight inharmonicity. */
export const pianoNote = (midi, secs = 3, gain = 0.2) => {
  const f = mtof(midi);
  return make(secs, (t) => {
    const env = Math.min(1, t / 0.005) * Math.exp(-t * 2.2);
    let v = 0;
    [1, 2.003, 3.01, 4.03, 5.06].forEach((m, k) => {
      v += Math.sin(TAU * f * m * t) * Math.exp(-t * (1 + k * 1.3)) / (k + 1) ** 1.3;
    });
    return v * env * gain;
  });
};

/** Pluck (Karplus–Strong). */
export const pluck = (midi, secs, rand, gain = 0.25, damp = 0.996) => {
  const f = mtof(midi);
  const period = Math.max(2, Math.round(RATE / f));
  const ring = Float32Array.from({ length: period }, () => rand() * 2 - 1);
  let idx = 0;
  return make(secs, () => {
    const a = ring[idx];
    const b = ring[(idx + 1) % period];
    const v = (a + b) * 0.5 * damp;
    ring[idx] = v;
    idx = (idx + 1) % period;
    return a * gain;
  });
};

/** Sub bass note with soft attack. */
export const bassNote = (midi, secs, gain = 0.3) => {
  const f = mtof(midi);
  return make(secs, (t) => {
    const env = Math.min(1, t / 0.02) * Math.min(1, (secs - t) / 0.08);
    return (Math.sin(TAU * f * t) + Math.sin(TAU * f * 2 * t) * 0.18) * env * gain;
  });
};

/** Cinematic low drum hit (taiko-like). */
export const lowHit = (rand, gain = 0.9, pitch = 1) => {
  let ph = 0;
  const nz = lowpass2(noise(0.6, rand), hz(900));
  return make(0.9, (t, i) => {
    const f = (48 + 110 * Math.exp(-t * 16)) * pitch;
    ph += (TAU * f) / RATE;
    return (Math.sin(ph) * Math.exp(-t * 4.5) + (nz[i] ?? 0) * 1.8 * Math.exp(-t * 18)) * gain;
  });
};

/** Freeverb-style stereo reverb (4 combs + 2 allpasses per channel). Returns new [L, R]. */
export const reverb = (L, R, { mix = 0.25, room = 0.84, damp = 0.35 } = {}) => {
  const proc = (inp, spread) => {
    const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => ({ buf: new Float32Array(d + spread), i: 0, lp: 0 }));
    const aps = [556, 441, 341].map((d) => ({ buf: new Float32Array(d + spread), i: 0 }));
    const out = new Float32Array(inp.length);
    for (let n = 0; n < inp.length; n++) {
      const x = inp[n] * 0.015;
      let acc = 0;
      for (const c of combs) {
        const y = c.buf[c.i];
        c.lp = y * (1 - damp) + c.lp * damp;
        c.buf[c.i] = x + c.lp * room;
        c.i = (c.i + 1) % c.buf.length;
        acc += y;
      }
      for (const a of aps) {
        const b = a.buf[a.i];
        const y = -acc + b;
        a.buf[a.i] = acc + b * 0.5;
        a.i = (a.i + 1) % a.buf.length;
        acc = y;
      }
      out[n] = acc;
    }
    return out;
  };
  const wl = proc(L, 0);
  const wr = proc(R, 23);
  return [L.map((v, i) => v * (1 - mix) + wl[i] * mix * 3), R.map((v, i) => v * (1 - mix) + wr[i] * mix * 3)];
};

/** Soft-clip and normalise to a peak. */
export const master = (chs, peak = 0.89) => {
  const sat = chs.map((c) => c.map((v) => Math.tanh(v * 1.1)));
  let p = 1e-9;
  for (const c of sat) for (const v of c) p = Math.max(p, Math.abs(v));
  return sat.map((c) => c.map((v) => (v / p) * peak));
};

/** Makes a buffer loop seamlessly: the tail (after loopLen) is folded onto the head. */
export const foldLoop = (data, loopLen) => {
  const n = Math.floor(loopLen * RATE);
  const out = data.slice(0, n);
  for (let i = n; i < data.length; i++) out[i - n] += data[i];
  return out;
};

/** Crossfades the last `secs` into the start so a file loops without a click. */
export const crossfadeLoop = (data, secs = 0.5) => {
  const xf = Math.floor(secs * RATE);
  const n = data.length - xf;
  const out = data.slice(0, n);
  for (let i = 0; i < xf; i++) {
    const k = i / xf;
    out[i] = data[i] * k + data[n + i] * (1 - k);
  }
  return out;
};

export const writeWav = (file, channels) => {
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
};
