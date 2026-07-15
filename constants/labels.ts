export const labels = {
  appName: 'Jerry',
  brandName: 'PRADEEP',
  currencySymbol: '₹',
  gramUnit: 'g',
  minBuyAmount: 250,
  minBuyGrams: 0.01,
};

export const purchaseMetals = [
  { key: 'gold', label: 'Gold (24K)' },
  { key: 'silver', label: 'Silver (999)' },
] as const;

export const purchaseModes = [
  { key: 'amount', label: 'Buy in ₹' },
  { key: 'grams', label: 'Buy in grams' },
] as const;

export const statusOptions = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'kyc_pending', label: 'KYC Pending' },
] as const;

export const metalOptions = [
  { key: 'gold', label: 'Gold' },
  { key: 'silver', label: 'Silver' },
] as const;

export const adjustmentTypes = [
  { key: 'credit', label: 'Credit (Add)' },
  { key: 'debit', label: 'Debit (Deduct)' },
] as const;

export const genderOptions = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'other', label: 'Other' },
] as const;

export const businessTypes = [
  { key: 'proprietorship', label: 'Proprietorship' },
  { key: 'partnership', label: 'Partnership' },
  { key: 'pvt_ltd', label: 'Private Limited' },
  { key: 'llp', label: 'LLP' },
] as const;

export const reportRanges = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'custom', label: 'Custom' },
] as const;

export const walletTabs = [
  { key: 'all', label: 'All' },
  { key: 'gold', label: 'Gold' },
  { key: 'silver', label: 'Silver' },
] as const;
