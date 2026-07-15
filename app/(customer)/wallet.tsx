import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  ActionTile,
  ColorBanner,
  ColorBox,
  ColorBoxGrid,
} from '@/components/ui/ColorBoxes';
import {
  EmptyState,
  SectionHeader,
} from '@/components/ui/ContentBlocks';
import { TransactionItem } from '@/components/ui/DomainCards';
import { FilterChipGroup } from '@/components/ui/FormControls';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/colors';
import { walletTabs } from '@/constants/labels';
import { getCustomerById, getCustomers } from '@/services/customerService';
import { getCurrentRate } from '@/services/rateService';
import { getTransactions } from '@/services/transactionService';
import {
  estimateMetalValue,
  formatCurrency,
  formatGrams,
} from '@/utils/format';
import type { Customer, DailyRate, MetalType, Transaction } from '@/types/app';

const MOCK_CUSTOMER_ID = 'cust-1';

export default function WalletScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rate, setRate] = useState<DailyRate | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metalFilter, setMetalFilter] = useState<'all' | MetalType>('all');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let profile = await getCustomerById(MOCK_CUSTOMER_ID);
      if (!profile) {
        const all = await getCustomers();
        profile = all[0] ?? null;
      }

      const customerId = profile?.id ?? MOCK_CUSTOMER_ID;
      const [currentRate, txns] = await Promise.all([
        getCurrentRate(),
        getTransactions({ customerId, metal: metalFilter }),
      ]);

      setCustomer(profile);
      setRate(currentRate);
      setTransactions(txns);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [metalFilter]);

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
  const totalValue = goldValue + silverValue;

  return (
    <ScreenContainer
      refreshing={refreshing}
      onRefresh={() => load(true)}
    >
      <ScreenHeader
        title="Wallet"
        subtitle="Gold & silver locked in your account"
      />

      <ColorBoxGrid>
        <ColorBox
          label="Gold locked"
          value={formatGrams(customer?.goldBalanceGrams ?? 0)}
          hint={formatCurrency(goldValue)}
          tone="gold"
        />
        <ColorBox
          label="Silver locked"
          value={formatGrams(customer?.silverBalanceGrams ?? 0, 2)}
          hint={formatCurrency(silverValue)}
          tone="silver"
        />
      </ColorBoxGrid>

      <ColorBanner
        tone="green"
        title={formatCurrency(totalValue)}
        subtitle="Estimated portfolio value at today's rate"
      />

      <ActionTile
        title="Buy Metal now"
        subtitle="Gold or Silver · ₹ or grams"
        icon="flash-outline"
        tone="amber"
        onPress={() => router.push('/(customer)/buy-gold')}
      />

      <SectionHeader title="Transactions" subtitle="Pull down to refresh" />
      <FilterChipGroup
        options={walletTabs}
        value={metalFilter}
        onChange={(key) => setMetalFilter(key as 'all' | MetalType)}
      />

      {transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message="Buy gold to see your activity here."
        />
      ) : (
        transactions.map((item) => (
          <TransactionItem key={item.id} item={item} />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // reserved for local overrides
  spacer: { height: spacing.sm },
});
