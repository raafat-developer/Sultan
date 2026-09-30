import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { OrderStatus, CourierStatus } from '../types';

interface BadgeProps {
  status: OrderStatus | CourierStatus | string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const { t } = useSettingsStore();

  const getStatusColor = () => {
    switch (status) {
      case 'AVAILABLE':
      case 'DELIVERED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: COLORS.success, border: 'rgba(16, 185, 129, 0.3)' };
      case 'BUSY':
      case 'ASSIGNED':
      case 'COURIER_ACCEPTED':
      case 'GOING_TO_PICKUP':
      case 'ARRIVED_AT_PICKUP':
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
      case 'ARRIVED_AT_CUSTOMER':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: COLORS.warning, border: 'rgba(245, 158, 11, 0.3)' };
      case 'FAILED_DELIVERY':
      case 'CANCELLED':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: COLORS.danger, border: 'rgba(239, 68, 68, 0.3)' };
      case 'NEW':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: COLORS.info, border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.15)', text: COLORS.textMuted, border: 'rgba(156, 163, 175, 0.3)' };
    }
  };

  const getStatusLabel = () => {
    if (status === 'AVAILABLE') return t.online;
    if (status === 'OFFLINE') return t.offline;
    if (status === 'BUSY') return t.busy;

    const key = `status_${status}` as keyof typeof t;
    const val = t[key];
    return typeof val === 'string' ? val : String(status);
  };

  const colors = getStatusColor();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={[styles.dot, { backgroundColor: colors.text }]} />
      <Text style={[styles.label, { color: colors.text }]}>{getStatusLabel()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
