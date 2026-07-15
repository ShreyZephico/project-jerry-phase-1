import ratesData from '@/data/daily-rates.json';
import type { DailyRate } from '@/types/app';

let current: DailyRate = { ...(ratesData.current as DailyRate) };
let history: DailyRate[] = [...(ratesData.history as DailyRate[])];

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCurrentRate(): Promise<DailyRate> {
  await delay();
  return { ...current };
}

export async function getRateHistory(): Promise<DailyRate[]> {
  await delay();
  return history.map((item) => ({ ...item }));
}

export async function updateRate(
  payload: Omit<DailyRate, 'id' | 'isActive' | 'updatedAt'>,
): Promise<DailyRate> {
  await delay(500);

  history = [{ ...current, isActive: false }, ...history];

  current = {
    id: `rate-${payload.date}`,
    ...payload,
    isActive: true,
    updatedAt: new Date().toISOString(),
  };

  return { ...current };
}
