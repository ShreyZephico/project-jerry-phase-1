import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassTabBarBackground } from '@/components/ui/GlassTabBarBackground';
import { colors } from '@/constants/colors';

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.2,
        color: focused ? colors.brandTitle : colors.textMuted,
      }}
    >
      {label}
    </Text>
  );
}

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => <GlassTabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 78 : 64,
          paddingBottom: Platform.OS === 'ios' ? 18 : 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Home" focused={focused} />
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={20}
              color={focused ? colors.brandTitle : colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Wallet" focused={focused} />
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={20}
              color={focused ? colors.brandTitle : colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="buy-gold"
        options={{
          title: 'Buy',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Buy" focused={focused} />
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'diamond' : 'diamond-outline'}
              size={20}
              color={focused ? colors.brandTitle : colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen name="buy-checkout" options={{ href: null }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Profile" focused={focused} />
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={20}
              color={focused ? colors.brandTitle : colors.textMuted}
            />
          ),
        }}
      />
    </Tabs>
  );
}
