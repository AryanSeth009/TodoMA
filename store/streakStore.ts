import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Streak, DailyContribution, AIInsight, StreakState, AppSettings } from '@/types/streak';

export const getStartOfDay = (date: Date) => {
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const MIN_MEANINGFUL_TASK_TIME_MINUTES = 3;
const REQUIRED_TASKS_PER_DAY = 1; // Example: requires at least 1 meaningful task

const INITIAL_STREAK_STATE: StreakState = {
  streak: {
    currentStreak: 0,
    bestStreak: 0,
    lastMaintainedDate: 0,
    freezeTokens: 1, // Start with 1 freeze token for testing
    xp: 0,
    status: 'Maintaining',
  },
  dailyContributions: [],
  aiInsights: [],
  habitStats: { // Placeholder for habitStats
    habits: [
      { id: 'h1', name: 'Morning Run', streak: 7, weeklyProgress: [true, true, false, true, true, false, true], bestHabitOfMonth: true, failingInsight: null },
      { id: 'h2', name: 'Read 30 mins', streak: 3, weeklyProgress: [true, true, true, false, false, false, false], bestHabitOfMonth: false, failingInsight: "You've skipped reading for 3 days. Try setting a reminder for 9 PM." }
    ]
  },
  achievementStats: { // Placeholder for achievementStats
    unlockedBadges: [
      { id: 'b1', name: 'First Streak', description: 'Completed 7-day streak', iconUrl: 'flame', isUnlocked: true, unlockedDate: Date.now() - 86400000 * 10 },
      { id: 'b2', name: 'Early Bird', description: 'Completed 10 tasks before 9 AM', iconUrl: 'sun', isUnlocked: true, unlockedDate: Date.now() - 86400000 * 5 }
    ],
    lockedBadges: [
      { id: 'b3', name: 'Elite Performer', description: 'Reach Elite rank', iconUrl: 'award', isUnlocked: false },
      { id: 'b4', name: 'Month of Focus', description: 'Maintain a 30-day streak', iconUrl: 'calendar-check', isUnlocked: false }
    ],
    rankMilestoneTrophies: [
      { id: 't1', name: 'Beginner Rank', iconUrl: 'trophy', achieved: true },
      { id: 't2', name: 'Performer Rank', iconUrl: 'trophy', achieved: false }
    ]
  },
  rankingStats: { // Placeholder for rankingStats
    currentXP: 1250,
    xpToNextRank: 250,
    rank: { level: 'Performer', badgeUrl: 'performer.png' },
    globalRank: 12345,
    similarBehaviorRank: 567,
    friendsRank: 3,
    pointsToOvertake: 50,
    weeklyLeaderboardPreview: [
      { name: 'You', xp: 1250, rank: 1 },
      { name: 'Alice', xp: 1200, rank: 2 },
      { name: 'Bob', xp: 1180, rank: 3 }
    ]
  },
  appSettings: { // Placeholder for appSettings
    notificationStyle: 'Motivational',
    themePreference: 'Dark',
    soundEnabled: true,
    reminderType: 'Push',
    smartRemindersOn: true,
    dailySummaryTime: '22:00',
    weeklyReviewTime: 'Sunday 20:00',
    privacySettings: {
      hideStats: false,
      hideRank: false,
    },
  },
  journeyTimeline: { // Placeholder for journeyTimeline
    joinedDate: new Date('2024-01-15').getTime(),
    biggestStreakEver: 45,
    totalTasksFinishedOverall: 1200,
    monthlySummarySnapshots: [
      { month: 'Jan', year: 2024, tasksCompleted: 80 },
      { month: 'Feb', year: 2024, tasksCompleted: 110 },
      { month: 'Mar', year: 2024, tasksCompleted: 95 },
    ],
    rankEvolutionTimeline: [
      { date: new Date('2024-01-15').getTime(), rank: 'Beginner' },
      { date: new Date('2024-03-01').getTime(), rank: 'Performer' },
    ],
    timelineEvents: [
      { date: new Date('2024-01-15').getTime(), event: 'Joined TodoMA' },
      { date: new Date('2024-02-10').getTime(), event: 'Achieved First 7-Day Streak' },
      { date: new Date('2024-03-01').getTime(), event: 'Reached Performer Rank' },
    ]
  },
  connectedAccounts: { // Placeholder for connectedAccounts
    accounts: [
      { id: 'g1', name: 'Google', isConnected: true, icon: 'google' },
      { id: 'a1', name: 'Apple', isConnected: false, icon: 'apple' },
      { id: 'c1', name: 'Calendar Sync', isConnected: true, icon: 'calendar' },
    ]
  },
  isLoading: false,
  error: null,
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get): StreakState => ({
      ...INITIAL_STREAK_STATE,

      // Actions
      initializeStreak: async () => {
        set({ isLoading: true });
        try {
          const today = getStartOfDay(new Date());
          const { streak } = get();

          // Check for streak break on initialization if last maintained date is not today
          if (streak.lastMaintainedDate !== today) {
            const yesterdayDate = new Date(today); // Create a Date object from today's timestamp
            yesterdayDate.setDate(yesterdayDate.getDate() - 1); // Subtract one day
            const yesterday = getStartOfDay(yesterdayDate); // Get the start of yesterday

            // If streak was not maintained yesterday and no freeze tokens, break streak
            if (streak.lastMaintainedDate !== yesterday && streak.freezeTokens <= 0) {
              set(state => ({
                streak: { ...state.streak, currentStreak: 0, status: 'Dropping' },
                aiInsights: [...state.aiInsights, { id: Date.now().toString(), message: "Your streak was broken! Don't worry, start fresh today!", icon: 'broken-heart' }]
              }));
            } else if (streak.lastMaintainedDate !== yesterday && streak.freezeTokens > 0) {
              // Auto-activate streak freeze
              set(state => ({
                streak: { ...state.streak, freezeTokens: state.streak.freezeTokens - 1, status: 'Maintaining' },
                aiInsights: [...state.aiInsights, { id: Date.now().toString(), message: "Your streak was saved using a freeze token!", icon: 'snowflake' }]
              }));
            }
          }
          console.log('Initializing streak data', get().streak);

        } catch (error) {
          set({ error: 'Failed to load streak data', isLoading: false });
        } finally {
          set({ isLoading: false });
        }
      },

      updateStreak: (newStreak: Partial<Streak>) => {
        set((state) => ({
          streak: { ...state.streak, ...newStreak },
        }));
      },

      // This function will be called by taskStore when a meaningful task is completed
      maintainStreak: (tasksCompletedToday: number) => {
        set(state => {
          const today = getStartOfDay(new Date());
          let { streak, dailyContributions } = state;

          // Update daily contribution
          const productivityScore = Math.min(tasksCompletedToday * 20, 100); // Max 100 score
          const existingContributionIndex = dailyContributions.findIndex(dc => dc.date === today);
          if (existingContributionIndex !== -1) {
            dailyContributions[existingContributionIndex] = { date: today, productivityScore };
          } else {
            dailyContributions = [...dailyContributions, { date: today, productivityScore }].slice(-30);
          }

          // Check if streak is maintained today
          if (tasksCompletedToday >= REQUIRED_TASKS_PER_DAY) {
            if (streak.lastMaintainedDate === today) {
              // Already maintained today, no change to streak count
              console.log('Streak already maintained today.');
            } else {
              const yesterdayDate = new Date(); // Create a new Date object
              yesterdayDate.setDate(yesterdayDate.getDate() - 1); // Subtract one day
              const yesterday = getStartOfDay(yesterdayDate); // Get the start of yesterday

              if (streak.lastMaintainedDate === yesterday) {
                // Maintained yesterday, increment streak
                streak.currentStreak++;
                console.log('Streak incremented to:', streak.currentStreak);
              } else {
                // New streak or continued after a break
                streak.currentStreak = 1;
                console.log('New streak started:', streak.currentStreak);
              }
              streak.lastMaintainedDate = today; // Update last maintained date to today
            }

            if (streak.currentStreak > streak.bestStreak) {
              streak.bestStreak = streak.currentStreak;
            }
            streak.status = 'Maintaining';

            // Calculate XP
            const consistencyBonus = tasksCompletedToday > REQUIRED_TASKS_PER_DAY ? 1 : 0;
            streak.xp += (tasksCompletedToday * 2) + (consistencyBonus * 3);

          } else {
            console.log('Not enough tasks completed today to maintain streak.');
            // Not enough tasks completed today to maintain streak, but don't break yet
            // The break logic will happen at the end of the day or on initialization
          }

          console.log('maintainStreak - New streak state:', streak);
          return { streak: { ...streak }, dailyContributions: [...dailyContributions] };
        });
      },

      // This will be called at the end of the day or when the app initializes on a new day
      checkStreakForBreak: () => {
        set(state => {
          const today = getStartOfDay(new Date());
          const yesterdayDate = new Date(); // Create a new Date object
          yesterdayDate.setDate(yesterdayDate.getDate() - 1); // Set to yesterday
          const yesterday = getStartOfDay(yesterdayDate); // Get the start of yesterday

          let { streak } = state;

          if (streak.lastMaintainedDate !== today && streak.lastMaintainedDate !== yesterday) {
            // Streak was not maintained yesterday and not today, check for freeze token
            console.log('Streak not maintained yesterday or today. Checking freeze tokens.');
            if (streak.freezeTokens > 0) {
              streak.freezeTokens--;
              streak.status = 'Maintaining';
              state.aiInsights.push({ id: Date.now().toString(), message: "Your streak was saved using a freeze token!", icon: 'snowflake' });
              console.log('Streak saved with freeze token.');
            } else {
              streak.currentStreak = 0;
              streak.status = 'Dropping';
              state.aiInsights.push({ id: Date.now().toString(), message: "Your streak was broken! Don't worry, start fresh today!", icon: 'broken-heart' });
              console.log('Streak broken.');
            }
          }
          console.log('checkStreakForBreak - New streak state:', streak);
          return { streak: { ...streak }, aiInsights: [...state.aiInsights] };
        });
      },

      addDailyContribution: (date: number, productivityScore: number) => {
        set((state) => {
          const existingIndex = state.dailyContributions.findIndex(dc => dc.date === date);
          let newContributions = [...state.dailyContributions];

          if (existingIndex !== -1) {
            // Update existing contribution
            newContributions[existingIndex] = { date, productivityScore };
          } else {
            // Add new contribution and keep only last 30 days
            newContributions.push({ date, productivityScore });
            newContributions = newContributions.slice(-30); // Keep only the last 30 days
          }
          return { dailyContributions: newContributions };
        });
      },

      addAIInsight: (insight: AIInsight) => {
        set((state) => ({
          aiInsights: [...state.aiInsights, insight].slice(-5), // Keep a limited number of insights
        }));
      },

      useFreezeToken: () => {
        set(state => {
          if (state.streak.freezeTokens > 0) {
            state.streak.freezeTokens--;
            // Logic to restore streak or prevent break for today
            // This would typically involve setting lastMaintainedDate to yesterday or today if it was missed
            state.aiInsights.push({ id: Date.now().toString(), message: "You used a streak freeze token! Your streak is safe for today.", icon: 'snowflake' });
            return { streak: { ...state.streak }, aiInsights: [...state.aiInsights] };
          }
          return state; // No token to use
        });
      },

      updateAppSettings: (newSettings: Partial<AppSettings>) => {
        set((state) => ({
          appSettings: { ...state.appSettings, ...newSettings },
        }));
      },
    }),
    {
      name: 'streak-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
