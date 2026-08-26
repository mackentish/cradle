import type { Exercise, ExerciseId } from './types';

/**
 * The exercise library. Everything here is general pelvic-floor wellness content
 * for an uncomplicated pregnancy — the app gates it behind a disclaimer and
 * repeats "check with your provider" wherever it matters.
 *
 * Two ideas run through the whole library:
 *   1. Exhale to lift. Effort happens on the out-breath, never on a held breath.
 *   2. A pelvic floor that can't relax isn't strong, it's tight. Release is
 *      trained as deliberately as the squeeze, and takes over late in pregnancy.
 */
const list: Exercise[] = [
  {
    id: 'diaphragmatic-breath',
    name: 'Diaphragmatic Breathing',
    kind: 'breath',
    summary: 'The breath everything else is built on.',
    positions: ['Seated, back supported', 'Side-lying', 'Hands and knees'],
    howTo: [
      'Rest one hand on your ribs and one on your belly.',
      'Breathe in through your nose and let your lower ribs widen sideways, like an umbrella opening.',
      'Feel your pelvic floor soften and drop gently on the inhale.',
      'Exhale slowly through your mouth and let the ribs knit back down.',
    ],
    cues: ['Widen the ribs, not just the belly', 'Slow out-breath', 'Jaw loose'],
  },
  {
    id: 'find-your-floor',
    name: 'Finding Your Pelvic Floor',
    kind: 'breath',
    summary: 'Locate the muscles before you try to train them.',
    positions: ['Side-lying', 'Seated on a firm chair'],
    howTo: [
      'Imagine the space between your pubic bone and tailbone as a hammock.',
      'Gently draw up as if stopping yourself from passing gas, then as if lifting a blueberry with your vagina.',
      'Notice the lift is small and internal — your buttocks, thighs and belly stay quiet.',
      'Let go completely and feel the hammock settle back down.',
    ],
    cues: ['Small and internal', 'Glutes stay soft', "Don't hold your breath"],
    caution:
      'If you cannot feel anything, or you feel pain, that is worth a visit to a pelvic floor physical therapist rather than more effort.',
  },
  {
    id: 'connection-breath',
    name: 'Connection Breath',
    kind: 'breath',
    summary: 'Pair the lift with your exhale so it becomes automatic.',
    positions: ['Side-lying', 'Seated', 'Hands and knees'],
    howTo: [
      'Inhale and let the pelvic floor soften and widen.',
      'Exhale slowly and let the lift happen with the breath, from back to front.',
      'Release fully as the next inhale arrives.',
    ],
    cues: ['Exhale to lift', 'Inhale to soften', 'Let the breath lead'],
  },
  {
    id: 'short-hold',
    name: 'Short Holds',
    kind: 'endurance',
    summary: 'Brief squeezes with equal rest — the starting dose.',
    positions: ['Side-lying', 'Seated', 'Standing'],
    howTo: [
      'Exhale and lift the pelvic floor to about 70% of your maximum.',
      'Hold while breathing normally.',
      'Release fully and rest at least as long as you held.',
    ],
    cues: ['70%, not 100%', 'Keep breathing', 'Full release between reps'],
  },
  {
    id: 'long-hold',
    name: 'Endurance Holds',
    kind: 'endurance',
    summary: 'Longer holds to build stamina for daily loads.',
    positions: ['Side-lying', 'Seated', 'Standing'],
    howTo: [
      'Exhale and lift to about 70%.',
      'Keep the lift steady and keep breathing through the whole hold.',
      'Release slowly and completely, then rest.',
    ],
    cues: ['Steady, not maximal', 'Breathe through the hold', 'Release slowly'],
    caution:
      'If the lift fades partway through, shorten the hold. A shorter honest hold beats a long one you are bracing through.',
  },
  {
    id: 'elevator',
    name: 'The Elevator',
    kind: 'endurance',
    summary: 'Lift in stages to build control, not just strength.',
    positions: ['Seated', 'Side-lying'],
    howTo: [
      'Exhale and lift a third of the way — first floor. Pause.',
      'Lift to two thirds — second floor. Pause.',
      'Lift as high as feels comfortable — top floor.',
      'Come down one floor at a time, all the way to the ground floor.',
    ],
    cues: ['Pause at each floor', 'The way down matters most', 'Land softly'],
  },
  {
    id: 'quick-flicks',
    name: 'Quick Flicks',
    kind: 'quick',
    summary: 'Fast on, fast off — for coughs, sneezes and laughing.',
    positions: ['Seated', 'Standing', 'Side-lying'],
    howTo: [
      'Lift the pelvic floor quickly and strongly.',
      'Let go immediately and completely.',
      'Keep a light, easy breath going the whole set.',
    ],
    cues: ['Snap up, drop down', 'Full release every time', 'Keep breathing'],
  },
  {
    id: 'the-knack',
    name: 'The Knack',
    kind: 'quick',
    summary: 'Pre-brace before pressure so you stay dry.',
    positions: ['Standing', 'Seated'],
    howTo: [
      'Think of something that usually makes you leak — a cough, a sneeze, standing up.',
      'Just before it, lift the pelvic floor quickly.',
      'Do the movement or cough, then release.',
    ],
    cues: ['Lift just before, not during', 'Then let go completely'],
  },
  {
    id: 'full-release',
    name: 'Full Release',
    kind: 'release',
    summary: 'Training the letting-go, which most of us never practice.',
    positions: ['Side-lying', 'Supported deep squat', 'Seated on the toilet'],
    howTo: [
      'Inhale slowly and imagine the pelvic floor blooming open and widening.',
      'Let the sit bones drift apart and the perineum soften downward.',
      'Do nothing on the exhale — no lift, no squeeze. Just rest.',
    ],
    cues: ['Soften and widen', 'Nothing to hold', 'Let it be heavy'],
  },
  {
    id: 'perineal-bulge',
    name: 'Perineal Bulging',
    kind: 'release',
    summary: 'Practicing the opening direction you will need for birth.',
    positions: ['Supported deep squat', 'Side-lying with a pillow between knees'],
    howTo: [
      'Inhale into your belly and let the pelvic floor drop and widen.',
      'Gently direct a soft downward pressure toward the perineum — an opening, not a strain.',
      'Keep your jaw and throat loose; there should be no gripping anywhere.',
      'Release the pressure and take two easy breaths before the next one.',
    ],
    cues: ['Open, do not push', 'Loose jaw, loose throat', 'Gentle and brief'],
    caution:
      'Birth-prep work, generally introduced around 34 weeks. Skip it if you have a history of preterm labor, cervical insufficiency, placenta previa, or your provider has advised against bearing down — ask them first.',
  },
  {
    id: 'birth-breathing',
    name: 'Open-Throat Breathing',
    kind: 'release',
    summary: 'Breathing that lets the pelvic floor open under effort.',
    positions: ['Supported squat', 'Side-lying', 'Hands and knees'],
    howTo: [
      'Take a slow breath in through your nose.',
      'Exhale with a low, audible sigh or a soft "ahh" — the throat stays open.',
      'Notice that the pelvic floor stays soft when the sound is low and open.',
      'Compare it to a tight, held breath and feel the difference in your pelvis.',
    ],
    cues: ['Low sound, open throat', 'Soft pelvic floor', 'Never hold the breath'],
  },
  {
    id: 'happy-baby-supported',
    name: 'Supported Happy Baby',
    kind: 'release',
    summary: 'Opens the pelvic outlet without lying flat on your back.',
    positions: ['Side-lying, knees drawn up', 'Reclined on a bolster or wedge'],
    howTo: [
      'Set up on your side or propped up on pillows so you are not flat.',
      'Draw your knees up and out, holding behind the thighs.',
      'Breathe slowly and let the pelvic floor widen with each inhale.',
    ],
    cues: ['Knees wide', 'Tailbone heavy', 'Breathe into the hips'],
    caution: 'Come out of it if you feel dizzy, breathless, or any pubic pain.',
  },
  {
    id: 'child-pose-wide',
    name: "Wide-Knee Child's Pose",
    kind: 'release',
    summary: 'Makes room for the bump and lets the pelvic floor lengthen.',
    positions: ['Kneeling, knees wide, belly between the thighs'],
    howTo: [
      'Kneel with your knees wide and big toes touching.',
      'Sit your hips back toward your heels and walk your hands forward, resting your forehead on a cushion.',
      'Breathe into your low back and let the pelvic floor soften downward.',
    ],
    cues: ['Belly has room', 'Breathe into the back', 'Let the floor drop'],
  },
  {
    id: 'deep-squat-support',
    name: 'Supported Deep Squat',
    kind: 'release',
    summary: 'Lengthens the pelvic floor and opens the outlet.',
    positions: ['Holding a counter or door frame', 'Sitting back onto a low stool or birth ball'],
    howTo: [
      'Hold something solid at chest height, feet a little wider than your hips.',
      'Lower your hips as far as feels easy, keeping your heels down or on a rolled towel.',
      'Let the pelvic floor relax completely and breathe slowly.',
      'Push through your feet and exhale-lift to stand back up.',
    ],
    cues: ['Weight in the heels', 'Relax the floor at the bottom', 'Exhale to rise'],
    caution:
      'Skip deep squats if you have pubic symphysis or SI joint pain, or if your provider has advised against them. A shallow squat with a narrow stance is a fine substitute.',
  },
  {
    id: 'bridge',
    name: 'Glute Bridge',
    kind: 'functional',
    summary: 'Ties the pelvic floor to the glutes it works with.',
    positions: ['On your back with a wedge or pillows under your head and shoulders'],
    howTo: [
      'Knees bent, feet hip-width, propped up rather than flat if you are past mid-pregnancy.',
      'Exhale, lift the pelvic floor, then peel your hips up.',
      'Inhale at the top and release the lift.',
      'Lower slowly, one vertebra at a time.',
    ],
    cues: ['Exhale, lift, then move', 'Ribs stay down', 'Lower slowly'],
    caution:
      'From roughly 20 weeks, avoid lying flat on your back for long. Prop your upper body up, or swap in the side-lying clam.',
  },
  {
    id: 'side-lying-clam',
    name: 'Side-Lying Clam',
    kind: 'functional',
    summary: 'Deep hip strength that supports the pelvis, bump-friendly.',
    positions: ['Side-lying, pillow under the bump and between the knees'],
    howTo: [
      'Lie on your side with knees bent and stacked, heels together.',
      'Exhale, lift the pelvic floor, and open the top knee without rolling your hips back.',
      'Inhale and lower the knee with control.',
    ],
    cues: ['Hips stacked', 'Exhale to open', 'Slow return'],
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    kind: 'functional',
    summary: 'Whole-core coordination on all fours.',
    positions: ['Hands and knees'],
    howTo: [
      'Start on hands and knees with a long, neutral spine.',
      'Exhale, lift the pelvic floor, and reach one arm forward.',
      'Add the opposite leg back if it feels stable.',
      'Return, breathe, and switch sides.',
    ],
    cues: ['Long spine', 'Hips stay level', 'No holding the breath'],
  },
  {
    id: 'heel-slide',
    name: 'Heel Slides',
    kind: 'functional',
    summary: 'Gentle deep-core connection with no pressure on the belly.',
    positions: ['Reclined on pillows', 'Side-lying'],
    howTo: [
      'Knees bent, upper body propped up.',
      'Exhale, lift the pelvic floor, and slide one heel away along the floor.',
      'Only go as far as you can keep the low back quiet.',
      'Inhale and slide back in.',
    ],
    cues: ['Low back stays quiet', 'Exhale to move', 'Small range is fine'],
  },
  {
    id: 'sit-to-stand',
    name: 'Sit to Stand',
    kind: 'functional',
    summary: 'The movement you do fifty times a day, done well.',
    positions: ['A firm chair'],
    howTo: [
      'Sit tall at the front of a chair, feet hip-width.',
      'Exhale, lift the pelvic floor, then stand.',
      'Inhale at the top and let the lift go.',
      'Sit back down slowly, controlling the last few inches.',
    ],
    cues: ['Exhale on the way up', 'Release at the top', 'Sit down slowly'],
  },
  {
    id: 'wall-sit-lift',
    name: 'Wall Sit with Lift',
    kind: 'functional',
    summary: 'Holding a lift while your legs are working.',
    positions: ['Back against a wall, birth ball optional'],
    howTo: [
      'Lean your back on a wall with feet forward and knees softly bent.',
      'Exhale-lift the pelvic floor, hold it for a few breaths, then release.',
      'Come up out of the wall sit whenever your legs have had enough.',
    ],
    cues: ['Breathe through the hold', 'Knees behind the toes', 'Stop before shaking'],
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow',
    kind: 'mobility',
    summary: 'Frees up a spine that carries a bump all day.',
    positions: ['Hands and knees', 'Seated'],
    howTo: [
      'Inhale and let your tailbone lift and chest open.',
      'Exhale and round through the spine, tucking the tailbone.',
      'Move at the pace of your breath.',
    ],
    cues: ['Move with the breath', 'Small and easy', 'No forcing the arch'],
  },
  {
    id: 'pelvic-tilt',
    name: 'Seated Pelvic Tilts',
    kind: 'mobility',
    summary: 'Wakes up the pelvis and eases low-back ache.',
    positions: ['Seated on a firm chair or birth ball'],
    howTo: [
      'Sit tall with feet flat and find your sit bones.',
      'Roll your pelvis forward into a small arch, then back into a tuck.',
      'Then draw slow circles in each direction.',
    ],
    cues: ['Move from the pelvis', 'Ribs stay quiet', 'Slow circles'],
  },
  {
    id: 'hip-flexor-kneel',
    name: 'Kneeling Hip Opener',
    kind: 'mobility',
    summary: 'Releases the front of the hip that tightens as posture shifts.',
    positions: ['Half-kneeling with a cushion under the back knee'],
    howTo: [
      'Half-kneel with a cushion under the back knee.',
      'Tuck your tailbone slightly and shift your weight forward until you feel a stretch at the front of the back hip.',
      'Breathe slowly, then switch sides.',
    ],
    cues: ['Tuck the tailbone first', 'Stretch, never pinch', 'Easy breath'],
  },
  {
    id: 'figure-four',
    name: 'Seated Figure Four',
    kind: 'mobility',
    summary: 'Opens the deep glutes that pull on the pelvic floor.',
    positions: ['Seated on a firm chair'],
    howTo: [
      'Sit tall and cross one ankle over the opposite knee.',
      'Hinge forward from the hips until you feel the outer hip open.',
      'Breathe, then switch sides.',
    ],
    cues: ['Hinge from the hips', 'Back stays long', 'Stop at a stretch'],
  },
  {
    id: 'posture-reset',
    name: 'Ribs Over Pelvis Reset',
    kind: 'mobility',
    summary: 'Stacks you back up so the pelvic floor can do its job.',
    positions: ['Standing', 'Seated'],
    howTo: [
      'Stand with feet hip-width and weight even through both feet.',
      'Let your ribs settle directly over your pelvis — not flared up, not tucked under.',
      'Take three slow breaths here and feel the pelvic floor respond on its own.',
    ],
    cues: ['Ribs over hips', 'Unclench the glutes', 'Soft knees'],
  },
  {
    id: 'gentle-walk',
    name: 'Gentle Walk',
    kind: 'functional',
    summary: 'The most underrated recovery exercise there is.',
    positions: ['Anywhere flat'],
    howTo: [
      'Walk at a comfortable, conversational pace.',
      'Every so often, exhale-lift the pelvic floor for a few steps, then let it go.',
      'Turn back sooner than you think you need to.',
    ],
    cues: ['Conversational pace', 'Ribs over hips', 'Stop before you are tired'],
    caution:
      'Early postpartum, any heaviness, dragging or increased bleeding is a signal to shorten the walk and rest.',
  },
  {
    id: 'rest-and-breathe',
    name: 'Rest and Breathe',
    kind: 'breath',
    summary: 'Doing nothing, on purpose. This counts.',
    positions: ['Side-lying', 'Reclined on pillows'],
    howTo: [
      'Lie down somewhere comfortable with your knees supported.',
      'Breathe slowly and let your whole pelvis feel heavy.',
      'Nothing to lift, nothing to hold.',
    ],
    cues: ['Heavy and soft', 'Slow out-breath', 'Nothing to do'],
  },
];

/**
 * Keyed by `ExerciseId`, so a lookup from step data needs no undefined check.
 * `list` is the source of truth; the cast is what `Object.fromEntries` costs, and
 * the completeness of the union against it is asserted in the domain test.
 */
export const exercises = Object.fromEntries(
  list.map((exercise) => [exercise.id, exercise])
) as Record<ExerciseId, Exercise>;

export function getExercise(id: ExerciseId): Exercise {
  return exercises[id];
}

/** Lookup for an id that came from outside the type system — a route param. */
export function findExercise(id: string): Exercise | undefined {
  return Object.hasOwn(exercises, id) ? exercises[id as ExerciseId] : undefined;
}

export const kindLabels: Record<Exercise['kind'], string> = {
  breath: 'Breath',
  endurance: 'Strength',
  quick: 'Quick',
  release: 'Release',
  functional: 'Functional',
  mobility: 'Mobility',
};
