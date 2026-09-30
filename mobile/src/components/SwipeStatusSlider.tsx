import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { ChevronRight, Check } from 'lucide-react-native';

interface SwipeStatusSliderProps {
  label: string;
  onConfirm: () => void;
  isLoading?: boolean;
  color?: string;
}

export function SwipeStatusSlider({
  label,
  onConfirm,
  isLoading = false,
  color,
}: SwipeStatusSliderProps) {
  const { colors } = useSettingsStore();
  const activeColor = color || colors.primary;
  const [confirmed, setConfirmed] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const handlePressSimulate = () => {
    if (isLoading || confirmed) return;
    setConfirmed(true);
    Animated.timing(slideAnim, {
      toValue: 240,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      onConfirm();
      setTimeout(() => {
        setConfirmed(false);
        slideAnim.setValue(0);
      }, 800);
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.sliderTrack,
          {
            borderColor: activeColor,
            backgroundColor: colors.surfaceElevated,
          },
        ]}
        activeOpacity={0.8}
        onPress={handlePressSimulate}
      >
        {/* Fill Background */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sliderFill,
            {
              backgroundColor: activeColor,
              width: slideAnim.interpolate({
                inputRange: [0, 240],
                outputRange: ['15%', '100%'],
              }),
            },
          ]}
        />

        {/* Action Label */}
        <View pointerEvents="none" style={styles.textContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            {isLoading ? 'جاري التحديث...' : label}
          </Text>
        </View>

        {/* Sliding Thumb Button */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              backgroundColor: activeColor,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {confirmed ? (
            <Check size={20} color="#FFFFFF" />
          ) : (
            <ChevronRight size={20} color="#FFFFFF" />
          )}
        </Animated.View>
      </TouchableOpacity>
      <Text style={[styles.hintText, { color: colors.textMuted }]}>
        👆 اضغط على الشريط أو اسحبه لتأكيد الإجراء والانتقال للخطوة التالية
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  sliderTrack: {
    height: 56,
    backgroundColor: '#121622',
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.28,
  },
  textContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    shadowColor: '#E50914',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  hintText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
});
