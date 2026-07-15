import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import AuthLayout, { authStyles as styles } from '@/components/AuthLayout';
import { colors } from '@/constants/colors';
import authData from '@/data/auth.json';
import { sendPasswordResetOtp } from '@/lib/supabase';

const page = authData.forgotPassword;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);

      const { error, otpType } = await sendPasswordResetOtp(trimmedEmail);

      if (error) {
        Alert.alert('OTP failed', error.message);
        return;
      }

      Alert.alert(
        'OTP sent',
        `We sent a 6-digit OTP to ${trimmedEmail}.\n\nCheck Inbox and Spam.`,
        [
          {
            text: 'Enter OTP',
            onPress: () =>
              router.push({
                pathname: page.otpRoute as any,
                params: {
                  email: trimmedEmail,
                  otpType: otpType ?? 'email',
                },
              }),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('OTP failed', err?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Text style={styles.title}>{page.title}</Text>
      <Text style={styles.description}>{page.description}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>{page.fields.email.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.email.placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending OTP...' : page.buttonText}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace(page.signInRoute as any)}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>
            {page.secondaryButtonText}
          </Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
