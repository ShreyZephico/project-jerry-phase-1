import customersData from '@/data/customers.json';
import type { Customer } from '@/types/app';

let customers: Customer[] = [...(customersData as Customer[])];

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCustomers(): Promise<Customer[]> {
  await delay();
  return customers.map((c) => ({ ...c }));
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  await delay();
  const found = customers.find((c) => c.id === id);
  return found ? { ...found } : null;
}

export async function createCustomer(
  payload: Omit<
    Customer,
    | 'id'
    | 'createdAt'
    | 'goldBalanceGrams'
    | 'silverBalanceGrams'
    | 'status'
    | 'kycStatus'
  > &
    Partial<Pick<Customer, 'status' | 'kycStatus'>>,
): Promise<Customer> {
  await delay(500);
  const created: Customer = {
    id: `cust-${Date.now()}`,
    goldBalanceGrams: 0,
    silverBalanceGrams: 0,
    status: payload.status ?? 'active',
    kycStatus: payload.kycStatus ?? 'pending',
    createdAt: new Date().toISOString(),
    ...payload,
  };
  customers = [created, ...customers];
  return { ...created };
}

export async function updateCustomer(
  id: string,
  payload: Partial<Customer>,
): Promise<Customer> {
  await delay(450);
  customers = customers.map((c) =>
    c.id === id ? { ...c, ...payload } : c,
  );
  const updated = customers.find((c) => c.id === id);
  if (!updated) throw new Error('Customer not found');
  return { ...updated };
}

export async function adjustCustomerBalance(
  id: string,
  metal: 'gold' | 'silver',
  type: 'credit' | 'debit',
  grams: number,
): Promise<Customer> {
  await delay(450);
  const customer = customers.find((c) => c.id === id);
  if (!customer) throw new Error('Customer not found');

  const key = metal === 'gold' ? 'goldBalanceGrams' : 'silverBalanceGrams';
  const next =
    type === 'credit' ? customer[key] + grams : customer[key] - grams;

  if (next < 0) {
    throw new Error('Insufficient balance for debit');
  }

  return updateCustomer(id, {
    [key]: Number(next.toFixed(4)),
    lastTransactionAt: new Date().toISOString(),
  });
}
