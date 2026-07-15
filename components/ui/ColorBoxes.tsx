import { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  ColorTone,
  colors,
  getTonePalette,
  radius,
  spacing,
} from '@/constants/colors';

type BoxProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: ColorTone;
  style?: ViewStyle;
  onPress?: () => void;
};

/** Solid colorful metric box — clear scanning for fintech numbers. */
export function ColorBox({
  label,
  value,
  hint,
  tone = 'gold',
  style,
  onPress,
}: BoxProps) {
  const palette = getTonePalette(tone);
  const body = (
    <View
      style={[
        styles.box,
        { backgroundColor: palette.bg, borderColor: palette.border },
        style,
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: palette.accent }]} />
      <Text style={[styles.label, { color: palette.accent }]}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={styles.pressable}>{body}</View>;
}

type GridProps = {
  children: ReactNode;
};

/** Two-column aligned grid for ColorBoxes. */
export function ColorBoxGrid({ children }: GridProps) {
  return <View style={styles.grid}>{children}</View>;
}

type ActionProps = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: ColorTone;
  onPress: () => void;
  style?: ViewStyle;
};

/** Colorful action tile with icon — for home / dashboard shortcuts. */
export function ActionTile({
  title,
  subtitle,
  icon,
  tone = 'gold',
  onPress,
  style,
}: ActionProps) {
  const palette = getTonePalette(tone);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: palette.bg, borderColor: palette.border },
        style,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: palette.accent }]}>
        <Ionicons name={icon} size={18} color={colors.white} />
      </View>
      <View style={styles.tileText}>
        <Text style={[styles.tileTitle, { color: palette.accent }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.tileSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={palette.accent} />
    </Pressable>
  );
}

type BannerProps = {
  title: string;
  subtitle?: string;
  tone?: ColorTone;
  right?: ReactNode;
};

export function ColorBanner({
  title,
  subtitle,
  tone = 'gold',
  right,
}: BannerProps) {
  const palette = getTonePalette(tone);
  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <View style={styles.bannerLeft}>
        <Text style={[styles.bannerTitle, { color: palette.accent }]}>{title}</Text>
        {subtitle ? <Text style={styles.bannerSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '48%',
    marginBottom: spacing.md,
  },
  box: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 110,
    justifyContent: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  accentBar: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textStrong,
    letterSpacing: 0.2,
  },
  hint: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 68,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { flex: 1 },
  tileTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  tileSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  bannerLeft: { flex: 1 },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  bannerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
