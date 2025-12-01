import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../../types/task'; // Assuming your Task type is here
import { api, getApiUrl } from '../../services/api'; // Corrected import path and imported getApiUrl

// Use the dynamically determined API_URL from services/api.ts
const API_BASE_URL = getApiUrl(); // Use a getter if API_URL is private

export const getAuthToken = async (): Promise<string | null> => {
  // Implement logic to retrieve the user's authentication token from AsyncStorage
  // Use the standardized 'token' key
  return await AsyncStorage.getItem('token'); // Changed from 'userToken' to 'token'
};

export const fetchAllTasks = async (): Promise<Task[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch tasks from backend');
  }

  return response.json();
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create task on backend');
  }

  return response.json();
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PATCH', // Or PUT if you prefer full replacement
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update task on backend');
  }

  return response.json();
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete task from backend');
  }
};

