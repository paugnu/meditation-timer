# Background ambiences

`rain.wav` and `waves.wav` are original sounds synthesized for this app by
`scripts/generate-ambience.py`. They are not recordings and contain no third-party material,
so they carry no attribution requirement; treat them as CC0.

Format: mono PCM signed 16-bit WAV, 22.05 kHz, 20 seconds, peak normalized, no DC offset.
Noise is shaped in the frequency domain, which makes each file exactly periodic: playback
loops with no audible seam and needs no crossfade at the loop point.

These are placeholders good enough to build and judge the interface. When they are replaced
with real CC0 field recordings, prefer a compressed format (m4a/aac) to keep the bundle small,
keep the loop seamless, and record the source, author, licence and checksum here as
`assets/gong-LICENSE.md` does.
