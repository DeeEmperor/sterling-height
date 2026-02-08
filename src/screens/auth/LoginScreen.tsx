/**
 * Login Screen
 * Phone number input with Nigerian format validation
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Input } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context';
import { isValidPhoneNumber } from '../../utils/helpers';
import { AuthStackParamList } from '../../types';

type LoginNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    // Clear previous errors
    setError('');

    // Validate phone number
    const normalizedPhone = phone.trim();
    if (!normalizedPhone) {
      setError('Please enter your phone number');
      return;
    }

    if (!isValidPhoneNumber(normalizedPhone)) {
      setError('Please enter a valid Nigerian phone number');
      return;
    }

    setLoading(true);
    try {
      await login(normalizedPhone);
      navigation.navigate('Otp', { phone: normalizedPhone });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🏘️</Text>
            </View>
            <Text style={styles.title}>Sterling Height</Text>
            <Text style={styles.subtitle}>Estate Management</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.instructionText}>
              Enter your phone number to continue
            </Text>

            <Input
              label="Phone Number"
              placeholder="+234 801 234 5678"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setError('');
              }}
              keyboardType="phone-pad"
              autoComplete="tel"
              error={error}
              containerStyle={styles.input}
            />

            <Button
              title="Send OTP"
              onPress={handleSendOtp}
              loading={loading}
              fullWidth
              size="large"
            />

            {/* Demo credentials info */}
            <View style={styles.demoInfo}>
              <Text style={styles.demoTitle}>Demo Phone Numbers:</Text>
              <Text style={styles.demoText}>Resident: +2348012345678</Text>
              <Text style={styles.demoText}>Security: +2348045678901</Text>
              <Text style={styles.demoHint}>(Any 6-digit OTP works)</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.lg,
  },
  demoInfo: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  demoText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  demoHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});

export default LoginScreen;
