import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useState, useMemo } from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { createTypography } from '../styles/typography';
import { useTaskStore } from '@/store/taskStore'; // Import useTaskStore

export default function DateSelector() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  // Use selectedDate and setSelectedDate from useTaskStore
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const setSelectedDate = useTaskStore((state) => state.setSelectedDate);
  
  // Generate dates for the next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      // Use the start of the day's timestamp for ID to ensure accurate selection
      id: date.setHours(0, 0, 0, 0),
    };
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date) => {
          // Compare selectedDate with the actual date timestamp (start of day)
          const isSelected = selectedDate === date.id;
          
          return (
            <TouchableOpacity
              key={date.id}
              // Pass the start of the day's timestamp to setSelectedDate
              onPress={() => setSelectedDate(date.id)}
              style={styles.dateItemContainer}
            >
              <View 
                style={[
                  styles.dateItem,
                  isSelected && {
                    backgroundColor: colors.secondary, // Use primary color for selected background
                  }
                ]}
              >
                <Text
                  style={[
                    typography.small,
                    styles.weekday,
                    {
                      color: isSelected ? colors.textPrimary : colors.textPrimary, // Always use textPrimary for weekday
                    }
                  ]}
                >
                  {date.weekday}
                </Text>
                <Text
                  style={[
                    typography.dateNumber,
                    {
                      color: isSelected ? colors.textPrimary : colors.textPrimary, // Always use textPrimary for day
                    }
                  ]}
                >
                  {date.day}
                </Text>
                {isSelected && (
                  <Animated.View
                    style={[
                      styles.indicator,
                      { backgroundColor: colors.textPrimary } // Use textPrimary for indicator
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateItemContainer: {
    alignItems: 'center',
  },
  dateItem: {
    width: 50,
    height: 70,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekday: {
    marginBottom: 4,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});