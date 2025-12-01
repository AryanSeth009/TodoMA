import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { JourneyTimelineData } from '@/types/streak';
import { Calendar, Award, ListTodo } from 'lucide-react-native'; // Icons

type JourneyTimelineProps = {
  journeyTimeline: JourneyTimelineData;
};

const JourneyTimeline = ({ journeyTimeline }: JourneyTimelineProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  const sortedEvents = useMemo(() => {
    const allEvents = [
      { date: journeyTimeline.joinedDate, event: `Joined TodoMA`,
        icon: <Calendar size={16} color={colors.accent} /> },
      { date: new Date().setHours(0,0,0,0), event: `Biggest Streak: ${journeyTimeline.biggestStreakEver} Days`,
        icon: <Award size={16} color={colors.highlight} /> },
      { date: new Date().setHours(0,0,0,0), event: `Total Tasks Finished: ${journeyTimeline.totalTasksFinishedOverall}`,
        icon: <ListTodo size={16} color={colors.primary} /> },
      ...journeyTimeline.timelineEvents.map(event => ({
        date: event.date,
        event: event.event,
        icon: <Calendar size={16} color={colors.textSecondary} /> // Default icon
      })),
      // Add monthly summaries and rank evolution as events
      ...journeyTimeline.monthlySummarySnapshots.map(snapshot => ({
        date: new Date(snapshot.year, new Date(`${snapshot.month} 1, 2000`).getMonth(), 1).getTime(),
        event: `${snapshot.month} ${snapshot.year}: ${snapshot.tasksCompleted} Tasks Completed`,
        icon: <ListTodo size={16} color={colors.textSecondary} />
      })),
      ...journeyTimeline.rankEvolutionTimeline.map(rankEvent => ({
        date: rankEvent.date,
        event: `Reached ${rankEvent.rank} Rank`,
        icon: <Award size={16} color={colors.textSecondary} />
      })),
    ].sort((a, b) => a.date - b.date);
    return allEvents;
  }, [journeyTimeline, colors]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        Journey Timeline
      </Text>

      <View style={styles.timelineContainer}>
        {sortedEvents.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineDotContainer}>
              <View style={[styles.timelineDot, { backgroundColor: colors.accent }]} />
              {index < sortedEvents.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={[typography.small, { color: colors.textSecondary }]}>{new Date(item.date).toLocaleDateString()}</Text>
              <View style={styles.eventDetails}>
                {item.icon}
                <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 8, flexShrink: 1 }]}>{item.event}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default JourneyTimeline;

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
  timelineContainer: {
    paddingLeft: 20,
    paddingVertical: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDotContainer: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
