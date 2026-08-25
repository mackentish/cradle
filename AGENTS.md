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
  parses as UTC and shifts the day.
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
npm run typecheck
npx expo export --platform ios
```
