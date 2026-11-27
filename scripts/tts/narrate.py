"""
Free, local, open-source narration for projects/<id>/narration.txt.
Runs on GitHub Actions (CPU). The user's PC is too old for these models.

Engines
  chatterbox  Resemble AI Chatterbox (MIT). Expressive, beat ElevenLabs in blind tests.
              voice spec: chatterbox[:ref=<wav>][:ex=<0.25-2>][:cfg=<0-1>][:temp=<t>][:pp=<paragraph pause s>]
  kokoro      Kokoro-82M (Apache-2.0). Very clean, fast, less emotional.
              voice spec: kokoro:<voice>[:speed=<s>]   e.g. kokoro:am_michael, kokoro:bm_george

Usage
  python scripts/tts/narrate.py --text narration.txt --voice "chatterbox:ex=0.6:cfg=0.4" \
      --chunk 0 --chunks 8 --out out/part0.wav
  python scripts/tts/narrate.py --text sample.txt --voice kokoro:bm_george --out out/sample.wav

Every generated sentence group is checked with Whisper; if the words don't match the script
(skipped words, mumbles, hallucinated endings) it is regenerated with a new seed (best of 4).
"""
import argparse
import difflib
import json
import re
import sys

import numpy as np
import soundfile as sf

SR_OUT = 44100
PAUSE_SENTENCE = 0.28  # between sentence groups inside a paragraph
PAUSE_PARAGRAPH = 0.85  # between paragraphs
MAX_CHARS = 260  # chatterbox is most stable on short inputs


def parse_voice(spec):
    parts = spec.split(":")
    engine, opts = parts[0], {}
    for p in parts[1:]:
        if "=" in p:
            k, v = p.split("=", 1)
            opts[k] = v
        else:
            opts["voice"] = p
    return engine, opts


ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def say_number(n):
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else "-" + ONES[n % 10])
    if 2000 <= n < 2100:  # years: "two thousand and nine"
        return "two thousand" + ("" if n == 2000 else " and " + say_number(n - 2000))
    if n < 1000:
        return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " and " + say_number(n % 100))
    return str(n)


def clean(par):
    """Markdown/typography → what a narrator should actually say."""
    par = re.sub(r"[*_]{1,3}([^*_]+)[*_]{1,3}", r"\1", par)  # **bold**, *italic*
    par = par.replace("*", "")
    letters = re.sub(r"[^A-Za-z]", "", par)
    if letters and letters.isupper() and len(letters) > 3:  # ALL-CAPS alert/heading → sentence case
        par = re.sub(r"(^|[.!?]\s+)([a-z])", lambda m: m.group(1) + m.group(2).upper(), par.lower())
    par = re.sub(r"\b\d{1,4}\b", lambda m: say_number(int(m.group())), par)
    return par


def paragraphs(text):
    out = []
    for p in re.split(r"\n\s*\n", text):
        lines = [l for l in p.splitlines() if not l.lstrip().startswith("#")]  # titles are not narrated
        p = clean(re.sub(r"\s+", " ", " ".join(lines)).strip())
        if p:
            out.append(p)
    return out


def sentence_groups(par, max_chars=MAX_CHARS):
    sents = re.split(r"(?<=[.!?])\s+(?=[A-Z\"'])", par)
    groups, cur = [], ""
    for s in sents:
        if cur and len(cur) + 1 + len(s) > max_chars:
            groups.append(cur)
            cur = s
        else:
            cur = f"{cur} {s}".strip()
    if cur:
        groups.append(cur)
    return groups


def norm_words(s):
    # Whisper writes digits ("2015", "10") and US spelling; compare letters only
    s = re.sub(r"\d{1,4}", lambda m: say_number(int(m.group())), s.lower())
    s = s.replace("our", "or").replace("ise", "ize").replace("-", " ")
    return re.sub(r"[^a-z ]", "", s).split()


def similarity(a, b):
    return difflib.SequenceMatcher(None, " ".join(norm_words(a)), " ".join(norm_words(b))).ratio()


def resample(wav, sr):
    if sr == SR_OUT:
        return wav
    n = int(round(len(wav) * SR_OUT / sr))
    return np.interp(np.linspace(0, len(wav) - 1, n), np.arange(len(wav)), wav).astype(np.float32)


def trim(wav, sr, thresh=0.01, pad=0.04):
    idx = np.where(np.abs(wav) > thresh)[0]
    if len(idx) == 0:
        return wav
    p = int(pad * sr)
    return wav[max(0, idx[0] - p): min(len(wav), idx[-1] + p)]


REF_TEXT = (
    "Every great story begins with a single question. What would happen if the world changed overnight? "
    "Scientists have studied this possibility for years, and the answers are surprising. "
    "Some of them are hopeful. Others are terrifying."
)


