import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeMode } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export function ThemeToggle() {
  const { mode, setMode } = useThemeMode();
  const { colors } = useTheme();

  const toggleTheme = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('system');
    else setMode('light');
  };

  const getIcon = () => {
    switch (mode) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      default:
        return 'phone-portrait';
    }
  };

  const getLabel = () => {
    switch (mode) {
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
        { backgroundColor: colors.inputBackground }
      ]}
    >
      <Ionicons 
        name={getIcon()} 
        size={20} 
        color={colors.textPrimary}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: colors.textPrimary }]}>
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
    fontSize: 14,
    fontWeight: '500',
  },
});
