import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import AuthLayout, { authStyles as styles } from '@/components/AuthLayout';
import { colors } from '@/constants/colors';
import authData from '@/data/auth.json';
import { supabase } from '@/lib/supabase';

const page = authData.resetPassword;

export default function ResetPasswordScreen() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    let active = true;

    async function loadRecoverySession() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      if (data.session) {
        setUserEmail(data.session.user.email ?? '');
        setReady(true);
        return;
      }

      Alert.alert('OTP required', page.noSessionMessage, [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/forgot-password' as any),
        },
      ]);
    }

    loadRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setUserEmail(session.user.email ?? '');
        setReady(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleResetPassword() {
    if (!ready) {
      Alert.alert('OTP required', page.noSessionMessage);
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing details', 'Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        'Weak password',
        'Password must be at least 6 characters long.',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'Both passwords must match.');
      return;
    }

    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert('Session expired', 'Please request a new OTP and try again.');
        router.replace('/(auth)/forgot-password' as any);
        return;
      }

      const email = userEmail || session.user.email || '';

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        Alert.alert('Reset failed', error.message);
        return;
      }

      await supabase.auth.signOut();

      if (email) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email,
          password: newPassword,
        });

        if (verifyError) {
          Alert.alert(
            'Password not updated',
            'Please request a new OTP and try again.',
          );
          return;
        }

        await supabase.auth.signOut();
      }

      Alert.alert(page.successTitle, page.successMessage, [
        {
          text: 'Sign In',
          onPress: () => router.replace(page.signInRoute as any),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Reset failed', err?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Text style={styles.title}>{page.title}</Text>
      <Text style={styles.description}>{page.description}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>{page.fields.newPassword.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.newPassword.placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          editable={!loading && ready}
          textContentType="newPassword"
          autoComplete="password-new"
        />

        <Text style={styles.label}>{page.fields.confirmPassword.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.confirmPassword.placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading && ready}
          textContentType="newPassword"
          autoComplete="password-new"
        />

        <Pressable
          style={[
            styles.button,
            (!ready || loading) && styles.buttonDisabled,
          ]}
          onPress={handleResetPassword}
          disabled={!ready || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Updating...' : page.buttonText}
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
