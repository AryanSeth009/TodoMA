import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ScheduledTask } from '@/types/task';
import TeamAvatars from './TeamAvatars';
import { Phone } from 'lucide-react-native';
import { useMemo } from 'react';
import { createTypography } from '../styles/typography';
import { colors } from '@/styles/colors';

type ScheduledardProps = {
  task: ScheduledTask;
};

export default function Scheduledard({ task }: ScheduledardProps) {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const { title, team, color, hasCall } = task;

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: color }
      ]}
    >
      <View style={styles.contentContainer}>
        <Text 
          numberOfLines={2} 
          style={[typography.cardTitle, styles.title]}
        >
          {title}
        </Text>
        
        <View style={styles.teamContainer}>
          <TeamAvatars avatars={team} maxDisplay={4} />
        </View>
      </View>
      
      {hasCall && (
        <TouchableOpacity 
          style={[styles.callButton, { backgroundColor: colors.card }]}
        >
          <Phone size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 4,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 80,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary, // Use theme color
    marginBottom: 8,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
});