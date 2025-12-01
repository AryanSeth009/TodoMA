import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Calendar, ListTodo, Settings, Flame, View } from 'lucide-react-native'; // Import Flame icon

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <ListTodo size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="streaks" // New tab for streaks
        options={{
          title: 'Streaks',
          tabBarIcon: ({ color }) => <Flame size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}