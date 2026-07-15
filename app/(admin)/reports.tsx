import { useCallback, useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import {
  EmptyState,
  SectionHeader,
  StatCard,
} from '@/components/ui/ContentBlocks';
import { TransactionItem } from '@/components/ui/DomainCards';
import {
  AppButton,
  FilterChipGroup,
  FormField,
} from '@/components/ui/FormControls';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { spacing } from '@/constants/colors';
import { reportRanges } from '@/constants/labels';
import { getCollectionReport } from '@/services/dashboardService';
import type { CollectionReport, ReportRange } from '@/types/app';
import { formatCurrency, formatDate, formatGrams } from '@/utils/format';

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<ReportRange>('daily');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [report, setReport] = useState<CollectionReport | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      if (range === 'custom' && (!fromDate.trim() || !toDate.trim())) {
        setReport(null);
        setLoading(false);
        return;
      }
      const data = await getCollectionReport({
        range,
        fromDate: fromDate.trim() || undefined,
        toDate: toDate.trim() || undefined,
      });
      setReport(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  }, [range, fromDate, toDate]);

  useEffect(() => {
    load();
  }, [load]);

  function handleExport() {
    Alert.alert('Export', 'Export coming soon');
  }

  return (
    <ScreenContainer onRefresh={load}>
      <SectionHeader
        title="Collection Reports"
        subtitle="Filter by period and review totals"
      />

      <FilterChipGroup
        options={reportRanges}
        value={range}
        onChange={(key) => setRange(key as ReportRange)}
      />

      {range === 'custom' ? (
        <View>
          <FormField
            label="From Date"
            value={fromDate}
            onChangeText={setFromDate}
            placeholder="YYYY-MM-DD"
          />
          <FormField
            label="To Date"
            value={toDate}
            onChangeText={setToDate}
            placeholder="YYYY-MM-DD"
          />
          <AppButton title="Apply Custom Range" onPress={load} />
        </View>
      ) : null}

      {loading ? (
        <ScreenLoader />
      ) : report ? (
        <>
          <SectionHeader
            title="Summary"
            subtitle={`${formatDate(report.fromDate)} → ${formatDate(report.toDate)}`}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            <StatCard
              label="Total Collection"
              value={formatCurrency(report.totalCollection)}
            />
            <StatCard
              label="Transactions"
              value={String(report.transactionCount)}
              tone="info"
            />
            <StatCard
              label="Gold (g)"
              value={formatGrams(report.totalGoldGrams)}
              tone="warning"
            />
            <StatCard
              label="Silver (g)"
              value={formatGrams(report.totalSilverGrams, 2)}
              tone="info"
            />
          </View>

          <AppButton title="Export Report" onPress={handleExport} variant="secondary" />

          <SectionHeader
            title="Transactions"
            right={`${report.transactions.length}`}
          />
          {report.transactions.length === 0 ? (
            <EmptyState
              title="No transactions"
              message="Nothing found for this period."
            />
          ) : (
            report.transactions.map((item) => (
              <TransactionItem key={item.id} item={item} />
            ))
          )}
        </>
      ) : range === 'custom' ? (
        <EmptyState
          title="Custom range"
          message="Enter from and to dates, then apply."
        />
      ) : null}
    </ScreenContainer>
  );
}
