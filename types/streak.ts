export interface Streak {
  currentStreak: number;
  bestStreak: number;
  lastMaintainedDate: number; // Timestamp of the last day the streak was maintained
  freezeTokens: number;
  xp: number;
  status: 'Maintaining' | 'Improving' | 'Dropping';
}

export interface DailyContribution {
  date: number; // Timestamp of the day
  productivityScore: number; // 0-100, based on tasks completed
}

export interface FreezeToken {
  id: string;
  count: number;
  lastUsed: number | null;
}

export interface AIInsight {
  id: string;
  message: string;
  icon: string; // e.g., 'calendar', 'moon', 'bar-chart'
  action?: {
    type: 'reminder' | 'link';
    payload: string;
  };
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  weeklyProgress: boolean[]; // 7 booleans for 7 days
  bestHabitOfMonth: boolean;
  failingInsight: string | null;
}

export interface HabitStats {
  habits: Habit[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedDate?: number; // Timestamp when unlocked (if unlocked)
  isUnlocked: boolean;
}

export interface AchievementStats {
  unlockedBadges: Badge[];
  lockedBadges: Badge[];
  rankMilestoneTrophies: { id: string; name: string; iconUrl: string; achieved: boolean; }[];
}

export interface Rank {
  level: 'Beginner' | 'Performer' | 'Elite';
  badgeUrl: string;
}

export interface LeaderboardEntry {
  name: string;
  xp: number;
  rank: number;
}

export interface RankingStats {
  currentXP: number;
  xpToNextRank: number;
  rank: Rank;
  globalRank: number;
  similarBehaviorRank: number;
  friendsRank: number;
  pointsToOvertake: number;
  weeklyLeaderboardPreview: LeaderboardEntry[];
}

export interface AppSettings {
  notificationStyle: 'Motivational' | 'Minimal' | 'Strict';
  themePreference: 'Dark' | 'Neon' | 'Calm' | 'Focused';
  soundEnabled: boolean;
  reminderType: 'Push' | 'Email' | 'SMS';
  smartRemindersOn: boolean;
  dailySummaryTime: string;
  weeklyReviewTime: string;
  privacySettings: {
    hideStats: boolean;
    hideRank: boolean;
  };
}

export interface JourneyEvent {
  date: number; // Timestamp of the event
  event: string; // Description of the event
}

export interface JourneyTimelineData {
  joinedDate: number;
  biggestStreakEver: number;
  totalTasksFinishedOverall: number;
  monthlySummarySnapshots: { month: string; year: number; tasksCompleted: number; }[];
  rankEvolutionTimeline: { date: number; rank: string; }[];
  timelineEvents: JourneyEvent[];
}

export interface ConnectedAccount {
  id: string;
  name: string; // e.g., 'Google', 'Apple', 'Calendar'
  isConnected: boolean;
  icon: string; // e.g., 'google', 'apple', 'calendar'
}

export interface ConnectedAccountsData {
  accounts: ConnectedAccount[];
}

export interface StreakState {
  streak: Streak;
  dailyContributions: DailyContribution[]; // Last 30 days
  aiInsights: AIInsight[];
  habitStats: HabitStats;
  achievementStats: AchievementStats;
  rankingStats: RankingStats;
  appSettings: AppSettings;
  journeyTimeline: JourneyTimelineData; // Add journeyTimeline to StreakState
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeStreak: () => Promise<void>;
  updateStreak: (newStreak: Partial<Streak>) => void;
  maintainStreak: (tasksCompletedToday: number) => void;
  checkStreakForBreak: () => void;
  addDailyContribution: (date: number, productivityScore: number) => void;
  addAIInsight: (insight: AIInsight) => void;
  useFreezeToken: () => void;
  updateAppSettings: (newSettings: Partial<AppSettings>) => void;
}
