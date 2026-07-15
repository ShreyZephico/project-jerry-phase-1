import { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';

import { colors, glass, radius, spacing } from '@/constants/colors';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  intensity?: number;
  padded?: boolean;
  onPress?: () => void;
};

/**
 * Frosted glass panel — shared glassmorphism surface for cards/forms/lists.
 * Uses expo-blur (Android: experimentalBlurMethod for real blur on SDK 54).
 */
export function GlassCard({
  children,
  style,
  contentStyle,
  intensity = glass.intensity,
  padded = true,
  onPress,
}: Props) {
  const body = (
    <View style={[styles.shadow, style]}>
      <BlurView
        intensity={intensity}
        tint={glass.tint}
        experimentalBlurMethod={
          Platform.OS === 'android' ? 'dimezisBlurView' : undefined
        }
        style={styles.blur}
      >
        <View pointerEvents="none" style={styles.frost} />
        <View pointerEvents="none" style={styles.edgeHighlight} />
        <View style={[padded && styles.padded, contentStyle]}>{children}</View>
      </BlurView>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {body}
      </Pressable>
    );
  }

  return body;
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
      },
      android: {
        elevation: 5,
      },
      default: {},
    }),
  },
  blur: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassFill,
  },
  frost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glassTint,
  },
  edgeHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.glassHighlight,
    opacity: 0.7,
  },
  padded: {
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
});
