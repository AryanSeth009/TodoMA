import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTaskStore } from '@/store/taskStore';
import TaskCard from './TaskCard';
import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react-native';

export default function CompletedTasks() {
  const { colors, typography } = useTheme();
  const completedTasks = useTaskStore((state) => state.completedTasks);
  const syncTasksWithBackend = useTaskStore((state) => state.syncTasksWithBackend);
  const isLoading = useTaskStore((state) => state.isLoading);
  
  // Sync with backend when component mounts
  useEffect(() => {
    console.log('CompletedTasks: Syncing tasks with backend');
    syncTasksWithBackend();
  }, []);
  
  // Debug logging
  useEffect(() => {
    console.log(`CompletedTasks: Rendering with ${completedTasks.length} completed tasks`);
    completedTasks.forEach(task => {
      console.log(`- Task ${task.id}: ${task.title} (completed: ${task.completedAt})`);
    });
  }, [completedTasks]);
  
  // Filter for tasks completed today
  const todayCompletedTasks = completedTasks.filter(task => {
    if (!task.completedAt) return false;
    
    const completedDate = new Date(task.completedAt);
    const today = new Date();
    return (
      completedDate.getDate() === today.getDate() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getFullYear() === today.getFullYear()
    );
  });
  
  // Filter for tasks completed in the last 7 days (excluding today)
  const recentCompletedTasks = completedTasks.filter(task => {
    if (!task.completedAt) return false;
    
    const completedDate = new Date(task.completedAt);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    // Check if it's within the last 7 days but not today
    return (
      completedDate >= sevenDaysAgo && 
      completedDate <= today &&
      !(completedDate.getDate() === today.getDate() &&
        completedDate.getMonth() === today.getMonth() &&
        completedDate.getFullYear() === today.getFullYear())
    );
  });
  
  // Handle manual refresh
  const handleRefresh = () => {
    console.log('Manually refreshing completed tasks');
    syncTasksWithBackend();
  };
  
  return (
    <View style={styles.container}>
      {/* Today's completed tasks */}
          <View style={styles.headerContainer}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
              Completed Today
            </Text>
            <View style={styles.rightHeader}>
              <Text style={[typography.small, { color: colors.textSecondary, marginRight: 8 }]}>
                {todayCompletedTasks.length} {todayCompletedTasks.length === 1 ? 'task' : 'tasks'}
              </Text>
              <TouchableOpacity onPress={handleRefresh} disabled={isLoading}>
                <RefreshCw 
                  size={16} 
                  color={colors.textSecondary} 
                  style={isLoading ? styles.spinning : undefined} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.taskList}>
        {todayCompletedTasks.length > 0 ? (
          todayCompletedTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={{...task, completedAt: task.completedAt || new Date()}} 
              />
          ))
        ) : (
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            No tasks completed today
          </Text>
        )}
          </View>
      
      {/* Recently completed tasks (last 7 days) */}
      <View style={[styles.headerContainer, { marginTop: 24 }]}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
              Recently Completed
            </Text>
            <Text style={[typography.small, { color: colors.textSecondary }]}>
              {recentCompletedTasks.length} {recentCompletedTasks.length === 1 ? 'task' : 'tasks'}
            </Text>
          </View>
          
          <View style={styles.taskList}>
        {recentCompletedTasks.length > 0 ? (
          recentCompletedTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={{...task, completedAt: task.completedAt || new Date()}} 
              />
          ))
        ) : (
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            No tasks completed in the last 7 days
          </Text>
        )}
          </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskList: {
    gap: 16,
    marginTop: 16,
  },
  spinning: {
    opacity: 0.6,
    transform: [{ rotate: '45deg' }],
  },
});