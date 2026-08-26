import type { StageColorKey } from '@/theme';

export type Phase = 'pregnancy' | 'postpartum';

export type ExerciseKind =
  | 'breath'
  | 'endurance'
  | 'quick'
  | 'release'
  | 'functional'
  | 'mobility';

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
  | 'rest-and-breathe';

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
  reminders: ReminderSettings;
};

/** A single daily local notification. Off until she turns it on. */
export type ReminderSettings = {
  enabled: boolean;
  /** Local time, 0–23. */
  hour: number;
  /** Local time, 0–59, stepped in fives by the UI. */
  minute: number;
};
