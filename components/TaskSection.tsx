import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import TaskCard from './TaskCard';
import { ChevronRight, RefreshCw } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { useEffect, useMemo } from 'react';
import { createTypography } from '../styles/typography';

export default function TaskSection() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const error = useTaskStore((state) => state.error);
  const syncTasksWithBackend = useTaskStore((state) => state.syncTasksWithBackend);
  
  // Sync with backend when component mounts
  useEffect(() => {
    console.log('TaskSection: Syncing tasks with backend');
    syncTasksWithBackend();
  }, []);
  
  // Filter out any tasks that have completedAt set or completed flag
  const ongoingTasks = tasks.filter(task => {
    // Debug log each task
    console.log('Processing task:', {
      id: task.id,
      title: task.title,
      completedAt: task.completedAt,
      completed: task.completed
    });
    
    // Ensure task has an ID
    if (!task.id) {
      console.error('Task missing ID:', task);
      return false;
    }
    
    return !task.completedAt && !task.completed;
  });
  
  // Debug logging
  useEffect(() => {
    console.log(`TaskSection: Rendering with ${ongoingTasks.length} ongoing tasks out of ${tasks.length} total tasks`);
    if (tasks.length !== ongoingTasks.length) {
      console.log('Some tasks appear to be completed but are still in the tasks array:');
      tasks.forEach(task => {
        if (task.completedAt || task.completed) {
          console.log(`- Task ${task.id}: ${task.title} (completed: ${task.completedAt}, completed flag: ${task.completed})`);
        }
      });
    }
  }, [tasks, ongoingTasks]);

  const handleRefresh = async () => {
    console.log('Refreshing ongoing tasks...');
    try {
      await syncTasksWithBackend();
      console.log('Ongoing tasks refreshed successfully');
    } catch (error) {
      console.error('Error refreshing ongoing tasks:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 16 }]}>
          Loading tasks...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[typography.body, { color: colors.error, textAlign: 'center' }]}>
          Error loading tasks: {error}
        </Text>
        <TouchableOpacity 
          style={[styles.refreshButton, { marginTop: 16 }]}
          onPress={handleRefresh}
        >
          <RefreshCw size={16} color={colors.primary} />
          <Text style={[typography.buttonText, { color: colors.primary, marginLeft: 8 }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
          Ongoing tasks
        </Text>
          <Text style={[typography.small, { color: colors.textSecondary }]}>
            {ongoingTasks.length} tasks
          </Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <RefreshCw size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={[typography.buttonText, { color: colors.textSecondary }]}>
            See all
          </Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.taskList}>
        {ongoingTasks.length > 0 ? (
          ongoingTasks.map((task) => {
            // Ensure task has an ID before rendering
            if (!task.id) {
              console.error('Rendering task without ID:', task);
              return null;
            }
            return <TaskCard key={task.id} task={task} />;
          })
        ) : (
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 16 }]}>
            No ongoing tasks. Great job!
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskList: {
    gap: 16,
  },
});