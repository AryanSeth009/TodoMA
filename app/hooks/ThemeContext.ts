import React, { createContext } from 'react';
import { ColorValue } from 'react-native';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  [x: string]: any;
  inputBackground: string;
  white: string;
  primary: string;
  beige: string;
  secondary: string;
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  notification: string;
  error: string;
  black: string;
  success: string;
  warning: string;
  onPrimary: string;
  fontFamily: {
    black: string;
    blackItalic: string;
    bold: string;
    boldItalic: string;
    extraBold: string;
    extraBoldItalic: string;
    extraLight: string;
    extraLightItalic: string;
    italic: string;
    light: string;
    lightItalic: string;
    medium: string;
    mediumItalic: string;
    regular: string;
    semiBold: string;
    semiBoldItalic: string;
    thin: string;
    thinItalic: string;
  };
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
  isDark: boolean; // Add isDark property
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
