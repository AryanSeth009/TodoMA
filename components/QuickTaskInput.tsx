import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Plus } from 'lucide-react-native';

export default function QuickTaskInput() {
  const { colors } = useTheme();
  const [taskTitle, setTaskTitle] = useState('');
  const addQuickTask = useTaskStore((state) => state.addQuickTask);

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;

    addQuickTask({
      id: Date.now().toString(),
      title: taskTitle,
      startTime: new Date().toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
      team: [],
      progress: 0,
      color: colors.categoryPeach,
      daysRemaining: 0,
      categoryId: 'quick',
    });

    setTaskTitle('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.inputBackground, color: colors.textPrimary }
        ]}
        placeholder="Add a quick task..."
        placeholderTextColor={colors.textSecondary}
        value={taskTitle}
        onChangeText={setTaskTitle}
        onSubmitEditing={handleAddTask}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleAddTask}
      >
        <Plus size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});