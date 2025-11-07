import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../../types/task'; // Assuming your Task type is here

const LOCAL_TASKS_KEY = '@todoApp:tasks';

export const getLocalTasks = async (): Promise<Task[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(LOCAL_TASKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to get local tasks:', e);
    return [];
  }
};

export const saveLocalTasks = async (tasks: Task[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(LOCAL_TASKS_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save local tasks:', e);
  }
};
