import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { Streak } from '@/types/streak';
// import Animated, { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
// import { Flame, Trophy } from 'lucide-react-native'; // Example icons

type StreakSummaryCardProps = {
  streak: Streak;
};

const StreakSummaryCard = ({ streak }: StreakSummaryCardProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  // const flameScale = useSharedValue(1); // For flame animation

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        Streak & Consistency
      </Text>
      
      <View style={styles.streakRow}>
        {/* Current Streak */}
        <View style={styles.streakItem}>
          {/* <Animated.View style={{ transform: [{ scale: flameScale }] }}>
            <Flame size={24} color={colors.accent} />
          </Animated.View> */}
          <Text style={[typography.display, { color: colors.accent, marginLeft: 8 }]}>
            {streak.currentStreak}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 4 }]}>Days</Text>
          <Text style={[typography.small, styles.label, { color: colors.textSecondary }]}>Current Streak</Text>
        </View>

        {/* Best Streak */}
        <View style={styles.streakItem}>
          {/* <Trophy size={24} color={colors.highlight} /> */}
          <Text style={[typography.display, { color: colors.highlight, marginLeft: 8 }]}>
            {streak.bestStreak}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 4 }]}>Days</Text>
          <Text style={[typography.small, styles.label, { color: colors.textSecondary }]}>Best Streak</Text>
        </View>
      </View>
      
      <Text style={[typography.body, styles.statusText, { color: colors.textPrimary }]}>
        Status: <Text style={{ color: streak.status === 'Maintaining' ? colors.success : colors.warning }}>{streak.status}</Text>
      </Text>
    </View>
  );
};

export default StreakSummaryCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Add soft shadow styles here
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  streakItem: {
    alignItems: 'center',
  },
  label: {
    marginTop: 4,
  },
  statusText: {
    textAlign: 'center',
  },
});
