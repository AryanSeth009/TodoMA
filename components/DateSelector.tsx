import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import Animated, { 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

export default function DateSelector() {
  const { colors, typography } = useTheme();
  const [selectedDate, setSelectedDate] = useState(7); // Default to current day
  
  // Generate dates for the next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      id: i + 1,
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
          const isSelected = selectedDate === date.id;
          
          return (
            <TouchableOpacity
              key={date.id}
              onPress={() => setSelectedDate(date.id)}
              style={styles.dateItemContainer}
            >
              <View 
                style={[
                  styles.dateItem,
                  isSelected && {
                    backgroundColor: colors.dark,
                  }
                ]}
              >
                <Text 
                  style={[
                    typography.small,
                    styles.weekday,
                    isSelected && { color: colors.white }
                  ]}
                >
                  {date.weekday}
                </Text>
                <Text
                  style={[
                    typography.dateNumber,
                    isSelected && { color: colors.white }
                  ]}
                >
                  {date.day}
                </Text>
                {isSelected && (
                  <Animated.View 
                    style={[
                      styles.indicator, 
                      { backgroundColor: colors.white }
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