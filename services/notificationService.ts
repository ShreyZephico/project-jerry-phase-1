import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { supabase } from '@/lib/supabase';
import { formatCurrency, formatGrams } from '@/utils/format';
import type { DailyRate, Transaction } from '@/types/app';

/** Expo Go: local notifications OK. Remote Android push needs a Dev Build (SDK 53+). */
export const isExpoGo = Constants.appOwnership === 'expo';

type NotificationsModule = typeof import('expo-notifications');

let notificationsPromise: Promise<NotificationsModule | null> | null = null;
let handlerReady = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (!notificationsPromise) {
    notificationsPromise = import('expo-notifications')
      .then((mod) => {
        if (!handlerReady) {
          mod.setNotificationHandler({
            handleNotification: async () => ({
              shouldPlaySound: true,
              shouldSetBadge: true,
              shouldShowBanner: true,
              shouldShowList: true,
            }),
          });
          handlerReady = true;
        }
        return mod;
      })
      .catch(() => null);
  }
  return notificationsPromise;
}

function getEasProjectId(): string | undefined {
  const id =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  if (!id || id === 'YOUR_EAS_PROJECT_ID') return undefined;
  return id;
}

async function ensureAndroidChannel(Notifications: NotificationsModule) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('jerry-default', {
    name: 'Jerry Alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#C5A059',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });
}

/** Ask OS permission (required on Android 13+ / iOS). */
export async function ensureNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;

  try {
    await ensureAndroidChannel(Notifications);

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Remote push token does not work in Expo Go on Android SDK 53+
  if (isExpoGo) return null;

  const Notifications = await getNotifications();
  if (!Notifications) return null;

  try {
    const allowed = await ensureNotificationPermissions();
    if (!allowed) return null;

    const projectId = getEasProjectId();
    if (!projectId) return null;

    const token = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;
    return token;
  } catch {
    return null;
  }
}

export async function savePushTokenToProfile(token: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('profiles')
    .update({
      expo_push_token: token,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
}

export async function syncPushTokenForCurrentUser(): Promise<string | null> {
  await ensureNotificationPermissions();
  if (isExpoGo) return null;

  const token = await registerForPushNotificationsAsync();
  if (token) {
    await savePushTokenToProfile(token);
  }
  return token;
}

/** Shows a notification in the system tray (works in Expo Go as LOCAL). */
export async function showLocalNotification(params: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  /** Delay so it appears after alerts/modals (default 1s). */
  delaySeconds?: number;
}): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;

  try {
    const allowed = await ensureNotificationPermissions();
    if (!allowed) return false;

    await ensureAndroidChannel(Notifications);

    const delay = Math.max(1, params.delaySeconds ?? 1);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        data: params.data ?? {},
        sound: true,
        ...(Platform.OS === 'android'
          ? { channelId: 'jerry-default' }
          : null),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delay,
        channelId: 'jerry-default',
      },
    });
    return true;
  } catch (err) {
    console.warn('[Jerry] local notification failed', err);
    return false;
  }
}

export async function sendExpoPushMessages(
  messages: Array<{
    to: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }>,
): Promise<{ sent: number; skipped: number }> {
  if (isExpoGo) {
    return { sent: 0, skipped: messages.length };
  }

  const valid = messages.filter((m) => m.to.startsWith('ExponentPushToken'));
  if (valid.length === 0) {
    return { sent: 0, skipped: messages.length };
  }

  let sent = 0;
  for (let i = 0; i < valid.length; i += 100) {
    const chunk = valid.slice(i, i + 100);
    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          chunk.map((m) => ({
            ...m,
            sound: 'default',
            channelId: 'jerry-default',
          })),
        ),
      });
      if (res.ok) sent += chunk.length;
    } catch {
      // ignore
    }
  }

  return { sent, skipped: messages.length - valid.length };
}

export async function getCustomerPushTokens(): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('expo_push_token')
    .eq('role', 'customer')
    .not('expo_push_token', 'is', null);

  if (error || !data) return [];

  return data
    .map((row) => row.expo_push_token as string | null)
    .filter((token): token is string => Boolean(token));
}

export async function notifyPurchaseSuccess(txn: Transaction) {
  const metalLabel = txn.metal === 'gold' ? 'Gold (24K)' : 'Silver (999)';
  await showLocalNotification({
    title: `${metalLabel} purchase successful`,
    body: `You bought ${formatGrams(txn.grams)} for ${formatCurrency(txn.amountInr)}.`,
    delaySeconds: 2,
    data: {
      type: 'purchase',
      metal: txn.metal,
      url: '/(customer)/wallet',
    },
  });
}

export async function notifyCustomersRateUpdated(rate: DailyRate) {
  const title = "Today's metal rates updated";
  const body = `24K Gold ${formatCurrency(rate.gold24kPerGram)}/g · Silver ${formatCurrency(rate.silver999PerGram)}/g`;

  const localShown = await showLocalNotification({
    title,
    body,
    delaySeconds: 2,
    data: {
      type: 'rate_update',
      url: '/(customer)/buy-gold',
    },
  });

  if (isExpoGo) {
    return { sent: 0, skipped: 0, localShown, expoGo: true as const };
  }

  const tokens = await getCustomerPushTokens();
  if (tokens.length === 0) {
    return { sent: 0, skipped: 0, localShown, expoGo: false as const };
  }

  const result = await sendExpoPushMessages(
    tokens.map((to) => ({
      to,
      title,
      body,
      data: {
        type: 'rate_update',
        gold24k: rate.gold24kPerGram,
        silver999: rate.silver999PerGram,
        url: '/(customer)/buy-gold',
      },
    })),
  );

  return { ...result, localShown, expoGo: false as const };
}
