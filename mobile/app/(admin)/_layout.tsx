import React from 'react';
import { Tabs } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { LayoutDashboard, Package, Bike, MapPin, BarChart3, Building2 } from 'lucide-react-native';

export default function AdminLayout() {
  const { t, colors, language } = useSettingsStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
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
        name="companies"
        options={{
          title: language === 'ar' ? 'الشركات (SaaS)' : 'Companies',
          tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} />,
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
