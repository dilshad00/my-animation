/**
 * NARRATION & TIMING
 * ---------------------------------------------------------------------------
 * Converts (script + optional word timestamps) into an exact frame timeline.
 *
 * - With a voiceover + captions JSON: every scene's narration text is aligned
 *   against the transcribed words (tolerant to transcription mistakes), and
 *   each scene plays *its own slice* of the voiceover. This means scenes can be
 *   lengthened, re-ordered or separated by silent title cards without the
 *   audio drifting out of sync.
 * - Without a voiceover: word timings are estimated from words-per-minute so
 *   you can draft and preview the full video before recording.
 */

export type CaptionLike = {
  text: string;
  startMs: number;
  endMs: number;
};

export type Word = {
  text: string;
  /** seconds */
  start: number;
  end: number;
};

export type SceneTiming = {
  id: string;
  index: number;
  /** absolute first frame in the video */
  from: number;
  durationInFrames: number;
  /** frames of the transition into this scene (overlaps the previous scene) */
  transitionIn: number;
  /** voiceover slice to play (seconds in the voiceover file) */
  audio: { start: number; end: number } | null;
  /** scene-relative seconds at which the voiceover slice begins */
  narrationStart: number;
  /** scene-relative word timings */
  words: Word[];
};

export type Timeline = {
  fps: number;
  totalFrames: number;
  mode: "captions" | "estimate";
  scenes: SceneTiming[];
  warnings: string[];
};

export type TimelineSceneInput = {
  id: string;
  narration?: string;
  duration?: number;
  hold?: number;
  transitionSeconds: number;
};

export const normalizeWord = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");

export const splitWords = (text: string): string[] =>
  text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w.length > 0);

/** Whisper emits sub-word tokens; merge tokens without a leading space. */
export const captionsToWords = (captions: CaptionLike[]): Word[] => {
  const words: Word[] = [];
  for (const c of captions) {
    const raw = c.text;
    const startsNew = words.length === 0 || /^\s/.test(raw);
    const text = raw.trim();
    if (text.length === 0) continue;
    const isPunct = normalizeWord(text).length === 0;
    if (!startsNew || (isPunct && words.length > 0)) {
      const last = words[words.length - 1];
      last.text += text;
      last.end = Math.max(last.end, c.endMs / 1000);
      continue;
    }
    // a caption may itself contain several words (SRT-style captions)
    const parts = splitWords(text);
    const s = c.startMs / 1000;
    const e = Math.max(s + 0.05, c.endMs / 1000);
    const totalChars = parts.reduce((a, p) => a + Math.max(1, p.length), 0);
    let cursor = s;
    for (const p of parts) {
      const d = ((e - s) * Math.max(1, p.length)) / totalChars;
      words.push({ text: p, start: cursor, end: cursor + d });
      cursor += d;
    }
  }
  return words;
};

