import { parseBackup, toLogs, toProfile } from '@/lib/storage';
import { summarise } from '@/lib/streak';

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
    for (const reminders of [null, 'nine', 42, []]) {
      const { profile } = parseBackup(wrap({ profile: { reminders } }));
      // The provider destructures these on every render.
      const { enabled, hour, minute } = profile.reminders;
      expect(enabled).toBe(false);
      expect(hour).toBe(9);
      expect(minute).toBe(0);
    }
  });

  it('clamps a reminder time into a schedulable range', () => {
    const { profile } = parseBackup(
      wrap({ profile: { reminders: { enabled: true, hour: 99, minute: -4 } } })
    );
    expect(profile.reminders).toEqual({ enabled: true, hour: 23, minute: 0 });
  });

  it('keeps only dates that name a real local day', () => {
    const { profile } = parseBackup(
      wrap({ profile: { dueDate: '2027-02-31', birthDate: '2026-03-14' } })
    );
    // 02/31 would roll over to March, quietly moving the whole programme.
    expect(profile.dueDate).toBeNull();
    expect(profile.birthDate).toBe('2026-03-14');
  });

  it('drops log entries that cannot be placed on the calendar', () => {
    const good = {
      day: '2026-03-14',
      completedAt: '2026-03-14T09:00:00.000Z',
      stageId: 'build',
      sessionId: 'build-a',
      week: 20,
      phase: 'pregnancy',
      seconds: 300,
    };
    const { logs } = parseBackup(
      wrap({ logs: [null, 'nope', { ...good, day: 'whenever' }, { ...good, stageId: 'nope' }, good] })
    );

    expect(logs).toEqual([good]);
    // The streak summary walks every entry, so a survivor has to be complete.
    expect(() => summarise(logs)).not.toThrow();
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
