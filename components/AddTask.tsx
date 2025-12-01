import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTaskStore } from '@/store/taskStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

export const AddTask = ({ onClose }: { onClose: () => void }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedCategory, setSelectedCategory] = useState<string>('default');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTask = useTaskStore((state) => state.addTask);
  const categories = useTaskStore((state) => state.categories);

  const priorityColors = {
    LOW: '#7ED321',
    MEDIUM: '#F5A623',
    HIGH: '#D0021B',
  };

  const handleAddTask = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        startTime,
        endTime,
        categoryId: selectedCategory,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        team: [],
        progress: 0,
        color: getNextTaskColor(TASK_COLORS), // Assign color dynamically
        daysRemaining: 7,
      }, TASK_COLORS);

      setTitle('');
      setDescription('');
      setStartTime('09:00');
      setEndTime('17:00');
      setSelectedCategory('default');
      setPriority('MEDIUM');
      onClose();
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary }]}
        placeholder="Task title"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.descriptionInput, { backgroundColor: colors.card, color: colors.textPrimary }]}
        placeholder="Description"
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.timeContainer}>
        <View style={styles.timeInput}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Start Time</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary }]}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="HH:MM"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.timeInput}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>End Time</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary }]}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="HH:MM"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <Text style={[styles.label, { color: colors.textPrimary }]}>Priority</Text>
      <View style={styles.priorityContainer}>
        {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.priorityButton,
              { backgroundColor: priority === level ? priorityColors[level] : colors.card },
            ]}
            onPress={() => setPriority(level)}
          >
            <Text
              style={[
                styles.priorityText,
                { color: priority === level ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.textPrimary }]}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              { backgroundColor: colors.card },
              selectedCategory === category.id && { backgroundColor: category.color },
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
            <Text
              style={[
                styles.categoryText,
                { color: selectedCategory === category.id ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddTask}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[styles.addButtonText, { color: colors.textPrimary }]}>Add Task</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#FFFFFF',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 