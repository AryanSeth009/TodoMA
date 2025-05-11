import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Task, ScheduledTask } from '@/types/task';
import ScheduledTaskCard from './ScheduledTaskCard';
import TaskCard from './TaskCard';
import Animated, { FadeIn } from 'react-native-reanimated';

type TimelineItemProps = {
  time: string;
  isLast: boolean;
  tasks: (Task | ScheduledTask)[];
};

export default function TimelineItem({ time, isLast, tasks }: TimelineItemProps) {
  const { colors, typography } = useTheme();

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
            {tasks.map((task) => (
              'time' in task ? (
                <ScheduledTaskCard key={task.id} task={task as ScheduledTask} />
              ) : (
                <TaskCard key={task.id} task={task as Task} />
              )
            ))}
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
    marginBottom: 8,
  },
});