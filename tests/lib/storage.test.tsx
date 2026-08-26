import { PROGRAM_IDS } from '@/domain/program';
import { parseBackup, toLogs, toProfile } from '@/lib/storage';
import { summarize } from '@/lib/streak';

/**
 * A backup is pasted in by hand, so a malformed one is something a user can
 * really produce. It used to be worse than a bad restore: `replaceAll` writes to
 * disk before the provider re-reads `profile.reminders`, so one bad paste took
 * the app down on every launch from then on — reinstalling, and losing the whole
 * history, being the only way back.
 */
describe('parseBackup', () => {
  const wrap = (body: object) => JSON.stringify({ app: 'cradle', version: 1, ...body });

  it('rejects anything that is not a Cradle backup', () => {
    expect(() => parseBackup('{"app":"something-else","version":1}')).toThrow(
      /does not look like a Cradle backup/
    );
    expect(() => parseBackup('not json at all')).toThrow();
  });

  it('never yields a profile the provider cannot read', () => {
    for (const reminders of [null, 42, []]) {
      const { profile } = parseBackup(wrap({ profile: { reminders } }));
      // The provider reads every program's settings on every render.
      for (const programId of PROGRAM_IDS) {
        const { enabled, hour, minute } = profile.reminders[programId];
        expect(enabled).toBe(false);
        expect(typeof hour).toBe('number');
        expect(typeof minute).toBe('number');
      }
    }
  });

  it('clamps a reminder time into a schedulable range', () => {
    const { profile } = parseBackup(
      wrap({
        profile: { reminders: { core: { enabled: true, hour: 99, minute: -4 } } },
      })
    );
    expect(profile.reminders.core).toEqual({ enabled: true, hour: 23, minute: 0 });
    // The other two are untouched by a bad value in one of them.
    expect(profile.reminders['pelvic-floor'].enabled).toBe(false);
  });

  /**
   * The one-program shape: `reminders` as a flat object rather than a map. Reading
   * the new keys off it would find nothing and switch her reminder off, which is a
   * silent regression on upgrade rather than a visible one.
   */
  it('migrates a single-program reminder onto pelvic floor', () => {
    const { profile } = parseBackup(
      wrap({ profile: { reminders: { enabled: true, hour: 7, minute: 30 } } })
    );

    expect(profile.reminders['pelvic-floor']).toEqual({ enabled: true, hour: 7, minute: 30 });
    // The programs that did not exist then start off, at their own default times.
    expect(profile.reminders.core).toEqual({ enabled: false, hour: 17, minute: 0 });
    expect(profile.reminders['birth-prep']).toEqual({ enabled: false, hour: 20, minute: 0 });
  });

  it('reads a reminder map written by this build straight back', () => {
    const { profile } = parseBackup(
      wrap({
        profile: {
          reminders: {
            'pelvic-floor': { enabled: false, hour: 9, minute: 0 },
            core: { enabled: true, hour: 6, minute: 15 },
            'birth-prep': { enabled: true, hour: 21, minute: 45 },
          },
        },
      })
    );

    expect(profile.reminders.core).toEqual({ enabled: true, hour: 6, minute: 15 });
    expect(profile.reminders['birth-prep']).toEqual({ enabled: true, hour: 21, minute: 45 });
    expect(profile.reminders['pelvic-floor'].enabled).toBe(false);
  });

  it('keeps only dates that name a real local day', () => {
    const { profile } = parseBackup(
      wrap({ profile: { dueDate: '2027-02-31', birthDate: '2026-03-14' } })
    );
    // 02/31 would roll over to March, quietly moving the whole program.
    expect(profile.dueDate).toBeNull();
    expect(profile.birthDate).toBe('2026-03-14');
  });

  it('drops log entries that cannot be placed on the calendar', () => {
    const good = {
      day: '2026-03-14',
      completedAt: '2026-03-14T09:00:00.000Z',
      programId: 'core',
      stageId: 'build',
      sessionId: 'core-build-a',
      week: 20,
      phase: 'pregnancy',
      seconds: 300,
    };
    const { logs } = parseBackup(
      wrap({ logs: [null, 'nope', { ...good, day: 'whenever' }, { ...good, stageId: 'nope' }, good] })
    );

    expect(logs).toEqual([good]);
    // The streak summary walks every entry, so a survivor has to be complete.
    expect(() => summarize(logs)).not.toThrow();
  });

  /**
   * A log from before this feature has no `programId` at all. Dropping it would
   * erase real history, so it is defaulted — every one of them was pelvic floor.
   */
  it('assigns a program to a log written before there were three', () => {
    const legacy = {
      day: '2026-03-14',
      completedAt: '2026-03-14T09:00:00.000Z',
      stageId: 'build',
      sessionId: 'build-a',
      week: 20,
      phase: 'pregnancy',
      seconds: 300,
    };
    const { logs } = parseBackup(
      wrap({ logs: [legacy, { ...legacy, completedAt: 'x', programId: 42 }] })
    );

    expect(logs).toHaveLength(2);
    expect(logs[0]?.programId).toBe('pelvic-floor');
    // A junk value is coerced the same way rather than dropping the entry.
    expect(logs[1]?.programId).toBe('pelvic-floor');
  });

  it('survives a backup with nothing in it at all', () => {
    const backup = parseBackup('{"app":"cradle","version":1}');
    expect(backup.profile).toEqual(toProfile(undefined));
    expect(backup.logs).toEqual([]);
    expect(backup.exportedAt).toBe('');
  });
});

describe('toLogs', () => {
  it('returns an empty history for anything that is not a list', () => {
    for (const value of [undefined, null, 'logs', 7, {}]) {
      expect(toLogs(value)).toEqual([]);
    }
  });
});