class Chatterbox:
    def __init__(self, opts):
        import torch
        from chatterbox.tts import ChatterboxTTS

        torch.set_num_threads(max(1, torch.get_num_threads()))
        self.torch = torch
        self.model = ChatterboxTTS.from_pretrained(device="cpu")
        self.sr = self.model.sr
        self.ref = opts.get("ref")
        if self.ref and self.ref.startswith("kokoro-"):
            self.ref = "voice-ref.wav"  # made by --make-ref in the workflow (Apache-2.0 Kokoro voice)
        self.ex = float(opts.get("ex", 0.5))
        self.cfg = float(opts.get("cfg", 0.5))
        self.temp = float(opts.get("temp", 0.8))
        if self.ref:
            self.model.prepare_conditionals(self.ref, exaggeration=self.ex)

    def say(self, text, seed):
        self.torch.manual_seed(seed)
        kw = dict(exaggeration=self.ex, cfg_weight=self.cfg, temperature=self.temp)
        wav = self.model.generate(text, **kw)
        return wav.squeeze(0).cpu().numpy().astype(np.float32)


class Kokoro:
    def __init__(self, opts):
        from kokoro import KPipeline

        self.voice = opts.get("voice", "am_michael")
        self.speed = float(opts.get("speed", 1.0))
        self.pipe = KPipeline(lang_code=self.voice[0])  # a = American, b = British
        self.sr = 24000

    def say(self, text, seed):
        out = [np.asarray(a, dtype=np.float32) for _, _, a in self.pipe(text, voice=self.voice, speed=self.speed)]
        return np.concatenate(out) if out else np.zeros(1, np.float32)


class Checker:
    def __init__(self):
        from faster_whisper import WhisperModel

        self.m = WhisperModel("base.en", device="cpu", compute_type="int8")

    def score(self, wav, sr, text):
        a = resample(wav, sr)
        a16 = np.interp(np.linspace(0, len(a) - 1, int(len(a) * 16000 / SR_OUT)), np.arange(len(a)), a).astype(np.float32)
        segs, _ = self.m.transcribe(a16, language="en", beam_size=1, vad_filter=False)
        heard = " ".join(s.text for s in segs)
        return similarity(text, heard), heard


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True)
    ap.add_argument("--voice", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--chunk", type=int, default=0)
    ap.add_argument("--chunks", type=int, default=1)
    ap.add_argument("--tries", type=int, default=4)
    ap.add_argument("--min-score", type=float, default=0.9)
    a = ap.parse_args()

    engine, opts = parse_voice(a.voice)
    if engine == "make-ref":  # make-ref:<kokoro voice> → a ~15 s reference clip for chatterbox voice cloning
        k = Kokoro({"voice": opts["voice"], "speed": "0.92"})
        wav = np.concatenate([k.say(REF_TEXT, 0)])
        sf.write(a.out, wav, k.sr, subtype="PCM_16")
        print(f"reference: {len(wav) / k.sr:.1f}s")
        return

    pars = paragraphs(open(a.text, encoding="utf8").read())
    # balanced split by characters, on paragraph boundaries
    total = sum(len(p) for p in pars)
    lo, hi = total * a.chunk / a.chunks, total * (a.chunk + 1) / a.chunks
    mine, acc = [], 0
    for i, p in enumerate(pars):
        mid = acc + len(p) / 2
        if lo <= mid < hi or (a.chunk == a.chunks - 1 and mid >= hi):
            mine.append((i, p))
        acc += len(p)

    tts = {"chatterbox": Chatterbox, "kokoro": Kokoro}[engine](opts)
    chk = Checker()
    report, pieces = [], []
    for n, (pi, p) in enumerate(mine):
        groups = sentence_groups(p) if engine == "chatterbox" else [p]
        for gi, g in enumerate(groups):
            best = None
            for t in range(a.tries):
                wav = trim(tts.say(g, seed=1000 * pi + 10 * gi + t), tts.sr)
                sc, heard = chk.score(wav, tts.sr, g)
                # very long audio for the text = rambling; penalise
                dur = len(wav) / tts.sr
                if dur > 0.12 * len(g) + 2:
                    sc -= 0.3
                if best is None or sc > best[0]:
                    best = (sc, wav, heard, t)
                if sc >= a.min_score:
                    break
            sc, wav, heard, t = best
            print(f"[{a.chunk}] p{pi} g{gi} score={sc:.2f} tries={t + 1} {g[:60]!r}", flush=True)
            report.append({"paragraph": pi, "group": gi, "score": round(sc, 3), "text": g, "heard": heard})
            pieces.append(resample(wav, tts.sr))
            last_group = gi == len(groups) - 1
            pause = float(opts.get("pp", PAUSE_PARAGRAPH)) if last_group else PAUSE_SENTENCE
            pieces.append(np.zeros(int(pause * SR_OUT), np.float32))
    audio = np.concatenate(pieces) if pieces else np.zeros(SR_OUT, np.float32)
    sf.write(a.out, audio, SR_OUT, subtype="PCM_16")
    tempo = float(opts.get("tempo", 1))
    if tempo != 1:  # pitch-preserving slow-down / speed-up
        import os, subprocess
        tmp = a.out + ".tmp.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", a.out, "-af", f"atempo={tempo}", tmp], check=True)
        os.replace(tmp, a.out)
    json.dump(report, open(a.out.rsplit(".", 1)[0] + ".json", "w", encoding="utf8"), indent=1)
    bad = [r for r in report if r["score"] < a.min_score]
    print(f"done: {len(report)} pieces, {len(audio) / SR_OUT:.1f}s, {len(bad)} below {a.min_score}")
    for r in bad:
        print(f"  CHECK p{r['paragraph']}: {r['text']!r}\n        heard: {r['heard']!r}")


if __name__ == "__main__":
    sys.exit(main())
