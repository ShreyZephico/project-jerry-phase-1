import { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Cinzel_500Medium,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from '@expo-google-fonts/montserrat';

import { GlassCard } from '@/components/ui/GlassCard';
import { colors, glass, spacing } from '@/constants/colors';
import authData from '@/data/auth.json';

type AuthLayoutProps = {
  children: ReactNode;
};

/**
 * Shared auth screen shell — cream/gold gradient + logo (no background image).
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const [fontsLoaded] = useFonts({
    Cinzel_500Medium,
    Cinzel_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={styles.loadingOnly} />;
  }

  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View pointerEvents="none" style={styles.orbWrap}>
              <View style={[styles.orb, styles.orbOne]} />
              <View style={[styles.orb, styles.orbTwo]} />
            </View>

            <View style={styles.brandBlock}>
              <Image
                source={require('../assets/splash/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>{authData.brandName}</Text>
              <Text style={styles.subBrandName}>{authData.subBrandName}</Text>
            </View>

            <GlassCard
              intensity={glass.intensityStrong}
              style={styles.formCard}
              contentStyle={styles.formCardInner}
            >
              {children}
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export const authStyles = StyleSheet.create({
  title: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 26,
    letterSpacing: 1,
    color: colors.brandTitle,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  form: {
    width: '100%',
  },
  label: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 13,
    color: colors.brandTitle,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: colors.inputText,
    backgroundColor: colors.inputBg,
  },
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    fontFamily: 'Montserrat_600SemiBold',
    color: colors.buttonText,
    fontSize: 15,
    letterSpacing: 1,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    color: colors.brandTitle,
    fontSize: 14,
  },
  linkWrap: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 8,
  },
  link: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: colors.brandTitle,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  footerText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: colors.textMuted,
  },
  footerLink: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: colors.brandTitle,
  },
});

const styles = StyleSheet.create({
  loadingOnly: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbOne: {
    width: 200,
    height: 200,
    top: 20,
    right: -60,
    backgroundColor: colors.orbGold,
  },
  orbTwo: {
    width: 160,
    height: 160,
    bottom: 80,
    left: -50,
    backgroundColor: colors.orbAmber,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 6,
  },
  brandName: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 22,
    letterSpacing: 5,
    color: colors.brandTitle,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subBrandName: {
    marginTop: 4,
    fontFamily: 'Cinzel_500Medium',
    fontSize: 11,
    letterSpacing: 6,
    color: colors.brandSubtitle,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  formCard: {
    width: '100%',
    marginBottom: 0,
  },
  formCardInner: {
    width: '100%',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
