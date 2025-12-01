import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Task } from '../../types/task';
import { Plus } from 'lucide-react-native';

interface QuickTaskInputProps {
  addTask: (task: Partial<Task>) => Promise<void>;
}

const QuickTaskInput: React.FC<QuickTaskInputProps> = ({ addTask }) => {
  const { colors } = useTheme();
  const [taskTitle, setTaskTitle] = useState('');

  const handleAddTask = async () => {
    if (taskTitle.trim()) {
      await addTask({
        title: taskTitle.trim(),
        color: '#00C0FF', // Default color for quick tasks
        progress: 0,
        daysRemaining: 1, // Quick tasks often due today/soon
        categoryId: 'quick', // Special category for quick tasks
        quick: true,
      });
      setTaskTitle('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground }]}>
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        placeholder="Add a quick task..."
        placeholderTextColor={colors.textSecondary}
        value={taskTitle}
        onChangeText={setTaskTitle}
        onSubmitEditing={handleAddTask}
      />
      <TouchableOpacity onPress={handleAddTask} style={[styles.addButton, { backgroundColor: colors.primary }]}>
        <Plus size={24} color={colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

export default QuickTaskInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#EF4045',
    borderRadius: 8,
    padding: 8,
    marginLeft: 10,
  },
});
