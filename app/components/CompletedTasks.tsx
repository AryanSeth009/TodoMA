import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Task } from '../../types/task';
import { useTheme } from '@/hooks/useTheme';

interface CompletedTasksProps {
  tasks: Task[];
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const CompletedTasks: React.FC<CompletedTasksProps> = ({ tasks, updateTask, deleteTask }) => {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[typography.label, { color: colors.textPrimary, marginBottom: 10 }]}>
        Completed Tasks
      </Text>
      {tasks.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>No completed tasks.</Text>
      ) : (
        tasks.map(task => (
          <View key={task._id || task.localId} style={styles.taskItem}>
            <Text style={{ color: colors.textPrimary, textDecorationLine: 'line-through' }}>{task.title}</Text>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <Button title="Undo" onPress={() => updateTask(task._id!, { completedAt: undefined, completed: false })} />
              <Button title="Delete" onPress={() => deleteTask(task._id!)} color="red" />
            </View>
          </View>
        ))
      )}
    </View>
  );
};

export default CompletedTasks;

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
});
