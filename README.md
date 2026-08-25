# Cradle

Progressive pelvic floor exercises for pregnancy and recovery. Tell Cradle your due date once and
the programme moves with you — awareness in the first trimester, real strength through the second,
and a deliberate shift toward release and birth prep as you get close.

No account, no server, no network. Everything lives on the device.

## Running it

```sh
npm install
npm start          # then press i / a, or scan with Expo Go
```

Requires Node 20+. Works in Expo Go — every dependency is either part of the Expo SDK or pure JS.

```sh
npx tsc --noEmit                        # typecheck
npx expo export --platform ios          # verify the bundle builds
```

## How the progression works

`src/domain/pregnancy.ts` turns a due date into a gestational week (280 days from LMP, so
`week = floor((280 - daysUntilDue) / 7)`). That week selects one of seven stages in
`src/domain/program.ts`:

| Stage | When | Emphasis |
| --- | --- | --- |
| Foundation | weeks 1–13 | Find the muscles, pair the lift with the exhale. Low volume. |
| Build | weeks 14–27 | Longer holds, more reps, hips and deep core integrated. |
| Sustain | weeks 28–34 | Maintain rather than chase. Release work grows. |
| Prepare | week 35+ | Mostly opening, softening and breathing for labour. |
| Recover | postpartum 0–1 | Breath and rest only. |
| Reconnect | postpartum 2–5 | Short holds, gentle movement, walking. |
| Rebuild | postpartum 6+ | Progressive strength, get properly assessed. |

Setting a birth date in **You** flips the whole programme to the postpartum track.

Each stage carries two or three session variants. `sessionForDay` rotates them by calendar day, so
sessions vary day to day without anything being fetched — the same day always yields the same
session, and consecutive days differ.

A session is a list of steps. `buildSegments` expands each one into timed segments: rep-based steps
cycle lift → hold → release → rest, duration steps are a single stretch. Release-focused exercises
relabel those phases (soften / open / let go) because telling someone to "lift" during perineal
bulging is exactly backwards.

## Layout

```
app/                      expo-router routes
  onboarding/             welcome → due date → safety gate
  (tabs)/                 Today · Progress · You
  session.tsx             the guided player
  plan.tsx                the whole programme, all seven stages
  exercise/[id].tsx       library detail
src/
  domain/                 types, exercise library, programme, pregnancy math, session builder
  state/AppState.tsx      the single provider: profile + logs + derived progress
  lib/                    dates, AsyncStorage, streaks
  components/             design system
  theme/                  colours, type scale, spacing
  content/safety.ts       all safety copy, in one place
```

## Design

Dusty rose primary, sage secondary, warm cream background. Quicksand for headings, Nunito for body
— both rounded, both free. Tokens live in `src/theme`; the palette is the only place to change a
colour.

## Reminders

One daily reminder, off by default, toggled in **You → Daily reminder**. It's a *local*
notification: `expo-notifications` hands iOS/Android a single `DAILY` trigger that repeats on the
device forever until cancelled. No push token, no server, no network — it fires with the phone in
airplane mode.

`src/lib/notifications.ts` is the only place that talks to the OS. `AppState` re-syncs on every
launch and whenever the settings or the current stage change, which means the wording follows the
programme (`src/content/reminders.ts`) — a third-trimester reminder talks about opening and
breathing, not building strength.

Enabling requests permission and saves `enabled: false` if refused, so the switch never reads as on
while the OS is dropping every notification. If permission is revoked later, the screen says so and
offers a route into system settings.

## No backend, on purpose

- Due date, birth date, reminder settings and session history are in `AsyncStorage`, keyed and versioned.
- Deleting the app deletes the history. **You → Export a backup** shares a JSON blob;
  **Restore from a backup** pastes it back.
- Content changes ship with an app release (or EAS Update).
- The trade-off accepted here: no cross-device sync.

## Safety

Cradle is a wellness app, not medical advice. Onboarding gates the programme behind a disclaimer
and a red-flag list, and every exercise with any risk attached carries its own caution. Content is
written for an uncomplicated, low-risk pregnancy.

**Before this ships to anyone: have the exercise library and the stage progression reviewed by a
pelvic floor physical therapist.** App Store health-app review will also want the disclaimer to be
prominent.

## Not built yet

- Illustrations or audio cues for the session player
- A "how did that feel?" note after each session
- App icon and splash art (still the Expo template)
