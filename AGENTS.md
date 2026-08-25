# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Cradle

Expo SDK 57 + expo-router, TypeScript, no backend. See README.md for the domain model.

## Rules that matter here

- **Stay Expo Go compatible.** Every dependency must be in the Expo SDK or pure JS. No custom native
  modules — that's why the date entry is plain number fields and the icons are hand-rolled SVG.
- **No network calls, ever.** The whole promise is that nothing leaves the device. Content is
  bundled; state is in AsyncStorage.
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

## Checks

```sh
npx tsc --noEmit
npx expo export --platform ios
```
