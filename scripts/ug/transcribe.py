"""Word-level transcript of narration16k.wav -> narration_words.json + transcript_timed.txt"""
import json, sys, wave
import numpy as np
from faster_whisper import WhisperModel
ROOT = sys.argv[2] if len(sys.argv) > 2 else "out"
m = WhisperModel(sys.argv[1] if len(sys.argv) > 1 else "medium.en", device="cpu", compute_type="int8")
wf = wave.open(f"{ROOT}/narration16k.wav")
audio = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
segs, info = m.transcribe(audio, word_timestamps=True, beam_size=5,
                          vad_filter=False, condition_on_previous_text=False)
words, lines = [], []
for s in segs:
    lines.append(f"{s.start:7.2f}-{s.end:7.2f} {s.text.strip()}")
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)})
    print(lines[-1], flush=True)
json.dump(words, open(f"{ROOT}/narration_words.json", "w", encoding="utf-8"), ensure_ascii=False)
open(f"{ROOT}/transcript_timed.txt", "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("WORDS", len(words))
