import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  isDark: false,
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  useEffect(() => {
    // Load saved theme mode
    AsyncStorage.getItem('themeMode').then((savedMode) => {
      if (savedMode) {
        setMode(savedMode as ThemeMode);
      }
    });
  }, []);

  const isDark = React.useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        setMode: handleSetMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeContext);
