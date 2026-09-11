import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';
import { Circle } from 'react-native-svg';

import { setNow } from '@/lib/clock';
import { programPhaseColors } from '@/theme';

import { seed } from '../helpers';

/**
 * The paced view. A breathing exercise, and a set too fast to draw an arc for,
 * get a circle that grows and shrinks while the ring times the exercise end to
 * end — and the intro says so before she taps anything.
 *
 * Unlike the other session flows this one freezes the clock, because which
 * session the rotation serves decides whether a paced step is on the screen at
 * all. Week 20 puts pelvic floor in Build, and these two days pick:
 *
 *   2026-06-15 → `build-a`  connection breath first, quick flicks at step four
 *   2026-06-17 → `build-c`  posture reset first, and nothing paced about it
 */
describe('a paced exercise', () => {
  afterEach(() => setNow(null));

  const openPlayer = async (day: string) => {
    setNow(new Date(`${day}T09:30:00Z`));
    await seed();
    renderRouter('app', { initialUrl: '/session/pelvic-floor' });
    await waitFor(() => expect(screen.getByText(/Step 1 of \d+/)).toBeOnTheScreen());
  };

  /** Forward to a later exercise, stopping on its intro. */
  const skipTo = async (step: number) => {
    for (let at = 1; at < step; at += 1) {
      fireEvent.press(screen.getByText('Skip this one'));
      await waitFor(() =>
        expect(screen.getByText(new RegExp(`Step ${at + 1} of \\d+`))).toBeOnTheScreen()
      );
    }
  };

  const start = async () => {
    fireEvent.press(screen.getByText("I'm ready"));
    await waitFor(() => expect(screen.getByText('Pause')).toBeOnTheScreen());
  };

  const countdown = () => screen.getByTestId('session-countdown').props.children;
  const phase = () => screen.getByTestId('session-phase').props.children;

  it('says what the timer is about to do before she taps', async () => {
    await openPlayer('2026-06-15');

    // The jarring part was never the pace, it was arriving at it unannounced.
    expect(screen.getByText('Before you start')).toBeOnTheScreen();
    expect(screen.getByText(/breathe in over 4 seconds as it grows/)).toBeOnTheScreen();
    expect(screen.getByText(/counts the whole exercise down, not each breath/)).toBeOnTheScreen();
  });

  it('paces the breath with a circle, and times the whole exercise', async () => {
    await openPlayer('2026-06-15');
    await start();

    expect(screen.getByTestId('session-breath-circle')).toBeOnTheScreen();
    expect(phase()).toBe('Inhale, soften');
    // Forty-five seconds is the exercise, not a phase of it — the old view
    // would have opened on "45" whatever the breath was doing.
    expect(countdown()).toBe('45s left');
  });

  it('holds the ring on one rung while the circle carries the phase', async () => {
    await openPlayer('2026-06-15');
    await start();

    // A color per phase on a four second breath would be one more thing moving,
    // so the arc sits on the program's darkest rung for the whole exercise —
    // which is where a sustained hold already sat before any of this.
    const circles = screen.UNSAFE_getAllByType(Circle);
    const arc = circles[circles.length - 1]?.props.stroke;
    expect(arc).toBe(programPhaseColors['pelvic-floor'].hold);
    // And the label stays on the same color as the arc around it.
    expect(StyleSheet.flatten(screen.getByTestId('session-phase').props.style).color).toBe(arc);
  });

  it('counts a fast set down as a set, not as one second at a time', async () => {
    await openPlayer('2026-06-15');
    await skipTo(4);
    await start();

    // Ten quick flicks: 3s a rep and 3s between them, so 57 seconds of set. The
    // number used to read "1" for the whole thing.
    expect(screen.getByText('Quick Flicks')).toBeOnTheScreen();
    expect(screen.getByTestId('session-breath-circle')).toBeOnTheScreen();
    expect(countdown()).toBe('57s left');
    expect(phase()).toBe('Lift');
    expect(screen.getByText('Rep 1 of 10')).toBeOnTheScreen();
  });

  it('leaves an exercise that just counts down exactly as it was', async () => {
    await openPlayer('2026-06-17');
    await start();

    expect(screen.getByText('Ribs Over Pelvis Reset')).toBeOnTheScreen();
    expect(screen.queryByTestId('session-breath-circle')).not.toBeOnTheScreen();
    expect(screen.queryByText('Before you start')).not.toBeOnTheScreen();
    // The big number, counting the phase itself down.
    expect(countdown()).toBe(45);
  });
});
