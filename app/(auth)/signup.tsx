import { View, Text, StyleSheet, TextInput, ImageBackground, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { router, Link } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';

export default function SignupScreen() {
  const { colors, typography } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const register = useTaskStore((state) => state.register);

  const handleSignup = async () => {
    // Trim and validate inputs
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedUsername) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
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
      await register(trimmedEmail, trimmedPassword, trimmedUsername);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              Create Account
            </Text>
            <Text style={[typography.body, { color: colors.white, opacity: 0.8, marginBottom: 32 }]}>
              Join us to get started
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.inputBackground, color: colors.textPrimary }
                  ]}
                  placeholder="Username"
                  placeholderTextColor={colors.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[
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

              <View style={styles.inputContainer}>
                <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.inputBackground, color: colors.textPrimary }
                  ]}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <Eye size={20} color={colors.textSecondary} />
                  ) : (
                    <EyeOff size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, {  opacity: loading ? 0.7 : 1 }]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[typography.buttonText, { color: colors.white }]}>
                    Sign Up
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.linkContainer}>
                <Text style={[typography.body, { color: colors.white }]}>
                  Already have an account?{' '}
                </Text>
                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <Text style={[styles.login, typography.body]}>Login</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
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
  login:{
    color: '#EF4045',
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
    fontSize: 16,
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
    backgroundColor:'#EF4045'
    
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});
