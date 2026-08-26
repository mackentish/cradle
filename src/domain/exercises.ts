import type { Exercise, ExerciseId } from './types';

/**
 * The exercise library, shared by all three programs — an exercise has no program
 * of its own, and several are used by two. Everything here is general wellness
 * content for an uncomplicated pregnancy; the app gates it behind a disclaimer
 * and repeats "check with your provider" wherever it matters.
 *
 * Four ideas run through the whole library:
 *   1. Exhale to lift. Effort happens on the out-breath, never on a held breath.
 *   2. A pelvic floor that can't relax isn't strong, it's tight. Release is
 *      trained as deliberately as the squeeze, and takes over late in pregnancy.
 *   3. Core work is judged by whether the midline stays quiet. Doming or coning
 *      along the linea alba means regress the exercise, not push through it.
 *   4. Relaxin makes end range easy to reach and easy to overshoot. Stretches
 *      are held at comfortable, never at maximum.
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
  // ---------------------------------------------------------------------------
  // Core program. Deep-core-first, midline-quiet progressions — nothing here
  // asks for a crunch, and the supine work carries an explicit way out.
  // ---------------------------------------------------------------------------
  {
    id: 'quadruped-core-breath',
    name: 'Quadruped Core Breath',
    kind: 'core',
    summary: 'Teaches the deep core to fire with the exhale, before any load.',
    positions: ['Hands and knees', 'Forearms on a sofa seat if wrists complain'],
    howTo: [
      'Come to hands and knees with a long, neutral spine — not arched, not tucked.',
      'Inhale and let the belly hang heavy without letting the low back sag.',
      'Exhale slowly through pursed lips and feel the deep abdominals draw in low and wide.',
      'Keep the ribs still. The movement is under the skin, not in your back.',
    ],
    cues: ['Exhale draws in low', 'Ribs quiet', 'Long spine'],
  },
  {
    id: 'standing-march',
    name: 'Standing March',
    kind: 'core',
    summary: 'Anti-tip core work you can do at any size, at any wall.',
    positions: ['Standing, back against a wall', 'Standing free, fingertips on a counter'],
    howTo: [
      'Stand tall with your ribs stacked over your pelvis, feet hip-width.',
      'Exhale and lift one knee to hip height without letting your pelvis tip or your ribs flare.',
      'Lower with control and repeat on the other side.',
      'Slower is harder. Let the trunk staying still be the point.',
    ],
    cues: ['Pelvis level', 'Ribs over hips', 'Exhale to lift the knee'],
  },
  {
    id: 'wall-plank',
    name: 'Wall Plank',
    kind: 'core',
    summary: 'A plank at an angle your midline can actually hold.',
    positions: ['Hands on a wall', 'Hands on a kitchen counter for more challenge'],
    howTo: [
      'Place your hands on a wall at shoulder height and step your feet back a little.',
      'Make one long line from heels to head, ribs down, tailbone neutral.',
      'Breathe normally and hold. Exhale-lift the pelvic floor every few breaths.',
      'Step in closer to the wall the moment the position starts to sag.',
    ],
    cues: ['One long line', 'Ribs down', 'Keep breathing'],
    caution:
      'Watch your midline. If you see or feel a ridge or doming along the center line of your belly, walk your feet in until it settles — that is the right dose, not a lesser one. Skip if you have significant abdominal separation until a pelvic floor physical therapist has assessed you.',
  },
  {
    id: 'side-plank-knees',
    name: 'Side Plank from Knees',
    kind: 'core',
    summary: 'Loads the side of the trunk without any pressure on the belly.',
    positions: ['Forearm and bottom knee down', 'Forearm on a stack of pillows to raise the angle'],
    howTo: [
      'Lie on your side with your forearm under your shoulder and knees bent behind you.',
      'Exhale and lift your hips so your shoulder, hip and bottom knee make a line.',
      'Breathe and hold, then lower with control and change sides.',
    ],
    cues: ['Press the forearm down', 'Hips forward, not sagging back', 'Even breaths'],
    caution:
      'Stop if you get pubic bone, groin or wrist pain. Raising the forearm onto pillows reduces the load; pubic symphysis pain means leave this one out.',
  },
  {
    id: 'dead-bug-heel-tap',
    name: 'Dead Bug Heel Taps',
    kind: 'core',
    summary: 'The clearest way to feel whether the deep core is holding.',
    positions: ['Reclined on a wedge of pillows', 'Flat on your back only in early pregnancy'],
    howTo: [
      'Recline on a firm wedge of pillows so your chest sits above your hips.',
      'Bring both knees over your hips, shins parallel to the floor.',
      'Exhale and lower one heel to tap the floor, keeping your low back still.',
      'Inhale back to the start and change sides.',
    ],
    cues: ['Low back stays quiet', 'Exhale as the heel lowers', 'Small range first'],
    caution:
      'From around the middle of the second trimester, lying flat on your back can make you lightheaded and is best avoided — use the pillow wedge, or swap this for the side-lying work instead. Stop if your midline domes or your back arches away from the support.',
  },
  {
    id: 'side-lying-leg-lift',
    name: 'Side-Lying Leg Lift',
    kind: 'core',
    summary: 'Hips and lateral trunk, in the most comfortable position there is.',
    positions: ['Side-lying with a pillow between the ribs and floor', 'Side-lying with a bump pillow'],
    howTo: [
      'Lie on your side, hips and shoulders stacked, bottom knee bent for stability.',
      'Exhale and lift the top leg to about hip height, toes facing forward.',
      'Lower slowly without letting your top hip roll backwards.',
    ],
    cues: ['Toes point forward, not up', 'Hips stay stacked', 'Slow on the way down'],
    caution:
      'If you have pubic symphysis or SI joint pain, keep the range small and stop at the first twinge.',
  },
  {
    id: 'anti-rotation-reach',
    name: 'Anti-Rotation Reach',
    kind: 'core',
    summary: 'Trains the core to resist twist — what it actually does all day.',
    positions: ['Tall kneeling', 'Standing in a short split stance'],
    howTo: [
      'Kneel tall or stand in a short split stance, ribs stacked over your pelvis.',
      'Bring both hands together in front of your chest and press your palms together.',
      'Exhale and reach both hands slowly out to one side without letting your trunk turn.',
      'Return to center and reach to the other side.',
    ],
    cues: ['Hips stay square', 'Exhale as you reach', 'Nothing rotates'],
    caution:
      'Keep the reach short enough that your midline stays flat. Doming means come back closer to your chest.',
  },
  {
    id: 'tall-kneel-hold',
    name: 'Tall Kneeling Hold',
    kind: 'core',
    summary: 'Takes the legs out of the equation so the trunk has to work.',
    positions: ['Tall kneeling on a mat or folded blanket', 'Tall kneeling beside a sofa to hold'],
    howTo: [
      'Kneel upright with knees under hips and a cushion under your shins.',
      'Stack your ribs over your pelvis and let your glutes stay soft.',
      'Hold, breathing normally, and exhale-lift the pelvic floor every few breaths.',
    ],
    cues: ['Ribs over hips', 'Glutes soft', 'Tall through the crown'],
    caution: 'Skip it if kneeling is uncomfortable for your knees; the standing version is fine.',
  },
  // ---------------------------------------------------------------------------
  // Birth prep and recovery stretches. Held at comfortable, never at end range —
  // relaxin makes it easy to reach further than the joint wants to be.
  // ---------------------------------------------------------------------------
  {
    id: 'butterfly-stretch',
    name: 'Seated Butterfly',
    kind: 'stretch',
    summary: 'Opens the inner thighs and the front of the pelvis.',
    positions: ['Seated on a cushion, back against a wall', 'Seated on a low stool'],
    howTo: [
      'Sit on a cushion so your hips are above your knees, soles of the feet together.',
      'Let your knees fall open under their own weight — no pressing down with your hands.',
      'Sit tall and breathe slowly, letting the pelvic floor soften on each inhale.',
    ],
    cues: ['Let gravity do it', 'Sit tall', 'Soften on the inhale'],
    caution:
      'Comfortable, never maximum. If you have pubic symphysis pain, keep your knees closer together or leave this one out — wide-leg positions are a common trigger.',
  },
  {
    id: 'pelvic-circles-ball',
    name: 'Pelvic Circles on a Ball',
    kind: 'stretch',
    summary: 'Mobilizes the pelvis and is genuinely useful in early labor.',
    positions: ['Seated on a birth ball', 'Seated on a firm chair'],
    howTo: [
      'Sit on the ball with your feet flat and wide, knees a little below your hips.',
      'Circle your hips slowly in one direction, letting the movement come from the pelvis.',
      'Change direction after several circles, then add slow figure-eights.',
    ],
    cues: ['Slow and loose', 'Let the jaw go', 'Breathe out through the movement'],
    caution:
      'Have something solid within reach the first few times, and check the ball is sized so your hips sit slightly above your knees.',
  },
  {
    id: 'supported-lunge-stretch',
    name: 'Supported Lunge',
    kind: 'stretch',
    summary: 'Lengthens the hip flexors that pull the pelvis forward.',
    positions: ['Standing with a foot on a low step', 'Kneeling with the back knee on a cushion'],
    howTo: [
      'Step one foot forward onto a low step, holding a wall or counter.',
      'Keep your ribs stacked over your pelvis and gently shift your weight forward.',
      'Feel the stretch at the front of the back hip, not in your low back.',
      'Breathe slowly, then change sides.',
    ],
    cues: ['Tailbone heavy', 'No arching', 'Stop at a stretch'],
    caution:
      'A split stance can aggravate pubic symphysis and SI joint pain. Shorten the stride, and skip it if you feel it in the pubic bone.',
  },
  {
    id: 'chest-opener-doorway',
    name: 'Doorway Chest Opener',
    kind: 'stretch',
    summary: 'Undoes the rounded-forward posture of pregnancy and feeding.',
    positions: ['Standing in a doorway', 'Standing at a wall corner'],
    howTo: [
      'Place your forearm on a door frame with your elbow at about shoulder height.',
      'Turn your body slowly away from that arm until you feel the chest open.',
      'Breathe into the front of the ribs, then change sides.',
    ],
    cues: ['Chest, not shoulder joint', 'Ribs down', 'Slow and small'],
    caution:
      'Shoulder ligaments are laxer than usual too. If you feel this pulling in the front of the shoulder joint rather than across the chest, back off.',
  },
  {
    id: 'neck-shoulder-release',
    name: 'Neck and Shoulder Release',
    kind: 'stretch',
    summary: 'The one that helps most once you are holding a baby all day.',
    positions: ['Seated', 'Standing'],
    howTo: [
      'Sit tall and let one ear drift toward that shoulder, without turning your head.',
      'Let the opposite shoulder soften down and breathe there.',
      'Come back to center, change sides, then roll both shoulders slowly backwards.',
    ],
    cues: ['Shoulders down', 'No forcing with the hand', 'Slow breaths'],
  },
  {
    id: 'standing-hamstring-support',
    name: 'Supported Hamstring Stretch',
    kind: 'stretch',
    summary: 'Eases the back-of-thigh tightness that tips the pelvis.',
    positions: ['Standing with a heel on a low step', 'Seated on the edge of a chair'],
    howTo: [
      'Rest one heel on a low step with your leg almost straight.',
      'Hinge forward from the hips with a long back until you feel the back of the thigh.',
      'Hold and breathe, then change sides.',
    ],
    cues: ['Hinge from the hips', 'Back long, not rounded', 'Comfortable, not maximum'],
    caution:
      'Hamstrings under relaxin will let you go much further than is useful. Take the first sensation of stretch and stay there.',
  },
  {
    id: 'birth-ball-lean',
    name: 'Forward Lean on a Ball',
    kind: 'stretch',
    summary: 'Takes the weight off your pelvis and opens the back of it.',
    positions: ['Kneeling and draped over a birth ball', 'Kneeling and draped over a sofa seat'],
    howTo: [
      'Kneel with a cushion under your knees and drape your upper body over the ball.',
      'Let your arms and head be heavy and your belly hang forward, unsupported.',
      'Breathe slowly and let your whole pelvic floor go soft.',
      'Rock gently side to side if that feels good.',
    ],
    cues: ['Heavy and draped', 'Let the belly hang', 'Nothing to hold'],
    caution:
      'Wedge the ball against a sofa or wall so it cannot roll away, and come up slowly.',
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
  core: 'Core',
  stretch: 'Stretch',
};
