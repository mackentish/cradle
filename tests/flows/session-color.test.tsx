import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';
import { Circle } from 'react-native-svg';

import { PROGRAM_IDS, programsById } from '@/domain/program';
import { colors, palette, programColors, programPhaseColors } from '@/theme';

import { seed } from '../helpers';

/**
 * The player is where two color scales meet, and both are easy to break by
 * accident. The ring is the running program's color at every phase, with the
 * phase drawn as lightness within that one family; the chrome around it is the
 * program's identity. Neither is covered by the screen snapshots, which capture
 * only the completed session — so without this file a ring quietly reverted to
 * dusty rose in all three programs would ship green.
 */
describe('color in the session player', () => {
  const started = async (programId: string) => {
    await seed();
    renderRouter('app', { initialUrl: `/session/${programId}` });
    await waitFor(() => expect(screen.getByText(/Step 1 of/)).toBeOnTheScreen());
    fireEvent.press(screen.getByText("I'm ready"));
    await waitFor(() => expect(screen.getByText('Pause')).toBeOnTheScreen());
  };

  /** The arc, not the track behind it — ProgressRing draws the track first. */
  const arcStroke = (): string => {
    const circles = screen.UNSAFE_getAllByType(Circle);
    return circles[circles.length - 1]?.props.stroke;
  };

  const trackFill = () =>
    StyleSheet.flatten(screen.getByTestId('session-track').props.style).backgroundColor;

  it.each(PROGRAM_IDS)('draws %s’s ring in its own color family', async (programId) => {
    await started(programId);
    const ramp = programPhaseColors[programsById[programId].colorKey];
    expect(Object.values<string>(ramp)).toContain(arcStroke());
  });

  it('never paints a program’s ring in another program’s family', async () => {
    // The bug the old cross-family scale had: a core session went sage on rest
    // and lavender on release, borrowing the other two programs' identities.
    await started('core');
    const foreign = [palette.blush300, palette.blush400, palette.blush500, palette.blush600];
    expect(foreign).not.toContain(arcStroke());
    // `lift`, not `hold`: the first step here is rep-based, so `buildSegments` opens
    // on the lift of rep 1 rather than on a sustained hold. Pinning the exact rung
    // and not just the family is what catches the ramp being wired off by one.
    expect(arcStroke()).toBe(programPhaseColors.core.lift);
  });

  it('darkens every ramp monotonically from rest through hold', () => {
    // Hue no longer marks the phase, so lightness is the only cue left: the ring
    // gets darker as the work gets harder, and two phases sharing a rung — or a
    // rung out of order — would make it stop saying anything. Relative
    // luminance rather than the hex, so a repalette that keeps the order passes.
    for (const programId of PROGRAM_IDS) {
      const ramp = programPhaseColors[programsById[programId].colorKey];
      const rungs = [ramp.rest, ramp.release, ramp.lift, ramp.hold];
      expect(new Set(rungs).size).toBe(rungs.length);

      const light = rungs.map(luminance);
      expect(light).toEqual([...light].sort((a, b) => b - a));
    }
  });

  it('keeps the phase label on the same color as the arc it sits in', async () => {
    await started('core');
    // Every label `buildSegments` can produce, so this doesn't pin one session.
    const label = screen.getByText(/^(Lift|Soften|Hold|Open|Release|Let go|Rest|Breathe)$/);
    expect(StyleSheet.flatten(label.props.style).color).toBe(arcStroke());
  });

  it('paints the progress track with the program, not the app primary', async () => {
    await started('core');
    expect(trackFill()).toBe(programColors.core.ring);
    expect(trackFill()).not.toBe(colors.primary);
  });

  it('gives each program its own track, and pelvic floor the primary it always had', async () => {
    await started('birth-prep');
    expect(trackFill()).toBe(programColors['birth-prep'].ring);

    screen.unmount();
    await started('pelvic-floor');
    expect(trackFill()).toBe(colors.primary);
  });
});

/** WCAG relative luminance, for asserting one color is lighter than another. */
function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}
