import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Task } from '../../types/task'; // Assuming your Task type is here
import { router } from 'expo-router';

interface AddTaskButtonProps {
  addTask: (task: Partial<Task>) => Promise<void>;
}

const AddTaskButton: React.FC<AddTaskButtonProps> = ({ addTask }) => {
  const { colors } = useTheme();

  const handlePress = () => {
    // Navigate to a dedicated screen for adding/editing tasks
    // Or you can directly call addTask if it's a simple form
    router.push('/create-task'); // You'd need to create this route
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]} 
      onPress={handlePress}
    >
      <Plus size={28} color={colors.onPrimary} />
    </TouchableOpacity>
  );
};

export default AddTaskButton;

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
