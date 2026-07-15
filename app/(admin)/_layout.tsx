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

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(
  focused: boolean,
  filled: IconName,
  outline: IconName,
) {
  return (
    <Ionicons
      name={focused ? filled : outline}
      size={20}
      color={focused ? colors.brandTitle : colors.textMuted}
    />
  );
}

export default function AdminLayout() {
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
        tabBarActiveTintColor: colors.brandTitle,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Home" focused={focused} />
          ),
          tabBarIcon: ({ focused }) => tabIcon(focused, 'grid', 'grid-outline'),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Users" focused={focused} />
          ),
          tabBarIcon: ({ focused }) =>
            tabIcon(focused, 'people', 'people-outline'),
        }}
      />
      <Tabs.Screen
        name="rates"
        options={{
          title: 'Rates',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Rates" focused={focused} />
          ),
          tabBarIcon: ({ focused }) =>
            tabIcon(focused, 'pricetag', 'pricetag-outline'),
        }}
      />
      <Tabs.Screen
        name="company"
        options={{
          title: 'Company',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Company" focused={focused} />
          ),
          tabBarIcon: ({ focused }) =>
            tabIcon(focused, 'business', 'business-outline'),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Reports" focused={focused} />
          ),
          tabBarIcon: ({ focused }) =>
            tabIcon(focused, 'bar-chart', 'bar-chart-outline'),
        }}
      />
      <Tabs.Screen name="balance-adjust" options={{ href: null }} />
    </Tabs>
  );
}
