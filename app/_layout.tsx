import { useEffect } from 'react';
import 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { AlertProvider } from '@/components/ui/AppAlert';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { createSessionFromUrl, supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

function RootLayoutNav() {
  const router = useRouter();
  usePushNotifications();

  useEffect(() => {
    async function handleAuthUrl(url: string | null) {
      if (!url) return;

      const isResetLink =
        url.includes('reset-password') ||
        url.includes('code=') ||
        url.includes('type=recovery');

      if (!isResetLink) return;

      try {
        const result = await createSessionFromUrl(url);

        if (result?.session) {
          router.replace('/(auth)/reset-password');
        }
      } catch {
        // Ignore invalid / unrelated links
      }
    }

    Linking.getInitialURL().then(handleAuthUrl);

    const linkSub = Linking.addEventListener('url', ({ url }) => {
      handleAuthUrl(url);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/(auth)/reset-password');
      }
    });

    return () => {
      linkSub.remove();
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="splash" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="(auth)"
          options={{
            animation: 'fade_from_bottom',
            animationDuration: 450,
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            animation: 'fade_from_bottom',
            animationDuration: 450,
          }}
        />
        <Stack.Screen
          name="(customer)"
          options={{
            animation: 'fade_from_bottom',
            animationDuration: 450,
          }}
        />
        <Stack.Screen
          name="(admin)"
          options={{
            animation: 'fade_from_bottom',
            animationDuration: 450,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AlertProvider>
      <RootLayoutNav />
    </AlertProvider>
  );
}
