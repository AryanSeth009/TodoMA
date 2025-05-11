import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, ScheduledTask, TeamMember } from '@/types/task';
import { Category } from '@/types/category';
import { api } from '@/services/api';
import { notificationService } from '@/services/notificationService';

interface TaskState {
  // State
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  scheduledTasks: ScheduledTask[];
  quickTasks: Task[];
  categories: Category[];
  selectedDate: number;
  isAuthenticated: boolean;
  user: { email: string; name: string; avatar?: string } | null;
  isLoading: boolean;
  error: string | null;
  
  // Task management
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  addScheduledTask: (task: Omit<ScheduledTask, 'id'> & { time: string, hasCall: boolean }) => Promise<void>;
  addQuickTask: (task: Task) => Promise<void>;
  completeTask: (taskId: string) => Promise<Task | undefined>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  updateScheduledTask: (taskId: string, updates: Partial<ScheduledTask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteScheduledTask: (taskId: string) => Promise<void>;
  cleanupOldTasks: () => Promise<void>;
  
  // Category management
  addCategory: (category: Category) => Promise<void>;
  
  // UI state
  setSelectedDate: (date: number) => void;
  
  // Auth
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Data initialization
  initializeData: () => Promise<void>;
  syncTasksWithBackend: () => Promise<void>;
  sendDailySummary: () => void;
}

// Helper function to check if a task was completed more than 1 month ago
const isTaskOlderThanOneMonth = (task: Task): boolean => {
  if (!task.completedAt) return false;
  
  const completedDate = new Date(task.completedAt);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  return completedDate < oneMonthAgo;
};

// Helper function to check if a task is older than its completion time
const isTaskPastCompletionTime = (task: Task): boolean => {
  if (!task.endTime) return false;
  
  const now = new Date();
  const [hours, minutes] = task.endTime.split(':').map(Number);
  const taskEndTime = new Date();
  taskEndTime.setHours(hours, minutes, 0, 0);
  
  return now > taskEndTime;
};

export const useTaskStore = create(
  persist<TaskState>(
    (set, get): TaskState => ({
      // Initial state
      tasks: [],
      activeTasks: [],
      completedTasks: [],
      scheduledTasks: [],
      quickTasks: [],
      categories: [],
      selectedDate: new Date().getDate(),
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
  
      addTask: async (task: Omit<Task, 'id'>) => {
        try {
          set({ isLoading: true, error: null });
          console.log('TaskStore - Starting to add task:', task);
          
          // Validate required fields
          if (!task.title || !task.startTime || !task.endTime) {
            console.error('TaskStore - Missing required fields:', task);
            throw new Error('Missing required task fields');
          }

          // Create temporary task with ID
          const tempTask: Task = {
            ...task,
            id: `temp_${Date.now()}`,
            completed: false,
            completedAt: undefined,
            scheduled: false
          };

          console.log('TaskStore - Created temporary task:', tempTask);

          // Add to local state first
          set((state) => {
            console.log('TaskStore - Adding to local state');
            return {
              tasks: [...state.tasks, tempTask],
              activeTasks: [...state.activeTasks, tempTask],
              completedTasks: state.completedTasks,
              scheduledTasks: state.scheduledTasks,
              isLoading: state.isLoading,
              error: state.error
            };
          });

          try {
            console.log('TaskStore - Attempting to create task in backend');
            const createdTask = await api.createTask(task);
            console.log('TaskStore - Backend task created:', createdTask);

            // Update local state with the real task
            set((state) => {
              console.log('TaskStore - Updating local state with backend task');
              return {
                tasks: state.tasks.map((t: Task) => 
                  t.id === tempTask.id ? createdTask : t
                ),
                activeTasks: state.activeTasks.map((t: Task) => 
                  t.id === tempTask.id ? createdTask : t
                ),
                completedTasks: state.completedTasks,
                scheduledTasks: state.scheduledTasks,
                isLoading: state.isLoading,
                error: state.error
              };
            });

            console.log('TaskStore - Task added successfully');
            // Schedule notification for the new task
            notificationService.scheduleTaskNotification(createdTask);
          } catch (error) {
            console.error('TaskStore - Error creating task in backend:', error);
            // Remove temporary task from state
            set((state) => ({
              tasks: state.tasks.filter((t: Task) => t.id !== tempTask.id),
              activeTasks: state.activeTasks.filter((t: Task) => t.id !== tempTask.id),
              completedTasks: state.completedTasks,
              scheduledTasks: state.scheduledTasks,
              isLoading: state.isLoading,
              error: state.error
            }));
            throw error;
          }
        } catch (error) {
          console.error('TaskStore - Error in addTask:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add task',
            isLoading: false 
          });
          throw error;
        }
      },
  
      addScheduledTask: async (task) => {
        try {
          // Create a proper task object with all required fields
          const taskToCreate = {
            title: task.title,
            description: '',
            startTime: task.time,
            endTime: task.time, // For scheduled tasks, end time is same as start time
            team: task.team || [],
            progress: 0,
            color: task.color,
            daysRemaining: 7,
            categoryId: task.categoryId || 'default',
            scheduled: true
          };
          console.log('Creating scheduled task:', taskToCreate);
          const newTask = await api.createTask({
            ...taskToCreate,
            createdAt: new Date().toISOString() // Add the missing createdAt field
          });
          console.log('Created scheduled task:', newTask);
          
          // Cast the new task to ScheduledTask type with the required properties
          const scheduledTask: ScheduledTask = {
            id: newTask.id,
            title: newTask.title,
            time: task.time,
            team: newTask.team,
            color: newTask.color,
            hasCall: task.hasCall || false,
            categoryId: newTask.categoryId
          };
          
          // Ensure we're working with the correct type
          set((state) => {
            const updatedScheduledTasks: ScheduledTask[] = [...state.scheduledTasks, scheduledTask];
            return { scheduledTasks: updatedScheduledTasks };
          });
        } catch (error) {
          console.error('Error creating scheduled task:', error);
          // Create a temporary scheduled task with a client-side ID for local state
          const tempTask: ScheduledTask = {
            id: `temp_${Date.now()}`,
            title: task.title,
            time: task.time,
            team: task.team || [],
            color: task.color,
            hasCall: task.hasCall || false,
            categoryId: task.categoryId || 'default'
          };
          
          // Ensure we're working with the correct type
          set((state) => {
            const updatedScheduledTasks: ScheduledTask[] = [...state.scheduledTasks, tempTask];
            return { scheduledTasks: updatedScheduledTasks };
          });
        }
      },
  
      addQuickTask: async (task) => {
        const newTask = await api.createTask({ ...task, quick: true });
        set((state) => ({ quickTasks: [...state.quickTasks, newTask] }));
      },
  
      completeTask: async (taskId) => {
        if (!taskId) {
          console.error('Cannot complete task: Missing task ID');
          return;
        }
        
        try {
          console.log('Completing task with ID:', taskId);
          
          // Find the task in the current state before making API call
          const taskToComplete = get().tasks.find(t => t.id === taskId);
          
          if (!taskToComplete) {
            console.warn('Task not found in state:', taskId);
            return;
          }
          
          // Prepare completion timestamp
          const completionTime = new Date().toISOString();
          
          // Update the completedAt field in the database
          const updatedTask = await api.updateTask(taskId, { 
            completedAt: completionTime,
            completed: true
          });
          
          console.log('Task marked as completed in database:', updatedTask);
          
          // Update the local state
          set((state) => {
            // Create a properly formatted completed task
            const completedTask = {
              ...taskToComplete,
              completedAt: updatedTask.completedAt || completionTime,
              completed: true
            };
            
            console.log('Adding task to completed tasks:', completedTask);
            
            return {
              // Remove from active tasks
              tasks: state.tasks.filter(t => t.id !== taskId),
              // Add to completed tasks
              completedTasks: [...state.completedTasks, completedTask]
            };
          });
          
          // Run cleanup to remove tasks older than 1 month
          get().cleanupOldTasks();
          
          // Return the updated task for the caller
          return updatedTask;
        } catch (error) {
          console.error('Error completing task:', error);
          
          // Handle the error gracefully - mark the task as completed locally
          const taskToComplete = get().tasks.find(t => t.id === taskId);
          if (!taskToComplete) {
            console.error('Cannot complete task: Task not found in state');
            return;
          }
          
          const completionTime = new Date().toISOString();
          const localUpdatedTask = {
            ...taskToComplete,
            completedAt: completionTime,
            completed: true
          };
          
          set((state) => ({
            tasks: state.tasks.filter(t => t.id !== taskId),
            completedTasks: [...state.completedTasks, localUpdatedTask]
          }));
          
          // Return the locally updated task
          return localUpdatedTask;
        }
      },
      
      cleanupOldTasks: async () => {
        console.log('Running cleanup of old tasks');
        
        // Get current state
        const state = get();
        
        // Filter out tasks completed more than 1 month ago
        const tasksToKeep = state.completedTasks.filter(task => !isTaskOlderThanOneMonth(task));
        const tasksToDelete = state.completedTasks.filter(task => isTaskOlderThanOneMonth(task));
        
        // Delete old tasks from the backend
        for (const task of tasksToDelete) {
          try {
            if (task.id && !task.id.startsWith('temp_')) {
              console.log('Deleting old completed task:', task.id);
              await api.deleteTask(task.id);
            }
          } catch (error) {
            console.error('Error deleting old task:', error);
          }
        }
        
        // Update the state
        set({
          completedTasks: tasksToKeep
        });
      },
  
      addCategory: async (category) => {
        const newCategory = await api.createCategory(category);
        set((state) => ({ categories: [...state.categories, newCategory] }));
      },
  
      updateTask: async (taskId, updates) => {
        try {
          set({ isLoading: true, error: null });
        const updatedTask = await api.updateTask(taskId, updates);
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId ? updatedTask : task
            ),
        }));
          // Cancel existing notification and schedule new one if endTime changed
          notificationService.cancelTaskNotification(taskId);
          if (updates.endTime) {
            notificationService.scheduleTaskNotification(updatedTask);
          }
        } catch (error) {
          console.error('Error updating task:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update task',
            isLoading: false 
          });
        }
      },
  
      updateScheduledTask: async (taskId, updates) => {
        const updatedTask = await api.updateTask(taskId, { ...updates, scheduled: true });
        const scheduledTask: ScheduledTask = {
          id: updatedTask.id,
          title: updatedTask.title,
          time: updatedTask.startTime,
          team: updatedTask.team || [],
          color: updatedTask.color,
          hasCall: updates.hasCall || false,
          categoryId: updatedTask.categoryId || 'default'
        };
        set((state) => ({
          scheduledTasks: state.scheduledTasks.map((task) => 
            task.id === taskId ? scheduledTask : task
          )
        }));
      },
  
      deleteTask: async (taskId) => {
        try {
          set({ isLoading: true, error: null });
        await api.deleteTask(taskId);
        set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
          // Cancel notification when task is deleted
          notificationService.cancelTaskNotification(taskId);
        } catch (error) {
          console.error('Error deleting task:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete task',
            isLoading: false 
          });
        }
      },
  
      deleteScheduledTask: async (taskId) => {
        await api.deleteTask(taskId);
        set((state) => ({
          scheduledTasks: state.scheduledTasks.filter((task) => task.id !== taskId)
        }));
      },
  
      setSelectedDate: (date) => set({ selectedDate: date }),
  
      login: async (email, password) => {
        try {
          const response = await api.login(email, password);
          set({ 
            isAuthenticated: true, 
            user: { 
              email, 
              name: response.name || email.split('@')[0],
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` 
            } 
          });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
  
      register: async (email, password, username) => {
        try {
          const userData = await api.register(email, password, username);
          set({ 
            isAuthenticated: true, 
            user: { 
              email, 
              name: username,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` 
            } 
          });
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        }
      },
  
      logout: async () => {
        await api.logout();
        set({ 
          isAuthenticated: false,
          user: null,
          tasks: [],
          categories: [],
          completedTasks: [],
          scheduledTasks: [],
          quickTasks: [],
          isLoading: false,
          error: null
        });
      },
      
      // Initialize data from backend
      initializeData: async () => {
        set({ isLoading: true });
        try {
          console.log('Initializing data from backend');
          await get().syncTasksWithBackend();
          
          // Initialize categories
          try {
            const categories = await api.getCategories();
            set({ categories });
          } catch (error) {
            console.error('Error loading categories:', error);
          }
          
          // Schedule daily summary notification
          try {
            notificationService.scheduleDailySummaryNotification();
          } catch (error) {
            console.error('Error scheduling daily summary notification:', error);
            // Continue with initialization even if notification fails
          }
          
          console.log('Data initialization complete');
        } catch (error) {
          console.error('Error initializing data:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Sync tasks with backend
      syncTasksWithBackend: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log('Syncing tasks with backend');
          
          const backendTasks = await api.getTasks();
          console.log('Backend tasks received:', backendTasks);
          
          if (backendTasks && Array.isArray(backendTasks)) {
            console.log('API - Retrieved tasks:', backendTasks.length);
            
            // Separate tasks by type
            const activeTasks: Task[] = [];
            const completedTasks: Task[] = [];
            const scheduledTasks: ScheduledTask[] = [];
            
            backendTasks.forEach((task: any) => {
              // Debug log for each task
              console.log('Processing task:', {
                id: task.id,
                title: task.title,
                completedAt: task.completedAt,
                scheduled: task.scheduled,
                endTime: task.endTime
              });
              
              // Handle completed tasks
              if (task.completedAt) {
                // Skip tasks completed more than a month ago
                if (!isTaskOlderThanOneMonth(task)) {
                  completedTasks.push(task);
                }
              } 
              // Handle scheduled tasks
              else if (task.scheduled) {
                // Convert to ScheduledTask format
                const scheduledTask: ScheduledTask = {
                  id: task.id,
                  title: task.title,
                  time: task.startTime,
                  team: task.team || [],
                  color: task.color,
                  hasCall: task.hasCall || false,
                  categoryId: task.categoryId || 'default'
                };
                scheduledTasks.push(scheduledTask);
              } 
              // Handle active tasks
              else {
                // Only include tasks that haven't passed their completion time
                if (!isTaskPastCompletionTime(task)) {
                activeTasks.push(task);
                } else {
                  // Move past-due tasks to completed
                  const completedTask = {
                    ...task,
                    completedAt: new Date().toISOString(),
                    completed: true
                  };
                  completedTasks.push(completedTask);
                  // Update the task in the backend
                  api.updateTask(task.id, completedTask);
                }
              }
            });
            
            console.log(`Synced ${activeTasks.length} active tasks, ${completedTasks.length} completed tasks, ${scheduledTasks.length} scheduled tasks`);
            
            // Update state with backend data
            set({
              tasks: activeTasks,
              completedTasks: completedTasks,
              scheduledTasks: scheduledTasks,
              isLoading: false
            });
          } else {
            console.error('Invalid tasks response:', backendTasks);
            set({ 
              error: 'Invalid tasks response from server',
              isLoading: false 
            });
          }
        } catch (error: any) {
          console.error('Error syncing tasks with backend:', error);
          
          // Handle authentication errors
          if (error.message?.includes('401') || error.message?.includes('Authentication')) {
            console.log('Authentication error detected, logging out user');
            set({ 
              error: 'Authentication required',
              isLoading: false,
              isAuthenticated: false,
              user: null
            });
            // Clear the token
            await api.logout();
            return;
          }
          
          set({ 
            error: error instanceof Error ? error.message : 'Failed to sync tasks',
            isLoading: false 
          });
        }
      },

      sendDailySummary: () => {
        const state = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTasks = state.tasks.filter(task => {
          const taskDate = new Date(task.createdAt);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });

        const completedTasks = todayTasks.filter(task => task.completed).length;
        const totalTasks = todayTasks.length;

        if (state.user?.name) {
          notificationService.sendDailySummaryNotification(
            completedTasks,
            totalTasks,
            state.user.name
          );
        }
      }
}),
{
  name: 'task-store',
  storage: createJSONStorage(() => AsyncStorage),
}
));