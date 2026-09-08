"""Original synthesized gong. Standard library only; no third-party recordings."""
import math, struct, wave
from pathlib import Path
path = Path(__file__).resolve().parent.parent / 'assets' / 'gong-synth.wav'
rate = 44100
partials = [(174, 1, 2.4), (271, .48, 1.7), (359, .27, 1.4), (493, .19, 1.1), (737, .09, .7)]
with wave.open(str(path), 'wb') as out:
    out.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
    samples = bytearray()
    for i in range(rate * 7):
        t = i / rate
        attack = min(1, t / .012)
        fade = min(1, (7-t)/.5)
        sample = sum(a * math.exp(-t/d) * math.sin(2*math.pi*f*t + .5*math.sin(2*math.pi*.8*t)) for f,a,d in partials)
        samples.extend(struct.pack('<h', int(max(-1,min(1,sample*.42*attack*fade))*32767)))
    out.writeframes(samples)
print(path)
