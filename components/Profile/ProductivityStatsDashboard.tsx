import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { Task } from '@/types/task';
import { Category } from '@/types/category';

// Placeholder for charting components (e.g., react-native-svg-charts or similar)
const BarChart = ({ data }: { data: { label: string; value: number; color: string; }[] }) => (
  <View style={styles.chartPlaceholder}>
    <Text style={{ color: 'white' }}>Bar Chart</Text>
  </View>
);

const DonutChart = ({ data }: { data: { label: string; value: number; color: string; }[] }) => (
  <View style={styles.chartPlaceholder}>
    <Text style={{ color: 'white' }}>Donut Chart</Text>
  </View>
);

type ProductivityStatsDashboardProps = {
  tasks: Task[];
  completedTasks: Task[];
  categories: Category[];
};

const ProductivityStatsDashboard = ({ tasks, completedTasks, categories }: ProductivityStatsDashboardProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  // Placeholder for calculations - will be replaced with actual logic
  const totalTasksCompleted = completedTasks.length;
  const weeklyTasksCompleted = 25;
  const monthlyTasksCompleted = 100;
  const averageTasksPerDay = 3.5;
  const peakProductivityTime = { timeRange: "8-10 PM", insight: "You complete tasks fastest at night." };

  const categoryDistributionData = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    completedTasks.forEach(task => {
      const categoryName = categories.find(cat => cat.id === task.categoryId)?.name || 'Uncategorized';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    // Convert to chart data format with random colors for now
    const chartColors = [colors.accent, colors.highlight, colors.textSecondary, colors.primary];
    let colorIndex = 0;

    return Object.entries(categoryCounts).map(([label, value]) => {
      const color = chartColors[colorIndex % chartColors.length];
      colorIndex++;
      return { label, value, color };
    });
  }, [completedTasks, categories, colors]);

  const weeklyPerformanceData = useMemo(() => {
    // Placeholder data for weekly performance
    return [
      { label: 'Week 1', value: 20, color: colors.accent },
      { label: 'Week 2', value: 30, color: colors.accent },
      { label: 'Week 3', value: 25, color: colors.accent },
      { label: 'Week 4', value: 35, color: colors.accent },
    ];
  }, [colors]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        Productivity Stats Dashboard
      </Text>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[typography.small, { color: colors.textSecondary }]}>Total Completed</Text>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>{totalTasksCompleted}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[typography.small, { color: colors.textSecondary }]}>Weekly Tasks</Text>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>{weeklyTasksCompleted}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[typography.small, { color: colors.textSecondary }]}>Monthly Tasks</Text>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>{monthlyTasksCompleted}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[typography.small, { color: colors.textSecondary }]}>Avg Tasks/Day</Text>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>{averageTasksPerDay}</Text>
        </View>
      </View>

      <View style={[styles.statCard, { backgroundColor: colors.background, marginTop: 16 }]}>
        <Text style={[typography.small, { color: colors.textSecondary }]}>Peak Productivity</Text>
        <Text style={[typography.body, { color: colors.textPrimary }]}>{peakProductivityTime.insight}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={[typography.body, styles.chartTitle, { color: colors.textPrimary }]}>Category Distribution</Text>
        <DonutChart data={categoryDistributionData} />
      </View>

      <View style={styles.chartContainer}>
        <Text style={[typography.body, styles.chartTitle, { color: colors.textPrimary }]}>Weekly Performance</Text>
        <BarChart data={weeklyPerformanceData} />
      </View>
    </View>
  );
};

export default ProductivityStatsDashboard;

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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    borderRadius: 12,
    padding: 12,
    flexBasis: '48%', // Roughly half width
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  chartTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  chartPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
});

