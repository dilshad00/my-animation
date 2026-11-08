/**
 * Creates word-level timestamps for a project's narration, 100% locally
 * (free, no API key, nothing uploaded).
 *
 *   npm run transcribe -- <project-id> [--model=base.en|small.en] [--engine=transformers|whispercpp] [--file=other.mp3]
 *
 * Reads projects/<id>/narration.mp3 and writes projects/<id>/captions.json.
 * The engine then aligns your approved script to these timestamps, so small
 * transcription mistakes don't matter.
 *
 * Engines:
 *  - transformers (default): OpenAI Whisper via ONNX Runtime in Node. Works on any
 *    x64 CPU, including older ones without AVX2. The first run downloads the model
 *    into .whisper/transformers (base.en ≈ 300 MB). Roughly real-time speed on a laptop CPU.
 *  - whispercpp: faster, but its prebuilt Windows binary needs a CPU with AVX2.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { captionsFile, findNarration, projectDir, rel, ROOT, storyboardFile } from "./lib/files";

type Caption = { text: string; startMs: number; endMs: number; timestampMs: number | null; confidence: number | null };

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const opt = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");
if (!id) {
  console.error("Usage: npm run transcribe -- <project-id> [--model=base.en|small.en] [--engine=transformers|whispercpp] [--file=other.mp3]");
  process.exit(1);
}

const WHISPER_DIR = path.join(ROOT, ".whisper");
const model = opt("model") ?? "base.en";
const engine = opt("engine") ?? "transformers";
const win = process.platform === "win32";

/** Reads the PCM16 mono "data" chunk of a WAV file into floats. */
const readWav = (file: string): Float32Array => {
  const buf = fs.readFileSync(file);
  let off = 12;
  while (off < buf.length) {
    const chunk = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (chunk === "data") {
      const data = buf.subarray(off + 8, off + 8 + size);
      const pcm = new Float32Array(Math.floor(data.length / 2));
      for (let i = 0; i < pcm.length; i++) pcm[i] = data.readInt16LE(i * 2) / 32768;
      return pcm;
    }
    off += 8 + size + (size % 2);
  }
  throw new Error("WAV has no data chunk");
};

const withTransformers = async (wav: string): Promise<Caption[]> => {
  const { pipeline, env } = await import("@huggingface/transformers");
  env.cacheDir = path.join(WHISPER_DIR, "transformers");
  const repo = `Xenova/whisper-${model}`;
  console.log(`Loading ${repo} (first run downloads it)…`);
  const asr = await pipeline("automatic-speech-recognition", repo, { dtype: "fp32" });
  const pcm = readWav(wav);
  const minutes = pcm.length / 16000 / 60;
  // Whisper hears 30 s at a time. Its built-in chunk merging can silently drop
  // words at chunk borders, so we cut the audio ourselves at natural pauses.
  const segments = splitAtPauses(pcm, 16000);
  console.log(`Transcribing ${minutes.toFixed(1)} min of audio in ${segments.length} pieces – roughly ${Math.ceil(minutes)}–${Math.ceil(minutes * 1.5)} min on a laptop CPU…`);
  const captions: Caption[] = [];
  const started = Date.now();
  for (const [k, [a, b]] of segments.entries()) {
    const out = (await asr(pcm.subarray(a, b), { return_timestamps: "word" })) as { chunks?: { text: string; timestamp: [number, number | null] }[] };
    const chunks = out.chunks ?? [];
    const offset = a / 16000;
    chunks.forEach((c, i) => {
      const start = c.timestamp[0];
      const end = c.timestamp[1] ?? chunks[i + 1]?.timestamp[0] ?? start + 0.3;
      captions.push({ text: c.text, startMs: Math.round((offset + start) * 1000), endMs: Math.round((offset + end) * 1000), timestampMs: null, confidence: null });
    });
    const done = (k + 1) / segments.length;
    const eta = ((Date.now() - started) / done - (Date.now() - started)) / 1000;
    process.stdout.write(`\r  ${Math.round(done * 100)}%  (${k + 1}/${segments.length}, ~${Math.ceil(eta / 60)} min left)   `);
  }
  return captions;
};

