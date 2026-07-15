import { StyleSheet, Text, View } from 'react-native';

import { SectionHeader, StatusBadge } from '@/components/ui/ContentBlocks';
import { ColorBox, ColorBoxGrid } from '@/components/ui/ColorBoxes';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors, spacing } from '@/constants/colors';
import { formatGrams } from '@/utils/format';
import type { Customer } from '@/types/app';

type Props = {
  customer: Customer;
  showAdminMeta?: boolean;
};

export function CustomerProfileSummary({
  customer,
  showAdminMeta = false,
}: Props) {
  return (
    <View style={styles.wrap}>
      <GlassCard contentStyle={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.fullName.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{customer.fullName}</Text>
        <Text style={styles.meta}>{customer.phone}</Text>
        <Text style={styles.meta}>{customer.email}</Text>
        <View style={styles.badgeRow}>
          <StatusBadge
            label={customer.status.replace('_', ' ')}
            tone={customer.status === 'active' ? 'success' : 'warning'}
          />
          {showAdminMeta ? (
            <StatusBadge
              label={`KYC ${customer.kycStatus}`}
              tone={customer.kycStatus === 'verified' ? 'success' : 'warning'}
            />
          ) : null}
        </View>
      </GlassCard>

      <SectionHeader title="Wallet summary" />
      <ColorBoxGrid>
        <ColorBox
          label="Gold"
          value={formatGrams(customer.goldBalanceGrams)}
          tone="gold"
        />
        <ColorBox
          label="Silver"
          value={formatGrams(customer.silverBalanceGrams, 2)}
          tone="silver"
        />
      </ColorBoxGrid>

      <SectionHeader title="Contact & address" />
      <GlassCard>
        <InfoRow label="Address" value={customer.address || '—'} />
        <InfoRow label="City" value={customer.city || '—'} />
        <InfoRow label="State" value={customer.state || '—'} />
        <InfoRow label="Pincode" value={customer.pincode || '—'} />
        {customer.pan ? <InfoRow label="PAN" value={customer.pan} /> : null}
        {showAdminMeta && customer.notes ? (
          <InfoRow label="Notes" value={customer.notes} />
        ) : null}
      </GlassCard>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  hero: {
    alignItems: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.boxGoldBg,
    borderWidth: 1.5,
    borderColor: colors.boxGoldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.boxGoldAccent },
  name: { fontSize: 22, fontWeight: '800', color: colors.brandTitle },
  meta: { marginTop: 4, fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  infoRow: { marginBottom: spacing.md },
  infoLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  infoValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textBody,
  },
});
