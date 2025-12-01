import { colors } from '@/styles/colors';
import { darkColors } from '@/styles/darkColors';

import { useThemeMode } from '@/context/ThemeContext';

export function useTheme() {
  const { isDark } = useThemeMode();
  
  return {
    colors: isDark ? darkColors : colors,

    isDark,
  };
}