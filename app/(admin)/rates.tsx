import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useAppAlert } from '@/components/ui/AppAlert';
import { EmptyState, SectionHeader } from '@/components/ui/ContentBlocks';
import { RateCard } from '@/components/ui/DomainCards';
import { AppButton, FormField } from '@/components/ui/FormControls';
import { GlassCard } from '@/components/ui/GlassCard';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { colors, spacing } from '@/constants/colors';
import {
  getCurrentRate,
  getRateHistory,
  updateRate,
} from '@/services/rateService';
import { notifyCustomersRateUpdated } from '@/services/notificationService';
import type { DailyRate } from '@/types/app';
import { formatCurrency, formatDate, todayIsoDate } from '@/utils/format';
import { isPositiveNumber, required } from '@/utils/validation';

type RateForm = {
  date: string;
  gold24k: string;
  gold22k: string;
  silver999: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof RateForm, string>>;

export default function RatesScreen() {
  const { showAlert } = useAppAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<DailyRate | null>(null);
  const [history, setHistory] = useState<DailyRate[]>([]);
  const [form, setForm] = useState<RateForm>({
    date: todayIsoDate(),
    gold24k: '',
    gold22k: '',
    silver999: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [rate, hist] = await Promise.all([getCurrentRate(), getRateHistory()]);
      setCurrent(rate);
      setHistory(hist);
      setForm({
        date: todayIsoDate(),
        gold24k: String(rate.gold24kPerGram),
        gold22k: String(rate.gold22kPerGram),
        silver999: String(rate.silver999PerGram),
        notes: '',
      });
      setErrors({});
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Could not load rates',
        message: err?.message ?? 'Failed to load rates.',
      });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    load();
  }, [load]);

  function setField<K extends keyof RateForm>(key: K, value: RateForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!required(form.date)) next.date = 'Date is required';
    if (!isPositiveNumber(form.gold24k)) next.gold24k = 'Enter a positive rate';
    if (!isPositiveNumber(form.gold22k)) next.gold22k = 'Enter a positive rate';
    if (!isPositiveNumber(form.silver999)) next.silver999 = 'Enter a positive rate';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleUpdate() {
    if (!validate()) {
      showAlert({
        type: 'warning',
        title: 'Check your rates',
        message: 'Please enter valid positive rates for all metals.',
      });
      return;
    }

    try {
      setSaving(true);
      const updated = await updateRate({
        date: form.date.trim(),
        gold24kPerGram: Number(form.gold24k),
        gold22kPerGram: Number(form.gold22k),
        silver999PerGram: Number(form.silver999),
        notes: form.notes.trim() || undefined,
      });
      setCurrent(updated);
      const hist = await getRateHistory();
      setHistory(hist);

      const pushResult = await notifyCustomersRateUpdated(updated);

      showAlert({
        type: 'success',
        title: 'Rates updated',
        message: pushResult.expoGo
          ? "Today's rates saved. Push to all customers needs a Development Build (not Expo Go)."
          : pushResult.sent > 0
            ? `Today's rates are live. Push sent to ${pushResult.sent} customers.`
            : "Today's rates are live. Customers get push after they open the app on a real build with notification permission.",
        details: [
          { label: 'Date', value: formatDate(updated.date) },
          { label: '24K', value: formatCurrency(updated.gold24kPerGram) },
          { label: '22K', value: formatCurrency(updated.gold22kPerGram) },
          { label: 'Silver', value: formatCurrency(updated.silver999PerGram) },
          { label: 'Push sent', value: String(pushResult.sent) },
        ],
      });
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Update failed',
        message: err?.message ?? 'Failed to update rates.',
      });
    } finally {
      setSaving(false);
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
      <SectionHeader
        title="Daily Rate Management"
        subtitle="Update live metal rates"
      />

      {current ? <RateCard rate={current} /> : null}

      <SectionHeader title="Update Rates" subtitle="YYYY-MM-DD for date" />
      <FormField
        label="Date"
        value={form.date}
        onChangeText={(t) => setField('date', t)}
        placeholder="2026-07-15"
        error={errors.date}
      />
      <FormField
        label="24K Gold (₹/g)"
        value={form.gold24k}
        onChangeText={(t) => setField('gold24k', t)}
        keyboardType="decimal-pad"
        error={errors.gold24k}
      />
      <FormField
        label="22K Gold (₹/g)"
        value={form.gold22k}
        onChangeText={(t) => setField('gold22k', t)}
        keyboardType="decimal-pad"
        error={errors.gold22k}
      />
      <FormField
        label="Silver 999 (₹/g)"
        value={form.silver999}
        onChangeText={(t) => setField('silver999', t)}
        keyboardType="decimal-pad"
        error={errors.silver999}
      />
      <FormField
        label="Notes"
        value={form.notes}
        onChangeText={(t) => setField('notes', t)}
        placeholder="Optional note"
      />
      <AppButton
        title={saving ? 'Updating...' : 'Update Rates'}
        onPress={handleUpdate}
        disabled={saving}
      />

      <SectionHeader title="Rate History" right={`${history.length} entries`} />
      {history.length === 0 ? (
        <EmptyState title="No history" message="Updated rates will appear here." />
      ) : (
        history.map((item) => (
          <GlassCard key={item.id}>
            <Text style={styles.historyTitle}>{formatDate(item.date)}</Text>
            <Text style={styles.historyMeta}>
              24K {formatCurrency(item.gold24kPerGram)} · 22K{' '}
              {formatCurrency(item.gold22kPerGram)} · Silver{' '}
              {formatCurrency(item.silver999PerGram)}
            </Text>
            {item.notes ? <Text style={styles.historyNotes}>{item.notes}</Text> : null}
          </GlassCard>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandTitle,
  },
  historyMeta: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textMuted,
  },
  historyNotes: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
