import { useEffect } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Cinzel_400Regular,
  Cinzel_500Medium,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
} from '@expo-google-fonts/montserrat';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import splashData from '@/data/splash.json';
import { SPLASH_ICONS, TinyDiamond } from '@/components/SplashIcons';

SplashScreen.preventAutoHideAsync().catch(() => {});

const EASE = Easing.out(Easing.cubic);

export default function Splash() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_500Medium,
    Cinzel_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
  });

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.88);
  const brandOpacity = useSharedValue(0);
  const brandY = useSharedValue(16);
  const midOpacity = useSharedValue(0);
  const midY = useSharedValue(12);
  const loadOpacity = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!fontsLoaded) return;

    SplashScreen.hideAsync().catch(() => {});

    const total = splashData.durationMs; // 3 sec
    const loadStart = 400; // when progress bar starts filling

    // 1) Logo fades + scales in
    logoOpacity.value = withTiming(1, { duration: 450, easing: EASE });
    logoScale.value = withTiming(1, { duration: 450, easing: EASE });

    // 2) Brand name slides up
    brandOpacity.value = withDelay(120, withTiming(1, { duration: 400, easing: EASE }));
    brandY.value = withDelay(120, withTiming(0, { duration: 400, easing: EASE }));

    // 3) Tagline + badges fade up
    midOpacity.value = withDelay(280, withTiming(1, { duration: 400, easing: EASE }));
    midY.value = withDelay(280, withTiming(0, { duration: 400, easing: EASE }));

    // 4) Loading bar appears, then fills until screen ends
    loadOpacity.value = withDelay(loadStart, withTiming(1, { duration: 300, easing: EASE }));
    progress.value = withDelay(
      loadStart,
      withTiming(1, {
        duration: total - loadStart,
        easing: Easing.linear,
      }),
    );

    const timer = setTimeout(() => {
      router.replace(splashData.redirectTo as any);
    }, total);

    return () => clearTimeout(timer);
  }, [fontsLoaded, router]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: brandY.value }],
  }));

  const midStyle = useAnimatedStyle(() => ({
    opacity: midOpacity.value,
    transform: [{ translateY: midY.value }],
  }));

  const loadStyle = useAnimatedStyle(() => ({
    opacity: loadOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!fontsLoaded) {
    return <View style={styles.loadingOnly} />;
  }

  return (
    <ImageBackground
      source={require('../assets/splash/bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.mainBlock}>
          {/* Logo */}
          <Animated.Image
            source={require('../assets/splash/logo.png')}
            style={[styles.logo, logoStyle]}
            resizeMode="contain"
          />

          {/* Brand */}
          <Animated.View style={[styles.centerBlock, brandStyle]}>
            <Text style={styles.brandName}>{splashData.brandName}</Text>
            <Text style={styles.subBrandName}>{splashData.subBrandName}</Text>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerGem}>
                <TinyDiamond size={8} />
              </View>
              <View style={styles.dividerLine} />
            </View>
          </Animated.View>

          {/* Tagline + badges + quote */}
          <Animated.View style={[styles.centerBlock, midStyle]}>
            {splashData.taglineLines.map((line) => (
              <Text key={line} style={styles.tagline}>
                {line}
              </Text>
            ))}

            <View style={styles.sectionLine} />

            <View style={styles.badgesRow}>
              {splashData.trustBadges.map((badge) => {
                const Icon =
                  SPLASH_ICONS[badge.icon as keyof typeof SPLASH_ICONS] ||
                  SPLASH_ICONS.diamond;

                return (
                  <View key={badge.label} style={styles.badgeItem}>
                    <Icon size={44} />
                    <Text style={styles.badgeLabel}>{badge.label}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.sectionLine} />

            <Text style={styles.closingQuote}>{splashData.closingQuote}</Text>

            <View style={styles.flourishRow}>
              <View style={styles.flourishLine} />
              <TinyDiamond size={7} />
              <View style={styles.flourishLine} />
            </View>
          </Animated.View>
        </View>

        {/* Loading */}
        <Animated.View style={[styles.loadingBlock, loadStyle]}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <Text style={styles.loadingText}>{splashData.loadingText}</Text>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingOnly: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  background: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  mainBlock: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    width: '100%',
    alignItems: 'center',
  },

  logo: {
    width: 168,
    height: 168,
    marginBottom: 10,
    alignSelf: 'center',
  },

  brandName: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 36,
    letterSpacing: 8,
    color: colors.brandTitle,
    textAlign: 'center',
    textTransform: 'uppercase',
    width: '100%',
    textShadowColor: 'rgba(90, 60, 10, 0.28)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  subBrandName: {
    marginTop: 8,
    fontFamily: 'Cinzel_500Medium',
    fontSize: 14,
    letterSpacing: 10,
    color: colors.brandSubtitle,
    textAlign: 'center',
    textTransform: 'uppercase',
    width: '100%',
    textShadowColor: 'rgba(90, 60, 10, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 12,
    width: '52%',
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gold,
  },
  dividerGem: {
    marginHorizontal: 8,
  },

  tagline: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.textSecondary,
    textAlign: 'center',
    width: '100%',
    lineHeight: 18,
  },

  sectionLine: {
    alignSelf: 'center',
    width: '78%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gold,
    marginTop: 20,
    marginBottom: 16,
    opacity: 0.7,
  },

  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'center',
    width: '100%',
  },
  badgeItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeLabel: {
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 8,
    letterSpacing: 0.5,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },

  closingQuote: {
    marginTop: 4,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
    textAlign: 'center',
    width: '100%',
  },
  flourishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '28%',
    marginTop: 8,
    gap: 8,
  },
  flourishLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gold,
  },

  loadingBlock: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  progressTrack: {
    width: '68%',
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.progressTrack,
    borderWidth: 0.5,
    borderColor: colors.progressBorder,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.progressFill,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 10,
    letterSpacing: 3,
    color: colors.goldDark,
    textAlign: 'center',
  },
});
