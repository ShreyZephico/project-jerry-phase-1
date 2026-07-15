import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import AuthLayout, { authStyles as styles } from '@/components/AuthLayout';
import { colors } from '@/constants/colors';
import authData from '@/data/auth.json';
import { supabase } from '@/lib/supabase';
import {
  getHomeRouteForRole,
  getMyRole,
} from '@/services/profileService';

const page = authData.signIn;

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      Alert.alert('Missing details', 'Please enter email and password.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        Alert.alert('Sign in failed', error.message);
        return;
      }

      if (!data.session) {
        Alert.alert(
          'Sign in failed',
          'Could not start your session. Please try again.',
        );
        return;
      }

      const role = await getMyRole();
      router.replace(getHomeRouteForRole(role) as any);
    } catch (err: any) {
      Alert.alert('Sign in failed', err?.message ?? 'Something went wrong.');
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
          textContentType="username"
          autoComplete="email"
        />

        <Text style={styles.label}>{page.fields.password.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.password.placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
          textContentType="password"
          autoComplete="password"
        />

        <Pressable
          style={styles.linkWrap}
          onPress={() => router.push(page.forgotPasswordRoute as any)}
          disabled={loading}
        >
          <Text style={styles.link}>{page.forgotPasswordText}</Text>
        </Pressable>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing In...' : page.buttonText}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{page.footerPrompt} </Text>
        <Pressable
          onPress={() => router.push(page.signUpRoute as any)}
          disabled={loading}
        >
          <Text style={styles.footerLink}>{page.footerLink}</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
