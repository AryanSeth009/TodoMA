import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { useTheme } from '@/hooks/useTheme';
import { useTaskStore } from '@/store/taskStore';
import { router } from 'expo-router';
import React from 'react';

export default function Header() {
  const { colors, typography } = useTheme();
  const user = useTaskStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const logout = useTaskStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={[typography.heading, { color: colors.textPrimary }]}>
          Orr!, {user?.name || user?.email}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          {tasks.length.toString().padStart(2, '0')} tasks pending
        </Text>
      </View>
      <TouchableOpacity onPress={handleLogout}>
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
  avatar: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});