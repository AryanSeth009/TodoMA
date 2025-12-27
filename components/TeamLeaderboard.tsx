import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface LeaderboardEntry {
  id: string;
  name: string;
  tasksCompleted: number;
  taskQuality: number; // e.g., average rating or number of high-quality tasks
  streakBehavior: number; // e.g., current streak or longest streak
  xpEarned: number;
  speedOfCompletion: number; // e.g., average time to complete tasks in hours
}

interface TeamLeaderboardProps {
  leaderboardData: LeaderboardEntry[];
}

const TeamLeaderboard = ({ leaderboardData }: TeamLeaderboardProps) => {
  const { colors } = useTheme();

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.rank, { color: colors.textSecondary }]}>#{index + 1}</Text>
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.stats, { color: colors.textSecondary }]}>
          Tasks: {item.tasksCompleted} | Streak: {item.streakBehavior} | XP: {item.xpEarned}
        </Text>
      </View>
      {/* More detailed stats could be displayed on expansion or another screen */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Team Leaderboard</Text>
      <FlatList
        data={leaderboardData.sort((a, b) => b.xpEarned - a.xpEarned)} // Sort by XP earned for now
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary }}>No leaderboard data yet.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stats: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default TeamLeaderboard;
