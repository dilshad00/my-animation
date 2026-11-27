"""Higgs Audio v2 (Boson AI) voice-cloned narration, generated paragraph-by-paragraph and joined.
python scripts/tts/higgs_say.py <ref.wav> <ref.txt> <script.txt> <out.wav> <temperature> <seed>
Runs on CPU (GitHub Actions). One-shot generation of a whole ~60 s script can drift into gibberish
(SH-PENCIL take 1: 103 s of babble), so each chunk (1-2 paragraphs) is generated separately with the
same voice reference, its token budget is capped from its text length, and a take that runs too long
or too short (drift) is retried with another seed. Chunks are joined with short pauses."""
import base64, re, sys, time
import numpy as np, soundfile as sf, torch
from boson_multimodal.serve.serve_engine import HiggsAudioServeEngine
from boson_multimodal.data_types import ChatMLSample, Message, AudioContent

ref_wav, ref_txt, script, out, temp, seed = sys.argv[1:7]
torch.set_num_threads(max(1, torch.get_num_threads()))
from huggingface_hub import snapshot_download
# Pin to the original (pre "trfms-support", Apr 2026) weights/config that boson-ai/higgs-audio's code expects.
MODEL = snapshot_download("bosonai/higgs-tts-2-3b-base", revision="10840182ca4ad5d9d9113b60b9bb3c1ef1ba3f84")
TOKENIZER = snapshot_download("bosonai/higgs-audio-v2-tokenizer", revision="9d4988fbd4ad07b4cac3a5fa462741a41810dbec")
eng = HiggsAudioServeEngine(MODEL, TOKENIZER, device="cpu")
system = ("Generate audio following instruction.\n\n<|scene_desc_start|>\n"
          "An energetic, engaging YouTube tech presenter recorded in a quiet studio. Natural, expressive, conversational delivery with clear emphasis.\n"
          "<|scene_desc_end|>")
ref_b64 = base64.b64encode(open(ref_wav, "rb").read()).decode()
ref_text = open(ref_txt, encoding="utf8").read().strip()

paras = [p.strip() for p in re.split(r"\n\s*\n", open(script, encoding="utf8").read()) if p.strip()]
chunks, cur = [], ""
for p in paras:  # pack paragraphs into chunks of <= ~190 chars
    if cur and len(cur) + len(p) > 190:
        chunks.append(cur)
        cur = p
    else:
        cur = f"{cur} {p}".strip()
if cur:
    chunks.append(cur)

TOK_PER_S = 25  # Higgs audio tokens per second
pieces, sr = [], 24000
t0 = time.time()
for ci, text in enumerate(chunks):
    expect = len(text) / 14.0  # seconds at a brisk presenter pace
    budget = int(expect * 1.6 * TOK_PER_S) + 60
    best = None
    for attempt in range(4):
        s = int(seed) + 101 * ci + 7 * attempt
        torch.manual_seed(s)
        np.random.seed(s)
        msgs = [
            Message(role="system", content=system),
            Message(role="user", content=ref_text),
            Message(role="assistant", content=AudioContent(raw_audio=ref_b64, audio_url="placeholder")),
            Message(role="user", content=text),
        ]
        r = eng.generate(chat_ml_sample=ChatMLSample(messages=msgs), max_new_tokens=budget, temperature=float(temp),
                         top_p=0.95, top_k=50, stop_strings=["<|end_of_text|>", "<|eot_id|>"])
        a = np.asarray(r.audio, dtype=np.float32)
        sr = r.sampling_rate
        dur = len(a) / sr
        ok = 0.55 * expect <= dur <= 1.45 * expect
        print(f"chunk {ci + 1}/{len(chunks)} try {attempt + 1}: {dur:.1f}s (expect ~{expect:.1f}s) {'OK' if ok else 'REJECT'} | {text[:60]}", flush=True)
        if best is None or abs(dur - expect) < abs(len(best) / sr - expect):
            best = a
        if ok:
            break
    idx = np.where(np.abs(best) > 0.01)[0]  # trim edge silence
    if len(idx):
        best = best[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
    pieces.append(best)
    pieces.append(np.zeros(int(0.32 * sr), dtype=np.float32))
audio = np.concatenate(pieces[:-1])
sf.write(out, audio, sr, subtype="PCM_16")
print(f"done {len(audio) / sr:.1f}s audio, {len(chunks)} chunks, in {(time.time() - t0) / 60:.1f} min")
