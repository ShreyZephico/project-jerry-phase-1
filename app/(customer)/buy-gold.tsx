import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { SectionHeader } from '@/components/ui/ContentBlocks';
import {
  MetalPriceCard,
  MetalToggle,
  PurchaseModeCard,
} from '@/components/ui/PurchaseControls';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { colors, spacing } from '@/constants/colors';
import { labels } from '@/constants/labels';
import { getCurrentRate } from '@/services/rateService';
import { formatCurrency, formatDate } from '@/utils/format';
import type { DailyRate, MetalType } from '@/types/app';

/**
 * Buy Metal HUB
 * - Shows Gold + Silver live prices
 * - Big Gold/Silver toggle
 * - Two clear mode cards → opens checkout screen
 */
export default function BuyMetalHubScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState<DailyRate | null>(null);
  const [metal, setMetal] = useState<MetalType>('gold');

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
      load();
    }, [load]),
  );

  function openCheckout(mode: 'amount' | 'grams') {
    router.push({
      pathname: '/(customer)/buy-checkout',
      params: { metal, mode },
    } as any);
  }

  if (loading || !rate) {
    return (
      <ScreenContainer scroll={false}>
        <ScreenLoader />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer onRefresh={load}>
      <ScreenHeader
        title="Buy Metal"
        subtitle={`Live rates · Min ${formatCurrency(labels.minBuyAmount)}`}
      />

      <SectionHeader
        title="Today's price"
        subtitle={formatDate(rate.date)}
      />
      <View style={styles.priceRow}>
        <MetalPriceCard
          title="Gold 24K"
          price={formatCurrency(rate.gold24kPerGram)}
          hint="per gram"
          tone="gold"
          selected={metal === 'gold'}
          onPress={() => setMetal('gold')}
        />
        <View style={styles.priceGap} />
        <MetalPriceCard
          title="Silver 999"
          price={formatCurrency(rate.silver999PerGram)}
          hint="per gram"
          tone="silver"
          selected={metal === 'silver'}
          onPress={() => setMetal('silver')}
        />
      </View>

      <Text style={styles.alsoRate}>
        Also listed · 22K Gold {formatCurrency(rate.gold22kPerGram)}/g
      </Text>

      <SectionHeader
        title="Select metal"
        subtitle="Tap Gold or Silver"
      />
      <MetalToggle value={metal} onChange={setMetal} />

      <View
        style={[
          styles.selectionBanner,
          metal === 'gold' ? styles.bannerGold : styles.bannerSilver,
        ]}
      >
        <Text style={styles.selectionBannerText}>
          Buying: {metal === 'gold' ? 'GOLD (24K)' : 'SILVER (999)'}
        </Text>
        <Text style={styles.selectionBannerSub}>
          Rate {formatCurrency(
            metal === 'gold' ? rate.gold24kPerGram : rate.silver999PerGram,
          )}
          /g
        </Text>
      </View>

      <SectionHeader
        title="How do you want to buy?"
        subtitle="Opens on next screen"
      />
      <PurchaseModeCard
        mode="amount"
        title="Buy in Rupees (₹)"
        subtitle={`Enter amount in ₹ · get grams · min ${formatCurrency(labels.minBuyAmount)}`}
        icon="cash-outline"
        tone="amber"
        onPress={() => openCheckout('amount')}
      />
      <PurchaseModeCard
        mode="grams"
        title="Buy in Grams (g)"
        subtitle={`Enter grams · pay calculated ₹ · min ${labels.minBuyGrams} g`}
        icon="scale-outline"
        tone="teal"
        onPress={() => openCheckout('grams')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  priceRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  priceGap: { width: spacing.md },
  alsoRate: {
    marginBottom: spacing.lg,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  selectionBanner: {
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
  },
  bannerGold: {
    backgroundColor: colors.boxGoldBg,
    borderColor: colors.boxGoldBorder,
  },
  bannerSilver: {
    backgroundColor: colors.boxSilverBg,
    borderColor: colors.boxSilverBorder,
  },
  selectionBannerText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textStrong,
    letterSpacing: 0.4,
  },
  selectionBannerSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
