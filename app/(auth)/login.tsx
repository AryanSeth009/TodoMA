import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect, useMemo } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { router, Link } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { createTypography } from '../../styles/typography';

export default function LoginScreen() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useTaskStore((state) => state.login);
  const isAuthenticated = useTaskStore((state) => state.isAuthenticated);

  // Navigation is now handled by the root layout

  const handleLogin = async () => {
    // Trim and validate inputs
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await login(trimmedEmail, trimmedPassword);
      // Router.replace is handled by the useEffect when isAuthenticated changes
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        error.message || 'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
    },
    login: {
      color: colors.primary,
    },
    content: {
      padding: 24,
    },
    form: {
      gap: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      left: 16,
      zIndex: 1,
    },
    input: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingLeft: 48,
    },
    eyeIcon: {
      position: 'absolute',
      right: 16,
    },
    button: {
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },
    linkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
  }), [colors]); // Recreate styles if colors change

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ImageBackground
        source={require('@/assets/images/login.jpg')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={[typography.heading, { color: colors.white, marginBottom: 8 }]}>
              Welcome Back
            </Text>
            <Text style={[typography.body, { color: colors.white, opacity: 0.8, marginBottom: 32 }]}>
              Sign in to continue
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[
                    typography.body,
                    styles.input,
                    { backgroundColor: colors.inputBackground, color: colors.textPrimary }
                  ]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[
                    typography.body,
                    styles.input,
                    { backgroundColor: colors.inputBackground, color: colors.textPrimary }
                  ]}
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <Eye size={20} color={colors.textSecondary} />
                  ) : (
                    <EyeOff size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textPrimary} />
                ) : (
                  <Text style={[typography.buttonText, { color: colors.white }]}>
                    Login
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.linkContainer}>
                <Text style={[typography.body, { color: colors.white }]}>
                  Don't have an account?{' '}
                </Text>
                <Link href="/signup" asChild>
                  <TouchableOpacity>
                    <Text style={[styles.login, typography.body]}>Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}