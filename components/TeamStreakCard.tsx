import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Flame } from 'lucide-react-native';

interface TeamStreakCardProps {
  currentStreak: number;
  allMembersCompletedToday: boolean;
}

const TeamStreakCard = ({ currentStreak, allMembersCompletedToday }: TeamStreakCardProps) => {
  const { colors } = useTheme();

  const streakMessage = allMembersCompletedToday
    ? `🔥 Team streak is ${currentStreak} days!`
    : `Keep the flame alive! Everyone needs to complete a task today.`;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Flame size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary, marginLeft: 10 }]}>Team Streak</Text>
      </View>
      <Text style={[styles.message, { color: colors.textSecondary, textAlign: 'center' }]}>
        {streakMessage}
      </Text>
      {allMembersCompletedToday && (
        <Text style={[styles.streakCount, { color: colors.primary }]}>
          {currentStreak} Days
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
  },
  streakCount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default TeamStreakCard;