/** Cuts audio into pieces of at most ~28 s, each ending in the quietest moment near the target length. */
const splitAtPauses = (pcm: Float32Array, rate: number): [number, number][] => {
  const frame = Math.round(rate * 0.02);
  const energy: number[] = [];
  for (let i = 0; i + frame <= pcm.length; i += frame) {
    let s = 0;
    for (let j = i; j < i + frame; j++) s += pcm[j] * pcm[j];
    energy.push(s / frame);
  }
  const out: [number, number][] = [];
  const maxF = Math.floor(28 / 0.02);
  const minF = Math.floor(15 / 0.02);
  let start = 0;
  while (start < energy.length) {
    if (energy.length - start <= maxF) {
      out.push([start * frame, pcm.length]);
      break;
    }
    // quietest 300 ms window between 15 s and 28 s after the start
    let best = start + maxF;
    let bestE = Infinity;
    for (let f = start + minF; f < start + maxF - 15; f++) {
      let e = 0;
      for (let j = 0; j < 15; j++) e += energy[f + j];
      if (e < bestE) {
        bestE = e;
        best = f + 7;
      }
    }
    out.push([start * frame, best * frame]);
    start = best;
  }
  return out;
};

const withWhisperCpp = async (wav: string): Promise<Caption[]> => {
  const { toCaptions, transcribe, installWhisperCpp, downloadWhisperModel } = await import("@remotion/install-whisper-cpp");
  type M = Parameters<typeof downloadWhisperModel>[0]["model"];
  const version = "1.5.5";
  const dir = path.join(WHISPER_DIR, "cpp");
  console.log("Preparing whisper.cpp (first run downloads it)…");
  await installWhisperCpp({ to: dir, version, printOutput: true });
  await downloadWhisperModel({ model: model as M, folder: dir, printOutput: true });
  const out = await transcribe({
    inputPath: wav,
    whisperPath: dir,
    whisperCppVersion: version,
    model: model as M,
    modelFolder: dir,
    tokenLevelTimestamps: true,
    onProgress: (p) => process.stdout.write(`\r  ${Math.round(p * 100)}%`),
  });
  return toCaptions({ whisperCppOutput: out }).captions;
};

const main = async () => {
  if (!fs.existsSync(storyboardFile(id))) throw new Error(`${rel(storyboardFile(id))} not found`);
  const voice = opt("file") ? path.resolve(projectDir(id), opt("file")!) : findNarration(id);
  if (!voice || !fs.existsSync(voice)) throw new Error(`No voiceover found. Put it at projects/${id}/narration.mp3`);
  console.log(`Voiceover: ${rel(voice)}`);

  const wav = path.join(os.tmpdir(), `explainer-${id}-16k.wav`);
  console.log("Converting to 16 kHz mono WAV (bundled ffmpeg)…");
  execFileSync(win ? "npx.cmd" : "npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", voice, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav], {
    stdio: "inherit",
    shell: win,
  });

  let captions: Caption[];
  try {
    captions = engine === "whispercpp" ? await withWhisperCpp(wav) : await withTransformers(wav);
  } finally {
    fs.rmSync(wav, { force: true });
  }
  if (!captions.length) throw new Error("The transcription came back empty.");

  const capFile = captionsFile(id);
  fs.writeFileSync(capFile, JSON.stringify(captions, null, 1));
  console.log(`\n✓ ${captions.length} timed words → ${rel(capFile)}`);
  execFileSync(win ? "npx.cmd" : "npx", ["tsx", path.join(ROOT, "scripts", "sync-projects.ts")], { stdio: "inherit", shell: win });
  console.log("✓ The video now uses the voiceover timing. Run: npm run validate -- " + id);
};

main().catch((e) => {
  console.error("✗ " + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
