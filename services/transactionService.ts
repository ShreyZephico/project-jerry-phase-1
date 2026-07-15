import transactionsData from '@/data/transactions.json';
import { getCurrentRate } from '@/services/rateService';
import { getCustomerById, updateCustomer } from '@/services/customerService';
import {
  calculateGramsFromInr,
  calculateInrFromGrams,
} from '@/utils/format';
import { labels } from '@/constants/labels';
import type {
  MetalType,
  PurchaseMode,
  Transaction,
  TransactionType,
} from '@/types/app';

let transactions: Transaction[] = [...(transactionsData as Transaction[])];

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTransactions(filters?: {
  customerId?: string;
  metal?: MetalType | 'all';
}): Promise<Transaction[]> {
  await delay();
  let list = [...transactions];

  if (filters?.customerId) {
    list = list.filter((t) => t.customerId === filters.customerId);
  }
  if (filters?.metal && filters.metal !== 'all') {
    list = list.filter((t) => t.metal === filters.metal);
  }

  return list.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function getRateForMetal(
  metal: MetalType,
  rate: Awaited<ReturnType<typeof getCurrentRate>>,
): number {
  return metal === 'gold' ? rate.gold24kPerGram : rate.silver999PerGram;
}

export async function buyMetal(params: {
  customerId: string;
  metal: MetalType;
  mode: PurchaseMode;
  /** Required when mode is 'amount' */
  amountInr?: number;
  /** Required when mode is 'grams' */
  grams?: number;
}): Promise<Transaction> {
  await delay(600);

  const rate = await getCurrentRate();
  const customer = await getCustomerById(params.customerId);
  if (!customer) throw new Error('Customer not found');

  const ratePerGram = getRateForMetal(params.metal, rate);
  if (!ratePerGram || ratePerGram <= 0) {
    throw new Error('Today\'s rate is not available');
  }

  let amountInr = 0;
  let grams = 0;

  if (params.mode === 'amount') {
    amountInr = Number(params.amountInr ?? 0);
    if (!amountInr || amountInr <= 0) {
      throw new Error('Enter a valid amount in rupees');
    }
    if (amountInr < labels.minBuyAmount) {
      throw new Error(`Minimum buy amount is ₹${labels.minBuyAmount}`);
    }
    grams = calculateGramsFromInr(amountInr, ratePerGram);
  } else {
    grams = Number(params.grams ?? 0);
    if (!grams || grams <= 0) {
      throw new Error('Enter a valid quantity in grams');
    }
    if (grams < labels.minBuyGrams) {
      throw new Error(`Minimum buy quantity is ${labels.minBuyGrams} g`);
    }
    amountInr = calculateInrFromGrams(grams, ratePerGram);
    if (amountInr < labels.minBuyAmount) {
      throw new Error(
        `Minimum purchase value is ₹${labels.minBuyAmount}. Increase grams.`,
      );
    }
  }

  const metalLabel = params.metal === 'gold' ? 'Gold' : 'Silver';
  const txn: Transaction = {
    id: `txn-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.fullName,
    type: 'buy',
    metal: params.metal,
    amountInr,
    grams,
    ratePerGram,
    status: 'success',
    notes: `Bought ${metalLabel} via ${params.mode === 'amount' ? 'INR' : 'grams'}`,
    createdAt: new Date().toISOString(),
  };

  transactions = [txn, ...transactions];

  if (params.metal === 'gold') {
    await updateCustomer(customer.id, {
      goldBalanceGrams: Number(
        (customer.goldBalanceGrams + grams).toFixed(4),
      ),
      lastTransactionAt: txn.createdAt,
    });
  } else {
    await updateCustomer(customer.id, {
      silverBalanceGrams: Number(
        (customer.silverBalanceGrams + grams).toFixed(4),
      ),
      lastTransactionAt: txn.createdAt,
    });
  }

  return { ...txn };
}

/** @deprecated Prefer buyMetal */
export async function buyGold(params: {
  customerId: string;
  amountInr: number;
}): Promise<Transaction> {
  return buyMetal({
    customerId: params.customerId,
    metal: 'gold',
    mode: 'amount',
    amountInr: params.amountInr,
  });
}

export async function createAdjustmentTransaction(params: {
  customerId: string;
  customerName: string;
  metal: MetalType;
  type: Extract<TransactionType, 'credit' | 'debit'>;
  grams: number;
  ratePerGram: number;
  notes?: string;
}): Promise<Transaction> {
  await delay(400);
  const txn: Transaction = {
    id: `txn-${Date.now()}`,
    customerId: params.customerId,
    customerName: params.customerName,
    type: params.type,
    metal: params.metal,
    amountInr: 0,
    grams: params.grams,
    ratePerGram: params.ratePerGram,
    status: 'success',
    notes: params.notes,
    createdAt: new Date().toISOString(),
  };
  transactions = [txn, ...transactions];
  return { ...txn };
}
