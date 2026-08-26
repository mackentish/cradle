# Cradle

Three progressive exercise programs for pregnancy and recovery — pelvic floor, core, and stretches
for labor and delivery. Tell Cradle your due date once and all three move with you: awareness in the
first trimester, real strength through the second, and a deliberate shift toward release and birth
prep as you get close. Do one a day, or all three.

No account, no server, no network. Everything lives on the device.

## Running it

```sh
npm install
npm start          # then press i / a, or scan with Expo Go
```

Requires Node 20+. Works in Expo Go — every dependency is part of the Expo SDK or pure JS, including
the native `@expo/ui` pickers, whose module ships inside Expo Go.

On a physical iOS device, scanning the QR from `npm start` needs the phone to reach Metro directly on
the LAN. A filtered or managed network can block that even when the phone and the Mac are on the same
subnet — the symptom in Expo Go is "The network connection was lost". Confirm it by opening
`http://<your-mac-lan-ip>:8081/status` in Safari on the phone: `packager-status:running` means the LAN
is fine, nothing back means it's blocked. When it's blocked, tunnel instead:

```sh
npm run start:tunnel   # EXPO_UNSTABLE_TUNNEL_V2=1 expo start --tunnel --go
```

`EXPO_UNSTABLE_TUNNEL_V2=1` is load-bearing. Without it, `--tunnel` goes through ngrok, and Expo pins
`@expo/ngrok-bin` to the end-of-life v2 agent (2.3.41) while ngrok now requires 3.20.0+ — so it dies
with `ERR_NGROK_121` on any free account, whatever the network. The flag switches to Expo's own
tunnel service over your logged-in Expo account (`npx expo whoami`), which needs no ngrok at all.
It's undocumented and marked unstable, so expect it to move between SDKs.

That is dev-server transport only. The shipped app still makes no network calls of any kind — the
tunnel carries the JavaScript bundle from your Mac to Expo Go during development and is not part of
the build. LAN is faster, so `npm start` stays the default for simulator work.

```sh
npm test                                # jest, including snapshots
npm run typecheck                       # tsc --noEmit
npx expo export --platform ios          # verify the bundle builds
```

## The three programs

| Program | What it is | Color |
| --- | --- | --- |
| Pelvic floor | Lift, hold and release. The program Cradle started as. | Dusty rose |
| Core | Deep-core strength, midline kept quiet. No crunches. | Sage |
| Birth prep | Hips, length and rehearsing letting go. Retitles to *Recovery stretches* postpartum. | Lavender |

Each has its own Today card, its own daily session, its own configurable reminder and its own take on
every stage. They are declared in `src/domain/program.ts` — the registry — with the stage data itself
in `src/domain/programs/*.ts`, because three tables in one file came to eighteen hundred lines.

**Stage ids are shared across programs; program is a second, orthogonal axis.** All three use the
same seven `StageId`s with the same week boundaries, so "Week 22 · Build" describes the whole app.
Namespacing them per program (`core-build`) would have pushed `StageId` to twenty-one members, forced
`stageColors` and the reminder copy table to twenty-one entries each, and — worse — invalidated every
log written before this existed, since `toLogs` drops an entry whose `stageId` it cannot place.

## How the progression works

`src/domain/pregnancy.ts` turns a due date into a gestational week (280 days from LMP, so
`week = floor((280 - daysUntilDue) / 7)`). That week selects one of seven stages, per program:

| Stage | When | Emphasis (pelvic floor; each program writes its own) |
| --- | --- | --- |
| Foundation | weeks 1–13 | Find the muscles, pair the lift with the exhale. Low volume. |
| Build | weeks 14–27 | Longer holds, more reps, hips and deep core integrated. |
| Sustain | weeks 28–34 | Maintain rather than chase. Release work grows. |
| Prepare | week 35+ | Mostly opening, softening and breathing for labor. |
| Recover | postpartum 0–1 | Breath and rest only. |
| Reconnect | postpartum 2–5 | Short holds, gentle movement, walking. |
| Rebuild | postpartum 6+ | Progressive strength, get properly assessed. |

Setting a birth date in **You** flips all three programs to the postpartum track.

Each stage carries two or three session variants. `sessionForDay` rotates them by calendar day, so
sessions vary day to day without anything being fetched — the same day always yields the same
session, and consecutive days differ. It also adds a small per-program offset: without one, three
programs with the same number of variants pick the same letter every day, and she gets variant A of
all three, then variant B of all three, forever. Pelvic floor's offset is zero, so its rotation is
what it always was.

A session is a list of steps. `buildSegments` expands each one into timed segments: rep-based steps
cycle lift → hold → release → rest, duration steps are a single stretch. Release-focused exercises
relabel those phases (soften / open / let go) because telling someone to "lift" during perineal
bulging is exactly backwards.

## Layout

```
app/                      expo-router routes
  onboarding/             welcome → due date → safety gate
  (tabs)/                 Today · Progress · You
  session/[program].tsx   the guided player, per program
  reminders/[program].tsx reminder settings, per program
  plan.tsx                every program, all seven stages each
  exercise/[id].tsx       library detail
src/
  domain/
    program.ts            the registry: programs, stage lookup, week → stage
    programs/*.ts         one stage table per program
    exercises.ts          the shared exercise library
    pregnancy.ts          the only place gestational age is computed
    session.ts            rotation and the timed-segment builder
  state/AppState.tsx      the single provider: profile + logs + derived progress
  lib/                    dates, AsyncStorage, streaks
  components/             design system
  theme/                  colors, type scale, spacing
  content/safety.ts       all safety copy, in one place
```

## Design

Dusty rose primary, sage secondary, warm cream background. Quicksand for headings, Nunito for body
— both rounded, both free. Tokens live in `src/theme`; the palette is the only place to change a
color.

