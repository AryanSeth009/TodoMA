import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ScheduledTask } from '@/types/task';
import TeamAvatars from './TeamAvatars';
import { Phone } from 'lucide-react-native';

type ScheduledTaskCardProps = {
  task: ScheduledTask;
};

export default function ScheduledTaskCard({ task }: ScheduledTaskCardProps) {
  const { colors, typography } = useTheme();
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
          style={[styles.callButton, { backgroundColor: 'rgba(0,0,0,0.05)' }]}
        >
          <Phone size={16} color="rgba(0,0,0,0.7)" />
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
    color: 'rgba(0,0,0,0.85)',
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