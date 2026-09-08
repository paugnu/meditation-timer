"""Original synthesized background ambiences. No third-party recordings.

Noise is shaped in the frequency domain, so each file is inherently periodic:
the loop wraps with no seam and needs no crossfade. Time-domain envelopes use
periods that divide the loop length exactly, preserving that property.
"""
import wave
from pathlib import Path
import numpy as np

RATE = 22050          # Ambience is broadband hiss; 11 kHz of bandwidth is plenty and halves the bundle cost.
SECONDS = 20
OUT = Path(__file__).resolve().parent.parent / 'assets' / 'ambience'

def shaped_noise(n, shape, seed):
    """White noise filtered by `shape(frequency)`; circular by construction."""
    spectrum = np.fft.rfft(np.random.default_rng(seed).standard_normal(n))
    freq = np.fft.rfftfreq(n, 1 / RATE)
    gain = shape(np.maximum(freq, 1e-6))
    gain[0] = 0  # A pink tilt blows up at DC; drop the bin instead of shifting the whole loop.
    signal = np.fft.irfft(spectrum * gain, n)
    return signal / np.max(np.abs(signal))

def write(name, samples, peak):
    samples = samples / np.max(np.abs(samples)) * peak
    with wave.open(str(OUT / f'{name}.wav'), 'wb') as out:
        out.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        out.writeframes((np.clip(samples, -1, 1) * 32767).astype('<i2').tobytes())
    print(OUT / f'{name}.wav')

n = RATE * SECONDS
t = np.arange(n) / RATE
cycle = 2 * np.pi / SECONDS  # One turn per loop: any integer multiple stays periodic.

# Rain: broad hiss with a gentle pink tilt, low rumble removed, softened on top.
rain = shaped_noise(n, lambda f: f ** -0.45 / (1 + (f / 5200) ** 2) * (f / (f + 260)), seed=7)
rain *= 1 + .06 * np.sin(3 * cycle * t) + .04 * np.sin(7 * cycle * t + 1.2)
write('rain', rain, .72)

# Sea: low swells washing in, with a brighter layer of foam riding each crest.
swell = (.5 + .5 * np.sin(2 * cycle * t - 1.4)) ** 2.2
body = shaped_noise(n, lambda f: f ** -0.8 / (1 + (f / 420) ** 2.4) * (f ** 2 / (f ** 2 + 32 ** 2)), seed=13)
foam = shaped_noise(n, lambda f: f ** -0.3 / (1 + (f / 3400) ** 2) * (f / (f + 900)), seed=29)
write('waves', body * (.34 + .66 * swell) + foam * .34 * swell ** 1.6, .74)
