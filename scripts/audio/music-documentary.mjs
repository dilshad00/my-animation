/**
 * Five documentary underscore loops, synthesised offline (royalty-free).
 * Each is written for a mood; use them as music cues in storyboard.json:
 *
 *   mystery  – D minor, 70 bpm, pads + music-box motif (history, cold opens)
 *   curious  – A minor, 96 bpm, plucked arpeggios + light pulse (explanations)
 *   tension  – C minor, 92 bpm, driving ostinato + low drums (escalating danger)
 *   dread    – E minor, 60 bpm, drones, clusters, heartbeat (bleak consequences)
 *   hope     – F major, 76 bpm, warm pads + piano (recovery, conclusions)
 */
import path from "node:path";
import {
  RATE,
  TAU,
  bassNote,
  crossfadeLoop,
  hz,
  lowHit,
  lowpass2,
  make,
  makeRand,
  master,
  mixStereo,
  noise,
  padNote,
  pianoNote,
  pluck,
  reverb,
  saw,
  writeWav,
  highpass,
} from "../lib/dsp.mjs";

const TAIL = 4; // seconds rendered past the loop point, then crossfaded into the head

const track = (secs) => {
  const n = Math.floor((secs + TAIL) * RATE);
  return [new Float32Array(n), new Float32Array(n)];
};

const finish = (L, R, loopSecs, rv) => {
  const [wl, wr] = reverb(L, R, rv);
  // fold the reverb tail back to the start so the loop point is seamless
  const n = Math.floor(loopSecs * RATE);
  const fl = wl.slice(0, n);
  const fr = wr.slice(0, n);
  for (let i = n; i < wl.length; i++) {
    fl[i - n] += wl[i];
    fr[i - n] += wr[i];
  }
  const [ml, mr] = master([fl, fr]);
  return [crossfadeLoop(ml, 0.05), crossfadeLoop(mr, 0.05)];
};

const pads = (L, R, chords, barSecs, barsPerChord, totalBars, opts) => {
  for (let b = 0; b < totalBars; b += barsPerChord) {
    const chord = chords[(b / barsPerChord) % chords.length];
    const at = b * barSecs;
    const len = barsPerChord * barSecs + 1.2;
    chord.forEach((m, k) => mixStereo(L, R, padNote(m, len, opts), at, 1, 0.25 + (k / Math.max(1, chord.length - 1)) * 0.5));
  }
};

const mystery = (rand) => {
  const bpm = 70;
  const bar = (60 / bpm) * 4;
  const bars = 16;
  const secs = bars * bar;
  const [L, R] = track(secs);
  // Dm(add9) – Bbmaj7 – Gm9 – A7sus4
  const chords = [
    [50, 57, 62, 64, 65],
    [46, 53, 57, 62, 65],
    [43, 50, 57, 58, 62],
    [45, 52, 57, 62, 67],
  ];
  pads(L, R, chords, bar, 4, bars, { cutoff: 900, attack: 2.2, release: 2.5, gain: 0.09 });
  // sub drone on the root of each chord
  for (let b = 0; b < bars; b += 4) mixStereo(L, R, bassNote(chords[(b / 4) % 4][0] - 12, 4 * bar + 0.5, 0.22), b * bar, 1, 0.5);
  // music-box motif, sparse and high
  const motif = [74, 77, 76, 72, 74, 69, 0, 0, 70, 74, 72, 69, 67, 69, 0, 0];
  for (let b = 0; b < bars; b++) {
    if (b % 4 === 3) continue;
    for (let s = 0; s < 4; s++) {
      const m = motif[((b * 4 + s) * 3) % motif.length];
      if (!m || rand() < 0.35) continue;
      mixStereo(L, R, pianoNote(m + 12, 3.2, 0.09), b * bar + s * (bar / 4), 1, 0.3 + rand() * 0.4);
    }
  }
  // airy noise wind
  const air = highpass(lowpass2(noise(secs + TAIL, rand), hz(2500)), hz(400));
  for (let i = 0; i < L.length; i++) {
    const w = 0.025 * (0.6 + 0.4 * Math.sin((i / RATE) * 0.21));
    L[i] += air[i] * w;
    R[i] += air[(i + 900) % air.length] * w;
  }
  return finish(L, R, secs, { mix: 0.38, room: 0.9 });
};

