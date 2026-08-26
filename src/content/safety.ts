import type { ProgramId } from '@/domain/types';

/**
 * Safety copy lives in one place so the onboarding gate, the settings screen and
 * the session player can't drift apart on the wording.
 */

export const SAFETY_INTRO =
  'Cradle is built for an uncomplicated, low-risk pregnancy. It is general wellness guidance, not medical advice — please clear it with your midwife or doctor first, especially if you have a high-risk pregnancy or any history of pelvic or abdominal surgery.';

export const RED_FLAGS = [
  'Vaginal bleeding, or fluid leaking',
  'Regular or painful contractions',
  'Pelvic, abdominal or vaginal pain during or after exercise',
  'Dizziness, faintness, chest pain or shortness of breath at rest',
  'Calf pain or swelling',
  'A feeling of heaviness, bulging or dragging in the vagina',
  'Reduced movement from baby',
];

export const STOP_RULES = [
  {
    title: 'Never hold your breath',
    body: 'Every lift happens on an exhale. If you have to hold your breath to do it, the effort is too high.',
  },
  {
    title: 'Pain means stop',
    body: 'Discomfort in the pelvic floor is not something to push through. Stop the session and get it looked at.',
  },
  {
    title: 'Watch for coning',
    body: 'If your belly domes or a ridge appears down the middle during core work, that is the signal to make the exercise easier — not to push through it.',
  },
  {
    title: 'Stretch to comfortable, not maximum',
    body: 'Pregnancy hormones let you reach further than your joints want to go. Take the first sensation of stretch and stay there.',
  },
];

/**
 * What is specific to each program, on top of the universal rules above. Shown on
 * the program's page in the full plan, so the caveats sit next to the content they
 * apply to rather than all being front-loaded at onboarding.
 */
export const PROGRAM_SAFETY: Record<ProgramId, { intro: string; rules: string[] }> = {
  'pelvic-floor': {
    intro:
      'Lifting and releasing are trained as two separate skills here, and the balance shifts toward release as birth gets closer.',
    rules: [
      'Exhale to lift, every single time',
      'A floor that cannot relax is tight, not strong',
      'Leaking or heaviness is worth a pelvic floor PT appointment, not more reps',
    ],
  },
  core: {
    intro:
      'Core work in pregnancy is judged by whether the midline stays quiet — not by how hard it feels. Nothing here asks for a crunch or a sit-up.',
    rules: [
      'Doming or coning means regress the exercise',
      'Lying flat on your back is avoided from mid-pregnancy on; use the pillow wedge or the side-lying option',
      'If you have significant abdominal separation, get assessed before loading it',
    ],
  },
  'birth-prep': {
    intro:
      'Relaxin makes end range easy to reach and easy to overshoot, so everything here is held at comfortable rather than maximum.',
    rules: [
      'Take the first sensation of stretch and stay there',
      'Wide-leg positions can aggravate pubic symphysis pain — narrow the stance or skip them',
      'The deep-opening and bearing-down work is introduced around 34 weeks, and not before',
    ],
  },
};

export const PT_NOTE =
  'A pelvic floor physical therapist can assess what an app cannot. If you leak, feel heaviness, or simply cannot tell whether you are doing this right, a single appointment is worth more than months of guessing.';
