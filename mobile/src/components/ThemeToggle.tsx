import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { RADIUS } from '../constants/theme';
import { Sun, Moon } from 'lucide-react-native';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, colors, language } = useSettingsStore();
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleTheme}
      style={[
        styles.toggle,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
        },
      ]}
    >
      {isDark ? (
        <Moon size={14} color="#00E5FF" />
      ) : (
        <Sun size={14} color="#E50914" />
      )}
      <Text style={[styles.text, { color: colors.text }]}>
        {isDark ? (language === 'ar' ? 'ليلي' : 'Dark') : (language === 'ar' ? 'نهاري' : 'Light')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  text: {
    fontWeight: '700',
    fontSize: 11,
  },
});
