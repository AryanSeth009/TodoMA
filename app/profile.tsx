import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import StreakSummaryCard from '@/components/Profile/StreakSummaryCard';
import DailyConsistencyCard from '@/components/Profile/DailyConsistencyCard';
import ProductivityStatsDashboard from '@/components/Profile/ProductivityStatsDashboard';
import HabitsRoutineSection from '@/components/Profile/HabitsRoutineSection';
import AchievementsBadgesGrid from '@/components/Profile/AchievementsBadgesGrid';
import RankingLeaderboardInsight from '@/components/Profile/RankingLeaderboardInsight';
import JourneyTimeline from '@/components/Profile/JourneyTimeline';
import StreakProtectionCard from '@/components/Profile/StreakProtectionCard';
import ConnectedAccountsSection from '@/components/Profile/ConnectedAccountsSection';
import AIInsightCard from '@/components/Profile/AIInsightCard';
import PremiumUpsellBanner from '@/components/Profile/PremiumUpsellBanner';
import { useTaskStore } from '@/store/taskStore';
import { useStreakStore } from '@/store/streakStore';
import { TASK_COLORS } from '@/store/taskStore';
// import Footer from './components/Footer';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  const user = useTaskStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const completedTasks = useTaskStore((state) => state.completedTasks);
  const categories = useTaskStore((state) => state.categories);
  const aiInsights = useStreakStore((state) => state.aiInsights);
  const { streak, dailyContributions, habitStats, achievementStats, rankingStats, journeyTimeline, connectedAccounts, appSettings } = useStreakStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
    

      <ProfileHeader user={user} streak={streak} />
      <DailyConsistencyCard />
      <StreakSummaryCard streak={streak} />
      {/* <ProductivityStatsDashboard tasks={tasks} completedTasks={completedTasks} categories={categories} /> */}
      <HabitsRoutineSection habitStats={habitStats} />
      <AchievementsBadgesGrid achievementStats={achievementStats} />
      <RankingLeaderboardInsight rankingStats={rankingStats} />
      {/* <JourneyTimeline journeyTimeline={journeyTimeline} />
      <StreakProtectionCard streak={streak} />
      <ConnectedAccountsSection connectedAccounts={connectedAccounts} />
      {aiInsights.map((insight) => (
        <AIInsightCard key={insight.id} insight={insight} />
      ))}
      <PremiumUpsellBanner /> */}
      {/* <Footer/> */}
    </ScrollView>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
