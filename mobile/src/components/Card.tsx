import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  highlight?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, highlight = false }) => {
  const { colors } = useSettingsStore();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: highlight ? colors.surfaceElevated : colors.surface,
          borderColor: highlight ? colors.primaryDark : colors.border,
        },
        highlight && styles.highlight,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  highlight: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
