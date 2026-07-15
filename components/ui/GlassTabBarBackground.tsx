import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { colors, glass } from '@/constants/colors';

/** Frosted glass tab bar background for Expo Router Tabs. */
export function GlassTabBarBackground() {
  return (
    <View style={styles.wrap}>
      <BlurView
        intensity={glass.intensityTab}
        tint={glass.tint}
        experimentalBlurMethod={
          Platform.OS === 'android' ? 'dimezisBlurView' : undefined
        }
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.tint} />
      <View pointerEvents="none" style={styles.topLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.tabBarGlass,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.glassBorder,
  },
});
