import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      // TODO: load fonts, check auth session, etc.
      await new Promise((resolve) => setTimeout(resolve, 6000));
      await SplashScreen.hideAsync();
      router.replace('/(auth)/sign-in');
    }

    prepare();
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>shrey shah</Text>
      <ActivityIndicator size="large" color="#111827" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 24,
  },
});
