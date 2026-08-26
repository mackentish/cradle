import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, DayDots, Pill, ProgramLegend, Screen, SegmentedTabs, Text } from '@/components';
import {
  PROGRAM_IDS,
  programsById,
  programTitle,
  stageById,
  stagesForProgram,
} from '@/domain/program';
import type { ProgramId, Progress } from '@/domain/types';
import { formatDayKey, formatDuration } from '@/lib/date';
import { recentDays, type ProgramSummary } from '@/lib/streak';
import { useAppState } from '@/state/AppState';
import { colors, programColors, radius, spacing, stageColors } from '@/theme';

export default function ProgressScreen() {
  const { ready, progress } = useAppState();

  // Guarded by the root layout, so a missing profile here means storage is
  // still loading rather than a user who skipped onboarding.
  if (!ready || !progress) return null;
  return <ProgressView progress={progress} />;
}

function ProgressView({ progress }: { progress: Progress }) {
  const { logs, stats } = useAppState();
  const [timelineProgram, setTimelineProgram] = useState<ProgramId>('pelvic-floor');

  const days = useMemo(() => recentDays(logs, 7), [logs]);
  const recentSessions = useMemo(
    () => [...logs].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 12),
    [logs]
  );
  const phaseStages = stagesForProgram(timelineProgram, progress.phase);

  return (
    <Screen testID="progress-screen">
      <View style={styles.header}>
        <Text variant="label">Progress</Text>
        <Text variant="hero">
          {stats.current} day{stats.current === 1 ? '' : 's'} running
        </Text>
        <Text variant="body">
          {stats.completedToday
            ? 'Today is in the bank.'
            : stats.current > 0
              ? 'Yesterday counted. Today is still open.'
              : 'Every streak starts with one session.'}
        </Text>
      </View>

      <View style={styles.statRow}>
        <Stat label="Sessions" value={String(stats.totalSessions)} />
        <Stat label="Time" value={formatDuration(stats.totalSeconds)} />
        <Stat label="Best streak" value={`${stats.longest}d`} />
      </View>

      <Card>
        <Text variant="label">Last seven days</Text>
        <DayDots days={days} />
        <ProgramLegend phase={progress.phase} />
        <Text variant="small" color={colors.textFaint}>
          A day counts toward the streak as soon as one program is done. The rings show which.
        </Text>
      </Card>

      {/*
        The headline streak deliberately forgives a partial day, so this is the
        only place you can see that core has been skipped for three weeks.
      */}
      <Card>
        <Text variant="label">By program</Text>
        <View style={styles.programList}>
          {PROGRAM_IDS.map((programId) => {
            const summary = stats.byProgram[programId];
            const tone = programColors[programsById[programId].colorKey];
            return (
              <View key={programId} style={styles.programRow}>
                <View style={[styles.swatch, { borderColor: tone.ring }]} />
                <View style={styles.programBody}>
                  <Text variant="bodyStrong">
                    {programTitle(programsById[programId], progress.phase)}
                  </Text>
                  <Text variant="small" color={colors.textFaint}>
                    {summary.totalSessions === 0 ? 'Not started yet' : describe(summary)}
                  </Text>
                </View>
                <Text variant="smallStrong" color={tone.ink}>
                  {summary.current}d
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text variant="label">The journey</Text>
        <SegmentedTabs
          value={timelineProgram}
          onChange={setTimelineProgram}
          options={PROGRAM_IDS.map((programId) => ({
            value: programId,
            label: programTitle(programsById[programId], progress.phase),
          }))}
        />
        <View style={styles.timeline}>
          {phaseStages.map((stage) => {
            const isCurrent = stage.id === progress.stages[timelineProgram].id;
            const tone = stageColors[stage.colorKey];
            const done =
              progress.week > (stage.endWeek ?? Number.POSITIVE_INFINITY) && !isCurrent;
            return (
              <View key={stage.id} style={styles.timelineRow}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: isCurrent ? tone.ink : done ? tone.tint : colors.border },
                  ]}
                />
                <View style={styles.timelineBody}>
                  <View style={styles.timelineTitle}>
                    <Text variant={isCurrent ? 'subheading' : 'bodyStrong'}>{stage.title}</Text>
                    {isCurrent ? (
                      <Pill label="You are here" tint={tone.tint} ink={tone.ink} />
                    ) : null}
                  </View>
                  <Text variant="small" color={colors.textFaint}>
                    {stage.range}
                  </Text>
                  {isCurrent ? (
                    <View style={styles.emphasis}>
                      {stage.emphasis.map((item) => (
                        <Text key={item} variant="small">
                          · {item}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text variant="label">Recent sessions</Text>
        {recentSessions.length === 0 ? (
          <Text variant="small">Nothing logged yet — your first session will show up here.</Text>
        ) : (
          <View style={styles.logList}>
            {recentSessions.map((log) => {
              const tone = programColors[programsById[log.programId].colorKey];
              const when =
                log.phase === 'pregnancy' ? `Week ${log.week}` : `${log.week}w postpartum`;
              return (
                <View key={log.completedAt} style={styles.logRow}>
                  <View style={[styles.swatch, { borderColor: tone.ring }]} />
                  <View style={styles.logBody}>
                    <Text variant="bodyStrong">
                      {stageById(log.programId, log.stageId)?.title ?? log.stageId}
                    </Text>
                    <Text variant="small" color={colors.textFaint}>
                      {programTitle(programsById[log.programId], log.phase)} ·{' '}
                      {when} ·{' '}
                      {formatDuration(log.seconds)}
                    </Text>
                  </View>
                  <Text variant="small" color={colors.textFaint}>
                    {formatDayKey(log.day)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>
    </Screen>
  );
}

function describe(summary: ProgramSummary): string {
  const plural = summary.totalSessions === 1 ? '' : 's';
  const sessions = `${summary.totalSessions} session${plural}`;
  const time = formatDuration(summary.totalSeconds);
  return `${sessions} · ${time} · ${summary.daysThisWeek}/7 this week`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="heading">{value}</Text>
      <Text variant="label">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: 2,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    borderWidth: 3,
  },
  programList: {
    gap: spacing.lg,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  programBody: {
    flex: 1,
    gap: 2,
  },
  timeline: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  timelineBody: {
    flex: 1,
    gap: 2,
  },
  timelineTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emphasis: {
    marginTop: spacing.xs,
    gap: 2,
  },
  logList: {
    gap: spacing.lg,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logBody: {
    flex: 1,
  },
});
