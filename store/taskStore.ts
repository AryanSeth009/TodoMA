import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, ScheduledTask, TeamMember, Comment } from '@/types/task';
import { Category } from '@/types/category';
import { api, getApiService } from '@/services/api'; // Import getApiService
import { useStreakStore, getStartOfDay } from '@/store/streakStore'; // Import getStartOfDay

export const TASK_COLORS = [
  '#FFD1DC', // Pink
  '#ADD8E6', // Light Blue
  '#90EE90', // Light Green
  '#FFECB3', // Light Yellow
  '#E0BBE4', // Light Purple
];

interface TaskState {
  // State
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  scheduledTasks: ScheduledTask[];
  quickTasks: Task[];
  historyTasks: Task[]; // New: for tasks moved from completed after 24 hours
  categories: Category[];
  teams: Team[]; // New: Add teams array
  pendingInvitations: TeamInvitation[]; // New: Add pendingInvitations array
  selectedDate: number;
  isAuthenticated: boolean;
  user: { email: string; name: string; avatar?: string } | null;
  isLoading: boolean;
  error: string | null;

  // Task management
  addTask: (task: Omit<Task, 'id' | 'color'> & { teamId?: string }, taskColors: string[]) => Promise<void>;
  addScheduledTask: (task: Omit<ScheduledTask, 'id' | 'color' | 'team'> & { time: string, hasCall: boolean; teamId?: string }, taskColors: string[]) => Promise<void>;
  addQuickTask: (task: Omit<Task, 'color'>, taskColors: string[]) => Promise<void>;
  addSharedTask: (task: Omit<Task, 'id' | 'color'> & { owner: TeamMember | undefined; deadline: Date | undefined; priority: 'LOW' | 'MEDIUM' | 'HIGH'; teamId: string }, taskColors: string[]) => Promise<void>;
  addCommentToTask: (taskId: string, comment: Comment) => Promise<void>; // New action to add a comment to a task
  addAttachmentToTask: (taskId: string, attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => Promise<void>; // New action to add an attachment
  removeAttachmentFromTask: (taskId: string, attachmentId: string) => Promise<void>; // New action to remove an attachment
  completeTask: (taskId: string) => Promise<Task | undefined>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  updateScheduledTask: (taskId: string, updates: Partial<ScheduledTask> & { teamId?: string }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteScheduledTask: (taskId: string) => Promise<void>;
  cleanupOldTasks: () => Promise<void>;

  // Category management
  addCategory: (category: Category) => Promise<void>;

  // Team management
  createTeam: (teamName: string) => Promise<void>; // New: Add createTeam action
  updateTeam: (team: Team) => Promise<void>; // New: Add updateTeam action
  removeTeamMember: (teamId: string, memberId: string) => Promise<void>; // New: Remove team member
  deleteTeam: (teamId: string) => Promise<void>; // New: Delete team
  inviteTeamMember: (teamId: string, email: string) => Promise<void>; // New: Add inviteTeamMember action
  acceptTeamInvitation: (invitationId: string, teamId: string) => Promise<void>; // New: Accept team invitation
  rejectTeamInvitation: (invitationId: string, teamId: string) => Promise<void>; // New: Reject team invitation

  // UI state
  setSelectedDate: (date: number) => void;

  // Auth
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;

  // Data initialization
  initializeData: (taskColors: string[]) => Promise<void>;
  syncTasksWithBackend: (taskColors: string[]) => Promise<void>;
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
  if (!task.endTime || task.quick) return false; // Exclude quick tasks

  const now = new Date();
  const [hours, minutes] = task.endTime.split(':').map(Number);
  const taskEndTime = new Date();
  taskEndTime.setHours(hours, minutes, 0, 0);

  return now > taskEndTime;
};

// Helper function to check if a task is older than 24 hours
const isTaskOlderThan24Hours = (task: Task): boolean => {
  if (!task.completedAt) return false;

  const completedDate = new Date(task.completedAt);
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  return completedDate < twentyFourHoursAgo;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get): TaskState => {
      let colorIndex = 0; // Internal state for cycling colors

      const getNextTaskColor = (taskColors: string[]) => {
        const color = taskColors[colorIndex];
        colorIndex = (colorIndex + 1) % taskColors.length;
        return color;
      };

      return {
        // Initial state
        tasks: [],
        activeTasks: [],
        completedTasks: [],
        scheduledTasks: [],
        quickTasks: [],
        historyTasks: [], // Initialize historyTasks
        categories: [],
        teams: [], // Initialize teams array
        pendingInvitations: [], // Initialize pendingInvitations
        selectedDate: new Date().setHours(0, 0, 0, 0), // Initialize to start of today
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,

        addTask: async (task: Omit<Task, 'id' | 'color'> & { teamId?: string }, taskColors: string[]) => {
          try {
            set({ isLoading: true, error: null });
            console.log('TaskStore - Starting to add task:', task);

            // Validate required fields
            if (!task.title) {
              console.error('TaskStore - Missing required fields:', task);
              throw new Error('Missing required task fields');
            }

            // Create temporary task with ID and assign a color
            const tempTask: Task = {
              ...task,
              id: `temp_${Date.now()}`,
              completed: false,
              completedAt: undefined,
              scheduled: false,
              status: 'To-do', // Set default status for new tasks
              color: getNextTaskColor(taskColors), // Assign a color here
              teamId: task.teamId, // Assign teamId if provided
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
              const createdTask = await api.createTask(tempTask); // Pass tempTask with color
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

        addScheduledTask: async (task: Omit<ScheduledTask, 'id' | 'color' | 'team'> & { time: string, hasCall: boolean; teamId?: string }, taskColors: string[]) => {
          try {
            // Create a proper task object with all required fields
            const taskToCreate = {
              title: task.title,
              description: '',
              startTime: task.time,
              endTime: task.time, // For scheduled tasks, end time is same as start time
              teamId: task.teamId, // Use teamId here
              progress: 0,
              color: getNextTaskColor(taskColors), // Assign a color here
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
              teamId: newTask.teamId, // Use teamId here
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
              color: getNextTaskColor(taskColors), // Assign color here
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

        addQuickTask: async (task: Omit<Task, 'color'>, taskColors: string[]) => {
          const taskToCreate: Partial<Task> = { ...task, quick: true, completed: false, color: getNextTaskColor(taskColors) };
          // if (task.startTime) taskToCreate.startTime = task.startTime;
          // if (task.endTime) taskToCreate.endTime = task.endTime;
          const newTask = await api.createTask(taskToCreate as Omit<Task, 'id'>);
          set((state) => ({
            quickTasks: [...state.quickTasks, newTask],
            tasks: [...state.tasks, newTask] // Also add to the main tasks array
          }));
        },

        addSharedTask: async (task: Omit<Task, 'id' | 'color'> & { owner: TeamMember | undefined; deadline: Date | undefined; priority: 'LOW' | 'MEDIUM' | 'HIGH'; teamId: string }, taskColors: string[]) => {
          try {
            set({ isLoading: true, error: null });
            console.log('TaskStore - Starting to add shared task:', task);

            if (!task.title) {
              console.error('TaskStore - Missing required fields for shared task:', task);
              throw new Error('Missing required shared task fields');
            }

            const tempTask: Task = {
              ...task,
              id: `temp_${Date.now()}`,
              completed: false,
              completedAt: undefined,
              scheduled: false,
              status: 'To-do', // Set default status for new shared tasks
              color: getNextTaskColor(taskColors),
              owner: task.owner,
              deadline: task.deadline?.toISOString(), // Convert Date to ISO string
              priority: task.priority,
              teamId: task.teamId, // Assign the teamId
            };

            set((state) => ({
              tasks: [...state.tasks, tempTask],
              activeTasks: [...state.activeTasks, tempTask],
            }));

            try {
              const createdTask = await api.createTask(tempTask);

              set((state) => ({
                tasks: state.tasks.map((t: Task) =>
                  t.id === tempTask.id ? createdTask : t
                ),
                activeTasks: state.activeTasks.map((t: Task) =>
                  t.id === tempTask.id ? createdTask : t
                ),
              }));
            } catch (error) {
              console.error('TaskStore - Error creating shared task in backend:', error);
              set((state) => ({
                tasks: state.tasks.filter((t: Task) => t.id !== tempTask.id),
                activeTasks: state.activeTasks.filter((t: Task) => t.id !== tempTask.id),
              }));
              throw error;
            }
          } catch (error) {
            console.error('TaskStore - Error in addSharedTask:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to add shared task',
              isLoading: false
            });
            throw error;
          }
        },

        addCommentToTask: async (taskId: string, comment: Comment) => {
          try {
            set({ isLoading: true, error: null });
            // Optimistically update the UI
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, comments: [...(task.comments || []), comment] }
                  : task
              ),
            }));

            // Call the API to add the comment to the backend
            await api.addCommentToTask(taskId, comment);
          } catch (error) {
            console.error('Error adding comment to task:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to add comment to task',
              isLoading: false,
            });
            // Revert optimistic update on error (optional, but good for consistency)
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, comments: (task.comments || []).filter(c => c.id !== comment.id) }
                  : task
              ),
            }));
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        addAttachmentToTask: async (taskId: string, attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => {
          try {
            set({ isLoading: true, error: null });

            const newAttachment: Attachment = {
              ...attachment,
              id: `attach_${Date.now()}`,
              uploadedAt: new Date().toISOString(),
            };

            // Optimistically update the UI
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, attachments: [...(task.attachments || []), newAttachment] }
                  : task
              ),
            }));

            // Call the API to add the attachment to the backend
            await api.addAttachmentToTask(taskId, newAttachment);
          } catch (error) {
            console.error('Error adding attachment to task:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to add attachment to task',
              isLoading: false,
            });
            // Revert optimistic update on error
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, attachments: (task.attachments || []).filter(a => a.id !== `attach_${Date.now()}`) }
                  : task
              ),
            }));
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        removeAttachmentFromTask: async (taskId: string, attachmentId: string) => {
          try {
            set({ isLoading: true, error: null });
            // Optimistically update the UI
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, attachments: (task.attachments || []).filter(a => a.id !== attachmentId) }
                  : task
              ),
            }));

            // Call the API to remove the attachment from the backend
            await api.removeAttachmentFromTask(taskId, attachmentId);
          } catch (error) {
            console.error('Error removing attachment from task:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to remove attachment from task',
              isLoading: false,
            });
            // Revert optimistic update on error
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, attachments: [...(task.attachments || []), get().tasks.find(t => t.id === taskId)?.attachments?.find(a => a.id === attachmentId)].filter(Boolean) as Attachment[] }
                  : task
              ),
            }));
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        completeTask: async (taskId: string) => {
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

            // Update streak logic: Check if task is meaningful
            const { maintainStreak } = useStreakStore.getState();
            // For now, assume all completed tasks are meaningful for streak purposes
            // In a more complex scenario, you'd check task.estimatedTime >= MIN_MEANINGFUL_TASK_TIME_MINUTES
            // and limit daily counts to avoid spam. Here, we'll just count every completed task.
            const allCompletedTasksToday = get().completedTasks.filter(task => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const taskCompletionDate = task.completedAt ? new Date(task.completedAt) : null;
              return taskCompletionDate && taskCompletionDate.setHours(0,0,0,0) === today.getTime();
            }).length + 1; // +1 for the current task being completed
            maintainStreak(allCompletedTasksToday);

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

          // Filter out tasks completed more than 24 hours ago
          const tasksToKeepInCompleted = state.completedTasks.filter(task => !isTaskOlderThan24Hours(task));
          const tasksToMoveToHistory = state.completedTasks.filter(task => isTaskOlderThan24Hours(task));

          // Add tasks to historyTasks that are not already there (to prevent duplicates)
          const newHistoryTasks = [...state.historyTasks];
          tasksToMoveToHistory.forEach(taskToMove => {
            if (!newHistoryTasks.some(historyTask => historyTask.id === taskToMove.id)) {
              newHistoryTasks.push(taskToMove);
            }
          });

          // Update the state
          set({
            completedTasks: tasksToKeepInCompleted,
            historyTasks: newHistoryTasks,
          });
        },

        addCategory: async (category: Category) => {
          const newCategory = await api.createCategory(category);
          set((state) => ({ categories: [...state.categories, newCategory] }));
        },

        createTeam: async (teamName: string) => {
          try {
            set({ isLoading: true, error: null });
            const user = get().user; // Get current user from store
            if (!user) {
              throw new Error('User not authenticated');
            }

            // Create a temporary team object
            const tempTeam: Team = {
              id: `temp_team_${Date.now()}`,
              name: teamName,
              members: [{ ...user, role: 'Admin' }], // Creator is the Admin
              owner: { ...user, role: 'Admin' },
            };

            set((state) => ({ teams: [...state.teams, tempTeam] }));

            // Call API to create the team
            const createdTeam = await api.createTeam(tempTeam);

            set((state) => ({
              teams: state.teams.map((t) =>
                t.id === tempTeam.id ? createdTeam : t
              ),
            }));
          } catch (error) {
            console.error('Error creating team:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to create team',
              isLoading: false,
            });
            // Revert optimistic update
            set((state) => ({ teams: state.teams.filter(t => t.id !== `temp_team_${Date.now()}`) }));
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        updateTeam: async (updatedTeam: Team) => {
          try {
            set({ isLoading: true, error: null });
            // Optimistically update the UI
            set((state) => ({
              teams: state.teams.map((team) =>
                team.id === updatedTeam.id ? updatedTeam : team
              ),
            }));

            // Call API to update the team
            await api.updateTeam(updatedTeam.id, updatedTeam);
          } catch (error) {
            console.error('Error updating team:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to update team',
              isLoading: false,
            });
            // Revert optimistic update on error (optional)
            set((state) => ({
              teams: state.teams.map((team) =>
                team.id === updatedTeam.id ? get().teams.find(t => t.id === updatedTeam.id) || team : team // Revert to previous state if possible
              ),
            }));
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        removeTeamMember: async (teamId: string, memberId: string) => {
          try {
            set({ isLoading: true, error: null });
            // Optimistically update the UI
            set((state) => ({
              teams: state.teams.map((team) =>
                team.id === teamId
                  ? { ...team, members: team.members.filter(member => member.id !== memberId) }
                  : team
              ),
            }));

            // Call API to remove member
            await api.removeTeamMember(teamId, memberId);
          } catch (error) {
            console.error('Error removing team member:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to remove member',
              isLoading: false,
            });
            // Revert optimistic update on error (optional)
            set((state) => ({
              teams: state.teams.map((team) => {
                if (team.id === teamId) {
                  const originalTeam = get().teams.find(t => t.id === teamId);
                  return originalTeam || team;
                }
                return team;
              }),
            }));
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        deleteTeam: async (teamId: string) => {
          try {
            set({ isLoading: true, error: null });
            // Optimistically update the UI
            set((state) => ({
              teams: state.teams.filter((team) => team.id !== teamId),
            }));

            // Call API to delete the team
            await api.deleteTeam(teamId);
          } catch (error) {
            console.error('Error deleting team:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to delete team',
              isLoading: false,
            });
            // Revert optimistic update on error (optional)
            // This would involve re-adding the deleted team if the API call fails, which is complex
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        inviteTeamMember: async (teamId: string, email: string) => {
          try {
            set({ isLoading: true, error: null });
            console.log(`Inviting ${email} to team ${teamId}...`);

            // Call API to send invitation
            await api.inviteTeamMember(teamId, email);

            console.log(`Invitation sent to ${email} for team ${teamId} successfully.`);
            
            const team = get().teams.find(t => t.id === teamId);
            if (team && get().user) {
              const newInvitation: TeamInvitation = {
                id: `inv_${Date.now()}`,
                teamId: team.id,
                teamName: team.name,
                inviterName: get().user?.name || get().user?.email || 'Unknown',
                recipientEmail: email,
              };
              set((state) => ({ pendingInvitations: [...state.pendingInvitations, newInvitation] }));
            }
          } catch (error) {
            console.error('Error inviting team member:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to send invitation',
              isLoading: false,
            });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        acceptTeamInvitation: async (invitationId: string, teamId: string) => {
          try {
            set({ isLoading: true, error: null });
            console.log(`Accepting invitation ${invitationId} for team ${teamId}...`);

            await api.acceptTeamInvitation(invitationId, teamId); // Call API to accept invitation

            // Remove the accepted invitation from pendingInvitations
            set((state) => ({
              pendingInvitations: state.pendingInvitations.filter(
                (inv) => inv.id !== invitationId
              ),
            }));

            // After successful acceptance, fetch updated team data or update local state directly
            // For now, we'll just log and assume backend handles membership addition
            console.log(`Invitation ${invitationId} for team ${teamId} accepted successfully.`);
            // Optionally, refresh teams or add the user to the team locally if the backend response includes team data
            // const updatedTeam = await api.getTeam(teamId); // Example to refetch a single team
            // set((state) => ({
            //   teams: state.teams.map((t) => (t.id === teamId ? updatedTeam : t)),
            // }));

          } catch (error) {
            console.error('Error accepting team invitation:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to accept invitation',
              isLoading: false,
            });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        rejectTeamInvitation: async (invitationId: string, teamId: string) => {
          try {
            set({ isLoading: true, error: null });
            console.log(`Rejecting invitation ${invitationId} for team ${teamId}...`);

            await api.rejectTeamInvitation(invitationId, teamId); // Call API to reject invitation

            // Remove the rejected invitation from pendingInvitations
            set((state) => ({
              pendingInvitations: state.pendingInvitations.filter(
                (inv) => inv.id !== invitationId
              ),
            }));

            console.log(`Invitation ${invitationId} for team ${teamId} rejected successfully.`);
            // No local state update needed here as the invitation is simply removed
          } catch (error) {
            console.error('Error rejecting team invitation:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to reject invitation',
              isLoading: false,
            });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        updateTask: async (taskId: string, updates: Partial<Task>) => {
          try {
            set({ isLoading: true, error: null });
            const updatedTask = await api.updateTask(taskId, updates);
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === taskId ? updatedTask : task
              ),
            }));
            // Cancel existing notification and schedule new one if endTime changed
            // notificationService.cancelTaskNotification(taskId); // This line was removed
            if (updates.endTime) {
              // notificationService.scheduleTaskNotification(updatedTask); // This line was removed
            }
          } catch (error) {
            console.error('Error updating task:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to update task',
              isLoading: false
            });
          }
        },

        updateScheduledTask: async (taskId: string, updates: Partial<ScheduledTask> & { teamId?: string }) => {
          const updatedTask = await api.updateTask(taskId, { ...updates, scheduled: true });
          const scheduledTask: ScheduledTask = {
            id: updatedTask.id,
            title: updatedTask.title,
            time: updatedTask.startTime || 'false',
            teamId: updatedTask.teamId, // Use teamId here
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

        deleteTask: async (taskId: string) => {
          try {
            set({ isLoading: true, error: null });
            await api.deleteTask(taskId);
            set((state) => ({
              tasks: state.tasks.filter((task) => task.id !== taskId),
            }));
            // Cancel notification when task is deleted
            // notificationService.cancelTaskNotification(taskId); // This line was removed
          } catch (error) {
            console.error('Error deleting task:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to delete task',
              isLoading: false
            });
          }
        },

        deleteScheduledTask: async (taskId: string) => {
          await api.deleteTask(taskId);
          set((state) => ({
            scheduledTasks: state.scheduledTasks.filter((task) => task.id !== taskId)
          }));
        },

        setSelectedDate: (date: number) => {
          const newDate = new Date(date);
          newDate.setHours(0, 0, 0, 0); // Ensure consistency: store start of day
          set({ selectedDate: newDate.getTime() });
        },

        login: async (email: string, password: string) => {
          try {
            const response = await api.login(email, password);
            await AsyncStorage.setItem('token', response.token);
            console.log('TaskStore - Token saved after login:', response.token ? 'Present' : 'Not present');
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

        register: async (email: string, password: string, username: string) => {
          try {
            const userData = await api.register(email, password, username);
            await AsyncStorage.setItem('token', userData.token);
            console.log('TaskStore - Token saved after registration:', userData.token ? 'Present' : 'Not present');
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
          await AsyncStorage.removeItem('token');
          console.log('TaskStore - Token removed after logout');
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
        initializeData: async (taskColors: string[]) => {
          set({ isLoading: true });
          try {
            console.log('Initializing data from backend');
            // Initialize the api service only when data is being initialized client-side
            const apiService = getApiService();
            await apiService.init();

            const token = await AsyncStorage.getItem('token');
            console.log('TaskStore - Token retrieved during initialization:', token ? 'Present' : 'Not present');
            await get().syncTasksWithBackend(taskColors);

            // Initialize categories
            try {
              const categories = await api.getCategories();
              set({ categories });
            } catch (error) {
              console.error('Error loading categories:', error);
            }

            // Initialize teams
            try {
              const teams = await api.getTeams();
              set({ teams: teams });
            } catch (error) {
              console.error('Error loading teams:', error);
            }

            console.log('Data initialization complete');
          } catch (error) {
            console.error('Error initializing data:', error);
          } finally {
            set({ isLoading: false });
          }
        },

        // Sync tasks with backend
        syncTasksWithBackend: async (taskColors: string[]) => {
          try {
            set({ isLoading: true, error: null });
            console.log('Syncing tasks with backend');

            const backendTasks = await api.getTasks();
            console.log('Backend tasks received:', backendTasks);

            if (backendTasks && Array.isArray(backendTasks)) {
              console.log('API - Retrieved tasks:', backendTasks.length);

              // Separate tasks by type
              const activeTasks: Task[] = [];
              let completedTasksBuffer: Task[] = []; // Use a buffer for all completed tasks
              const scheduledTasks: ScheduledTask[] = [];
              const quickTasks: Task[] = []; // New array for quick tasks

              backendTasks.forEach((task: any) => {
                // Ensure task has a color, assign one if missing
                const taskWithColor = {
                  ...task,
                  color: task.color || getNextTaskColor(taskColors), // Assign color if not present
                };

                // Debug log for each task
                console.log('Processing task:', {
                  id: taskWithColor.id,
                  title: taskWithColor.title,
                  completedAt: taskWithColor.completedAt,
                  scheduled: taskWithColor.scheduled,
                  endTime: taskWithColor.endTime,
                  color: taskWithColor.color, // Log the assigned color
                });

                // Handle completed tasks
                if (taskWithColor.completedAt) {
                  // All completed tasks go into the buffer initially
                  completedTasksBuffer.push({
                    ...taskWithColor,
                    completed: true // Ensure completed status is true
                  });
                }
                // Handle scheduled tasks
                else if (taskWithColor.scheduled) {
                  // Convert to ScheduledTask format
                  const scheduledTask: ScheduledTask = {
                    id: taskWithColor.id,
                    title: taskWithColor.title,
                    time: taskWithColor.startTime, // Use startTime for scheduled task time
                    teamId: taskWithColor.teamId, // Use teamId here
                    color: taskWithColor.color,
                    hasCall: taskWithColor.hasCall || false,
                    categoryId: taskWithColor.categoryId || 'default'
                  };
                  scheduledTasks.push(scheduledTask);
                }
                // Handle quick tasks
                else if (taskWithColor.quick) {
                  quickTasks.push(taskWithColor);
                }
                // Handle active tasks
                else {
                  // Only include tasks that haven't passed their completion time
                  if (!isTaskPastCompletionTime(taskWithColor)) {
                    activeTasks.push(taskWithColor);
                  } else {
                    // Move past-due tasks to completed
                    const completedTask = {
                      ...taskWithColor,
                      completedAt: new Date().toISOString(),
                      completed: true // Ensure this is true
                    };
                    completedTasksBuffer.push(completedTask); // Add to buffer
                    // Update the task in the backend
                    console.log('TaskStore - Marking task as completed and updating backend:', completedTask);
                    api.updateTask(taskWithColor.id, completedTask);
                  }
                }
              });

              console.log(`Synced ${activeTasks.length} active tasks, ${completedTasksBuffer.length} completed tasks (buffer), ${scheduledTasks.length} scheduled tasks, ${quickTasks.length} quick tasks`);

              // Update state with backend data
              set({
                // The 'tasks' array should represent all non-completed tasks
                tasks: [
                  ...activeTasks,
                  ...quickTasks,
                  // Scheduled tasks are handled separately for display in TimelineTasks
                ],
                activeTasks: activeTasks,
                completedTasks: completedTasksBuffer, // Assign buffer to completedTasks
                scheduledTasks: scheduledTasks,
                quickTasks: quickTasks,
                isLoading: false
              });
              
              // Now run cleanup to distribute tasks to historyTasks
              get().cleanupOldTasks();

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
            if (!task.createdAt) return false; // Add null check for createdAt
            const taskDate = new Date(task.createdAt);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
          });

          const completedTasks = todayTasks.filter(task => task.completed).length;
          const totalTasks = todayTasks.length;

          if (state.user?.name) {
            // notificationService.sendDailySummaryNotification( // This line was removed
            //   completedTasks,
            //   totalTasks,
            //   state.user.name
            // );
          }
        },
      };
    },
    {
      name: 'task-store',
      storage: createJSONStorage(() => AsyncStorage), // Changed from getStorage to storage
    }
  )
);
