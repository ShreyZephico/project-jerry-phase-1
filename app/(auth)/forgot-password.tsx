import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import AuthLayout, { authStyles as styles } from '@/components/AuthLayout';
import { colors } from '@/constants/colors';
import authData from '@/data/auth.json';

const page = authData.forgotPassword;

export default function ForgotPasswordScreen() {
  const router = useRouter();

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
        />

        <Pressable
          style={styles.button}
          onPress={() => router.push(page.resetRoute as any)}
        >
          <Text style={styles.buttonText}>{page.buttonText}</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace(page.signInRoute as any)}
        >
          <Text style={styles.secondaryButtonText}>
            {page.secondaryButtonText}
          </Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
