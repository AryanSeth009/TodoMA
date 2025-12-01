import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { Avatar } from '@/components/Avatar';
import { Streak } from '@/types/streak';
// import Animated, { useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';
// import FlameIcon from '@/assets/icons/flame.png'; // Example for animated flame

type ProfileHeaderProps = {
  user: { name: string; email: string; avatar?: string } | null;
  streak: Streak; // Pass the streak object
};

const ProfileHeader = ({ user, streak }: ProfileHeaderProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  // const flameScale = useSharedValue(1); // For animation

  // useEffect(() => {
  //   if (streak.currentStreak > prevStreak.current) { // Compare with previous streak value
  //     flameScale.value = withSequence(
  //       withSpring(1.2),n
  //       withTiming(1, { duration: 300 })
  //     );
  //   }
  //   prevStreak.current = streak.currentStreak;
  // }, [streak.currentStreak]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.avatarContainer}>
        <Avatar
          seed={user?.email || 'guest'}
          size={80}
          style={styles.avatar}
        />
        {/* <Animated.Image source={FlameIcon} style={[styles.flameIcon, animatedFlameStyle]} /> */}
      </View>
      <Text style={[typography.heading, styles.name, { color: colors.textPrimary }]}>
        {user?.name || user?.email?.split('@')[0] || 'Guest'}
      </Text>
      <Text style={[typography.body, styles.tagline, { color: colors.textSecondary }]}>
        {streak.status === 'Maintaining' ? 'Consistency Builder' : 'Getting Back on Track!'}
      </Text>
      
      {/* Rank Badge and XP Progress */}
      {/* <RankBadge level={streak.rank.level} xp={streak.xp} xpToNext={streak.xpToNextRank} /> */} {/* To be implemented */}
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    // Add soft shadow styles here
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 16,
    // position: 'relative',
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#DAFF01', // Accent color for avatar border
  },
  // flameIcon: { // For animated flame
  //   position: 'absolute',
  //   top: -10,
  //   right: -10,
  //   width: 30,
  //   height: 30,
  // },
  name: {
    fontWeight: '700',
    marginBottom: 4,
  },
  tagline: {
    fontStyle: 'italic',
    marginBottom: 16,
  },
});
