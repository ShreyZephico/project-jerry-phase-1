import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/colors';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

/** Consistent screen title block — aligned across all app screens. */
export function ScreenHeader({ title, subtitle, right }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  textCol: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.brandTitle,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  right: {
    paddingTop: 4,
  },
});
