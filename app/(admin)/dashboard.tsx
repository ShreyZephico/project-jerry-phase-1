import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import {
  ActionTile,
  ColorBox,
  ColorBoxGrid,
} from '@/components/ui/ColorBoxes';
import { SectionHeader } from '@/components/ui/ContentBlocks';
import { RateCard, TransactionItem } from '@/components/ui/DomainCards';
import { AppButton } from '@/components/ui/FormControls';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/colors';
import { labels } from '@/constants/labels';
import { supabase } from '@/lib/supabase';
import { getDashboardStats } from '@/services/dashboardService';
import { getCurrentRate } from '@/services/rateService';
import { getTransactions } from '@/services/transactionService';
import type { DailyRate, DashboardStats, Transaction } from '@/types/app';
import { formatCurrency, formatGrams } from '@/utils/format';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rate, setRate] = useState<DailyRate | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [dash, currentRate, txns] = await Promise.all([
        getDashboardStats(),
        getCurrentRate(),
        getTransactions(),
      ]);
      setStats(dash);
      setRate(currentRate);
      setTransactions(txns.slice(0, 5));
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Sign out failed', error.message);
        return;
      }
      router.replace('/(auth)/sign-in');
    } catch (err: any) {
      Alert.alert('Sign out failed', err?.message ?? 'Something went wrong.');
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <ScreenLoader />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer onRefresh={load}>
      <ScreenHeader
        title={`${labels.brandName} Admin`}
        subtitle="Collections, metals & customers at a glance"
      />

      {stats ? (
        <>
          <SectionHeader title="Collections" />
          <ColorBoxGrid>
            <ColorBox
              label="Today"
              value={formatCurrency(stats.todayCollection)}
              hint="INR collected"
              tone="green"
            />
            <ColorBox
              label="This week"
              value={formatCurrency(stats.weeklyCollection)}
              tone="teal"
            />
            <ColorBox
              label="This month"
              value={formatCurrency(stats.monthlyCollection)}
              tone="blue"
            />
            <ColorBox
              label="Customers"
              value={String(stats.totalCustomers)}
              hint={`${stats.activeCustomers} active`}
              tone="purple"
            />
          </ColorBoxGrid>

          <SectionHeader title="Metal locked" />
          <ColorBoxGrid>
            <ColorBox
              label="Gold locked"
              value={formatGrams(stats.totalGoldLocked)}
              tone="gold"
            />
            <ColorBox
              label="Silver locked"
              value={formatGrams(stats.totalSilverLocked, 2)}
              tone="silver"
            />
          </ColorBoxGrid>
        </>
      ) : null}

      <SectionHeader title="Live rates" />
      {rate ? <RateCard rate={rate} /> : null}

      <SectionHeader title="Quick actions" />
      <ActionTile
        title="Customers"
        subtitle="Search, KYC status & balances"
        icon="people-outline"
        tone="blue"
        onPress={() => router.push('/(admin)/customers')}
      />
      <ActionTile
        title="Add customer"
        subtitle="Create a new wallet account"
        icon="person-add-outline"
        tone="teal"
        onPress={() => router.push('/(admin)/customers/create')}
      />
      <ActionTile
        title="Daily rates"
        subtitle="Update 24K / 22K / silver"
        icon="pricetag-outline"
        tone="gold"
        onPress={() => router.push('/(admin)/rates')}
      />
      <ActionTile
        title="Collection reports"
        subtitle="Daily, weekly, monthly & custom"
        icon="bar-chart-outline"
        tone="amber"
        onPress={() => router.push('/(admin)/reports')}
      />
      <ActionTile
        title="Company profile"
        subtitle="Legal, GST & support contacts"
        icon="business-outline"
        tone="purple"
        onPress={() => router.push('/(admin)/company')}
      />
      <ActionTile
        title="Customer app"
        subtitle="Preview Jerry wallet experience"
        icon="phone-portrait-outline"
        tone="rose"
        onPress={() => router.push('/(customer)/home')}
      />

      <SectionHeader
        title="Recent transactions"
        right={`${transactions.length} shown`}
      />
      {transactions.map((item) => (
        <TransactionItem key={item.id} item={item} />
      ))}

      <AppButton
        title={signingOut ? 'Signing Out...' : 'Sign Out'}
        onPress={handleSignOut}
        disabled={signingOut}
        variant="danger"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  spacer: { height: spacing.sm },
});
