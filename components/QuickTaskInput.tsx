import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useState, useMemo } from 'react';
import { useTaskStore, TASK_COLORS } from '@/store/taskStore'; // Import TASK_COLORS
import { Plus } from 'lucide-react-native';
import { createTypography } from '../styles/typography';



export default function QuickTaskInput() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const [taskTitle, setTaskTitle] = useState('');
  const addQuickTask = useTaskStore((state) => state.addQuickTask);
  // const taskColors = useTaskStore((state) => state.TASK_COLORS); // This line is not needed, TASK_COLORS is directly imported
  // const getNextTaskColor = useTaskStore((state) => state.getNextTaskColor); // Removed this line

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;

    addQuickTask({
      id: Date.now().toString(),
      title: taskTitle,
      completed: false,
      team: [],
      progress: 0,
      // color: getNextTaskColor(TASK_COLORS), // This line will be handled by addTask internally
      daysRemaining: 0,
      categoryId: 'quick',
      createdAt: new Date().toISOString(),
    }, TASK_COLORS); // Pass TASK_COLORS

    setTaskTitle('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          typography.body, // Apply typography.body
          styles.input,
          { backgroundColor: colors.card, color: colors.textPrimary }
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
        <Plus size={24} color={colors.onPrimary} />
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
    // fontSize: 16, // Removed, handled by typography.body
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});