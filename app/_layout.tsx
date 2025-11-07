import { useEffect, useLayoutEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { ThemeProvider } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/useTheme';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useTaskStore((state) => state
  .isAuthenticated);
  const initializeData = useTaskStore((state) => state.initializeData);
  const isLoading = useTaskStore((state) => state.isLoading);

  // Use useLayoutEffect for navigation setup
  useLayoutEffect(() => {
    const setup = async () => {
      try {
        // Configure notifications

        // Wait for next tick
        await new Promise(resolve => setTimeout(resolve, 0));
        
        setIsReady(true);
      } catch (error) {
        console.error('Setup error:', error);
        setIsReady(true); // Still set ready even if notifications fail
      }
    };
    setup();
  }, []);

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
      initializeData();
    }
  }, [isAuthenticated, isReady]);

  // Always render the Slot first
    return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Slot />
      {!isReady && (
        <View style={[StyleSheet.absoluteFill, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
            Loading...
          </Text>
        </View>
      )}
      {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
          Loading your tasks...
        </Text>
      </View>
      )}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
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
    fontSize: 16,
    textAlign: 'center',
  },
});