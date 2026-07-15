import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import AuthLayout, { authStyles as styles } from '@/components/AuthLayout';
import { colors } from '@/constants/colors';
import authData from '@/data/auth.json';
import {
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
} from '@/lib/supabase';

const page = authData.verifyOtp;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string;
    otpType?: string;
  }>();

  const email = (params.email ?? '').trim().toLowerCase();
  const preferredType =
    params.otpType === 'recovery' ? 'recovery' : 'email';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerifyOtp() {
    const code = otp.trim();

    if (!email) {
      Alert.alert('Missing email', 'Please go back and enter your email again.');
      router.replace(page.forgotRoute as any);
      return;
    }

    if (code.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP from your email.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await verifyPasswordResetOtp(
        email,
        code,
        preferredType,
      );

      if (error) {
        Alert.alert('OTP failed', error.message);
        return;
      }

      if (!data?.session) {
        Alert.alert('OTP failed', 'Could not verify OTP. Please try again.');
        return;
      }

      router.replace(page.resetRoute as any);
    } catch (err: any) {
      Alert.alert('OTP failed', err?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!email) {
      router.replace(page.forgotRoute as any);
      return;
    }

    try {
      setResending(true);
      const { error } = await sendPasswordResetOtp(email);

      if (error) {
        Alert.alert('Resend failed', error.message);
        return;
      }

      Alert.alert('OTP sent', `A new OTP was sent to ${email}. Check Spam too.`);
    } catch (err: any) {
      Alert.alert('Resend failed', err?.message ?? 'Something went wrong.');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <Text style={styles.title}>{page.title}</Text>
      <Text style={styles.description}>
        {email ? `Enter the OTP sent to ${email}` : page.description}
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>{page.fields.otp.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.otp.placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
          maxLength={8}
          value={otp}
          onChangeText={setOtp}
          editable={!loading}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOtp}
          disabled={loading || resending}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : page.buttonText}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={handleResendOtp}
          disabled={loading || resending}
        >
          <Text style={styles.secondaryButtonText}>
            {resending ? 'Sending...' : page.resendText}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace(page.forgotRoute as any)}
          disabled={loading || resending}
        >
          <Text style={styles.secondaryButtonText}>
            {page.secondaryButtonText}
          </Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
