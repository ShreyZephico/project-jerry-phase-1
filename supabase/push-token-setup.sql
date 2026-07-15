-- ============================================================
-- Jerry — Push notification token column
-- Run in Supabase SQL Editor
-- ============================================================

alter table public.profiles
add column if not exists expo_push_token text;

comment on column public.profiles.expo_push_token is
  'Expo push token (ExponentPushToken[...]) for rate + purchase alerts';

-- Verify
select id, full_name, role, expo_push_token
from public.profiles;
