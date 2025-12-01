import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { View, Text } from 'react-native'; // Corrected import for View and Text
import { Calendar, ListTodo, Flame, Settings } from 'lucide-react-native';
import { Link } from 'expo-router';
import { createTypography } from '@/styles/typography';


export default function Footer({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  const typography = createTypography(colors);

  return (
    <View style={{
      flexDirection: 'row',
      height: 60,
      backgroundColor: colors.surface,
      borderTopWidth: 0,
      paddingBottom: 5,
      paddingTop: 5,
      justifyContent: 'space-around',
      alignItems: 'center',
    }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const iconMap: { [key: string]: React.ComponentType<{ size: number; color: string }> } = {
          'index': ListTodo,
          'schedule': Calendar,
          'streaks': Flame,
          'settings': Settings,
        };
        const IconComponent = iconMap[route.name] || ListTodo;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Link
            key={route.key}
            href={{ pathname: route.name, params: route.params }}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 5,
            }}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            <IconComponent size={24} color={isFocused ? colors.primary : colors.textSecondary} />
            <Text style={[typography.small, { color: isFocused ? colors.primary : colors.textSecondary, marginTop: 4 }]}>
              {label}
            </Text>
          </Link>
        );
      })}
    </View>
  );
}