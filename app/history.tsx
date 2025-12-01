import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTaskStore } from '@/store/taskStore'; // Import useTaskStore
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import TaskCard from '@/components/TaskCard'; // Assuming you have a TaskCard component

export default function History() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const historyTasks = useTaskStore((state) => state.historyTasks);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.heading, styles.header, { color: colors.textPrimary }]}>Task History</Text>
      <ScrollView style={styles.card} contentContainerStyle={styles.scrollContent}>
        {historyTasks.length > 0 ? (
          historyTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 20 }]}>
            No tasks in history yet.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 20, // Add some padding at the bottom for better scrolling
  },
  card:{
    marginBottom: 20,
    padding: 10
  }
});
