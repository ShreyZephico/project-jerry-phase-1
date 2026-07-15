import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/ContentBlocks';
import { ColorBox, ColorBoxGrid } from '@/components/ui/ColorBoxes';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors, radius, spacing } from '@/constants/colors';
import { formatCurrency, formatDate, formatGrams } from '@/utils/format';
import type { Customer, DailyRate, Transaction } from '@/types/app';

export function RateCard({ rate }: { rate: DailyRate }) {
  return (
    <View style={styles.rateWrap}>
      <Text style={styles.rateHeading}>
        Today&apos;s live rates · {formatDate(rate.date)}
      </Text>
      <ColorBoxGrid>
        <ColorBox
          label="24K Gold"
          value={formatCurrency(rate.gold24kPerGram)}
          hint="per gram"
          tone="gold"
        />
        <ColorBox
          label="22K Gold"
          value={formatCurrency(rate.gold22kPerGram)}
          hint="per gram"
          tone="amber"
        />
        <ColorBox
          label="Silver 999"
          value={formatCurrency(rate.silver999PerGram)}
          hint="per gram"
          tone="silver"
        />
        <ColorBox
          label="Valid for"
          value={formatDate(rate.date)}
          hint={rate.notes || 'Market day rate'}
          tone="teal"
        />
      </ColorBoxGrid>
    </View>
  );
}

export function CustomerListCard({
  customer,
  onPress,
  onAdjust,
}: {
  customer: Customer;
  onPress: () => void;
  onAdjust?: () => void;
}) {
  const tone =
    customer.status === 'active'
      ? 'success'
      : customer.status === 'inactive'
        ? 'danger'
        : 'warning';

  return (
    <GlassCard onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.fullName.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{customer.fullName}</Text>
          <Text style={styles.meta}>{customer.phone}</Text>
          <Text style={styles.meta}>{customer.email}</Text>
        </View>
        <StatusBadge label={customer.status.replace('_', ' ')} tone={tone} />
      </View>
      <View style={styles.miniRow}>
        <View style={[styles.miniChip, styles.miniGold]}>
          <Text style={styles.miniLabel}>Gold</Text>
          <Text style={styles.miniValue}>
            {formatGrams(customer.goldBalanceGrams)}
          </Text>
        </View>
        <View style={[styles.miniChip, styles.miniSilver]}>
          <Text style={styles.miniLabel}>Silver</Text>
          <Text style={styles.miniValue}>
            {formatGrams(customer.silverBalanceGrams, 2)}
          </Text>
        </View>
      </View>
      {customer.lastTransactionAt ? (
        <Text style={styles.notes}>
          Last txn · {formatDate(customer.lastTransactionAt)}
        </Text>
      ) : null}
      {onAdjust ? (
        <Pressable onPress={onAdjust} style={styles.linkBtn}>
          <Text style={styles.linkText}>Adjust Balance</Text>
        </Pressable>
      ) : null}
    </GlassCard>
  );
}

export function TransactionItem({ item }: { item: Transaction }) {
  const metalBg =
    item.metal === 'gold' ? colors.boxGoldBg : colors.boxSilverBg;
  const metalBorder =
    item.metal === 'gold' ? colors.boxGoldBorder : colors.boxSilverBorder;
  const metalAccent =
    item.metal === 'gold' ? colors.boxGoldAccent : colors.boxSilverAccent;

  return (
    <GlassCard>
      <View style={styles.headerRow}>
        <View style={[styles.txnBadge, { backgroundColor: metalBg, borderColor: metalBorder }]}>
          <Text style={[styles.txnBadgeText, { color: metalAccent }]}>
            {item.metal.toUpperCase()}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>
            {item.type.toUpperCase()}
          </Text>
          <Text style={styles.meta}>{item.customerName}</Text>
        </View>
        <StatusBadge
          label={item.status}
          tone={
            item.status === 'success'
              ? 'success'
              : item.status === 'pending'
                ? 'warning'
                : 'danger'
          }
        />
      </View>
      <View style={styles.balanceRow}>
        <View>
          <Text style={styles.meta}>Grams</Text>
          <Text style={styles.value}>{formatGrams(item.grams)}</Text>
        </View>
        <View style={styles.alignEnd}>
          <Text style={styles.meta}>Amount</Text>
          <Text style={styles.value}>{formatCurrency(item.amountInr)}</Text>
        </View>
      </View>
      <Text style={styles.notes}>
        Rate {formatCurrency(item.ratePerGram)}/g · {formatDate(item.createdAt)}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  rateWrap: { marginBottom: spacing.sm },
  rateHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.brandTitle,
    marginBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  alignEnd: { alignItems: 'flex-end' },
  meta: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  value: { fontSize: 15, fontWeight: '800', color: colors.textStrong, marginTop: 2 },
  notes: { marginTop: spacing.sm, fontSize: 12, color: colors.textSecondary },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.boxGoldBg,
    borderWidth: 1,
    borderColor: colors.boxGoldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.boxGoldAccent, fontWeight: '800', fontSize: 16 },
  flex: { flex: 1 },
  linkBtn: { marginTop: spacing.md },
  linkText: { color: colors.brandTitle, fontWeight: '800', fontSize: 13 },
  miniRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  miniChip: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  miniGold: {
    backgroundColor: colors.boxGoldBg,
    borderColor: colors.boxGoldBorder,
  },
  miniSilver: {
    backgroundColor: colors.boxSilverBg,
    borderColor: colors.boxSilverBorder,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  miniValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '800',
    color: colors.textStrong,
  },
  txnBadge: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  txnBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
