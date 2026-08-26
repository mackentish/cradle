import { setNow } from '@/lib/clock';
import { recentDays, summarize } from '@/lib/streak';

import { daysAgo, sessionLog } from '../helpers';

/**
 * The headline streak forgives a partial day — one program done is a day done —
 * which is what keeps every streak recorded before there were three programs
 * reading the same. `byProgram` is the only place a skipped program shows up.
 */
describe('summarize', () => {
  beforeEach(() => setNow(new Date('2026-06-15T09:30:00Z')));
  afterEach(() => setNow(null));

  it('counts a day as done when any one program is done', () => {
    const stats = summarize([
      sessionLog({ day: daysAgo(0), programId: 'core' }),
      sessionLog({ day: daysAgo(1), programId: 'birth-prep' }),
      sessionLog({ day: daysAgo(2), programId: 'pelvic-floor' }),
    ]);

    expect(stats.current).toBe(3);
    expect(stats.completedToday).toBe(true);
    expect(stats.totalSessions).toBe(3);
    // Only one of the three landed today.
    expect(stats.programsToday).toBe(1);
  });

  it('keeps a separate streak per program', () => {
    const stats = summarize([
      // Pelvic floor every day for three days.
      sessionLog({ day: daysAgo(0), programId: 'pelvic-floor', completedAt: 'a' }),
      sessionLog({ day: daysAgo(1), programId: 'pelvic-floor', completedAt: 'b' }),
      sessionLog({ day: daysAgo(2), programId: 'pelvic-floor', completedAt: 'c' }),
      // Core only today.
      sessionLog({ day: daysAgo(0), programId: 'core', completedAt: 'd' }),
    ]);

    expect(stats.byProgram['pelvic-floor'].current).toBe(3);
    expect(stats.byProgram.core.current).toBe(1);
    expect(stats.byProgram['birth-prep'].current).toBe(0);

    expect(stats.byProgram['pelvic-floor'].completedToday).toBe(true);
    expect(stats.byProgram['birth-prep'].completedToday).toBe(false);
    expect(stats.programsToday).toBe(2);
  });

  it('sums time and sessions per program, not just overall', () => {
    const stats = summarize([
      sessionLog({ programId: 'core', seconds: 100, completedAt: 'a' }),
      sessionLog({ programId: 'core', seconds: 200, completedAt: 'b' }),
      sessionLog({ programId: 'birth-prep', seconds: 50, completedAt: 'c' }),
    ]);

    expect(stats.totalSeconds).toBe(350);
    expect(stats.byProgram.core.totalSessions).toBe(2);
    expect(stats.byProgram.core.totalSeconds).toBe(300);
    expect(stats.byProgram['birth-prep'].totalSeconds).toBe(50);
    expect(stats.byProgram['pelvic-floor'].totalSessions).toBe(0);
  });

  it('reads an empty history without inventing a streak', () => {
    const stats = summarize([]);
    expect(stats.current).toBe(0);
    expect(stats.programsToday).toBe(0);
    expect(stats.byProgram.core.longest).toBe(0);
  });
});

describe('recentDays', () => {
  beforeEach(() => setNow(new Date('2026-06-15T09:30:00Z')));
  afterEach(() => setNow(null));

  it('reports which programs landed on each day, in display order', () => {
    const days = recentDays(
      [
        // Deliberately out of display order on the day itself.
        sessionLog({ day: daysAgo(0), programId: 'birth-prep', completedAt: 'a' }),
        sessionLog({ day: daysAgo(0), programId: 'pelvic-floor', completedAt: 'b' }),
        sessionLog({ day: daysAgo(3), programId: 'core', completedAt: 'c' }),
      ],
      7
    );

    expect(days).toHaveLength(7);
    // Oldest first, so today is last.
    expect(days[6]?.day).toBe(daysAgo(0));
    expect(days[6]?.done).toEqual(['pelvic-floor', 'birth-prep']);
    expect(days[3]?.done).toEqual(['core']);
    expect(days[5]?.done).toEqual([]);
  });

  it('collapses two sessions of the same program on one day', () => {
    const days = recentDays(
      [
        sessionLog({ day: daysAgo(0), programId: 'core', completedAt: 'a' }),
        sessionLog({ day: daysAgo(0), programId: 'core', completedAt: 'b' }),
      ],
      2
    );

    expect(days[1]?.done).toEqual(['core']);
  });
});
