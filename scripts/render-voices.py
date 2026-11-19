"""Build-time eSpeak NG renderer. Deployment requires no speech packages."""
import ctypes as c
import json
import subprocess
import sys
from pathlib import Path

import espeakng_loader
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
out = root / "public/audio/story"
out.mkdir(parents=True, exist_ok=True)
lib = c.CDLL(str(espeakng_loader.get_library_path()))
data = Path(espeakng_loader.get_data_path())
rate = lib.espeak_Initialize(2, 0, str(data.parent).encode(), 0)
if rate <= 0:
    raise RuntimeError("Speech engine did not initialise")
pcm = bytearray()


@c.CFUNCTYPE(c.c_int, c.POINTER(c.c_short), c.c_int, c.c_void_p)
def receive(samples, count, events):
    if samples and count:
        pcm.extend(c.string_at(samples, count * 2))
    return 0


lib.espeak_SetSynthCallback(receive)
actors = {"rota": (42, 151), "ard": (63, 175), "mina": (59, 148), "dara": (33, 133)}
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
for clip in json.load(sys.stdin):
    pitch, speed = actors[clip["role"]]
    for index, lang in enumerate(("fa", "en")):
        if lib.espeak_SetVoiceByName(lang.encode()) != 0:
            raise RuntimeError("Missing voice " + lang)
        lib.espeak_SetParameter(1, speed, 0)
        lib.espeak_SetParameter(3, pitch, 0)
        line = clip["text"][index].encode() + b"\0"
        pcm.clear()
        if lib.espeak_Synth(line, len(line), 0, 1, 0, 1, None, None) != 0:
            raise RuntimeError("Could not render " + clip["id"])
        lib.espeak_Synchronize()
        if len(pcm) < rate:
            raise RuntimeError("Empty performance: " + clip["id"])
        path = out / (lang + "-" + clip["id"] + ".mp3")
        subprocess.run([ffmpeg, "-v","error","-y","-f","s16le","-ar",str(rate),
                        "-ac","1","-i","pipe:0","-af","loudnorm=I=-17:LRA=8:TP=-2",
                        "-ar","24000","-b:a","48k",str(path)], input=pcm, check=True)
        subprocess.run([ffmpeg,"-nostdin","-v","error","-i",str(path),"-f","null","-"],check=True)
lib.espeak_Terminate()
