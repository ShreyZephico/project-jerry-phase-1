import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppAlert } from '@/components/ui/AppAlert';
import {
  ColorBanner,
  ColorBox,
  ColorBoxGrid,
} from '@/components/ui/ColorBoxes';
import { SectionHeader } from '@/components/ui/ContentBlocks';
import { AppButton, FormField } from '@/components/ui/FormControls';
import { GlassCard } from '@/components/ui/GlassCard';
import { MetalToggle } from '@/components/ui/PurchaseControls';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { colors, spacing } from '@/constants/colors';
import { labels } from '@/constants/labels';
import { getCurrentRate } from '@/services/rateService';
import { buyMetal } from '@/services/transactionService';
import { notifyPurchaseSuccess } from '@/services/notificationService';
import {
  calculateGramsFromInr,
  calculateInrFromGrams,
  formatCurrency,
  formatGrams,
} from '@/utils/format';
import { isPositiveNumber } from '@/utils/validation';
import type { DailyRate, MetalType, PurchaseMode } from '@/types/app';

const MOCK_CUSTOMER_ID = 'cust-1';

/**
 * Checkout screen — opened from Buy Metal hub with metal + mode params.
 */
export default function BuyCheckoutScreen() {
  const router = useRouter();
  const { showAlert } = useAppAlert();
  const params = useLocalSearchParams<{
    metal?: string;
    mode?: string;
  }>();

  const initialMetal: MetalType =
    params.metal === 'silver' ? 'silver' : 'gold';
  const initialMode: PurchaseMode =
    params.mode === 'grams' ? 'grams' : 'amount';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rate, setRate] = useState<DailyRate | null>(null);
  const [metal, setMetal] = useState<MetalType>(initialMetal);
  const [mode, setMode] = useState<PurchaseMode>(initialMode);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRate(await getCurrentRate());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setMetal(params.metal === 'silver' ? 'silver' : 'gold');
      setMode(params.mode === 'grams' ? 'grams' : 'amount');
      setInputText('');
      setError(undefined);
      load();
    }, [load, params.metal, params.mode]),
  );

  const ratePerGram = useMemo(() => {
    if (!rate) return 0;
    return metal === 'gold' ? rate.gold24kPerGram : rate.silver999PerGram;
  }, [rate, metal]);

  const metalLabel = metal === 'gold' ? 'Gold (24K)' : 'Silver (999)';
  const bannerTone = metal === 'gold' ? 'gold' : 'silver';

  const computed = useMemo(() => {
    if (!rate || !isPositiveNumber(inputText)) {
      return { amountInr: 0, grams: 0 };
    }
    const value = Number(inputText);
    if (mode === 'amount') {
      return {
        amountInr: value,
        grams: calculateGramsFromInr(value, ratePerGram),
      };
    }
    return {
      grams: value,
      amountInr: calculateInrFromGrams(value, ratePerGram),
    };
  }, [inputText, mode, rate, ratePerGram]);

  async function handleBuy() {
    if (!isPositiveNumber(inputText)) {
      setError(
        mode === 'amount'
          ? 'Enter a valid amount in rupees'
          : 'Enter a valid quantity in grams',
      );
      return;
    }

    if (mode === 'amount' && computed.amountInr < labels.minBuyAmount) {
      setError(`Minimum buy amount is ${formatCurrency(labels.minBuyAmount)}`);
      return;
    }

    if (mode === 'grams') {
      if (computed.grams < labels.minBuyGrams) {
        setError(`Minimum quantity is ${labels.minBuyGrams} g`);
        return;
      }
      if (computed.amountInr < labels.minBuyAmount) {
        setError(
          `Value must be at least ${formatCurrency(labels.minBuyAmount)}. Increase grams.`,
        );
        return;
      }
    }

    setError(undefined);
    setSubmitting(true);

    try {
      const txn = await buyMetal({
        customerId: MOCK_CUSTOMER_ID,
        metal,
        mode,
        amountInr: mode === 'amount' ? computed.amountInr : undefined,
        grams: mode === 'grams' ? computed.grams : undefined,
      });

      await notifyPurchaseSuccess(txn);

      setInputText('');
      showAlert({
        type: 'success',
        title: 'Purchase successful',
        message: `Your ${txn.metal} wallet has been updated. Notification sent.`,
        details: [
          {
            label: 'Metal',
            value: txn.metal === 'gold' ? 'Gold (24K)' : 'Silver (999)',
          },
          { label: 'Grams', value: formatGrams(txn.grams) },
          { label: 'Amount', value: formatCurrency(txn.amountInr) },
          { label: 'Rate', value: `${formatCurrency(txn.ratePerGram)}/g` },
        ],
        primaryAction: {
          label: 'View Wallet',
          onPress: () => router.replace('/(customer)/wallet'),
        },
        secondaryAction: {
          label: 'Buy again',
          onPress: () => router.replace('/(customer)/buy-gold'),
        },
      });
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Purchase failed',
        message: err?.message ?? 'Something went wrong. Please try again.',
        primaryAction: { label: 'Try again' },
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !rate) {
    return (
      <ScreenContainer scroll={false}>
        <ScreenLoader />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Pressable
        onPress={() => router.back()}
        style={styles.backRow}
        hitSlop={12}
      >
        <Ionicons name="arrow-back" size={20} color={colors.brandTitle} />
        <Text style={styles.backText}>Back to prices</Text>
      </Pressable>

      <ScreenHeader
        title={mode === 'amount' ? 'Buy in Rupees' : 'Buy in Grams'}
        subtitle={`${metalLabel} · Live rate ${formatCurrency(ratePerGram)}/g`}
      />

      <SectionHeader title="Metal" subtitle="You can still switch here" />
      <MetalToggle
        value={metal}
        onChange={(next) => {
          setMetal(next);
          setInputText('');
          setError(undefined);
        }}
      />

      <SectionHeader title="Purchase mode" />
      <View style={styles.modeSwitch}>
        <Pressable
          onPress={() => {
            setMode('amount');
            setInputText('');
            setError(undefined);
          }}
          style={[
            styles.modeBtn,
            mode === 'amount' && styles.modeBtnActiveAmber,
          ]}
        >
          <Text
            style={[
              styles.modeBtnText,
              mode === 'amount' && styles.modeBtnTextActive,
            ]}
          >
            By ₹ Rupees
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setMode('grams');
            setInputText('');
            setError(undefined);
          }}
          style={[
            styles.modeBtn,
            mode === 'grams' && styles.modeBtnActiveTeal,
          ]}
        >
          <Text
            style={[
              styles.modeBtnText,
              mode === 'grams' && styles.modeBtnTextActive,
            ]}
          >
            By Grams
          </Text>
        </Pressable>
      </View>

      <GlassCard>
        <FormField
          label={mode === 'amount' ? 'Amount in Rupees (₹)' : 'Quantity in Grams (g)'}
          value={inputText}
          onChangeText={(text) => {
            setInputText(text.replace(/[^0-9.]/g, ''));
            setError(undefined);
          }}
          keyboardType="decimal-pad"
          placeholder={
            mode === 'amount'
              ? `Example: ${labels.minBuyAmount}`
              : `Example: 1.5`
          }
          error={error}
        />
      </GlassCard>

      <ColorBanner
        tone={bannerTone}
        title={
          mode === 'amount'
            ? `You get ≈ ${formatGrams(computed.grams)}`
            : `You pay ≈ ${formatCurrency(computed.amountInr)}`
        }
        subtitle={`Live conversion for ${metalLabel}`}
      />

      <SectionHeader title="Order summary" />
      <ColorBoxGrid>
        <ColorBox
          label="Metal"
          value={metal === 'gold' ? 'Gold' : 'Silver'}
          hint={metal === 'gold' ? '24K' : '999'}
          tone={bannerTone}
        />
        <ColorBox
          label="Mode"
          value={mode === 'amount' ? 'By ₹' : 'By g'}
          tone={mode === 'amount' ? 'amber' : 'teal'}
        />
        <ColorBox
          label="You pay"
          value={formatCurrency(computed.amountInr)}
          tone="amber"
        />
        <ColorBox
          label="You receive"
          value={formatGrams(computed.grams)}
          tone="green"
        />
      </ColorBoxGrid>

      <AppButton
        title={
          submitting
            ? 'Processing...'
            : `Confirm Buy ${metal === 'gold' ? 'Gold' : 'Silver'}`
        }
        onPress={handleBuy}
        disabled={submitting}
      />
      <AppButton
        title="Cancel"
        variant="secondary"
        onPress={() => router.back()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.brandTitle,
  },
  modeSwitch: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modeBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  modeBtnActiveAmber: {
    backgroundColor: colors.boxAmberAccent,
    borderColor: colors.boxAmberAccent,
  },
  modeBtnActiveTeal: {
    backgroundColor: colors.boxTealAccent,
    borderColor: colors.boxTealAccent,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textBody,
  },
  modeBtnTextActive: {
    color: colors.white,
  },
});
