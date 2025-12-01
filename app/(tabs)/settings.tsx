import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTaskStore } from '@/store/taskStore';
import { useRouter } from 'expo-router';
import { createTypography } from '../../styles/typography';
// import History from '../../components/History'; // Removed unnecessary import

export default function SettingsScreen() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const router = useRouter();
  const logout = useTaskStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.heading, styles.title, { color: colors.textPrimary }]}>Settings</Text>
      
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[typography.sectionTitle, styles.sectionTitle, { color: colors.textSecondary }]}>
          Appearance
        </Text>
        <ThemeToggle />
      </View>


      <TouchableOpacity onPress={() => router.push('/history')} style={[styles.section, { backgroundColor: colors.card }]}>
       <Text style={[styles.historyText,  { color: colors.textSecondary }]}>
            History
          </Text>
      </TouchableOpacity>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[typography.sectionTitle, styles.sectionTitle, { color: colors.textSecondary }]}>
          Account
        </Text>
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
        >
          <Text style={[typography.buttonText, styles.logoutText, { color: colors.onPrimary }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    // fontSize: 32, // Removed, handled by typography.heading
    // fontWeight: 'bold', // Removed, handled by typography.heading
    marginBottom: 24,
    marginTop: 60,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    // fontSize: 16, // Removed, handled by typography.sectionTitle
    // fontWeight: '500', // Removed, handled by typography.sectionTitle
    marginBottom: 16,
  },
  logoutButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    // color: '#FFFFFF', // Removed, handled by typography.buttonText
    // fontSize: 16, // Removed, handled by typography.buttonText
    // fontWeight: '600', // Removed, handled by typography.buttonText
  },
  historyText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-regular',
   
  },
});
