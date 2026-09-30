import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface FastManLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: boolean;
  imageOnly?: boolean;
}

export const FastManLogo: React.FC<FastManLogoProps> = ({
  size = 'md',
  subtitle = true,
  imageOnly = false,
}) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const imgSize = isLg ? 110 : isSm ? 44 : 70;
  const titleFontSize = isLg ? 28 : isSm ? 18 : 22;

  if (imageOnly) {
    return (
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: imgSize, height: imgSize }}
        resizeMode="contain"
      />
    );
  }

  if (isLg) {
    return (
      <View style={styles.containerLg}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: imgSize, height: imgSize }}
          resizeMode="contain"
        />
        <View style={styles.brandRow}>
          <Text style={[styles.fastText, { fontSize: titleFontSize }]}>FAST</Text>
          <Text style={[styles.manText, { fontSize: titleFontSize }]}>MAN</Text>
        </View>
        {subtitle && (
          <Text style={styles.tagline}>MOTORCYCLE EXPRESS DELIVERY</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.containerSm}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: imgSize, height: imgSize }}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <View style={styles.brandRow}>
          <Text style={[styles.fastText, { fontSize: titleFontSize }]}>FAST</Text>
          <Text style={[styles.manText, { fontSize: titleFontSize }]}>MAN</Text>
        </View>
        {subtitle && (
          <Text style={styles.taglineSm}>EXPRESS DELIVERY</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerLg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  taglineSm: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
