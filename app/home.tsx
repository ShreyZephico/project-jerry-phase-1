import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import {
  getHomeRouteForRole,
  getMyRole,
} from '@/services/profileService';
import type { AppRole } from '@/types/app';

export default function Home() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [role, setRole] = useState<AppRole>('customer');

  useEffect(() => {
    let mounted = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        setHasSession(false);
        setReady(true);
        return;
      }

      const nextRole = await getMyRole();
      if (!mounted) return;

      setRole(nextRole);
      setHasSession(true);
      setReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.cream,
        }}
      >
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!hasSession) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href={getHomeRouteForRole(role) as any} />;
}
