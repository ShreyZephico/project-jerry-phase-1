import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ColorTone, colors, getTonePalette, radius, spacing } from '@/constants/colors';
import type { MetalType, PurchaseMode } from '@/types/app';

type MetalToggleProps = {
  value: MetalType;
  onChange: (metal: MetalType) => void;
};

/** Large Gold / Silver toggle — high contrast for mobile tap targets. */
export function MetalToggle({ value, onChange }: MetalToggleProps) {
  return (
    <View style={styles.toggleTrack}>
      <Pressable
        onPress={() => onChange('gold')}
        style={[
          styles.toggleBtn,
          value === 'gold' && styles.toggleGoldActive,
        ]}
      >
        <Ionicons
          name="diamond"
          size={18}
          color={value === 'gold' ? colors.white : colors.boxGoldAccent}
        />
        <Text
          style={[
            styles.toggleText,
            value === 'gold' && styles.toggleTextActive,
          ]}
        >
          GOLD
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange('silver')}
        style={[
          styles.toggleBtn,
          value === 'silver' && styles.toggleSilverActive,
        ]}
      >
        <Ionicons
          name="ellipse"
          size={18}
          color={value === 'silver' ? colors.white : colors.boxSilverAccent}
        />
        <Text
          style={[
            styles.toggleText,
            value === 'silver' && styles.toggleTextActive,
            value !== 'silver' && { color: colors.boxSilverAccent },
          ]}
        >
          SILVER
        </Text>
      </Pressable>
    </View>
  );
}

type ModeCardProps = {
  mode: PurchaseMode;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: ColorTone;
  onPress: () => void;
};

/** Full-width purchase mode card (By ₹ / By grams). */
export function PurchaseModeCard({
  title,
  subtitle,
  icon,
  tone,
  onPress,
}: ModeCardProps) {
  const palette = getTonePalette(tone);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeCard,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.modeIcon, { backgroundColor: palette.accent }]}>
        <Ionicons name={icon} size={22} color={colors.white} />
      </View>
      <View style={styles.modeText}>
        <Text style={[styles.modeTitle, { color: palette.accent }]}>{title}</Text>
        <Text style={styles.modeSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={palette.accent} />
    </Pressable>
  );
}

type PriceCardProps = {
  title: string;
  price: string;
  hint: string;
  tone: ColorTone;
  selected?: boolean;
  onPress?: () => void;
};

export function MetalPriceCard({
  title,
  price,
  hint,
  tone,
  selected,
  onPress,
}: PriceCardProps) {
  const palette = getTonePalette(tone);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.priceCard,
        {
          backgroundColor: palette.bg,
          borderColor: selected ? palette.accent : palette.border,
          borderWidth: selected ? 2.5 : 1.5,
        },
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      {selected ? (
        <View style={[styles.selectedPill, { backgroundColor: palette.accent }]}>
          <Text style={styles.selectedPillText}>SELECTED</Text>
        </View>
      ) : null}
      <Text style={[styles.priceTitle, { color: palette.accent }]}>{title}</Text>
      <Text style={styles.priceValue}>{price}</Text>
      <Text style={styles.priceHint}>{hint}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    marginBottom: spacing.lg,
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    minHeight: 56,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  toggleGoldActive: {
    backgroundColor: colors.boxGoldAccent,
  },
  toggleSilverActive: {
    backgroundColor: colors.boxSilverAccent,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.boxGoldAccent,
  },
  toggleTextActive: {
    color: colors.white,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 88,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: { flex: 1 },
  modeTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  modeSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    fontWeight: '600',
  },
  priceCard: {
    flex: 1,
    minWidth: '46%',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 120,
    justifyContent: 'center',
  },
  selectedPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  selectedPillText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  priceTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  priceValue: {
    marginTop: spacing.xs,
    fontSize: 20,
    fontWeight: '900',
    color: colors.textStrong,
  },
  priceHint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
