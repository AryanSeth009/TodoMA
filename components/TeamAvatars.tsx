import { View, StyleSheet } from 'react-native';
import { TeamMember } from '@/types/task';
import { Avatar } from '@/components/Avatar';

type TeamAvatarsProps = {
  avatars: TeamMember[];
  maxDisplay?: number;
};

export default function TeamAvatars({ avatars = [], maxDisplay = 3 }: TeamAvatarsProps) {
  // Display only up to maxDisplay avatars
  const displayedAvatars = avatars?.slice(0, maxDisplay) || [];
  
  return (
    <View style={styles.container}>
      {displayedAvatars.map((member, index) => (
        <View 
          key={member.id} 
          style={[
            styles.avatarContainer,
            { zIndex: avatars.length - index, marginLeft: index > 0 ? -8 : 0 }
          ]}
        >
          <Avatar
            seed={member.email}
            size={24}
            style={styles.avatar}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  avatarContainer: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});