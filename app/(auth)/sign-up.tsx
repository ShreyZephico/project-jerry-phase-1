import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import AuthLayout, { authStyles as styles } from '@/components/AuthLayout';
import { colors } from '@/constants/colors';
import authData from '@/data/auth.json';

const page = authData.signUp;

export default function SignUpScreen() {
  const router = useRouter();

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
        />

        <Text style={styles.label}>{page.fields.email.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.email.placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>{page.fields.mobile.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.mobile.placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>{page.fields.password.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={page.fields.password.placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry
        />

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>{page.buttonText}</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{page.footerPrompt} </Text>
        <Pressable onPress={() => router.replace(page.signInRoute as any)}>
          <Text style={styles.footerLink}>{page.footerLink}</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
