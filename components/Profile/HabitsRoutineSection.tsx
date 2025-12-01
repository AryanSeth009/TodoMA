import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { Habit, HabitStats } from '@/types/streak';
import { CheckCircle, XCircle, Award } from 'lucide-react-native'; // Example icons

type HabitsRoutineSectionProps = {
  habitStats: HabitStats;
};

const HabitsRoutineSection = ({ habitStats }: HabitsRoutineSectionProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        Habits & Routines
      </Text>
      
      {habitStats.habits.length === 0 ? (
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
          No habits tracked yet. Start building new routines!
        </Text>
      ) : (
        <View>
          {habitStats.habits.map(habit => (
            <View key={habit.id} style={styles.habitItem}>
              <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>{habit.name}</Text>
              <View style={styles.habitDetails}>
                <Text style={[typography.small, { color: colors.accent, fontWeight: 'bold' }]}>
                  🔥 {habit.streak} Days
                </Text>
                <View style={styles.weeklyProgress}>
                  {habit.weeklyProgress.map((dayStatus, index) => (
                    dayStatus ? <CheckCircle key={index} size={16} color={colors.success} /> : <XCircle key={index} size={16} color={colors.warning} />
                  ))}
                </View>
              </View>
              {habit.bestHabitOfMonth && (
                <View style={styles.badgeContainer}>
                  <Award size={16} color={colors.highlight} />
                  <Text style={[typography.small, { color: colors.highlight, marginLeft: 4 }]}>Best Habit of Month!</Text>
                </View>
              )}
              {habit.failingInsight && (
                <Text style={[typography.small, { color: colors.warning, marginTop: 4 }]}>{habit.failingInsight}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Placeholder for Weekly progress chart */}
      <View style={styles.chartPlaceholder}>
        <Text style={{ color: 'white' }}>Weekly Progress Chart</Text>
      </View>
    </View>
  );
};

export default HabitsRoutineSection;

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
  habitItem: {
    flexDirection: 'column',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  habitDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  weeklyProgress: {
    flexDirection: 'row',
    marginLeft: 12,
    gap: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  chartPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});