const curious = (rand) => {
  const bpm = 96;
  const beat = 60 / bpm;
  const bar = beat * 4;
  const bars = 16;
  const secs = bars * bar;
  const [L, R] = track(secs);
  // Am9 – Fmaj7 – C(add9) – G6
  const chords = [
    [45, 52, 57, 59, 60],
    [41, 48, 53, 57, 64],
    [48, 52, 55, 62, 64],
    [43, 50, 55, 59, 64],
  ];
  pads(L, R, chords, bar, 2, bars, { cutoff: 1100, attack: 0.8, release: 1.2, gain: 0.06 });
  for (let b = 0; b < bars; b++) {
    const chord = chords[Math.floor(b / 2) % 4];
    // plucked 16th arpeggio
    for (let s = 0; s < 16; s++) {
      const m = chord[[1, 2, 3, 4, 3, 2, 4, 1, 2, 3, 4, 3, 2, 3, 4, 2][s]] + 12;
      const g = s % 4 === 0 ? 0.16 : 0.1;
      mixStereo(L, R, pluck(m, 0.9, rand, g, 0.994), b * bar + s * (beat / 4), 1, 0.5 + 0.35 * Math.sin(s * 0.9 + b));
    }
    // light pulse: soft kick on 1 and 3, bass on 1
    mixStereo(L, R, lowHit(rand, 0.35, 1.3), b * bar, 1, 0.5);
    mixStereo(L, R, lowHit(rand, 0.22, 1.3), b * bar + 2 * beat, 1, 0.5);
    mixStereo(L, R, bassNote(chord[0] - 12, bar * 0.95, 0.2), b * bar, 1, 0.5);
  }
  return finish(L, R, secs, { mix: 0.25, room: 0.82 });
};

const tension = (rand) => {
  const bpm = 92;
  const beat = 60 / bpm;
  const bar = beat * 4;
  const bars = 32;
  const secs = bars * bar;
  const [L, R] = track(secs);
  // Cm – Ab – Fm – G (second half adds strings and more drums)
  const chords = [
    [48, 55, 60, 63],
    [44, 51, 56, 60],
    [41, 48, 53, 56],
    [43, 50, 55, 59],
  ];
  pads(L, R, chords, bar, 2, bars, { cutoff: 700, attack: 1.0, release: 1.4, gain: 0.07 });
  for (let b = 0; b < bars; b++) {
    const chord = chords[Math.floor(b / 2) % 4];
    const second = b >= 16;
    // driving 8th-note ostinato on the root, low saw through a filter that opens over the bar
    for (let s = 0; s < 8; s++) {
      const m = chord[0] - 12 + (s === 3 || s === 6 ? 7 : 0);
      const len = beat / 2;
      const note = lowpass2(saw((440 * Math.pow(2, (m - 69) / 12)) * 2, len), hz(500 + s * 90 + (second ? 500 : 0))).map(
        (v, i) => v * Math.min(1, i / 200) * Math.exp((-i / RATE) * 6) * 0.22,
      );
      mixStereo(L, R, note, b * bar + s * len, 1, 0.5);
    }
    // drums: low hits on 1 and the "and" of 2; more in the second half
    mixStereo(L, R, lowHit(rand, 0.75), b * bar, 1, 0.5);
    mixStereo(L, R, lowHit(rand, 0.45, 1.15), b * bar + beat * 1.5, 1, 0.42);
    if (second) {
      mixStereo(L, R, lowHit(rand, 0.55, 0.9), b * bar + beat * 3, 1, 0.58);
      if (b % 2 === 1) for (let k = 0; k < 4; k++) mixStereo(L, R, lowHit(rand, 0.25 + k * 0.08, 1.4), b * bar + beat * 3 + k * (beat / 4), 1, 0.5);
    }
    // high tremolo strings in the second half
    if (second) {
      chord.slice(1).forEach((m, k) => {
        const s = lowpass2(saw((440 * Math.pow(2, (m + 12 - 69) / 12)), bar + 0.3, k * 0.003), hz(2200)).map((v, i) => {
          const t = i / RATE;
          return v * 0.035 * (0.6 + 0.4 * Math.sin(TAU * 9 * t)) * Math.min(1, t / 0.4);
        });
        mixStereo(L, R, s, b * bar, 1, 0.2 + k * 0.3);
      });
    }
  }
  return finish(L, R, secs, { mix: 0.28, room: 0.86 });
};

