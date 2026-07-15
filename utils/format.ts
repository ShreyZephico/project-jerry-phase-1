export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatGrams(grams: number, digits = 4): string {
  return `${grams.toFixed(digits)} g`;
}

export function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateIso: string): string {
  const d = new Date(dateIso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateGramsFromInr(
  amountInr: number,
  ratePerGram: number,
): number {
  if (!ratePerGram || ratePerGram <= 0 || !amountInr) return 0;
  return Number((amountInr / ratePerGram).toFixed(4));
}

/** @deprecated use calculateGramsFromInr */
export function calculateGoldGrams(amountInr: number, ratePerGram: number): number {
  return calculateGramsFromInr(amountInr, ratePerGram);
}

export function calculateInrFromGrams(
  grams: number,
  ratePerGram: number,
): number {
  if (!ratePerGram || ratePerGram <= 0 || !grams) return 0;
  return Number((grams * ratePerGram).toFixed(2));
}

export function estimateMetalValue(grams: number, ratePerGram: number): number {
  return calculateInrFromGrams(grams, ratePerGram);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
