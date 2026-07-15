import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  ActionTile,
  ColorBanner,
  ColorBox,
  ColorBoxGrid,
} from '@/components/ui/ColorBoxes';
import { SectionHeader } from '@/components/ui/ContentBlocks';
import { RateCard, TransactionItem } from '@/components/ui/DomainCards';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { colors, spacing } from '@/constants/colors';
import { labels } from '@/constants/labels';
import { getMyProfile } from '@/services/profileService';
import { getCustomerById, getCustomers } from '@/services/customerService';
import { getCurrentRate } from '@/services/rateService';
import { getTransactions } from '@/services/transactionService';
import {
  estimateMetalValue,
  formatCurrency,
  formatGrams,
} from '@/utils/format';
import type { Customer, DailyRate, Transaction, UserProfile } from '@/types/app';

const MOCK_CUSTOMER_ID = 'cust-1';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authProfile, setAuthProfile] = useState<UserProfile | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rate, setRate] = useState<DailyRate | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const profile = await getMyProfile();
      setAuthProfile(profile);

      let wallet = await getCustomerById(MOCK_CUSTOMER_ID);
      if (!wallet) {
        const all = await getCustomers();
        wallet = all[0] ?? null;
      }

      const [currentRate, txns] = await Promise.all([
        getCurrentRate(),
        getTransactions({ customerId: wallet?.id ?? MOCK_CUSTOMER_ID }),
      ]);

      setCustomer(wallet);
      setRate(currentRate);
      setRecent(txns.slice(0, 3));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading && !customer) {
    return (
      <ScreenContainer scroll={false}>
        <ScreenLoader />
      </ScreenContainer>
    );
  }

  const goldValue = estimateMetalValue(
    customer?.goldBalanceGrams ?? 0,
    rate?.gold24kPerGram ?? 0,
  );
  const silverValue = estimateMetalValue(
    customer?.silverBalanceGrams ?? 0,
    rate?.silver999PerGram ?? 0,
  );
  const greetName =
    authProfile?.fullName?.split(' ')[0] ||
    customer?.fullName?.split(' ')[0] ||
    'there';

  return (
    <ScreenContainer
      refreshing={refreshing}
      onRefresh={() => load(true)}
    >
      <ScreenHeader
        title={`Hello, ${greetName}`}
        subtitle={`Welcome to ${labels.appName} · ${labels.brandName}`}
      />

      <ColorBanner
        tone="gold"
        title="Digital metal wallet"
        subtitle="Buy metal from ₹250 · Track grams & value live"
        right={
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>LIVE</Text>
          </View>
        }
      />

      <SectionHeader title="Your balances" subtitle="Current holdings" />
      <ColorBoxGrid>
        <ColorBox
          label="Gold"
          value={formatGrams(customer?.goldBalanceGrams ?? 0)}
          hint={formatCurrency(goldValue)}
          tone="gold"
          onPress={() => router.push('/(customer)/wallet')}
        />
        <ColorBox
          label="Silver"
          value={formatGrams(customer?.silverBalanceGrams ?? 0, 2)}
          hint={formatCurrency(silverValue)}
          tone="silver"
          onPress={() => router.push('/(customer)/wallet')}
        />
        <ColorBox
          label="Portfolio"
          value={formatCurrency(goldValue + silverValue)}
          hint="Estimated value"
          tone="green"
          onPress={() => router.push('/(customer)/wallet')}
        />
        <ColorBox
          label="Min buy"
          value={formatCurrency(labels.minBuyAmount)}
          hint="Gold or Silver"
          tone="amber"
          onPress={() => router.push('/(customer)/buy-gold')}
        />
      </ColorBoxGrid>

      <SectionHeader title="Quick actions" />
      <ActionTile
        title="Buy Metal"
        subtitle="Gold or Silver · pay in ₹ or grams"
        icon="diamond-outline"
        tone="gold"
        onPress={() => router.push('/(customer)/buy-gold')}
      />
      <ActionTile
        title="Open Wallet"
        subtitle="History, filters & estimated value"
        icon="wallet-outline"
        tone="teal"
        onPress={() => router.push('/(customer)/wallet')}
      />
      <ActionTile
        title="My Profile"
        subtitle="Contact details & account settings"
        icon="person-outline"
        tone="blue"
        onPress={() => router.push('/(customer)/profile')}
      />

      {rate ? (
        <>
          <SectionHeader title="Today's rates" />
          <RateCard rate={rate} />
        </>
      ) : null}

      <SectionHeader title="Recent activity" right={`${recent.length}`} />
      {recent.length === 0 ? (
        <ColorBanner
          tone="purple"
          title="No activity yet"
          subtitle="Buy gold or silver to see transactions here"
        />
      ) : (
        recent.map((item) => <TransactionItem key={item.id} item={item} />)
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bannerBadge: {
    backgroundColor: colors.boxGoldAccent,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  bannerBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
