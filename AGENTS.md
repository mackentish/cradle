# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Cradle

Expo SDK 57 + expo-router, TypeScript, no backend. See README.md for the domain model.

**American English, everywhere** — copy, comments and identifiers alike (`color`, `labor`,
`practice`, `canceled`, `summarize`, `math`). Note that commit `4d0dcb7` is titled
"Logo and british english" but its diff converted the repo in the opposite direction; the title is
misleading, the code is right.

## Rules that matter here

- **Stay Expo Go compatible.** Every dependency must be in the Expo SDK or pure JS. No custom native
  modules — that's why the date entry is plain number fields and the icons are hand-rolled SVG.
  `@expo/ui` is fine because its native module is compiled into Expo Go; check before reaching for
  anything else with an `ios/` directory.
- **`@expo/ui` is pre-1.0 and its API shifts between SDKs.** Keep it behind a component of ours
  (`TimePicker`) so an upstream change is a one-file fix, and keep the platform split in
  `.ios.tsx` / `.android.tsx` — the SwiftUI and Compose prop shapes genuinely differ.
- **No network calls, ever.** The whole promise is that nothing leaves the device. Content is
  bundled; state is in AsyncStorage.
- **Reminders are local notifications only.** Never add push tokens, `getExpoPushTokenAsync`, or
  anything remote — that would need a server and break the promise above. All OS notification calls
  live in `src/lib/notifications.ts`, wrapped so a revoked permission can never take a screen down;
  `AppState` owns scheduling, screens only save settings.
- **Every reminder is scheduled under its own identifier, and never with cancel-all.** There is one
  per program (`cradle-reminder-core`), so switching one on must not disturb the other two.
  `cancelAllScheduledNotificationsAsync` is gone on purpose. `syncReminders` also sweeps any
  scheduled notification it does not recognize — that is what stops the unnamed reminder from the
  single-program build firing forever alongside the new one on an upgraded install. Never change
  those identifier strings; they are how we find a reminder a *previous* install scheduled.
- **All text goes through `src/components/Text.tsx`** and all color/spacing through `src/theme`.
  Don't hardcode a hex value or a font family in a screen.
- **Safety copy lives in `src/content/safety.ts`.** Don't restate a disclaimer inline.
- **Gestational age is computed in one place** (`src/domain/pregnancy.ts`). Don't recompute weeks
  from a due date anywhere else.
- **`src/domain/program.ts` is the registry and the only place a program is declared.** Stage data
  lives in `src/domain/programs/*.ts`. Stage ids are *shared* across the three programs and program
  is a second, orthogonal axis — don't namespace a stage id per program (`core-build`). Doing so
  would take `StageId` to twenty-one members, force `stageColors` and the reminder copy table to
  twenty-one entries each, and invalidate every log written before there were three programs, since
  `toLogs` drops an entry whose `stageId` it can't place. The three programs must keep agreeing on
  week boundaries, which is what lets one banner say "Week 22 · Build" for the whole app; there's a
  test pinning that.
- **`programColors` is program identity, `stageColors` is where she is.** Both in `src/theme`, not
  interchangeable: a stage says *when*, a program says *what*. Pelvic floor keeps the app's primary.
- **Session titles must be unique within a stage band, across programs.** Two cards sit side by side
  on Today, so a shared title reads as a duplicate. Session *ids* must be globally unique, since
  `SessionLog.sessionId` is a free string — new ones are program-prefixed (`core-build-a`), and
  pelvic floor's are deliberately not, because renaming them would orphan existing history.
- **Dates are local, never UTC.** Use `toDayKey`/`fromDayKey` from `src/lib/date.ts`; `new Date('YYYY-MM-DD')`
  parses as UTC and shifts the day. `fromDayKey` returns an Invalid Date for a malformed key rather
  than a plausible wrong one — anything from outside the app goes through `isDayKey` first.
