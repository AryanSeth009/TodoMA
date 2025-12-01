import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Task } from '@/types/task';
import TeamAvatars from './TeamAvatars';
import { Clock, CheckCircle2, Circle } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTaskStore } from '@/store/taskStore';
import { useMemo } from 'react';
import { createTypography } from '../styles/typography';

type TaskCardProps = {
  task: Task;
};

function formatDate(dateStr?: string | number | Date) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function TaskCard({ task }: TaskCardProps) {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const { title, team, startTime, endTime, color, description, categoryId, completedAt } = task;
  const completeTask = useTaskStore(state => state.completeTask);
  const updateTask = useTaskStore(state => state.updateTask);
  
  // For debugging
  console.log('Task ID:', task.id, 'Task:', task);
  
  const handleTaskCompletion = async () => {
    // Debug log the task object
    console.log('Attempting to complete task:', {
      id: task.id,
      title: task.title,
      completedAt: task.completedAt
    });
    
    if (!task.id) {
      console.error('Cannot complete task: Missing task ID');
      return;
    }
    
    // If the task is already completed, do nothing
    if (task.completedAt) {
      console.log('Task already completed:', task.id);
      return;
    }
    
    try {
      // Mark the task as completed and wait for the operation to finish
      console.log('Completing task:', task.id);
      const completedTask = await completeTask(task.id);
      console.log('Task completed successfully:', completedTask);
      
      // Force a sync with backend to ensure UI is updated
      const syncTasksWithBackend = useTaskStore.getState().syncTasksWithBackend;
      await syncTasksWithBackend();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(600)}
      style={[styles.container, { backgroundColor: color || '#f8e9f0' }]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={[typography.cardTitle, styles.title]}>{title}</Text>
        </View>
        <View style={styles.timeRow}>
          {startTime && endTime ? (
            <>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={[typography.small, styles.timeText]}>
                {startTime} - {endTime}
              </Text>
            </>
          ) : null}
        </View>
        {/* Show extra info for completed tasks */}
        {completedAt && (
          <View style={styles.detailsContainer}>
            {description ? (
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: 8 }]}>Description: {description}</Text>
            ) : null}
            {categoryId ? (
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]}>Category: {categoryId}</Text>
            ) : null}
            {team && team.length > 0 ? (
              <View style={{ marginTop: 4 }}>
                <Text style={[typography.small, { color: colors.textSecondary }]}>Team:</Text>
                <TeamAvatars avatars={team} />
              </View>
            ) : null}
            <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]}>Completed: {formatDate(completedAt)}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={handleTaskCompletion}
        activeOpacity={0.7}
      >
        {task.completedAt ? (
          <CheckCircle2 size={28} color={colors.primary} />
        ) : (
          <Circle size={28} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    color: 'rgba(0,0,0,0.85)',
    fontWeight: '600',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLabel: {
    color: 'rgba(0,0,0,0.6)',
    marginRight: 8,
    fontSize: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'rgba(0,0,0,0.6)',
    marginLeft: 4,
    fontSize: 12,
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  detailsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 8,
  },
});