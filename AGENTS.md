# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Cradle

Expo SDK 57 + expo-router, TypeScript, no backend. See README.md for the domain model.

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
- **All text goes through `src/components/Text.tsx`** and all colour/spacing through `src/theme`.
  Don't hardcode a hex value or a font family in a screen.
- **Safety copy lives in `src/content/safety.ts`.** Don't restate a disclaimer inline.
- **Gestational age is computed in one place** (`src/domain/pregnancy.ts`). Don't recompute weeks
  from a due date anywhere else.
- **Dates are local, never UTC.** Use `toDayKey`/`fromDayKey` from `src/lib/date.ts`; `new Date('YYYY-MM-DD')`
  parses as UTC and shifts the day. `fromDayKey` returns an Invalid Date for a malformed key rather
  than a plausible wrong one — anything from outside the app goes through `isDayKey` first.
- **Nothing enters the app from storage unvalidated.** `toProfile`/`toLogs` in `src/lib/storage.ts`
  are the boundary, and both `loadProfile`/`loadLogs` and `parseBackup` go through them. A backup is
  pasted in by hand, and `replaceAll` writes to disk before the provider re-reads it — so an
  unchecked field is a crash on every launch afterwards, not a bad restore you can back out of.
- **`Step.exerciseId` is `ExerciseId`, not `string`.** Adding an exercise means adding it to the
  union in `src/domain/types.ts` as well as the library. That makes a typo in `program.ts` a compile
  error instead of a crash on the day that session comes up in the rotation. `getExercise` takes the
  union; `findExercise` is the one that accepts a route param.
- Screens that need `progress` gate on it in a wrapper component, then render an inner component —
  hooks must not sit behind an early return.

## Content changes

Exercises are in `src/domain/exercises.ts`, the stage/session programme in `src/domain/program.ts`.
Anything with a contraindication needs a `caution`. This is health content for pregnant users: don't
invent exercise prescriptions, and flag anything that should be reviewed by a pelvic floor PT.

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
  Snapshotting a `ReactTestInstance` directly serialises the fiber and throws
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
