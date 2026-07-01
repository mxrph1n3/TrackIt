import { LinearGradient } from 'expo-linear-gradient';
import { CalendarRange, Check } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { BRAND } from '../../theme/designTokens';
import type { PlannerProjectTimeline, PlannerTimelineDay } from '../../types/planner';
import { PlannerPremiumCard } from './PlannerPremiumCard';
import { PlannerSectionHeader } from './PlannerSectionHeader';
import { PLANNER_COPY } from './plannerTheme';

const DAY_ACCENTS = ['#7C5CFC', '#6366F1', '#38BDF8', '#34D399'] as const;

type ProjectsTimelineSectionProps = {
  projects: PlannerProjectTimeline[];
  days: PlannerTimelineDay[];
  onViewAll?: () => void;
};

type TimelineTaskCardProps = {
  project: PlannerProjectTimeline;
  day: PlannerTimelineDay;
  accent: string;
  styles: ReturnType<typeof createStyles>;
};

function TimelineTaskCard({ project, day, accent, styles }: TimelineTaskCardProps) {
  const progressPercent = Math.round(project.progress * 100);
  const isComplete = project.isComplete || progressPercent >= 100;

  return (
    <View style={[styles.taskCard, isComplete && styles.taskCardComplete]}>
      <View style={[styles.taskAccent, { backgroundColor: accent }]} />
      <View style={styles.taskBody}>
        <View style={styles.taskTopRow}>
          <View style={styles.taskCopy}>
            <Text
              style={[styles.taskTitle, isComplete && styles.taskTitleComplete]}
              numberOfLines={2}
            >
              {project.title}
            </Text>
            <Text style={styles.taskMeta}>
              {day.weekday} {day.dayNumber}
              {project.time ? ` · ${project.time}` : ''}
              {project.subtaskTotal > 0
                ? ` · ${project.subtaskDone}/${project.subtaskTotal} steps`
                : ''}
            </Text>
          </View>
          {isComplete ? (
            <View style={styles.doneBadge}>
              <Check color="#10B981" size={14} strokeWidth={3} />
            </View>
          ) : (
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{progressPercent}%</Text>
            </View>
          )}
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(isComplete ? 100 : progressPercent, isComplete ? 100 : 4)}%`,
              },
            ]}
          >
            <LinearGradient
              colors={isComplete ? ['#6EE7B7', '#10B981'] : [accent, BRAND.primary]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(
  theme: ReturnType<typeof usePlannerTheme>['theme'],
  surfaces: ReturnType<typeof usePlannerTheme>['surfaces'],
  isDark: boolean,
) {
  return StyleSheet.create({
    inner: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 18,
    },
    dayStrip: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    dayCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: surfaces.border,
      backgroundColor: surfaces.inset,
    },
    dayCellToday: {
      borderColor: isDark ? 'rgba(124, 92, 252, 0.55)' : 'rgba(124, 92, 252, 0.35)',
      backgroundColor: isDark ? 'rgba(124, 92, 252, 0.16)' : 'rgba(124, 92, 252, 0.08)',
    },
    dayWeekday: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: theme.textMuted,
    },
    dayWeekdayToday: {
      color: BRAND.primaryLight,
    },
    dayNumber: {
      marginTop: 4,
      fontSize: 18,
      fontWeight: '900',
      color: theme.textPrimary,
      fontVariant: ['tabular-nums'],
    },
    todayPill: {
      marginTop: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: BRAND.primary,
    },
    todayPillText: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.6,
      color: '#FFFFFF',
      textTransform: 'uppercase',
    },
    taskCount: {
      marginTop: 6,
      minWidth: 18,
      height: 18,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124, 92, 252, 0.1)',
    },
    taskCountText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textSecondary,
      fontVariant: ['tabular-nums'],
    },
    taskList: {
      gap: 10,
    },
    taskCard: {
      flexDirection: 'row',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: surfaces.border,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
      overflow: 'hidden',
    },
    taskCardComplete: {
      borderColor: isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.22)',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
    },
    taskAccent: {
      width: 4,
    },
    taskBody: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    taskTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    taskCopy: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.textPrimary,
      lineHeight: 20,
    },
    taskTitleComplete: {
      color: theme.textMuted,
      textDecorationLine: 'line-through',
    },
    taskMeta: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '500',
      color: theme.textMuted,
      lineHeight: 17,
    },
    percentBadge: {
      minWidth: 44,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(124, 92, 252, 0.18)' : 'rgba(124, 92, 252, 0.1)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(124, 92, 252, 0.28)' : 'rgba(124, 92, 252, 0.14)',
    },
    percentText: {
      fontSize: 12,
      fontWeight: '900',
      color: BRAND.primaryLight,
      fontVariant: ['tabular-nums'],
    },
    doneBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.12)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.2)',
    },
    progressTrack: {
      height: 6,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(124, 92, 252, 0.08)',
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
      overflow: 'hidden',
      minWidth: 6,
    },
    empty: {
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 28,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: surfaces.border,
      borderStyle: 'dashed',
      backgroundColor: surfaces.inset,
    },
    emptyIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(124, 92, 252, 0.14)' : 'rgba(124, 92, 252, 0.08)',
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.textPrimary,
    },
    emptyBody: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: '500',
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 19,
      maxWidth: 260,
    },
  });
}

export function ProjectsTimelineSection({
  projects,
  days,
  onViewAll,
}: ProjectsTimelineSectionProps) {
  const { theme, surfaces, isDark } = usePlannerTheme();
  const styles = useMemo(() => createStyles(theme, surfaces, isDark), [isDark, surfaces, theme]);

  const tasksByDay = useMemo(() => {
    const counts = [0, 0, 0, 0];
    for (const project of projects) {
      counts[project.dayIndex] = (counts[project.dayIndex] ?? 0) + 1;
    }
    return counts;
  }, [projects]);

  const completedCount = projects.filter((project) => project.isComplete).length;
  const activeCount = projects.length - completedCount;

  const subtitle =
    projects.length === 0
      ? 'Your next few days at a glance'
      : `${activeCount} active · ${completedCount} done`;

  return (
    <PlannerPremiumCard>
      <View style={styles.inner}>
        <PlannerSectionHeader
          title={PLANNER_COPY.projects}
          subtitle={subtitle}
          actionLabel={onViewAll ? PLANNER_COPY.viewAll : undefined}
          onAction={onViewAll}
        />

        <View style={styles.dayStrip}>
          {days.map((day, index) => {
            const count = tasksByDay[index] ?? 0;
            return (
              <View
                key={day.key}
                style={[styles.dayCell, day.isToday && styles.dayCellToday]}
              >
                <Text style={[styles.dayWeekday, day.isToday && styles.dayWeekdayToday]}>
                  {day.weekday}
                </Text>
                <Text style={styles.dayNumber}>{day.dayNumber}</Text>
                {day.isToday ? (
                  <View style={styles.todayPill}>
                    <Text style={styles.todayPillText}>Today</Text>
                  </View>
                ) : count > 0 ? (
                  <View style={styles.taskCount}>
                    <Text style={styles.taskCountText}>{count}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {projects.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <CalendarRange color={BRAND.primaryLight} size={22} strokeWidth={2.2} />
            </View>
            <Text style={styles.emptyTitle}>{PLANNER_COPY.noProjects}</Text>
            <Text style={styles.emptyBody}>
              Tasks due in the next four days show up here with clear progress and due dates.
            </Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {projects.map((project) => {
              const day = days[project.dayIndex] ?? days[0];
              const accent = DAY_ACCENTS[project.dayIndex % DAY_ACCENTS.length];

              return (
                <TimelineTaskCard
                  key={project.id}
                  project={project}
                  day={day}
                  accent={accent}
                  styles={styles}
                />
              );
            })}
          </View>
        )}
      </View>
    </PlannerPremiumCard>
  );
}