const dread = (rand) => {
  const bpm = 60;
  const bar = (60 / bpm) * 4;
  const bars = 24;
  const secs = bars * bar;
  const [L, R] = track(secs);
  // drones: E1 + B1 with slow beating
  const drone = make(secs + TAIL, (t) => {
    const f1 = 41.2;
    const f2 = 61.74;
    return (Math.sin(TAU * f1 * t) + Math.sin(TAU * f1 * 1.003 * t) * 0.7 + Math.sin(TAU * f2 * t) * 0.5) * 0.12 * (0.7 + 0.3 * Math.sin(t * 0.13));
  });
  for (let i = 0; i < L.length; i++) {
    L[i] += drone[i];
    R[i] += drone[(i + 300) % drone.length];
  }
  // dissonant cluster swells every 4 bars: Em(b9) colours
  const clusters = [
    [52, 53, 59, 64],
    [52, 55, 58, 65],
    [48, 52, 59, 63],
  ];
  for (let b = 0; b < bars; b += 4) {
    const c = clusters[(b / 4) % clusters.length];
    c.forEach((m, k) => mixStereo(L, R, padNote(m, 4 * bar + 2, { cutoff: 600, attack: 4, release: 4, gain: 0.07 }), b * bar, 1, 0.2 + k * 0.2));
  }
  // heartbeat-like double thump each bar
  for (let b = 0; b < bars; b++) {
    mixStereo(L, R, lowHit(rand, 0.5, 0.75), b * bar, 1, 0.5);
    mixStereo(L, R, lowHit(rand, 0.32, 0.8), b * bar + 0.32, 1, 0.5);
  }
  // occasional metallic shimmer (bowed-glass feel)
  for (let b = 2; b < bars; b += 6) {
    const f = 880 * (1 + rand() * 0.06);
    const sh = make(6, (t) => (Math.sin(TAU * f * t) + Math.sin(TAU * f * 2.76 * t) * 0.4) * Math.sin(Math.min(1, t / 6) * Math.PI) * 0.03);
    mixStereo(L, R, sh, b * bar + 1, 1, rand());
  }
  return finish(L, R, secs, { mix: 0.42, room: 0.92, damp: 0.5 });
};

const hope = (rand) => {
  const bpm = 76;
  const beat = 60 / bpm;
  const bar = beat * 4;
  const bars = 16;
  const secs = bars * bar;
  const [L, R] = track(secs);
  // Fmaj9 – C/E – Dm7 – Bbmaj7(#11)
  const chords = [
    [41, 53, 57, 60, 67],
    [40, 52, 55, 60, 67],
    [38, 50, 57, 60, 65],
    [34, 50, 53, 57, 64],
  ];
  pads(L, R, chords, bar, 2, bars, { cutoff: 1600, attack: 1.5, release: 2, gain: 0.08 });
  for (let b = 0; b < bars; b++) {
    const chord = chords[Math.floor(b / 2) % 4];
    mixStereo(L, R, bassNote(chord[0], bar * 0.98, 0.2), b * bar, 1, 0.5);
    // gentle piano arpeggio on 8ths
    for (let s = 0; s < 8; s++) {
      const m = chord[[1, 2, 3, 4, 3, 2, 3, 4][s]] + 12;
      mixStereo(L, R, pianoNote(m, 2.5, s % 4 === 0 ? 0.13 : 0.08), b * bar + s * (beat / 2), 1, 0.35 + 0.3 * Math.sin(s + b));
    }
    // melody in the second half
    if (b >= 8 && b % 2 === 0) {
      const mel = [72, 74, 76, 79, 77, 76, 74, 72];
      mixStereo(L, R, pianoNote(mel[(b - 8) % mel.length] + 12, 3.5, 0.12), b * bar + beat * 0.5, 1, 0.6);
      mixStereo(L, R, pianoNote(mel[(b - 7) % mel.length] + 12, 3, 0.1), b * bar + beat * 2.5, 1, 0.4);
    }
  }
  return finish(L, R, secs, { mix: 0.32, room: 0.88 });
};

export const generateDocumentaryMusic = (dir, log) => {
  const tracks = { mystery, curious, tension, dread, hope };
  Object.entries(tracks).forEach(([name, fn], k) => {
    const [L, R] = fn(makeRand(9000 + k));
    writeWav(path.join(dir, `${name}.wav`), [L, R]);
    log(`music/${name}.wav  (${(L.length / RATE).toFixed(1)} s loop)`);
  });
};
