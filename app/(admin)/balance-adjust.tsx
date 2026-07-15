import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppAlert } from '@/components/ui/AppAlert';
import { SectionHeader } from '@/components/ui/ContentBlocks';
import {
  AppButton,
  FilterChipGroup,
  FormField,
} from '@/components/ui/FormControls';
import { GlassCard } from '@/components/ui/GlassCard';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { colors, radius, spacing } from '@/constants/colors';
import { adjustmentTypes, metalOptions } from '@/constants/labels';
import {
  adjustCustomerBalance,
  getCustomerById,
} from '@/services/customerService';
import { getCurrentRate } from '@/services/rateService';
import { createAdjustmentTransaction } from '@/services/transactionService';
import type { AdjustmentType, Customer, MetalType } from '@/types/app';
import { formatGrams } from '@/utils/format';
import { isPositiveNumber, required } from '@/utils/validation';

export default function BalanceAdjustScreen() {
  const router = useRouter();
  const { showAlert } = useAppAlert();
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [metal, setMetal] = useState<MetalType>('gold');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('credit');
  const [grams, setGrams] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ grams?: string; reason?: string }>({});

  const load = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const profile = await getCustomerById(customerId);
      setCustomer(profile);
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Could not load',
        message: err?.message ?? 'Failed to load customer.',
      });
    } finally {
      setLoading(false);
    }
  }, [customerId, showAlert]);

  useEffect(() => {
    load();
  }, [load]);

  const currentBalance = useMemo(() => {
    if (!customer) return 0;
    return metal === 'gold'
      ? customer.goldBalanceGrams
      : customer.silverBalanceGrams;
  }, [customer, metal]);

  const gramsNum = Number(grams);
  const previewBalance = useMemo(() => {
    if (!isPositiveNumber(grams)) return currentBalance;
    return adjustmentType === 'credit'
      ? currentBalance + gramsNum
      : currentBalance - gramsNum;
  }, [adjustmentType, currentBalance, grams, gramsNum]);

  function validate(): boolean {
    const next: { grams?: string; reason?: string } = {};
    if (!isPositiveNumber(grams)) next.grams = 'Enter a positive gram amount';
    if (!required(reason)) next.reason = 'Reason is required';
    if (
      adjustmentType === 'debit' &&
      isPositiveNumber(grams) &&
      gramsNum > currentBalance
    ) {
      next.grams = 'Cannot debit more than available balance';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!customer || !customerId) {
      showAlert({
        type: 'error',
        title: 'Missing customer',
        message: 'Open this screen from a customer profile.',
      });
      return;
    }
    if (!validate()) {
      showAlert({
        type: 'warning',
        title: 'Check fields',
        message: 'Please fix the highlighted fields.',
      });
      return;
    }

    const run = async () => {
      try {
        setSaving(true);
        const rate = await getCurrentRate();
        const ratePerGram =
          metal === 'gold' ? rate.gold24kPerGram : rate.silver999PerGram;

        const updated = await adjustCustomerBalance(
          customerId,
          metal,
          adjustmentType,
          gramsNum,
        );

        await createAdjustmentTransaction({
          customerId,
          customerName: customer.fullName,
          metal,
          type: adjustmentType,
          grams: gramsNum,
          ratePerGram,
          notes: [reason.trim(), notes.trim()].filter(Boolean).join(' · '),
        });

        setCustomer(updated);
        showAlert({
          type: 'success',
          title: 'Balance updated',
          message: `${customer.fullName}'s ${metal} wallet was adjusted.`,
          details: [
            {
              label: 'Type',
              value: adjustmentType === 'credit' ? 'Credit' : 'Debit',
            },
            { label: 'Metal', value: metal === 'gold' ? 'Gold' : 'Silver' },
            { label: 'Grams', value: formatGrams(gramsNum) },
            {
              label: 'New balance',
              value: formatGrams(
                metal === 'gold'
                  ? updated.goldBalanceGrams
                  : updated.silverBalanceGrams,
              ),
            },
          ],
          primaryAction: {
            label: 'Done',
            onPress: () => router.back(),
          },
        });
      } catch (err: any) {
        showAlert({
          type: 'error',
          title: 'Adjustment failed',
          message: err?.message ?? 'Failed to adjust balance.',
        });
      } finally {
        setSaving(false);
      }
    };

    if (adjustmentType === 'debit') {
      showAlert({
        type: 'warning',
        title: 'Confirm debit',
        message: `This will deduct ${formatGrams(gramsNum)} of ${metal} from ${customer.fullName}.`,
        primaryAction: {
          label: 'Confirm debit',
          onPress: () => {
            void run();
          },
        },
        secondaryAction: { label: 'Cancel' },
      });
      return;
    }

    await run();
  }

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <ScreenLoader />
      </ScreenContainer>
    );
  }

  if (!customerId || !customer) {
    return (
      <ScreenContainer>
        <SectionHeader title="Balance Adjustment" />
        <Text style={styles.warn}>No customer selected.</Text>
        <AppButton title="Go Back" onPress={() => router.back()} variant="secondary" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <SectionHeader
        title="Balance Adjustment"
        subtitle={customer.fullName}
      />

      <GlassCard>
        <Text style={styles.previewLabel}>Current {metal} balance</Text>
        <Text style={styles.previewValue}>{formatGrams(currentBalance)}</Text>
        <Text style={styles.previewHint}>
          After {adjustmentType}: {formatGrams(Math.max(previewBalance, 0))}
        </Text>
      </GlassCard>

      <Text style={styles.fieldLabel}>Metal</Text>
      <FilterChipGroup
        options={metalOptions}
        value={metal}
        onChange={(key) => setMetal(key as MetalType)}
      />

      <Text style={styles.fieldLabel}>Adjustment Type</Text>
      <FilterChipGroup
        options={adjustmentTypes}
        value={adjustmentType}
        onChange={(key) => setAdjustmentType(key as AdjustmentType)}
      />

      {adjustmentType === 'debit' ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Debit will permanently reduce the customer wallet balance. Confirm
            carefully before submitting.
          </Text>
        </View>
      ) : null}

      <FormField
        label="Grams"
        value={grams}
        onChangeText={setGrams}
        keyboardType="decimal-pad"
        error={errors.grams}
      />
      <FormField
        label="Reason"
        value={reason}
        onChangeText={setReason}
        placeholder="e.g. Manual correction"
        error={errors.reason}
      />
      <FormField
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional"
        multiline
        style={styles.multiline}
      />

      <AppButton
        title={saving ? 'Saving...' : 'Submit Adjustment'}
        onPress={handleSubmit}
        disabled={saving}
        variant={adjustmentType === 'debit' ? 'danger' : 'primary'}
      />
      <AppButton title="Cancel" onPress={() => router.back()} variant="secondary" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandTitle,
    marginBottom: spacing.sm,
  },
  previewLabel: { fontSize: 12, color: colors.textMuted },
  previewValue: {
    marginTop: spacing.xs,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textStrong,
  },
  previewHint: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandTitle,
  },
  warningBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  warn: {
    color: colors.danger,
    marginBottom: spacing.lg,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
});
