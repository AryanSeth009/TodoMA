import { useEffect, useLayoutEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { SplashScreen } from 'expo-router';
import { useTaskStore } from '../store/taskStore';
import { TASK_COLORS } from '../store/taskStore';
import { ThemeProvider, useTheme } from '@/hooks/useTheme'; // Import ThemeProvider from useTheme.tsx
import { useMemo } from 'react';
import { createTypography } from '../styles/typography';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded, fontError] = Font.useFonts({
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-BlackItalic': require('../assets/fonts/Poppins-BlackItalic.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-BoldItalic': require('../assets/fonts/Poppins-BoldItalic.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraBoldItalic': require('../assets/fonts/Poppins-ExtraBoldItalic.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-ExtraLightItalic': require('../assets/fonts/Poppins-ExtraLightItalic.ttf'),
    'Poppins-Italic': require('../assets/fonts/Poppins-Italic.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-LightItalic': require('../assets/fonts/Poppins-LightItalic.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-MediumItalic': require('../assets/fonts/Poppins-MediumItalic.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-SemiBoldItalic': require('../assets/fonts/Poppins-SemiBoldItalic.ttf'),
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
    'Poppins-ThinItalic': require('../assets/fonts/Poppins-ThinItalic.ttf'),
  });
  const { colors, isDark } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]); // Initialize typography
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useTaskStore((state) => state
  .isAuthenticated);
  const initializeData = useTaskStore((state) => state.initializeData);
  const isLoading = useTaskStore((state) => state.isLoading);

  // Use useLayoutEffect for navigation setup
  useLayoutEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Re-integrate initial setup effect
  useEffect(() => {
    const setup = async () => {
      try {
        // Configure notifications or any other initial setup
        await SplashScreen.hideAsync(); // Hide splash screen once fonts are loaded and initial setup is done
        setIsReady(true);
      } catch (error) {
        console.error('Initial setup error:', error);
        setIsReady(true); // Still set ready even if setup fails
      }
    };
    if (fontsLoaded) {
      setup();
    }
  }, [fontsLoaded]); // Trigger setup when fonts are loaded

  // Handle authentication routing
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const shouldRedirect =
      (!isAuthenticated && !inAuthGroup) ||
      (isAuthenticated && inAuthGroup);

    if (shouldRedirect) {
      const route = !isAuthenticated ? '/login' : '/(tabs)';
      router.replace(route);
    }
  }, [isAuthenticated, segments, isReady]);

  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && isReady) {
      console.log('User is authenticated, initializing data...');
      // Pass the taskColors array when initializing data
      initializeData(TASK_COLORS);
    }
  }, [isAuthenticated, isReady, initializeData]);

  // Always render the Slot first
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {(!fontsLoaded || !isReady) ? (
        <View style={[StyleSheet.absoluteFill, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.body, styles.loadingText, { color: colors.textPrimary }]}>
            {fontError ? 'Error loading fonts' : 'Loading...'}
          </Text>
        </View>
      ) : (
        <>
          <Slot />
          {isLoading && (
            <View style={[StyleSheet.absoluteFill, styles.centered]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[typography.body, styles.loadingText, { color: colors.textPrimary }]}>
                Loading your tasks...
              </Text>
            </View>
          )}
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  loadingText: {
    marginTop: 12,
    // fontSize: 16, // Removed, handled by typography.body
    textAlign: 'center',
  },
});