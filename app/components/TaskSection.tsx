import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Task } from '../../types/task';
import { useTheme } from '@/hooks/useTheme';

interface TaskSectionProps {
  tasks: Task[];
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TaskSection: React.FC<TaskSectionProps> = ({ tasks, updateTask, deleteTask }) => {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[typography.label, { color: colors.textPrimary, marginBottom: 10 }]}>
        Ongoing Tasks
      </Text>
      {tasks.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>No ongoing tasks.</Text>
      ) : (
        tasks.map(task => (
          <View key={task._id || task.localId} style={styles.taskItem}>
            <Text style={{ color: colors.textPrimary }}>{task.title}</Text>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <Button title="Complete" onPress={() => updateTask(task._id!, { completedAt: new Date(), completed: true })} />
              <Button title="Delete" onPress={() => deleteTask(task._id!)} color="red" />
            </View>
          </View>
        ))
      )}
    </View>
  );
};

export default TaskSection;

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
