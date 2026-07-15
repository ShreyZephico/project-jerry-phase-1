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

const page = authData.signUp;

export default function SignUpScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMobile = mobile.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMobile || !password) {
      Alert.alert('Missing details', 'Please fill in all fields.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak password',
        'Password must be at least 6 characters long.',
      );
      return;
    }

    try {
      setLoading(true);

      // Create account (no confirmation email when Confirm email is OFF in Supabase)
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            mobile: trimmedMobile,
          },
        },
      });

      if (error) {
        Alert.alert('Sign up failed', error.message);
        return;
      }

      if (!data.user) {
        Alert.alert(
          'Sign up failed',
          'Could not create your account. Please try again.',
        );
        return;
      }

      if (data.session) {
        const role = await getMyRole();
        router.replace(getHomeRouteForRole(role) as any);
        return;
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

      if (signInError || !signInData.session) {
        Alert.alert(
          'Turn off email confirmation',
          'In Supabase go to:\nAuthentication → Providers → Email → Confirm email → OFF\n\nThen try Sign Up again. After that, signup logs you in directly with no confirmation email.',
        );
        return;
      }

      const role = await getMyRole();
      router.replace(getHomeRouteForRole(role) as any);
    } catch (err: any) {
      Alert.alert('Sign up failed', err?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Text style={styles.title}>{page.title}</Text>
      <Text style={styles.description}>{page.description}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>{page.fields.fullName.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.fullName.placeholder}
          placeholderTextColor={colors.placeholder}
          autoCapitalize="words"
          value={fullName}
          onChangeText={setFullName}
          editable={!loading}
        />

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

        <Text style={styles.label}>{page.fields.mobile.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.mobile.placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
          editable={!loading}
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
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : page.buttonText}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{page.footerPrompt} </Text>
        <Pressable
          onPress={() => router.replace(page.signInRoute as any)}
          disabled={loading}
        >
          <Text style={styles.footerLink}>{page.footerLink}</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
