import companyProfile from '@/data/company-profile.json';
import type { CompanyProfile } from '@/types/app';

let memoryProfile: CompanyProfile = { ...(companyProfile as CompanyProfile) };

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  await delay();
  return { ...memoryProfile };
}

export async function updateCompanyProfile(
  payload: CompanyProfile,
): Promise<CompanyProfile> {
  await delay(500);
  memoryProfile = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  return { ...memoryProfile };
}
