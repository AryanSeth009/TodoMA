import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { RankingStats } from '@/types/streak';
import { TrendingUp, Users, User, Crown } from 'lucide-react-native'; // Icons

type RankingLeaderboardInsightProps = {
  rankingStats: RankingStats;
};

const RankingLeaderboardInsight = ({ rankingStats }: RankingLeaderboardInsightProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        Ranking & Leaderboard Insight
      </Text>

      <View style={styles.rankInfoContainer}>
        <View style={styles.rankItem}>
          <Crown size={24} color={colors.highlight} />
          <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 8 }]}>Your Rank:</Text>
          <Text style={[typography.heading, { color: colors.textPrimary, marginLeft: 4 }]}>{rankingStats.globalRank}</Text>
        </View>
        <View style={styles.rankItem}>
          <TrendingUp size={24} color={colors.accent} />
          <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 8 }]}>Next Rank:</Text>
          <Text style={[typography.heading, { color: colors.textPrimary, marginLeft: 4 }]}>{rankingStats.xpToNextRank} XP</Text>
        </View>
      </View>

      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonItem}>
          <Users size={20} color={colors.textSecondary} />
          <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 8 }]}>Similar Users:</Text>
          <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 4 }]}>{rankingStats.similarBehaviorRank}</Text>
        </View>
        <View style={styles.comparisonItem}>
          <User size={20} color={colors.textSecondary} />
          <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 8 }]}>Friends:</Text>
          <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 4 }]}>{rankingStats.friendsRank}</Text>
        </View>
      </View>

      <View style={styles.leaderboardPreview}>
        <Text style={[typography.body, styles.leaderboardTitle, { color: colors.textPrimary }]}>Weekly Leaderboard Preview</Text>
        {rankingStats.weeklyLeaderboardPreview.map((entry) => (
          <View key={entry.name} style={styles.leaderboardEntry}>
            <Text style={[typography.small, { color: colors.textSecondary }]}>{entry.rank}.</Text>
            <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 8, flex: 1 }]}>{entry.name}</Text>
            <Text style={[typography.small, { color: colors.accent }]}>{entry.xp} XP</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default RankingLeaderboardInsight;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rankInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardPreview: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 16,
  },
  leaderboardTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.02)',
  },
});
