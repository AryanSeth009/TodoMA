import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategorySection from '@/components/CategorySection';
import TaskSection from '@/components/TaskSection';
import CompletedTasks from '@/components/CompletedTasks';
import QuickTaskInput from '@/components/QuickTaskInput';
import AddTaskButton from '@/components/AddTaskButton';
import { StatusBar } from 'expo-status-bar';
import { useTaskSync } from '../hooks/useTaskSync';
import { Task } from '../../types/task';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTaskSync();

  const activeTasks = tasks.filter(task => !task.completedAt);
  const completedTasksData = tasks.filter(task => task.completedAt);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textPrimary, marginTop: 10 }}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.error, textAlign: 'center' }}>Error: {error}</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 10 }}>
          Please check your internet connection or try logging in again.
        </Text>
      </View>
    );
  }

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          paddingTop: insets.top 
        }
      ]}
    >
      <StatusBar style="auto" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header />
        <SearchBar />
        <QuickTaskInput addTask={addTask} />
        {/* <CategorySection /> */}
        <TaskSection tasks={activeTasks} updateTask={updateTask} deleteTask={deleteTask} />
        <CompletedTasks tasks={completedTasksData} updateTask={updateTask} deleteTask={deleteTask} />
      </ScrollView>
      <AddTaskButton addTask={addTask} />
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});