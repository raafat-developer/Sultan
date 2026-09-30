import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { Zap } from 'lucide-react-native';

interface FastManLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: boolean;
}

export const FastManLogo: React.FC<FastManLogoProps> = ({ size = 'md', subtitle = true }) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const titleFontSize = isLg ? 32 : isSm ? 18 : 24;
  const iconSize = isLg ? 28 : isSm ? 16 : 22;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Zap size={iconSize} color={COLORS.white} fill={COLORS.white} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.brandRow}>
            <Text style={[styles.fastText, { fontSize: titleFontSize }]}>FAST</Text>
            <Text style={[styles.manText, { fontSize: titleFontSize }]}>MAN</Text>
          </View>
          {subtitle && (
            <Text style={styles.tagline}>MOTORCYCLE EXPRESS DELIVERY</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fastText: {
    color: COLORS.white,
    fontWeight: '900',
    letterSpacing: 2,
  },
  manText: {
    color: COLORS.primary,
    fontWeight: '900',
    letterSpacing: 2,
    marginLeft: 4,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 1,
  },
});
