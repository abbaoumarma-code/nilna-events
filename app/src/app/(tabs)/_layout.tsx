import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { usePlan } from '@/store/plan';
import { C, F } from '@/theme';

export default function TabLayout() {
  const { itemCount } = usePlan();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.brand,
        tabBarInactiveTintColor: C.ink2,
        tabBarLabelStyle: { fontFamily: F.heavy, fontSize: 11 },
        tabBarStyle: { borderTopWidth: 1.5, borderTopColor: C.ink, backgroundColor: C.paper, ...(Platform.OS === 'web' ? { height: 64, paddingBottom: 8 } : null) },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color as string} /> }} />
      <Tabs.Screen name="packages" options={{ title: 'Packages', tabBarIcon: ({ color, size }) => <Ionicons name="pricetags-outline" size={size} color={color as string} /> }} />
      <Tabs.Screen name="services" options={{ title: 'Services', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color as string} /> }} />
      <Tabs.Screen name="venues" options={{ title: 'Venues', tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color as string} /> }} />
      <Tabs.Screen
        name="book"
        options={{
          title: 'Book',
          tabBarBadge: itemCount ? itemCount : undefined,
          tabBarBadgeStyle: { backgroundColor: C.brand, fontFamily: F.heavy },
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}
