import { StyleSheet, Text, View } from 'react-native';

import { ColorBox } from '@/components/ui/ColorBoxes';
import { GlassCard } from '@/components/ui/GlassCard';
import { ColorTone, colors, radius, spacing } from '@/constants/colors';

type SectionProps = {
  title: string;
  subtitle?: string;
  right?: string;
};

export function SectionHeader({ title, subtitle, right }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLeft}>
        <View style={styles.titleRow}>
          <View style={styles.titleAccent} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <Text style={styles.sectionRight}>{right}</Text> : null}
    </View>
  );
}

type CardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?:
    | ColorTone
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info';
};

const legacyToneMap: Record<string, ColorTone> = {
  default: 'gold',
  success: 'green',
  warning: 'amber',
  danger: 'rose',
  info: 'blue',
};

export function StatCard({
  label,
  value,
  hint,
  tone = 'gold',
}: CardProps) {
  const mapped = (legacyToneMap[tone] ?? tone) as ColorTone;

  return (
    <ColorBox label={label} value={value} hint={hint} tone={mapped} />
  );
}

export function SummaryCard(props: CardProps) {
  return <StatCard {...props} />;
}

type EmptyProps = {
  title: string;
  message?: string;
};

export function EmptyState({ title, message }: EmptyProps) {
  return (
    <GlassCard contentStyle={styles.empty}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>○</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
    </GlassCard>
  );
}

type BadgeProps = {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

export function StatusBadge({ label, tone = 'default' }: BadgeProps) {
  return (
    <View style={[styles.badge, badgeTone(tone)]}>
      <Text style={[styles.badgeText, { color: badgeTone(tone).color }]}>
        {label}
      </Text>
    </View>
  );
}

function badgeTone(tone: BadgeProps['tone']) {
  switch (tone) {
    case 'success':
      return {
        backgroundColor: colors.boxGreenBg,
        borderColor: colors.boxGreenBorder,
        color: colors.boxGreenAccent,
      };
    case 'warning':
      return {
        backgroundColor: colors.boxAmberBg,
        borderColor: colors.boxAmberBorder,
        color: colors.boxAmberAccent,
      };
    case 'danger':
      return {
        backgroundColor: colors.boxRoseBg,
        borderColor: colors.boxRoseBorder,
        color: colors.boxRoseAccent,
      };
    case 'info':
      return {
        backgroundColor: colors.boxBlueBg,
        borderColor: colors.boxBlueBorder,
        color: colors.boxBlueAccent,
      };
    default:
      return {
        backgroundColor: colors.boxGoldBg,
        borderColor: colors.boxGoldBorder,
        color: colors.boxGoldAccent,
      };
  }
}

const styles = StyleSheet.create({
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionLeft: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleAccent: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.brandTitle,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.brandTitle,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    marginTop: 4,
    marginLeft: 12,
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionRight: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  empty: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.boxGoldBg,
    borderWidth: 1,
    borderColor: colors.boxGoldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyIconText: {
    fontSize: 18,
    color: colors.boxGoldAccent,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brandTitle,
  },
  emptyMessage: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
});
