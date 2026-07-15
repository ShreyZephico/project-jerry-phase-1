const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;
const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return PHONE_RE.test(value.replace(/\s/g, ''));
}

export function isValidPincode(value: string): boolean {
  return PIN_RE.test(value.trim());
}

export function isValidGst(value: string): boolean {
  return GST_RE.test(value.trim().toUpperCase());
}

export function isValidPan(value: string): boolean {
  return PAN_RE.test(value.trim().toUpperCase());
}

export function isPositiveNumber(value: string | number): boolean {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0;
}

export function required(value?: string | null): boolean {
  return Boolean(value && value.trim().length > 0);
}
