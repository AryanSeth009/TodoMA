import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Task, ScheduledTask } from '@/types/task';
import ScheduledTaskCard from './ScheduledTaskCard';
import TaskCard from './TaskCard';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useMemo } from 'react';
import { createTypography } from '../styles/typography';

type TimelineItemProps = {
  time: string;
  isLast: boolean;
  tasks: (Task | ScheduledTask)[];
};

export default function TimelineItem({ time, isLast, tasks }: TimelineItemProps) {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.timeColumn}>
        <Text style={[typography.time, { color: colors.textSecondary }]}>
          {time}
        </Text>
        
        {!isLast && (
          <View style={styles.timelineContainer}>
            <View 
              style={[
                styles.timelineLine, 
                { backgroundColor: colors.border }
              ]} 
            />
          </View>
        )}
      </View>
      
      <View style={styles.contentColumn}>
        {tasks.length > 0 ? (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.tasksContainer}
          >
            {tasks.map((task) => {
              // Determine the time to display based on task type and completion status
              let displayTime = '';
              if ('completedAt' in task && task.completedAt) {
                // Extract time from completedAt
                const date = new Date(task.completedAt);
                displayTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              } else if ('time' in task && task.time) {
                // For scheduled tasks, use their specific time
                displayTime = task.time;
              } else if ('startTime' in task && task.startTime) {
                // For active tasks, use their start time
                displayTime = task.startTime;
              }

              return (
                <View key={task.id} style={styles.taskEntry}>
                  {displayTime ? (
                    <Text style={[typography.small, { color: colors.textSecondary, marginRight: 8 }]}>
                      {displayTime}
                    </Text>
                  ) : null}
                  {'time' in task ? (
                    <ScheduledTaskCard key={task.id} task={task as ScheduledTask} />
                  ) : (
                    <TaskCard key={task.id} task={task as Task} />
                  )}
                </View>
              );
            })}
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 40,
  },
  timeColumn: {
    width: 80,
    alignItems: 'center',
  },
  timelineContainer: {
    flex: 1,
    alignItems: 'center',
  },
  timelineLine: {
    width: 1,
    flex: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: 16,
  },
  tasksContainer: {
    // Remove marginBottom as individual taskEntry will handle spacing
  },
  taskEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Add spacing between tasks
  },
});