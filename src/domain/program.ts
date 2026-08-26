import { birthPrepProgram } from './programs/birth-prep';
import { coreProgram } from './programs/core';
import { pelvicFloorProgram } from './programs/pelvic-floor';
import type { NonEmpty, Phase, Program, ProgramId, Stage, StageId } from './types';

/**
 * The program registry. Three programs, each with its own stage table, its own
 * daily session and its own reminder — but all sharing one set of `StageId`s and
 * one set of week boundaries, so "Week 22 · Build" describes the whole app rather
 * than any one program.
 *
 * That sharing is the load-bearing decision here. Namespacing stage ids per
 * program (`core-build`) would have taken `StageId` to twenty-one members and
 * forced `stageColors` and the reminder copy table to twenty-one entries each —
 * and, worse, would have invalidated every log written before this existed, since
 * `toLogs` drops an entry whose `stageId` it does not recognize.
 *
 * The stage data itself lives in `./programs/*.ts`; three tables in one file came
 * to eighteen hundred lines.
 */
export const programs: NonEmpty<Program> = [pelvicFloorProgram, coreProgram, birthPrepProgram];

/** Display order, everywhere: Today's cards, You's reminder rows, the legend. */
export const PROGRAM_IDS: NonEmpty<ProgramId> = ['pelvic-floor', 'core', 'birth-prep'];

export const programsById = Object.fromEntries(programs.map((p) => [p.id, p])) as Record<
  ProgramId,
  Program
>;

/** Every stage of every program, flat. Used by the domain test's integrity walk. */
export const stages: Stage[] = programs.flatMap((program) => program.stages);

/** For an id that came from outside the type system — a route or search param. */
export function isProgramId(value: unknown): value is ProgramId {
  return typeof value === 'string' && Object.hasOwn(programsById, value);
}

/** "Birth prep" is wrong once the baby is here; the rest keep one name. */
export function programTitle(program: Program, phase: Phase): string {
  return phase === 'postpartum' ? (program.postpartumTitle ?? program.title) : program.title;
}

const STAGE_IDS: StageId[] = [
  'foundation',
  'build',
  'sustain',
  'prepare',
  'recover',
  'reconnect',
  'rebuild',
];

export function isStageId(value: unknown): value is StageId {
  return typeof value === 'string' && (STAGE_IDS as string[]).includes(value);
}

export function stagesForProgram(programId: ProgramId, phase: Phase): Stage[] {
  return programsById[programId].stages.filter((stage) => stage.phase === phase);
}

export function stageById(programId: ProgramId, stageId: StageId): Stage | undefined {
  return programsById[programId].stages.find((stage) => stage.id === stageId);
}

/** Picks the stage whose week range contains `week`, clamping at both ends. */
export function stageFor(programId: ProgramId, phase: Phase, week: number): Stage {
  const candidates = stagesForProgram(programId, phase);
  const first = candidates[0];
  const last = candidates[candidates.length - 1];
  // Every program populates both phases in the tables above, so this is a
  // table-integrity failure rather than anything a user can reach.
  if (!first || !last) throw new Error(`No stages defined for ${programId} in phase: ${phase}`);

  const match = candidates.find(
    (stage) => week >= stage.startWeek && (stage.endWeek === null || week <= stage.endWeek)
  );
  if (match) return match;
  // Before the first stage's range (e.g. a due date more than 40 weeks out).
  return week < first.startWeek ? first : last;
}

/** The stage each program is in at `week`. */
export function stagesForWeek(phase: Phase, week: number): Record<ProgramId, Stage> {
  return {
    'pelvic-floor': stageFor('pelvic-floor', phase, week),
    core: stageFor('core', phase, week),
    'birth-prep': stageFor('birth-prep', phase, week),
  };
}