- **Nothing enters the app from storage unvalidated.** `toProfile`/`toLogs` in `src/lib/storage.ts`
  are the boundary, and both `loadProfile`/`loadLogs` and `parseBackup` go through them. A backup is
  pasted in by hand, and `replaceAll` writes to disk before the provider re-reads it — so an
  unchecked field is a crash on every launch afterwards, not a bad restore you can back out of.
- **Two shapes migrate on read, and both must keep working.** `toProfile` recognizes a pre-1.1
  `reminders` written as one flat `{ enabled, hour, minute }` and keeps that reminder on pelvic
  floor; `toLogs` defaults a missing or junk `programId` to `'pelvic-floor'` rather than dropping the
  entry, because every log from then was a pelvic floor session and that's real history. `PROFILE_KEY`
  and `Backup.version` stay as they are — the migration happens on load and the next save writes the
  new shape, so there's nothing for a version bump to do.
- **`Step.exerciseId` is `ExerciseId`, not `string`.** Adding an exercise means adding it to the
  union in `src/domain/types.ts` as well as the library. That makes a typo in `program.ts` a compile
  error instead of a crash on the day that session comes up in the rotation. `getExercise` takes the
  union; `findExercise` is the one that accepts a route param.
- Screens that need `progress` gate on it in a wrapper component, then render an inner component —
  hooks must not sit behind an early return.
- A program id from a route param goes through `isProgramId` before use, never a cast — same
  reasoning as `findExercise` versus `getExercise`. `/session/[program]` and `/reminders/[program]`
  both fall back to `'pelvic-floor'`.
- One reminder screen per program, not all three on a list: both native `@expo/ui` pickers are
  uncontrolled and read their value once on mount, so keep exactly one wheel alive at a time.

## Content changes

Exercises are in `src/domain/exercises.ts` — one shared library, no program field, and several
exercises are used by two programs. The stage/session tables are in `src/domain/programs/*.ts`.

Anything with a contraindication needs a `caution`. This is health content for pregnant users: don't
invent exercise prescriptions, and flag anything that should be reviewed by a pelvic floor PT. For
the two newer programs specifically, a `core` exercise needs to say what doming means and where the
supine limit is, and a `stretch` needs to say that end range is not the target. Program-wide caveats
go in `PROGRAM_SAFETY` (`src/content/safety.ts`), not inline.

Adding an exercise is three edits by design: the union in `src/domain/types.ts`, `list` in
`exercises.ts`, and the hand-written id array in `tests/domain/program.test.tsx`. The third is the
tripwire that catches a union member with no exercise behind it.

## Testing

- **All time goes through `now()` in `src/lib/clock.ts`.** Never call `new Date()`
  in app code — `setNow()` is what makes screen tests deterministic.
- **`@testing-library/react-native` stays on 13.x.** v14 made `render`/`fireEvent`
  async and expo-router's testing library expects the sync API. Mixing them fails
  in the worst way: no error, just state updates that never apply.
- Flows use `renderRouter` from `expo-router/testing-library` and navigate the way
  a user would. Only native-facing modules are mocked, in `tests/setup.tsx`.
- Stateful doubles live in `tests/doubles/` and are reset in a global `afterEach`.
  Prefer them over `jest.spyOn` on a module you also mocked — the spy patches a
  different object than the one under test.
- Snapshots go through `visualTree()`, which prunes to styles, copy and structure.
  Snapshotting a `ReactTestInstance` directly serializes the fiber and throws
  `RangeError: Invalid string length`.
- Screens are guarded by `Stack.Protected` in the root layout, not by redirecting
  from inside a screen. The anchor keeps the tabs mounted underneath, and a
  mounted screen that redirects fights every navigation in the onboarding flow.

## Checks

```sh
npm test
npm run typecheck                       # strict + noUncheckedIndexedAccess
npx expo export --platform ios
```

`noUncheckedIndexedAccess` is on, so an index into an array or a `Record<string, _>` is a
maybe-value. Prefer saying why it can't be missing — a `NonEmpty<T>` field, or a `?? list[0]`
fallback with a comment — over an `!`.
