import React, { useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { Theme, ThemeContext, ThemeContextType, ThemeColors } from './ThemeContext';

const LightThemeColors: ThemeColors = {
  inputBackground: '#FFFFFF',
  primary: '#EF4045',
  beige:'#FAF3E1',
  secondary: '#FF6B6B',
  background: '#F8F9FB',
  card: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  notification: '#EF4444',
  error: '#EF4045',
  black: '#000000',
  success: '#22C55E',
  warning: '#FACC15',
  onPrimary: '#FFFFFF',
  white: '#FFFFFF',
  olors: [
  
  '#CDE26D',
  '#F5D557',
  '#CCB2F4',
  '#181818', // Cyan
  ],
  fontFamily: {
    black: 'Poppins-Black',
    blackItalic: 'Poppins-BlackItalic',
    bold: 'Poppins-Bold',
    boldItalic: 'Poppins-BoldItalic',
    extraBold: 'Poppins-ExtraBold',
    extraBoldItalic: 'Poppins-ExtraBoldItalic',
    extraLight: 'Poppins-ExtraLight',
    extraLightItalic: 'Poppins-ExtraLightItalic',
    italic: 'Poppins-Italic',
    light: 'Poppins-Light',
    lightItalic: 'Poppins-LightItalic',
    medium: 'Poppins-Medium',
    mediumItalic: 'Poppins-MediumItalic',
    regular: 'Poppins-Regular',
    semiBold: 'Poppins-SemiBold',
    semiBoldItalic: 'Poppins-SemiBoldItalic',
    thin: 'Poppins-Thin',
    thinItalic: 'Poppins-ThinItalic',
  },
};

const DarkThemeColors: ThemeColors = {
  inputBackground: '#1F1F22',
  primary: '#EF4045',
  secondary: '#FF6B6B',
  background: '#000000',
  card: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  notification: '#FF453A',
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FFD60A',
  onPrimary: '#FFFFFF',
  olors: [
    '#704242', // Darker Red
    '#2D572C', // Darker Green
    '#1A3E5C', // Darker Blue
    '#4B3B61', // Darker Purple
    '#6B4C26', // Darker Orange
    '#2A595B', // Darker Cyan
  ],
  fontFamily: {
    black: 'Poppins-Black',
    blackItalic: 'Poppins-BlackItalic',
    bold: 'Poppins-Bold',
    boldItalic: 'Poppins-BoldItalic',
    extraBold: 'Poppins-ExtraBold',
    extraBoldItalic: 'Poppins-ExtraBoldItalic',
    extraLight: 'Poppins-ExtraLight',
    extraLightItalic: 'Poppins-ExtraLightItalic',
    italic: 'Poppins-Italic',
    light: 'Poppins-Light',
    lightItalic: 'Poppins-LightItalic',
    medium: 'Poppins-Medium',
    mediumItalic: 'Poppins-MediumItalic',
    regular: 'Poppins-Regular',
    semiBold: 'Poppins-SemiBold',
    semiBoldItalic: 'Poppins-SemiBoldItalic',
    thin: 'Poppins-Thin',
    thinItalic: 'Poppins-ThinItalic',
  },
};

export const ThemeProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemColorScheme || 'light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme) {
          setTheme(storedTheme as Theme);
        } else if (systemColorScheme) {
          setTheme(systemColorScheme);
        }
      } catch (e) {
        console.error("Failed to load theme from storage", e);
        if (systemColorScheme) {
          setTheme(systemColorScheme);
        }
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const colors = theme === 'light' ? LightThemeColors : DarkThemeColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
