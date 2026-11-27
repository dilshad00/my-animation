"""Higgs Audio v2 (Boson AI) voice-cloned narration, whole script in one generation (natural prosody).
python scripts/tts/higgs_say.py <ref.wav> <ref.txt> <script.txt> <out.wav> <temperature> <seed>
Runs on CPU (GitHub Actions). Model: bosonai/higgs-audio-v2-generation-3B-base."""
import base64, sys, time
import numpy as np, soundfile as sf, torch
from boson_multimodal.serve.serve_engine import HiggsAudioServeEngine
from boson_multimodal.data_types import ChatMLSample, Message, AudioContent

ref_wav, ref_txt, script, out, temp, seed = sys.argv[1:7]
torch.manual_seed(int(seed)); np.random.seed(int(seed))
torch.set_num_threads(max(1, torch.get_num_threads()))
eng = HiggsAudioServeEngine("bosonai/higgs-audio-v2-generation-3B-base", "bosonai/higgs-audio-v2-tokenizer", device="cpu")
system = ("Generate audio following instruction.\n\n<|scene_desc_start|>\n"
          "An energetic, engaging YouTube tech presenter recorded in a quiet studio. Natural, expressive, conversational delivery with clear emphasis.\n"
          "<|scene_desc_end|>")
ref_b64 = base64.b64encode(open(ref_wav, "rb").read()).decode()
text = open(script, encoding="utf8").read().strip()
msgs = [
    Message(role="system", content=system),
    Message(role="user", content=open(ref_txt, encoding="utf8").read().strip()),
    Message(role="assistant", content=AudioContent(raw_audio=ref_b64, audio_url="placeholder")),
    Message(role="user", content=text),
]
t0 = time.time()
r = eng.generate(chat_ml_sample=ChatMLSample(messages=msgs), max_new_tokens=2600, temperature=float(temp),
                 top_p=0.95, top_k=50, stop_strings=["<|end_of_text|>", "<|eot_id|>"])
sf.write(out, np.asarray(r.audio, dtype=np.float32), r.sampling_rate, subtype="PCM_16")
print(f"done {len(r.audio) / r.sampling_rate:.1f}s audio in {(time.time() - t0) / 60:.1f} min")
