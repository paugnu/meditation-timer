# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

# Orientation

Read this before exploring; it is meant to save you the exploration pass.

**What this is.** `Meditation Timer · YogaBond`: an Expo SDK 57 / React Native 0.86 / React 19 /
TypeScript meditation timer for Android, iOS and web. Single screen, offline-only, no accounts, no
backend, no analytics, no ads. Shipped to Google Play and App Store under `com.pau.meditationtimer`
(currently 1.1.0, build 8). Source and code comments are English; all user-facing copy is Spanish
keys translated through `src/i18n.ts`.

**Where things live.** See the *Estructura* section of [README.md](README.md) for the file map. The
short version: pure logic in `src/*.ts` (timer, history, calendar, settings, reviewPolicy — these are
the tested ones), all effects and orchestration in `src/hooks/useMeditation.ts`, platform bridges in
`src/services/`, UI in `App.tsx` + `src/components/`, and the Android Do-Not-Disturb native module in
`modules/meditation-focus/` (Kotlin, autolinked by Expo).

## Invariants worth not breaking

- **Time is an absolute deadline** (`endsAt`), never an accumulated interval. `src/timer.ts` is a pure
  reducer; a 200 ms `setInterval` only observes it. Suspension, reopening and clock drift are handled by
  recomputing from `endsAt`, and `restoreTimer` rejects anything out of range.
- **Practice time excludes pauses.** `finishSession` derives duration from timer progress
  (`durationMs - remaining`), never from wall-clock session length. Sessions under 1 s are not logged.
  Finishing early freezes and persists the timer *before* asking whether to save.
- **Never ring twice.** Foreground completion plays the gong through `expo-audio`; the scheduled
  notification is suppressed in the foreground by the handler in `src/services/alerts.ts`. Returning to a
  session that expired in the background must not ring (`tick(false)` on the AppState `active` path).
  Resuming a pause does not replay the start gong.
- **Cleanup is paired with every exit.** Pause, finish, completion and startup with a non-running timer
  all call `cleanup()`: cancel the notification and end the DND interval.
- **DND ownership is persisted natively.** `FocusControl` commits `active/previous/target/endsAt` to
  SharedPreferences *before* changing the interruption filter, and an exact alarm restores it without JS.
  That is why exact-alarm permission is required to enable DND at all. Android 15+ (SDK 35) touches only
  its own implicit rule; below that it preserves a filter the user set and refuses to overwrite a manual
  change made during the session.
- **All persisted input is untrusted.** Every `restore*` function sanitizes and falls back to safe
  defaults; there are tests for corrupt storage in `tests/` and in the Playwright suite.
- **Storage writes are serialized** through one promise chain in `src/services/storage.ts`, single key
  `meditation-timer:v1`. Changing that key or its shape orphans real users' history.
- **Review prompt: one attempt per install, ever.** `src/reviewPolicy.ts` marks the attempt before
  requesting (fail closed), gated on `app.json` → `extra.publicReviewsEnabled` (currently `true`),
  `!__DEV__`, five completed sessions, and a `canPresent()` guard so it never interrupts a session.
- **Background ambience plays only while the timer runs.** Choosing a sound on the idle screen is
  silent by design (the user asked for this explicitly); pausing or finishing fades it out, and
  reopening the app never starts audio on its own. `useAmbience` drives every player from a single
  destination held in a ref, so a re-render cannot resurrect a track that is fading out, and the
  `pause()` of a finished fade is deferred past it — pausing a `play()` that has not landed yet
  rejects it, which is what stepping quickly through the list used to do. Two e2e tests pin all of
  this, including the exact number of playback starts. It shares `settings.volume` with the gong,
  and a volume of zero must stay silent. Backgrounding freezes the ramp while the system stops
  playback, so the stored level goes stale: returning to the app resets that track to zero and
  fades it in again rather than trusting the level it left behind. The gong and the ambience take
  turns: an opening gong holds the ambience back (`ambienceLeadMs`, derived from the gong's real
  duration) so it swells out of the decay, and completion drops the ambience as the closing gong
  rings. That hold is computed during render — set from an effect it is still stale on the commit
  that starts the session, and the ambience slips in ahead of the gong.
- **Locales stay in lockstep.** Six dictionaries, 112 keys each, identical interpolation tokens; a test
  enforces it. Spanish source strings are the keys, so changing Spanish copy means updating all six files.
  Catalan is the Valencian variant — follow [docs/VALENCIAN.md](docs/VALENCIAN.md).
- **A running session offers one control.** `Finalizar` appears only when paused or completed, so
  ending early goes through a pause: it is not a one-tap action taken with your eyes closed. The
  reserved slot keeps its height either way, so nothing jumps. Settings live below the primary
  action, never between the countdown and it — that is why the ambience picker sits under the play
  button next to the gear rather than under the number.
- **Store-facing config is deliberate, not default.** `blockedPermissions` strips `RECORD_AUDIO`
  and `SYSTEM_ALERT_WINDOW` (the latter arrives with `expo-dev-client` and has no business in a
  meditation timer); the splash background is `#181613` because the app's first frame is dark in
  either theme; `enableProguardInReleaseBuilds` exists so the AAB carries a mapping file for Play.
  Verify these in the built AAB, not in `expo prebuild` output alone.
- **Failures surface as a dismissible notice, never as a blocked meditation.** Permissions denied, audio
  unavailable, storage unwritable: warn and keep going.

## Working here

- Verify with `npm run typecheck && npm test` (27 unit tests, node:test via tsx) and, for UI changes,
  `npm run test:e2e` (32 Playwright scenarios against the web build; needs Chrome). Occasional startup
  flake under full parallelism passes on a serial rerun.
- Style is deliberately dense: compact modules, inline JSX styling, comments only where an invariant is
  non-obvious. Match it rather than reformatting.
- Dependency versions are pinned to the SDK 57 matrix; do not run `npm audit fix --force`.
- Native behaviour (DND, notification channels, bundled sound) cannot be validated on web or in Expo Go
  — it needs a development or EAS build. Say so instead of implying coverage.
- Release/submission state is tracked chronologically in [store/RELEASE-STATUS.md](store/RELEASE-STATUS.md);
  append to it rather than rewriting history, and never state that a build was approved or published when
  only an upload was confirmed.
