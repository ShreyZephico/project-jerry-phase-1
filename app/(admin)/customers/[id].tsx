import { useCallback, useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CustomerProfileSummary } from '@/components/customer/CustomerProfileSummary';
import { EmptyState, SectionHeader } from '@/components/ui/ContentBlocks';
import { TransactionItem } from '@/components/ui/DomainCards';
import { AppButton } from '@/components/ui/FormControls';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/colors';
import { getCustomerById } from '@/services/customerService';
import { getTransactions } from '@/services/transactionService';
import type { Customer, Transaction } from '@/types/app';

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [profile, txns] = await Promise.all([
        getCustomerById(id),
        getTransactions({ customerId: id }),
      ]);
      setCustomer(profile);
      setTransactions(txns.slice(0, 5));
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to load customer.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <ScreenLoader />
      </ScreenContainer>
    );
  }

  if (!customer) {
    return (
      <ScreenContainer>
        <EmptyState title="Customer not found" message="This profile may have been removed." />
        <AppButton title="Go Back" onPress={() => router.back()} variant="secondary" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer onRefresh={load}>
      <SectionHeader title="Customer Profile" subtitle={customer.fullName} />

      <CustomerProfileSummary customer={customer} showAdminMeta />

      <SectionHeader title="Actions" />
      <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
        <AppButton
          title="Adjust Balance"
          onPress={() =>
            router.push(`/(admin)/balance-adjust?customerId=${customer.id}`)
          }
        />
        <AppButton
          title="Edit Customer"
          variant="secondary"
          onPress={() => Alert.alert('Coming soon', 'Edit customer coming soon')}
        />
        <AppButton
          title="View More Transactions"
          variant="secondary"
          onPress={() =>
            Alert.alert(
              'Transactions',
              `Showing latest ${transactions.length}. Full history screen coming soon.`,
            )
          }
        />
      </View>

      <SectionHeader
        title="Recent Transactions"
        right={`${transactions.length}`}
      />
      {transactions.length === 0 ? (
        <EmptyState title="No transactions" message="No activity for this customer yet." />
      ) : (
        transactions.map((item) => <TransactionItem key={item.id} item={item} />)
      )}
    </ScreenContainer>
  );
}
