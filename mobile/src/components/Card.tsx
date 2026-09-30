import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  highlight?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, highlight = false }) => {
  return (
    <View
      style={[
        styles.card,
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
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  highlight: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.surfaceElevated,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
