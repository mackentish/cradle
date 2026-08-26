import type { ProgramColorKey, StageColorKey } from '@/theme';

export type Phase = 'pregnancy' | 'postpartum';

/**
 * The three programs, each with its own daily session, its own reminder and its
 * own take on every stage. Pelvic floor came first, so its ids and log entries
 * are the ones everything else stays compatible with.
 */
export type ProgramId = 'pelvic-floor' | 'core' | 'birth-prep';

export type ExerciseKind =
  | 'breath'
  | 'endurance'
  | 'quick'
  | 'release'
  | 'functional'
  | 'mobility'
  | 'core'
  | 'stretch';

/**
 * Every exercise in the library, spelled out so the program's step data is
 * checked at compile time. `src/domain/program.ts` is ~600 lines of hand-written
 * steps; without this a mistyped id is a crash on the day that session comes up
 * in the rotation, which could be weeks after the typo shipped.
 */
export type ExerciseId =
  | 'diaphragmatic-breath'
  | 'find-your-floor'
  | 'connection-breath'
  | 'short-hold'
  | 'long-hold'
  | 'elevator'
  | 'quick-flicks'
  | 'the-knack'
  | 'full-release'
  | 'perineal-bulge'
  | 'birth-breathing'
  | 'happy-baby-supported'
  | 'child-pose-wide'
  | 'deep-squat-support'
  | 'bridge'
  | 'side-lying-clam'
  | 'bird-dog'
  | 'heel-slide'
  | 'sit-to-stand'
  | 'wall-sit-lift'
  | 'cat-cow'
  | 'pelvic-tilt'
  | 'hip-flexor-kneel'
  | 'figure-four'
  | 'posture-reset'
  | 'gentle-walk'
  | 'rest-and-breathe'
  // Core program
  | 'quadruped-core-breath'
  | 'standing-march'
  | 'wall-plank'
  | 'side-plank-knees'
  | 'dead-bug-heel-tap'
  | 'side-lying-leg-lift'
  | 'anti-rotation-reach'
  | 'tall-kneel-hold'
  // Birth prep / recovery stretches
  | 'butterfly-stretch'
  | 'pelvic-circles-ball'
  | 'supported-lunge-stretch'
  | 'chest-opener-doorway'
  | 'neck-shoulder-release'
  | 'standing-hamstring-support'
  | 'birth-ball-lean';

export type Exercise = {
  id: ExerciseId;
  name: string;
  kind: ExerciseKind;
  /** One line, shown on the step card. */
  summary: string;
  /** Positions this can be done in, most-recommended first. */
  positions: string[];
  howTo: string[];
  /** Short in-session reminders, shown under the timer. */
  cues: string[];
  caution?: string;
};

/** A step measured in repetitions, each rep cycling lift → hold → release → rest. */
export type RepStep = {
  type: 'reps';
  exerciseId: ExerciseId;
  reps: number;
  liftSec: number;
  holdSec: number;
  releaseSec: number;
  restSec: number;
  note?: string;
};

/** A step measured in one continuous stretch of time (breathing, stretches). */
export type HoldStep = {
  type: 'hold';
  exerciseId: ExerciseId;
  durationSec: number;
  note?: string;
};

export type Step = RepStep | HoldStep;

/** At least one element. Lets `[0]` be a value rather than a maybe-value. */
export type NonEmpty<T> = [T, ...T[]];

export type SessionTemplate = {
  id: string;
  title: string;
  steps: NonEmpty<Step>;
};

export type StageId =
  | 'foundation'
  | 'build'
  | 'sustain'
  | 'prepare'
  | 'recover'
  | 'reconnect'
  | 'rebuild';

export type Stage = {
  id: StageId;
  /** Which program this stage belongs to. Stage ids are shared across programs. */
  programId: ProgramId;
  colorKey: StageColorKey;
  phase: Phase;
  title: string;
  /** e.g. "Weeks 14–27" — human-readable range for headers. */
  range: string;
  /** Why the program looks the way it does right now. */
  focus: string;
  emphasis: string[];
  /** Inclusive start week within the phase. */
  startWeek: number;
  /** Inclusive end week, or null for "through the end of the phase". */
  endWeek: number | null;
  /** Rotated day to day so sessions vary without needing a server. */
  sessions: NonEmpty<SessionTemplate>;
};

/**
 * A program: one card on Today, one reminder, one stage table. All three share
 * the same `StageId`s and week boundaries, so "Week 22 · Build" describes the
 * whole app rather than any one program.
 */
export type Program = {
  id: ProgramId;
  colorKey: ProgramColorKey;
  title: string;
  /** "Birth prep" makes no sense once the baby is here. Falls back to `title`. */
  postpartumTitle?: string;
  /** One line, shown on the Today card under the session name. */
  blurb: string;
  stages: NonEmpty<Stage>;
};

/** Where the user is right now, derived entirely from due date + optional birth date. */
export type Progress = {
  phase: Phase;
  /** Gestational week (0–42+) during pregnancy, or weeks since birth postpartum. */
  week: number;
  /** Day within the current week, 0–6. */
  dayOfWeek: number;
  /** Days remaining until the due date; negative once past due. */
  daysUntilDue: number;
  trimester: 1 | 2 | 3 | null;
  /**
   * The stage each program is in. Programs share stage ids and week ranges, so
   * these always agree on `id` and differ only in their copy and sessions.
   */
  stages: Record<ProgramId, Stage>;
  /**
   * The headline stage, used for the app-level banner and the celebration copy.
   * Pelvic floor's, because it's the program the app started as — and since all
   * three share week boundaries, its id and range speak for all of them.
   */
  stage: Stage;
};

export type SegmentKind = 'lift' | 'hold' | 'release' | 'rest' | 'duration';

export type Segment = {
  kind: SegmentKind;
  label: string;
  seconds: number;
  repIndex: number | null;
  repTotal: number | null;
};

export type SessionLog = {
  /** Local calendar day, YYYY-MM-DD. */
  day: string;
  /** ISO timestamp of completion. */
  completedAt: string;
  /** Absent on logs written before the app had more than one program. */
  programId: ProgramId;
  stageId: StageId;
  sessionId: string;
  week: number;
  phase: Phase;
  /** Seconds of guided work actually completed. */
  seconds: number;
};

export type Profile = {
  dueDate: string | null;
  /** Set once the baby arrives; switches the program to postpartum. */
  birthDate: string | null;
  name: string | null;
  acknowledgedDisclaimerAt: string | null;
  /** One independent reminder per program. */
  reminders: Record<ProgramId, ReminderSettings>;
};

/** A single daily local notification. Off until she turns it on. */
export type ReminderSettings = {
  enabled: boolean;
  /** Local time, 0–23. */
  hour: number;
  /** Local time, 0–59, stepped in fives by the UI. */
  minute: number;
};
