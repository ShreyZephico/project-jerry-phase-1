import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import AuthLayout, { authStyles as styles } from '@/components/AuthLayout';
import { colors } from '@/constants/colors';
import authData from '@/data/auth.json';

const page = authData.resetPassword;

export default function ResetPasswordScreen() {
  const router = useRouter();

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
        />

        <Text style={styles.label}>{page.fields.confirmPassword.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.confirmPassword.placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry
        />

        <Pressable
          style={styles.button}
          onPress={() => router.replace(page.signInRoute as any)}
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
