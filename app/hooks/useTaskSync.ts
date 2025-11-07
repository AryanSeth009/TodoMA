import { useState, useEffect, useCallback } from 'react';
import { NetInfoStateType, useNetInfo } from '@react-native-community/netinfo';
import { Task } from '../../types/task';
import { fetchAllTasks, createTask, updateTask, deleteTask } from '../services/taskApi';
import { getLocalTasks, saveLocalTasks } from '../utils/localTaskStorage';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install 'uuid': npm install uuid @types/uuid
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncOperation {
  id: string; // Unique ID for the sync operation
  type: 'create' | 'update' | 'delete';
  payload: Partial<Task> | string; // Task data or taskId
  localId?: string; // Original local ID for 'create' operations
  timestamp: number;
}

const SYNC_QUEUE_KEY = '@todoApp:syncQueue';

export const getSyncQueue = async (): Promise<SyncOperation[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to get sync queue:', e);
    return [];
  }
};

export const saveSyncQueue = async (queue: SyncOperation[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(queue);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save sync queue:', e);
  }
};

export const useTaskSync = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const netInfo = useNetInfo();
  const isConnected = netInfo.type !== NetInfoStateType.unknown && netInfo.isConnected;

  const performSync = useCallback(async () => {
    if (!isConnected) {
      console.log('Offline: Skipping sync.');
      return;
    }

    console.log('Online: Initiating sync...');
    setLoading(true);
    setError(null);

    try {
      let currentLocalTasks = await getLocalTasks();
      let syncQueue = await getSyncQueue();

      // 1. Process pending local changes (Push to backend)
      for (const operation of syncQueue) {
        try {
          if (operation.type === 'create') {
            const createdTask = await createTask(operation.payload as Partial<Task>);
            // Update local task with backend _id
            currentLocalTasks = currentLocalTasks.map(t =>
              t.localId === operation.localId ? { ...t, _id: createdTask._id } : t
            );
            console.log('Synced create operation:', createdTask);
          } else if (operation.type === 'update') {
            await updateTask(operation.payload as string, operation.payload as Partial<Task>);
            console.log('Synced update operation:', operation.payload);
          } else if (operation.type === 'delete') {
            await deleteTask(operation.payload as string);
            currentLocalTasks = currentLocalTasks.filter(t => t._id !== operation.payload);
            console.log('Synced delete operation:', operation.payload);
          }
          // Remove successfully synced operation from queue
          syncQueue = syncQueue.filter(op => op.id !== operation.id);
        } catch (opError) {
          console.error(`Error syncing operation ${operation.id}:`, opError);
          // Keep in queue for retry
        }
      }
      await saveSyncQueue(syncQueue);

      // 2. Fetch all tasks from backend (Pull from backend)
      const serverTasks = await fetchAllTasks();
      console.log('Fetched tasks from server:', serverTasks.length);

      // 3. Reconcile local and server tasks
      // For simplicity: server data is authoritative after pushing local changes
      await saveLocalTasks(serverTasks); // Overwrite local tasks with server data
      setTasks(serverTasks);
    } catch (err) {
      console.error('Error during sync:', err);
      setError('Failed to sync tasks with cloud. Please try again.');
      // If pull fails, we still want to show local tasks
      setTasks(await getLocalTasks());
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    // Initial load of local tasks
    const loadInitialTasks = async () => {
      setLoading(true);
      const localTasks = await getLocalTasks();
      setTasks(localTasks);
      setLoading(false);
    };
    loadInitialTasks();
  }, []);

  useEffect(() => {
    // Trigger sync when online or app starts
    if (isConnected) {
      performSync();
    }
  }, [isConnected, performSync]);

  const addTask = useCallback(async (newTaskPartial: Partial<Task>) => {
    const localId = uuidv4();
    const newTask: Task = { ...newTaskPartial, _id: localId, localId } as Task; // Assign localId as _id initially
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveLocalTasks(updatedTasks);

    // Add to sync queue
    const syncQueue = await getSyncQueue();
    syncQueue.push({ id: uuidv4(), type: 'create', payload: newTask, localId, timestamp: Date.now() });
    await saveSyncQueue(syncQueue);

    // Try to sync immediately if online
    if (isConnected) {
      performSync();
    }
  }, [tasks, isConnected, performSync]);

  const updateTaskLocal = useCallback(async (taskId: string, updates: Partial<Task>) => {
    let updatedTasks = tasks.map(t =>
      t._id === taskId ? { ...t, ...updates } : t
    );
    setTasks(updatedTasks);
    await saveLocalTasks(updatedTasks);

    // Add to sync queue
    const syncQueue = await getSyncQueue();
    syncQueue.push({ id: uuidv4(), type: 'update', payload: { ...updates, _id: taskId }, timestamp: Date.now() });
    await saveSyncQueue(syncQueue);

    if (isConnected) {
      performSync();
    }
  }, [tasks, isConnected, performSync]);

  const deleteTaskLocal = useCallback(async (taskId: string) => {
    let updatedTasks = tasks.filter(t => t._id !== taskId);
    setTasks(updatedTasks);
    await saveLocalTasks(updatedTasks);

    // Add to sync queue
    const syncQueue = await getSyncQueue();
    syncQueue.push({ id: uuidv4(), type: 'delete', payload: taskId, timestamp: Date.now() });
    await saveSyncQueue(syncQueue);

    if (isConnected) {
      performSync();
    }
  }, [tasks, isConnected, performSync]);

  return { tasks, loading, error, addTask, updateTask: updateTaskLocal, deleteTask: deleteTaskLocal };
};
