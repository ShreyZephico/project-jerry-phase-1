import dashboardData from '@/data/dashboard.json';
import { getTransactions } from '@/services/transactionService';
import type { CollectionReport, DashboardStats, ReportRange } from '@/types/app';

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay();
  return { ...(dashboardData as DashboardStats) };
}

export async function getCollectionReport(params: {
  range: ReportRange;
  fromDate?: string;
  toDate?: string;
}): Promise<CollectionReport> {
  await delay(450);
  const all = await getTransactions();

  const now = new Date();
  let from = new Date(now);
  let to = new Date(now);

  if (params.range === 'daily') {
    from.setHours(0, 0, 0, 0);
  } else if (params.range === 'weekly') {
    from.setDate(now.getDate() - 7);
  } else if (params.range === 'monthly') {
    from.setDate(now.getDate() - 30);
  } else {
    from = new Date(params.fromDate ?? now.toISOString());
    to = new Date(params.toDate ?? now.toISOString());
  }

  const filtered = all.filter((t) => {
    const d = new Date(t.createdAt);
    return d >= from && d <= to;
  });

  const totalCollection = filtered.reduce((sum, t) => sum + t.amountInr, 0);
  const totalGoldGrams = filtered
    .filter((t) => t.metal === 'gold')
    .reduce((sum, t) => sum + t.grams, 0);
  const totalSilverGrams = filtered
    .filter((t) => t.metal === 'silver')
    .reduce((sum, t) => sum + t.grams, 0);

  return {
    range: params.range,
    fromDate: from.toISOString(),
    toDate: to.toISOString(),
    totalCollection,
    totalGoldGrams: Number(totalGoldGrams.toFixed(4)),
    totalSilverGrams: Number(totalSilverGrams.toFixed(4)),
    transactionCount: filtered.length,
    transactions: filtered,
  };
}
