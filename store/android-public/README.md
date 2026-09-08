# Android public store assets

Prepared 2026-09-06 for Meditation Timer · YogaBond, package com.pau.meditationtimer.

- `feature-graphic.png`: 1024×500, original app halo/circle icon and Raleway composition; AI-assisted graphic design.
- `screenshots/phone-*.png`: regenerated 2026-09-08 by `npx tsx scripts/capture-screenshots.ts` at
  1080×1920 (viewport 360×640, deviceScaleFactor 3). Rendered straight to the store size, so unlike
  the earlier set they are not upscaled. Spanish, dark theme, empty local history.
- `screenshots/phone-*.jpg` and `phone-timer-name8.*`: the previous set, captured at 432×768 and
  scaled up. Kept as the record of what was uploaded with build 8; do not reuse them.
- Still web captures: the browser draws its own switches and scrollbars (the active switch shows a
  turquoise thumb that is not an app colour) and Settings shows the web wording for Do Not Disturb.
- They show the development build after 8: no header title, background-sound selector under the play
  button, and Finalizar hidden while a session runs. What is live on the stores predates all of it.

Google Play includes the feature graphic and all three phone screenshots. These are web captures as authorized, rather than Android emulator captures; native controls can differ.

Production: 1.1.0 (7), EAS build 66e47225-fbf1-49ff-8118-d3daf67f33f0. Submission confirmed with 11 changes, preliminary Google checks in progress. See ../RELEASE-STATUS.md for outcome and release notes.
