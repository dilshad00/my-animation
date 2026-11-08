/**
 * Ambience and sound effects for documentary-style videos.
 * Loops (rain, rain-heavy, flies, spray, heartbeat) are seamless.
 */
import path from "node:path";
import {
  RATE,
  TAU,
  bandpass,
  brown,
  crossfadeLoop,
  highpass,
  hz,
  lowHit,
  lowpass,
  lowpass2,
  make,
  makeRand,
  mixInto,
  noise,
  reverb,
  writeWav,
} from "../lib/dsp.mjs";

/** Rain bed: filtered noise + many tiny drop "ticks". Seamless loop. */
const rainBed = (secs, rand, { heavy }) => {
  const len = secs + 0.6;
  const hiss = bandpass(noise(len, rand), hz(heavy ? 300 : 600), hz(heavy ? 5000 : 7000));
  const L = hiss.map((v) => v * (heavy ? 0.5 : 0.32));
  const R = bandpass(noise(len, rand), hz(heavy ? 300 : 600), hz(heavy ? 5000 : 7000)).map((v) => v * (heavy ? 0.5 : 0.32));
  if (heavy) {
    const rumble = lowpass2(brown(len, rand), hz(160));
    for (let i = 0; i < L.length; i++) {
      L[i] += rumble[i] * 0.35;
      R[i] += rumble[i] * 0.35;
    }
  }
  const drops = Math.round(len * (heavy ? 140 : 60));
  for (let k = 0; k < drops; k++) {
    const at = rand() * (len - 0.05);
    const f = 2500 + rand() * 4500;
    const g = 0.04 + rand() * (heavy ? 0.12 : 0.08);
    const tick = make(0.03, (t) => Math.sin(TAU * f * t) * Math.exp(-t * 260) * g);
    mixInto(rand() < 0.5 ? L : R, tick, at);
  }
  return [crossfadeLoop(L, 0.6), crossfadeLoop(R, 0.6)];
};

