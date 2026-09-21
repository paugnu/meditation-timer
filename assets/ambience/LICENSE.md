# Background sounds selected by Pau — 2026-09-12

These are the eight recordings explicitly selected for Meditation Timer · YogaBond.
They are bundled as background elements of the timer experience, with session-driven playback,
crossfades and the app's gong. The app does not expose downloads or redistribute a sound library.
They are not all CC0. The six Pixabay files use the [Pixabay Content License](https://pixabay.com/service/terms/);
the storm and tanpura use [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
Source and licence links are also available offline in Settings → Sound credits (opening the links requires a connection).

| App file | Original title / author | Source | Source duration |
| --- | --- | --- | --- |
| `rain.m4a` | Gentle Rain for Relaxation and Sleep — Eryliaa | https://pixabay.com/sound-effects/nature-gentle-rain-for-relaxation-and-sleep-337279/ | 8:50 |
| `waves.m4a` | Gentle Ocean Waves Mix (2018) — esh9419, via freesound_community | https://pixabay.com/sound-effects/nature-gentle-ocean-waves-mix-2018-19693/ | 11:59 |
| `wind.m4a` | wind in the trees — deleted_user_229898, via freesound_community | https://pixabay.com/sound-effects/nature-wind-in-the-trees-24035/ | 2:00 |
| `birds.m4a` | Birds — nektaria909, via freesound_community | https://pixabay.com/sound-effects/nature-birds-19624/ | 10:36 |
| `storm.m4a` | Rain with distant thunder — MrAuralization | https://freesound.org/people/MrAuralization/sounds/168562/ | 14:41.176 |
| `chimes.m4a` | Wind Chimes with Wind and Light Rain — IndigoBunting | https://pixabay.com/sound-effects/nature-wind-chimes-with-wind-and-light-rain-171624/ | 2:36 |
| `brown.m4a` | Soft Brown Noise — Cosmic-Scapes | https://pixabay.com/sound-effects/film-special-effects-soft-brown-noise-299934/ | 10:00 |

| `tanpura.m4a` | Electronic Tanpuar 4 — sankalp | https://freesound.org/people/sankalp/sounds/155497/ | 4:38.639 |

## Acquisition

MP3 files provided by the source sites, not original uncompressed field recordings.
The storm and tanpura are Freesound **HQ MP3 previews**, not the original WAV files. No accounts or payments were needed.

- rain: https://cdn.pixabay.com/audio/2025/05/05/audio_f58cb40be0.mp3
- waves: https://cdn.pixabay.com/audio/2022/02/10/audio_7b02ccf85c.mp3
- wind: https://cdn.pixabay.com/audio/2022/03/09/audio_f0730dbae2.mp3
- birds: https://cdn.pixabay.com/audio/2022/02/10/audio_7a07ee0e79.mp3
- storm: https://cdn.freesound.org/previews/168/168562_2843367-hq.mp3
- chimes: https://cdn.pixabay.com/audio/2023/10/15/audio_4f5062ffa0.mp3
- brown: https://cdn.pixabay.com/audio/2025/02/11/audio_076c4755e8.mp3

- tanpura: https://cdn.freesound.org/previews/155/155497_1859932-hq.mp3

## Adaptations and verification

For the first seven sounds, `scripts/prepare-ambience.py` retains the recording apart from five seconds at either end,
a twelve-second equal-power loop crossfade and sub-frame trimming. Stereo AAC/M4A at 44.1 kHz,
128 kb/s. A 20 Hz high-pass removes DC/subsonic content. Average level targets −26 dBFS;
a shared stereo look-ahead gain envelope limits isolated peaks to −6 dBFS before encoding.
Brown noise has an additional 5 ms taper at each edge to prevent AAC reconstruction clicks.
No replacement recording, added music, generated ambience or extra rain has been mixed in.

`audio-report.json` contains source/output SHA-256 hashes, exact durations, decoded sample counts,
peak/RMS levels and seam measurements. The pipeline rejects clipping, encoder padding and seam
steps above each recording's 99th-percentile ordinary sample step. These are numerical checks;
loop continuity and lifecycle behaviour on actual iOS/Android devices require native testing.

Attribution: “Rain with distant thunder” by MrAuralization, licensed under CC BY 4.0.
Adapted by YogaBond for looping playback and balanced volume; no endorsement implied.

Tanpura added 2026-09-13: “Electronic Tanpuar 4” by sankalp, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Adapted by YogaBond for looping and balanced volume; no endorsement implied. Uses the stable source interval 12.000–263.932 s, excluding the initial silence and final decay. A 12-second equal-power crossfade joins windows selected by pluck-envelope correlation, producing a 239.932-second loop. The quietest decoded 100 ms measures −29.89 dBFS (no silent tail); AAC adds no decoded padding.
