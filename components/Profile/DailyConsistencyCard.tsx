import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import ProgressCircle from '@/components/ProgressCircle'; // Assuming you have a ProgressCircle component
import { useTaskStore } from '@/store/taskStore';
import { getStartOfDay } from '@/store/streakStore';

const DailyConsistencyCard = () => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const tasks = useTaskStore((state) => state.tasks);
  const completedTasks = useTaskStore((state) => state.completedTasks);
  const scheduledTasks = useTaskStore((state) => state.scheduledTasks);

  const today = useMemo(() => getStartOfDay(new Date()), []);

  const dailyTasks = useMemo(() => {
    const allTasks = [...tasks, ...completedTasks, ...scheduledTasks];
    return allTasks.filter(task => {
      const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt || 0); // Use createdAt as fallback
      return getStartOfDay(taskDate) === today;
    });
  }, [tasks, completedTasks, scheduledTasks, today]);

  const tasksCompletedToday = useMemo(() => {
    return dailyTasks.filter(task => task.completed).length;
  }, [dailyTasks]);

  const totalTasksToday = dailyTasks.length;
  const progress = totalTasksToday > 0 ? (tasksCompletedToday / totalTasksToday) * 100 : 0;

  const message = useMemo(() => {
    if (tasksCompletedToday === totalTasksToday && totalTasksToday > 0) {
      return "All tasks completed! Great consistency!";
    } else if (tasksCompletedToday > 0 && tasksCompletedToday < totalTasksToday) {
      const remaining = totalTasksToday - tasksCompletedToday;
      return `You're close to maintaining streak — complete ${remaining} more task${remaining > 1 ? 's' : ''}!`;
    } else {
      return "Start strong! Complete a task to begin your streak.";
    }
  }, [tasksCompletedToday, totalTasksToday]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        Daily Consistency Meter
      </Text>
      <View style={styles.contentRow}>
        <ProgressCircle progress={progress} size={100} strokeWidth={10} circleColor={colors.accent} bgColor={colors.border} />
        <View style={styles.messageContainer}>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>
            {tasksCompletedToday}/{totalTasksToday}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default DailyConsistencyCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
