import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState, SectionHeader } from '@/components/ui/ContentBlocks';
import { CustomerListCard } from '@/components/ui/DomainCards';
import {
  AppButton,
  FilterChipGroup,
  SearchBar,
} from '@/components/ui/FormControls';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { statusOptions } from '@/constants/labels';
import { getCustomers } from '@/services/customerService';
import type { Customer, UserStatus } from '@/types/app';

export default function CustomersIndexScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getCustomers();
      setCustomers(list);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      const statusOk =
        status === 'all' ||
        c.status === (status as UserStatus) ||
        (status === 'kyc_pending' && c.kycStatus === 'pending');
      if (!statusOk) return false;
      if (!q) return true;
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    });
  }, [customers, search, status]);

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <ScreenLoader />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer onRefresh={load}>
      <SectionHeader
        title="Customers"
        subtitle="Search and manage wallets"
        right={`${filtered.length}`}
      />

      <AppButton
        title="Create Customer"
        onPress={() => router.push('/(admin)/customers/create')}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search name, phone, email"
      />

      <FilterChipGroup
        options={statusOptions}
        value={status}
        onChange={setStatus}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No customers found"
          message="Try a different search or create a new customer."
        />
      ) : (
        filtered.map((customer) => (
          <CustomerListCard
            key={customer.id}
            customer={customer}
            onPress={() => router.push(`/(admin)/customers/${customer.id}`)}
            onAdjust={() =>
              router.push(`/(admin)/balance-adjust?customerId=${customer.id}`)
            }
          />
        ))
      )}
    </ScreenContainer>
  );
}
