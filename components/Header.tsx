import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { useTheme } from '@/hooks/useTheme';
import { useTaskStore } from '@/store/taskStore';
import { useStreakStore } from '@/store/streakStore'; // Import useStreakStore
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { createTypography } from '../styles/typography'; // Import createTypography

export default function Header() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]); // Initialize typography
  const user = useTaskStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const logout = useTaskStore((state) => state.logout);
  const { currentStreak, bestStreak } = useStreakStore((state) => state.streak); // Get streak data

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerText, { color: colors.textPrimary }]}>
            Hello! {' '}
          </Text>
        <Text style={[styles.headerHeading, { color: colors.textPrimary }]}>
          {user?.name || user?.email}
        </Text>
        </View>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          {tasks.length.toString().padStart(2, '0')} tasks pending
        </Text>
        {/* Streak Information */}
        <View style={styles.streakContainer}>
          <Text style={[typography.small, { color: colors.textSecondary }]}>
            🔥{currentStreak} Days
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 8 }]}>
            🏆 Best Streak: {bestStreak} Days
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={handleProfile}>
        <Avatar
          seed={user?.email || 'guest'}
          size={40}
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  headerHeading: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    lineHeight: 32,
  },
  headerText: {
    fontSize: 28    ,
    fontFamily: 'Poppins-lightItalic',
    lineHeight: 32,
  },
});