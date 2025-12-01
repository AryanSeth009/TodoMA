import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { createTypography } from '../styles/typography';

export function ThemeToggle() {
  const { colors, theme, toggleTheme } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      default:
        return 'phone-portrait';
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.container,
        { backgroundColor: colors.card }
      ]}
    >
      <Ionicons 
        name={getIcon()} 
        size={20} 
        color={colors.textPrimary}
        style={styles.icon}
      />
      <Text style={[typography.label, styles.text, { color: colors.textPrimary }]}>
        {getLabel()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    // fontSize: 14, // Removed, handled by typography.label
    // fontWeight: '500', // Removed, handled by typography.label
  },
});
