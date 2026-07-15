import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { useAppAlert } from '@/components/ui/AppAlert';
import { CustomerProfileSummary } from '@/components/customer/CustomerProfileSummary';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { EmptyState, SectionHeader } from '@/components/ui/ContentBlocks';
import { TransactionItem } from '@/components/ui/DomainCards';
import { AppButton } from '@/components/ui/FormControls';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { getCustomerById, getCustomers } from '@/services/customerService';
import { getMyProfile } from '@/services/profileService';
import { getTransactions } from '@/services/transactionService';
import type { AppRole, Customer, Transaction } from '@/types/app';

const MOCK_CUSTOMER_ID = 'cust-1';

export default function ProfileScreen() {
  const router = useRouter();
  const { showAlert } = useAppAlert();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [role, setRole] = useState<AppRole>('customer');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const authProfile = await getMyProfile();
      setRole(authProfile?.role ?? 'customer');

      let profile = await getCustomerById(MOCK_CUSTOMER_ID);
      if (!profile) {
        const all = await getCustomers();
        profile = all[0] ?? null;
      }

      if (!profile) {
        setCustomer(null);
        setRecent([]);
        return;
      }

      const txns = await getTransactions({ customerId: profile.id });
      setCustomer(profile);
      setRecent(txns.slice(0, 3));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleEditProfile() {
    showAlert({
      type: 'info',
      title: 'Coming soon',
      message: 'Profile editing will be available in the next update.',
    });
  }

  async function handleSignOut() {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        showAlert({
          type: 'error',
          title: 'Sign out failed',
          message: error.message,
        });
        return;
      }
      router.replace('/(auth)/sign-in');
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Sign out failed',
        message: err?.message ?? 'Something went wrong.',
      });
    } finally {
      setSigningOut(false);
    }
  }

  if (loading && !customer) {
    return (
      <ScreenContainer scroll={false}>
        <ScreenLoader />
      </ScreenContainer>
    );
  }

  if (!customer) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Customer not found"
          message="Unable to load mock customer cust-1."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Profile"
        subtitle="Manage your Jerry account"
      />

      <CustomerProfileSummary customer={customer} showAdminMeta={false} />

      <SectionHeader title="Recent transactions" />
      {recent.length === 0 ? (
        <EmptyState
          title="No recent activity"
          message="Your latest transactions will appear here."
        />
      ) : (
        recent.map((item) => <TransactionItem key={item.id} item={item} />)
      )}

      <AppButton title="Edit Profile" onPress={handleEditProfile} />
      {role === 'admin' ? (
        <AppButton
          title="Open Admin Dashboard"
          variant="secondary"
          onPress={() => router.replace('/(admin)/dashboard')}
        />
      ) : null}
      <AppButton
        title={signingOut ? 'Signing Out...' : 'Sign Out'}
        variant="danger"
        onPress={handleSignOut}
        disabled={signingOut}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  spacer: { height: spacing.sm },
});
