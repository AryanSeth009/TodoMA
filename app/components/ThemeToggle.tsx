import React from 'react';
import { Switch, Text, View, StyleSheet } from 'react-native';
import { useThemeMode } from '../../context/ThemeContext'; // Adjust path as necessary
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { isDark, setMode } = useThemeMode();
  const { colors, typography } = useTheme();

  const toggleSwitch = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.body, { color: colors.textPrimary }]}>Dark Mode</Text>
      <Switch
        trackColor={{ false: colors.textSecondary, true: colors.primary }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.textSecondary}
        onValueChange={toggleSwitch}
        value={isDark}
      />
    </View>
  );
};

export { ThemeToggle };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
});
