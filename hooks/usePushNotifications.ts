import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import {
  ensureNotificationPermissions,
  isExpoGo,
  syncPushTokenForCurrentUser,
} from '@/services/notificationService';
import { supabase } from '@/lib/supabase';

/**
 * Asks notification permission on app start.
 * Saves Expo push token only outside Expo Go.
 */
export function usePushNotifications() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let responseSub: { remove: () => void } | undefined;

    async function setup() {
      // Always ask permission so LOCAL notifications can show (incl. Expo Go)
      await ensureNotificationPermissions();

      if (!isExpoGo) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session && mounted) {
          await syncPushTokenForCurrentUser();
        }
      }

      try {
        const Notifications = await import('expo-notifications');
        if (!mounted) return;

        function redirectFromNotification(
          notification: import('expo-notifications').Notification,
        ) {
          const url = notification.request.content.data?.url;
          if (typeof url === 'string' && url.length > 0) {
            router.push(url as any);
          }
        }

        const last = await Notifications.getLastNotificationResponseAsync();
        if (last?.notification) {
          redirectFromNotification(last.notification);
        }

        responseSub = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            redirectFromNotification(response.notification);
          },
        );
      } catch {
        // Expo Go may log a push warning — local still works
      }
    }

    void setup();

    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        void syncPushTokenForCurrentUser();
      }
    });

    return () => {
      mounted = false;
      authSub.subscription.unsubscribe();
      responseSub?.remove();
    };
  }, [router]);
}
