import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const { colors } = useTheme();

  const renderActivityItem = ({ item }: { item: ActivityItem }) => (
    <View style={[styles.activityItem, { backgroundColor: colors.card }]}>
      <Text style={[styles.activityText, { color: colors.textPrimary }]}>{item.text}</Text>
      <Text style={[styles.activityTimestamp, { color: colors.textSecondary }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Team Activity</Text>
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        inverted // To show most recent activities at the bottom
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary }}>No recent activity.</Text>
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
  activityItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityText: {
    fontSize: 14,
    marginBottom: 2,
  },
  activityTimestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
});

export default ActivityFeed;
