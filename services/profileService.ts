import { supabase } from '@/lib/supabase';
import type { AppRole, UserProfile } from '@/types/app';

export function getHomeRouteForRole(role: AppRole | null | undefined): string {
  return role === 'admin' ? '/(admin)/dashboard' : '/(customer)/home';
}

export async function getMyProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, mobile, role, updated_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    email: user.email ?? '',
    fullName: data.full_name ?? '',
    mobile: data.mobile ?? '',
    role: (data.role as AppRole) ?? 'customer',
    updatedAt: data.updated_at ?? '',
  };
}

export async function getMyRole(): Promise<AppRole> {
  const profile = await getMyProfile();
  return profile?.role ?? 'customer';
}