## Reminders

One daily reminder **per program**, all off by default, each toggled from its row in **You →
Reminders**. They're *local* notifications: `expo-notifications` hands iOS/Android a `DAILY` trigger
per program that repeats on the device forever until canceled. No push token, no server, no network —
they fire with the phone in airplane mode.

Each reminder is scheduled under its own stable identifier (`cradle-reminder-core`), so one can be
replaced without disturbing the other two. The default times are staggered — 9am, 5pm, 8pm — because
three reminders set to the same minute arrive as one buzz you learn to swipe away.

`src/lib/notifications.ts` is the only place that talks to the OS. `AppState` re-syncs on every
launch and whenever the settings or any current stage change, which means the wording follows both
the program and the stage (`src/content/reminders.ts`, twenty-one entries) — birth prep at 38 weeks
says *rehearse for labor*, and core at 38 weeks says *light and practical*, at the same time on the
same day.

One thing worth knowing if you ever change those identifiers: `syncReminders` sweeps any scheduled
notification whose identifier it does not recognize. That is what stops the unnamed reminder from the
single-program build firing forever alongside the new one on an upgraded install.

Enabling requests permission and saves `enabled: false` if refused, so the switch never reads as on
while the OS is dropping every notification. If permission is revoked later, the screen says so and
offers a route into system settings.

The time is picked with the real system control, via `@expo/ui` — a SwiftUI wheel on iOS and a
Material 3 clock dial on Android. Their prop shapes differ enough that `TimePicker` is split by
platform extension (`.ios.tsx` / `.android.tsx`), with `TimePicker.tsx` falling back to steppers on
web; all three share `TimePicker.types.ts`. Both native pickers are left uncontrolled — feeding the
selection back down mid-scroll fights the wheel — and the reminders screen debounces before saving,
since a spinning wheel would otherwise mean an AsyncStorage write and a reschedule per frame.

## No backend, on purpose

- Due date, birth date, reminder settings and session history are in `AsyncStorage`, keyed and versioned.
- `Profile.reminders` went from one `ReminderSettings` to a `Record<ProgramId, ReminderSettings>`,
  and `SessionLog` gained a `programId`. Both migrate on read rather than behind a key bump:
  `toProfile` recognizes the old flat shape and keeps the existing reminder on pelvic floor, and
  `toLogs` defaults a missing `programId` to `'pelvic-floor'` — because every log written before
  this existed was a pelvic floor session, and dropping it would erase real history.
- Deleting the app deletes the history. **You → Export a backup** shares a JSON blob;
  **Restore from a backup** pastes it back.
- Content changes ship with an app release (or EAS Update).
- The trade-off accepted here: no cross-device sync.

## Tests

`npm test` drives the app through its happy paths with `expo-router`'s testing
library — real navigation, real AsyncStorage, real pregnancy math. Only the things
that reach native code are doubled (`tests/doubles/`), and the notification double
keeps real state so "enabling a reminder schedules exactly one daily trigger" is an
assertion rather than a hope.

```
tests/
  flows/          onboarding, a full session, reminders, the postpartum switch, Today's three cards
  domain/         the exercise-id/library loop, registry integrity, rotation independence
  lib/            storage coercion and both migrations, per-program streaks
  components/     DateFields parsing, Confetti piece count and Reduce Motion
  screens.test.tsx  snapshots of the main screens
  doubles/        stateful stand-ins for notifications and accessibility
  visual.ts       the pruned-tree projection the snapshots use
```

A few of these exist to pin decisions that are easy to undo by accident: that the three programs
agree on week boundaries, that no two sessions in a stage band share a title (two cards side by side
would read as duplicates), that the day rotation gives the three programs *different* sessions, and
that switching one reminder on leaves the other two untouched.

The snapshots are **render-tree, not pixel**. They capture structure, copy and
resolved styles — so a color, radius or spacing regression shows up — but they
cannot catch a layout that only breaks once real text metrics are involved. Pixel
diffing would need a simulator harness plus image comparison, which is a bigger
piece of infrastructure than this repo currently earns. Regenerate with
`npm run test:update` and read the diff.

Two things worth knowing before touching the setup:

- **Time goes through `src/lib/clock.ts`.** `now()` is the only source of the
  current date, and `setNow()` freezes it for tests. Screens show the week, today's
  session and a streak, so without that seam every screen test is coupled to the
  clock of whatever machine runs it.
- **`@testing-library/react-native` is pinned to 13.x on purpose.** v14 made
  `render` and `fireEvent` async; `expo-router`'s testing library is built against
  the synchronous 13 API, and mixing them produces overlapping `act()` calls and
  state updates that silently never apply.

## Safety

Cradle is a wellness app, not medical advice. Onboarding gates the program behind a disclaimer
and a red-flag list, and every exercise with any risk attached carries its own caution. Content is
written for an uncomplicated, low-risk pregnancy.

**Before this ships to anyone: have the exercise library and the stage progression reviewed by a
pelvic floor physical therapist.** That now covers three programs rather than one — the core and
birth-prep content is conservative and well-established, but it is unreviewed, and the two areas
that most need a professional eye are the diastasis/doming guidance in the core program and the
end-range and pubic-symphysis cautions in the stretches. App Store health-app review will also want
the disclaimer to be prominent.

Program-specific caveats live in `PROGRAM_SAFETY` (`src/content/safety.ts`) and are shown on each
program's page in the full plan, so they sit next to the content they apply to.

## Not built yet

- Illustrations or audio cues for the session player
- A "how did that feel?" note after each session
- A separate Android notification channel per program, so one can be muted from system settings
- Letting the user hide or reorder programs — all three are on for everyone
- Divergent week boundaries per program; the types allow it, the content doesn't use it