export const generateDocumentarySfx = (dir, log) => {
  const rand = makeRand(777);
  const out = (name, chs) => {
    writeWav(path.join(dir, `${name}.wav`), chs);
    log(`sfx/${name}.wav`);
  };

  out("rain", rainBed(12, rand, { heavy: false }));
  out("rain-heavy", rainBed(12, rand, { heavy: true }));

  // thunder: sharp crack, then rolling low rumble
  {
    const secs = 6;
    const crack = highpass(noise(secs, rand), hz(800)).map((v, i) => v * Math.exp((-i / RATE) * 14) * 0.9);
    const rum = lowpass2(brown(secs, rand), hz(120));
    const roll = make(secs, (t, i) => {
      const env = Math.min(1, t / 0.15) * Math.exp(-t * 0.55) * (0.75 + 0.25 * Math.sin(t * 7.3) * Math.sin(t * 2.1));
      return rum[i] * env * 1.6 + crack[i];
    });
    const [L, R] = reverb(roll, roll.map((v, i) => roll[Math.max(0, i - 400)]), { mix: 0.35, room: 0.88 });
    out("thunder", [L, R]);
  }

  // flies: a few buzzing voices drifting left/right. Seamless loop.
  {
    const secs = 8;
    const len = secs + 0.5;
    const L = new Float32Array(Math.floor(len * RATE));
    const R = new Float32Array(L.length);
    for (let v = 0; v < 4; v++) {
      const base = 170 + rand() * 90;
      const ph0 = rand() * 10;
      let ph = 0;
      const voice = make(len, (t) => {
        const f = base * (1 + 0.04 * Math.sin(t * (5 + v) + ph0) + 0.02 * Math.sin(t * 23 + v));
        ph += f / RATE;
        ph -= Math.floor(ph);
        return ph * 2 - 1;
      });
      const shaped = bandpass(voice, hz(150), hz(3500));
      for (let i = 0; i < L.length; i++) {
        const t = i / RATE;
        const amp = 0.24 * (0.55 + 0.45 * Math.sin(t * (0.7 + v * 0.3) + ph0));
        const pan = 0.5 + 0.45 * Math.sin(t * (0.5 + v * 0.21) + v);
        L[i] += shaped[i] * amp * (1 - pan);
        R[i] += shaped[i] * amp * pan;
      }
    }
    out("flies", [crossfadeLoop(L, 0.5), crossfadeLoop(R, 0.5)]);
  }

  // drip: single liquid "plip"
  {
    let ph = 0;
    const d = make(0.35, (t) => {
      const f = 900 + 1500 * Math.min(1, t / 0.05);
      ph += (TAU * f) / RATE;
      return Math.sin(ph) * Math.exp(-t * 28) * 0.8;
    });
    out("drip", reverb(d, d, { mix: 0.2 }));
  }

  // squelch: wet, sticky low gurgle
  {
    const n = noise(0.6, rand);
    const sq = lowpass(n, (t) => hz(300 + 1800 * Math.sin(Math.min(1, t / 0.6) * Math.PI))).map((v, i) => {
      const t = i / RATE;
      return v * Math.sin(Math.min(1, t / 0.6) * Math.PI) * 3 * (0.6 + 0.4 * Math.sin(t * 90));
    });
    out("squelch", [sq]);
  }

  // tear: paper page ripping (calendar day cards)
  {
    const secs = 0.9;
    const n = highpass(noise(secs, rand), hz(1200));
    const tr = make(secs, (t, i) => {
      const env = Math.min(1, t / 0.03) * (t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.2));
      const crackle = rand() < 0.08 ? 2.2 : 0.6 + 0.4 * Math.sin(t * 160);
      return n[i] * env * crackle * 0.55;
    });
    out("tear", [tr]);
  }

  // spray: fire-hose hiss, seamless loop
  {
    const secs = 5;
    const L = highpass(noise(secs + 0.4, rand), hz(900)).map((v, i) => v * 0.4 * (0.85 + 0.15 * Math.sin((i / RATE) * 31)));
    const R = highpass(noise(secs + 0.4, rand), hz(900)).map((v, i) => v * 0.4 * (0.85 + 0.15 * Math.sin((i / RATE) * 27)));
    out("spray", [crossfadeLoop(L, 0.4), crossfadeLoop(R, 0.4)]);
  }

  // boom: deep cinematic hit with tail
  {
    const hit = lowHit(rand, 1, 0.8);
    const tail = lowpass2(brown(4, rand), hz(90)).map((v, i) => v * Math.exp((-i / RATE) * 1.2) * 0.8);
    const b = new Float32Array(Math.floor(4 * RATE));
    mixInto(b, hit, 0, 1);
    mixInto(b, tail, 0, 1);
    out("boom", reverb(b, b, { mix: 0.3, room: 0.9 }));
  }

  // heartbeat: lub-dub, 1.5 s loop (≈ 80 bpm, tense)
  {
    const secs = 1.5;
    const hb = new Float32Array(Math.floor(secs * RATE));
    const thump = (gain) => {
      let ph = 0;
      return make(0.25, (t) => {
        const f = 55 + 40 * Math.exp(-t * 30);
        ph += (TAU * f) / RATE;
        return Math.sin(ph) * Math.exp(-t * 16) * gain;
      });
    };
    mixInto(hb, thump(1), 0.02);
    mixInto(hb, thump(0.7), 0.3);
    out("heartbeat", [hb]);
  }

  // stinger: dissonant rising swell into a hit (chapter/tension moments)
  {
    const secs = 3.2;
    const sw = make(secs, (t) => {
      const k = Math.min(1, t / 2.4);
      const env = k * k * (t > 2.4 ? Math.exp(-(t - 2.4) * 5) : 1);
      return [196, 207.65, 293.66].reduce((a, f, j) => a + Math.sin(TAU * f * (1 + 0.02 * k) * t + j), 0) * env * 0.2;
    });
    mixInto(sw, lowHit(rand, 0.9), 2.4);
    out("stinger", reverb(sw, sw, { mix: 0.35, room: 0.88 }));
  }
};
