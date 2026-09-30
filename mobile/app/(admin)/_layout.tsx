import React from 'react';
import { Tabs } from 'expo-router';
import { COLORS } from '../../src/constants/theme';
import { useSettingsStore } from '../../src/store/settingsStore';
import { LayoutDashboard, Package, Bike, MapPin, BarChart3 } from 'lucide-react-native';

export default function AdminLayout() {
  const { t } = useSettingsStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t.tabDashboard,
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: t.tabOrders,
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="couriers"
        options={{
          title: t.tabCouriers,
          tabBarIcon: ({ color, size }) => <Bike size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: t.tabTracking,
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t.tabReports,
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders/create"
        options={{
          href: null, // Accessed via + New Order button
        }}
      />
    </Tabs>
  );
}
