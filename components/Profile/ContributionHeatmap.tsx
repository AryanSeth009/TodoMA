import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { DailyContribution } from '@/types/streak';

type ContributionHeatmapProps = {
  dailyContributions: DailyContribution[];
};

const ContributionHeatmap = ({ dailyContributions }: ContributionHeatmapProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  // Generate data for the last 30 days
  const last30Days = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const contribution = dailyContributions.find(dc => dc.date === date.getTime());
      days.push({
        date: date.getTime(),
        productivityScore: contribution ? contribution.productivityScore : 0,
      });
    }
    return days;
  }, [dailyContributions]);

  // Function to get color based on productivity score
  const getHeatmapColor = (score: number) => {
    if (score === 0) return colors.card; // No activity
    if (score < 30) return '#a4c2f4'; // Low (light blue)
    if (score < 70) return '#6d9eeb'; // Medium (medium blue)
    return '#3c78d8'; // High (dark blue)
  };

  // Placeholder for tooltip state
  const [tooltip, setTooltip] = React.useState<{ date: number; score: number; x: number; y: number } | null>(null);

  const handlePressDay = (e: any, day: DailyContribution) => {
    // In a real app, you'd calculate position more accurately
    setTooltip({ date: day.date, score: day.productivityScore, x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
    setTimeout(() => setTooltip(null), 2000); // Hide tooltip after 2 seconds
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        30-Day Contribution Heatmap
      </Text>
      <View style={styles.heatmapGrid}>
        {last30Days.map((day) => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.heatmapDay,
              { backgroundColor: getHeatmapColor(day.productivityScore) },
            ]}
            onPress={(e) => handlePressDay(e, day)}
            activeOpacity={0.7}
          />
        ))}
      </View>
      <View style={styles.legendContainer}>
        <Text style={[typography.small, { color: colors.textSecondary }]}>Low</Text>
        <View style={[styles.legendColor, { backgroundColor: '#a4c2f4' }]} />
        <View style={[styles.legendColor, { backgroundColor: '#6d9eeb' }]} />
        <View style={[styles.legendColor, { backgroundColor: '#3c78d8' }]} />
        <Text style={[typography.small, { color: colors.textSecondary }]}>High Productivity</Text>
      </View>

      {tooltip && (
        <View style={[styles.tooltip, { top: tooltip.y - 30, left: tooltip.x - 50, backgroundColor: colors.textPrimary }]}>
          <Text style={[typography.small, { color: colors.background }]}>
            {new Date(tooltip.date).toLocaleDateString()}: {tooltip.score}%
          </Text>
        </View>
      )}
    </View>
  );
};

export default ContributionHeatmap;

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
    marginBottom: 12,
    fontWeight: 'bold',
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 12,
  },
  heatmapDay: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 3,
  },
  tooltip: {
    position: 'absolute',
    padding: 8,
    borderRadius: 8,
    zIndex: 100,
  },
});