/** Estimate natural speech timing for a block of text. */
export const estimateWords = (text: string, wpm: number): Word[] => {
  const words = splitWords(text);
  const base = 60 / wpm;
  const out: Word[] = [];
  let t = 0;
  for (const w of words) {
    const letters = normalizeWord(w).length;
    const d = base * (0.62 + Math.min(0.9, letters * 0.075));
    out.push({ text: w, start: t, end: t + d * 0.92 });
    t += d;
    if (/[.!?…]["')\]]?$/.test(w)) t += 0.42;
    else if (/[,;:—–]["')\]]?$/.test(w)) t += 0.2;
  }
  return out;
};

// ------------------------------------------------------------ alignment
const similar = (a: string, b: string) => {
  if (a === b) return true;
  if (a.length > 3 && b.length > 3 && (a.startsWith(b) || b.startsWith(a)))
    return true;
  // single edit distance for words >= 4 letters
  if (Math.abs(a.length - b.length) > 1 || a.length < 4) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    edits++;
    if (edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
};

/**
 * Global alignment (Needleman–Wunsch) of script words against transcribed
 * words. Returns, for every script word, the index of the matching
 * transcribed word or -1.
 */
export const alignWords = (script: string[], heard: string[]): number[] => {
  const n = script.length;
  const m = heard.length;
  const MATCH = 3;
  const MISMATCH = -1;
  const GAP = -1;
  const trace = new Uint8Array((n + 1) * (m + 1)); // 0 diag,1 up,2 left
  let prev = new Int32Array(m + 1);
  let cur = new Int32Array(m + 1);
  for (let j = 0; j <= m; j++) {
    prev[j] = j * GAP;
    trace[j] = 2;
  }
  for (let i = 1; i <= n; i++) {
    cur[0] = i * GAP;
    trace[i * (m + 1)] = 1;
    const sw = script[i - 1];
    for (let j = 1; j <= m; j++) {
      const diag = prev[j - 1] + (similar(sw, heard[j - 1]) ? MATCH : MISMATCH);
      const up = prev[j] + GAP;
      const left = cur[j - 1] + GAP;
      let best = diag;
      let dir = 0;
      if (up > best) {
        best = up;
        dir = 1;
      }
      if (left > best) {
        best = left;
        dir = 2;
      }
      cur[j] = best;
      trace[i * (m + 1) + j] = dir;
    }
    const tmp = prev;
    prev = cur;
    cur = tmp;
  }
  const result = new Array<number>(n).fill(-1);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const dir = trace[i * (m + 1) + j];
    if (dir === 0) {
      // substitution or match → both consume; accept as positional anchor
      result[i - 1] = j - 1;
      i--;
      j--;
    } else if (dir === 1) {
      i--;
    } else {
      j--;
    }
  }
  return result;
};

/** Gives every script word a time, interpolating words that were not heard. */
export const timeScriptWords = (
  scriptWords: string[],
  heard: Word[],
): Word[] => {
  const map = alignWords(
    scriptWords.map(normalizeWord),
    heard.map((w) => normalizeWord(w.text)),
  );
  const out: (Word | null)[] = scriptWords.map((w, i) =>
    map[i] >= 0 ? { text: w, start: heard[map[i]].start, end: heard[map[i]].end } : null,
  );
  // interpolate gaps
  for (let i = 0; i < out.length; i++) {
    if (out[i]) continue;
    let a = i - 1;
    while (a >= 0 && !out[a]) a--;
    let b = i + 1;
    while (b < out.length && !out[b]) b++;
    const t0 = a >= 0 ? out[a]!.end : b < out.length ? Math.max(0, out[b]!.start - 0.3 * (b - i)) : 0;
    const t1 = b < out.length ? out[b]!.start : t0 + 0.3 * (i - a);
    const span = b - a;
    const k0 = (i - a) / span;
    const k1 = (i - a + 0.85) / span;
    out[i] = {
      text: scriptWords[i],
      start: t0 + (t1 - t0) * k0,
      end: t0 + (t1 - t0) * Math.min(1, k1),
    };
  }
  return out as Word[];
};

// ------------------------------------------------------------- timeline
export const buildTimeline = (opts: {
  fps: number;
  scenes: TimelineSceneInput[];
  captions: CaptionLike[] | null;
  wordsPerMinute: number;
  /** 0..1 — fraction of each incoming transition during which the voiceover already plays (0 = waits for it to finish) */
  narrationOverlap?: number;
}): Timeline => {
  const { fps, scenes } = opts;
  const warnings: string[] = [];
  const mode = opts.captions && opts.captions.length > 0 ? "captions" : "estimate";

  // 1. word timings per scene in "source" seconds
  const sceneWords: Word[][] = scenes.map(() => []);
  if (mode === "captions") {
    const heard = captionsToWords(opts.captions!);
    const all: string[] = [];
    const owner: number[] = [];
    scenes.forEach((s, i) => {
      for (const w of splitWords(s.narration ?? "")) {
        all.push(w);
        owner.push(i);
      }
    });
    const timed = timeScriptWords(all, heard);
    timed.forEach((w, k) => sceneWords[owner[k]].push(w));
    const matched = alignWords(
      all.map(normalizeWord),
      heard.map((w) => normalizeWord(w.text)),
    ).filter((v, k) => v >= 0 && similar(normalizeWord(all[k]), normalizeWord(heard[v].text))).length;
    const ratio = all.length ? matched / all.length : 1;
    if (ratio < 0.8) {
      warnings.push(
        `Only ${Math.round(ratio * 100)}% of the script matched the voiceover transcript. Check that the narration in storyboard.json matches the recording.`,
      );
    }
  } else {
    let cursor = 0;
    scenes.forEach((s, i) => {
      const est = estimateWords(s.narration ?? "", opts.wordsPerMinute);
      sceneWords[i] = est.map((w) => ({
        text: w.text,
        start: w.start + cursor,
        end: w.end + cursor,
      }));
      const last = est[est.length - 1];
      cursor += (last ? last.end : 0) + 0.6;
    });
  }

  // 2. audio slices
  const narrated = scenes.map((_, i) => sceneWords[i].length > 0);
  const slices: ({ start: number; end: number } | null)[] = scenes.map(() => null);
  const LEAD = 0.18;
  const TAIL = 0.45;
  for (let i = 0; i < scenes.length; i++) {
    if (!narrated[i]) continue;
    const ws = sceneWords[i];
    const first = ws[0].start;
    const last = ws[ws.length - 1].end;
    let prevEnd = -Infinity;
    for (let k = i - 1; k >= 0; k--) {
      if (narrated[k]) {
        const pw = sceneWords[k];
        prevEnd = pw[pw.length - 1].end;
        break;
      }
    }
    let nextStart = Infinity;
    for (let k = i + 1; k < scenes.length; k++) {
      if (narrated[k]) {
        nextStart = sceneWords[k][0].start;
        break;
      }
    }
    const start = Math.max(0, first - LEAD, (prevEnd + first) / 2);
    const end = Math.min(last + TAIL, (last + nextStart) / 2);
    slices[i] = { start, end: Math.max(end, start + 0.1) };
  }

  // 3. frames
  const out: SceneTiming[] = [];
  let from = 0;
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    let transitionIn = i === 0 ? 0 : Math.round(s.transitionSeconds * fps);
    const next = scenes[i + 1];
    const nextTransition = next ? Math.round(next.transitionSeconds * fps) : 0;
    const slice = slices[i];
    const overlap = Math.max(0, Math.min(1, opts.narrationOverlap ?? 0));
    const narrationFrames = transitionIn - Math.round(transitionIn * overlap);
    const narrationStart = narrationFrames / fps;
    const holdFrames = Math.round((s.hold ?? 0.4) * fps);
    let dur: number;
    if (slice) {
      const speechFrames = Math.ceil((slice.end - slice.start) * fps);
      dur = narrationFrames + speechFrames + Math.max(holdFrames, nextTransition + 2);
    } else {
      if (s.duration === undefined) {
        warnings.push(`Scene "${s.id}" has no narration and no duration – using 3s.`);
      }
      dur = Math.round((s.duration ?? 3) * fps);
    }
    if (s.duration !== undefined) dur = Math.max(dur, Math.round(s.duration * fps));
    dur = Math.max(dur, transitionIn + nextTransition + 2);
    if (i > 0) {
      const prevDur = out[i - 1].durationInFrames;
      if (transitionIn > prevDur - 1) {
        transitionIn = Math.max(0, prevDur - 1);
        warnings.push(`Transition into "${s.id}" was longer than the previous scene and was shortened.`);
      }
      from = out[i - 1].from + prevDur - transitionIn;
    }
    const words = slice
      ? sceneWords[i].map((w) => ({
          text: w.text,
          start: w.start - slice.start + narrationStart,
          end: w.end - slice.start + narrationStart,
        }))
      : [];
    out.push({
      id: s.id,
      index: i,
      from,
      durationInFrames: dur,
      transitionIn,
      audio: mode === "captions" ? slice : null,
      narrationStart,
      words,
    });
  }
  const lastScene = out[out.length - 1];
  return {
    fps,
    mode,
    totalFrames: lastScene ? lastScene.from + lastScene.durationInFrames : 1,
    scenes: out,
    warnings,
  };
};

// --------------------------------------------------------- time values
export type TimeContext = {
  words: Word[];
  /** scene duration in seconds */
  duration: number;
  sceneId: string;
};

/**
 * Resolves a TimeValue (see schema.ts) to scene-relative seconds.
 * Throws a descriptive error for unknown cues so mistakes surface in preview.
 */
export const resolveTime = (
  value: number | string | undefined,
  ctx: TimeContext,
  fallback = 0,
): number => {
  if (value === undefined) return fallback;
  if (typeof value === "number") return value;
  const v = value.trim();
  if (/^-?\d+(\.\d+)?$/.test(v)) return parseFloat(v);
  const endMatch = /^end\s*([+-]\s*\d+(\.\d+)?)?$/.exec(v);
  if (endMatch) {
    return ctx.duration + (endMatch[1] ? parseFloat(endMatch[1].replace(/\s/g, "")) : 0);
  }
  const cue = /^@(.+?)(?:#(\d+))?(?::(start|end))?\s*([+-]\s*\d+(?:\.\d+)?)?$/.exec(v);
  if (cue) {
    const phrase = splitWords(cue[1]).map(normalizeWord).filter(Boolean);
    const occurrence = cue[2] ? parseInt(cue[2], 10) : 1;
    const useEnd = cue[3] === "end";
    const offset = cue[4] ? parseFloat(cue[4].replace(/\s/g, "")) : 0;
    const norm = ctx.words.map((w) => normalizeWord(w.text));
    let seen = 0;
    for (let i = 0; i + phrase.length <= norm.length; i++) {
      let ok = true;
      for (let k = 0; k < phrase.length; k++) {
        const target = phrase[k];
        const word = norm[i + k];
        // allow plural / suffix forms: "@planet" matches "planets"
        if (!(word === target || (word.startsWith(target) && word.length - target.length <= 3))) {
          ok = false;
          break;
        }
      }
      if (ok) {
        seen++;
        if (seen === occurrence) {
          const w = useEnd ? ctx.words[i + phrase.length - 1].end : ctx.words[i].start;
          return w + offset;
        }
      }
    }
    throw new Error(
      `Scene "${ctx.sceneId}": cue "${value}" was not found in the scene narration.`,
    );
  }
  throw new Error(`Scene "${ctx.sceneId}": cannot understand time value "${value}".`);
};
