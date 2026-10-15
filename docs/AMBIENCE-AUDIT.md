# Ambience review — 2026-10-15

Requested scope: review rain, waves, wind, distant storm, chimes and brown noise for short/repetitive
loops. Birds and tanpura were excluded from analysis and remain byte-for-byte unchanged. No recording
was replaced or re-encoded in this review.

## Findings

- **Distant storm: 14:19.162.** The bundled file is a long recording, not a seconds-long preview.
  The [source listing](https://freesound.org/people/MrAuralization/sounds/168562/) gives 14:41.176;
  the 22.014-second difference matches the existing five-second trims at each end, twelve-second
  overlap and AAC-frame alignment. Screening did not identify an obvious short copied loop inside
  the file. Its strongest whole-track waveform correlation is only 0.017; the most similar
  ten-second dynamics windows (45 s and 181 s) have waveform correlation below 0.079 even allowing
  a one-second alignment offset. This does not rule out subjectively repetitive rain/thunder
  patterns. The user’s perception should be checked on a device with the running app before
  choosing a replacement.
- **Wind: 1:38.662.** This is the shortest selected ambience: about 18.2 cycles in a thirty-minute
  session. The source itself is only about two minutes; the loop preparation accounts for the
  reduction. It is a reasonable candidate for a longer recording if recognizable gusts repeat.
- **Wind chimes: 2:14.676.** About 13.4 cycles in thirty minutes, from a source of about 2:37.
  Repeated pitches create waveform correlation without proving duplicated excerpts. This is the
  other clear candidate for a longer selection, particularly because individual strikes are
  more recognizable than steady noise.
- **Rain: 8:28.610.** No short copied-loop signal found by this screening. About 3.5 cycles in
  thirty minutes.
- **Waves: 11:37.435.** No short copied-loop signal found. Similar wave envelopes occur naturally;
  the strongest candidate has waveform correlation below 0.073. About 2.6 cycles in thirty minutes.
- **Brown noise: 9:38.014.** No short copied-loop signal found. About 3.1 cycles in thirty minutes;
  statistically steady noise is expected to sound uniform.

All six files decode to their prepared PCM sample counts, without extra encoder padding or clipping.
Their edge discontinuities are below their ordinary 99th-percentile sample-to-sample steps.
Storm’s last/first one-second RMS levels differ by only 0.019 dB. Those checks screen for file-level
faults; they do not certify audible quality, seamless native playback or uninterrupted background audio.

Longer files made by concatenating the same recording would not add variety. The current user-selected
recordings are retained; wind and chimes are the priorities if longer licensed alternatives are chosen.
No subjective listening assessment was performed here.

## Release provenance

Compared the six reviewed files by SHA-256 against both locally retained release artifacts:

- `build-artifacts/meditation-timer-1.5.0-16.aab`
- `build-artifacts/ios-16/ios-b111c24adf7822c2db1a4b426e330043e0ab57ec/meditation-timer-1.5.1-16.ipa`

All six match exactly. The release log also records identical ambience hashes in Android 1.4.0 (12).
The old `scripts/generate-ambience.py` creates twenty-second synthesized **rain and waves only**;
that historical library had no storm option and does not explain this storm report.
This comparison does not establish which build is installed on the user’s phone.

## Reproduce

Run `python3 scripts/audit-ambience.py` with NumPy, ffmpeg and ffprobe installed.
It decodes only the six requested files and writes `assets/ambience/audit-report.json`; it does not
write audio. The report includes hashes, actual decoded durations, levels, seam measurements and
two repetition screens: whole-track waveform autocorrelation and ten-second spectral-dynamics
comparisons. Correlation scores are diagnostics, not perceptual quality scores. The analyses search
limited bands/windows and cannot prove the absence of every possible repeating event.

Source pages and licences remain in `assets/ambience/LICENSE.md`. The original MP3 files were not
re-downloaded successfully during this review; the source-duration comparison above uses the source
listing and the existing, hash-verified preparation report.
