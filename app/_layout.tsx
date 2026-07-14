import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
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
      </Stack>
    </>
  );
}
