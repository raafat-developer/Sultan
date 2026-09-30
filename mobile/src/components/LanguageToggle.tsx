import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { Globe } from 'lucide-react-native';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useSettingsStore();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={toggleLanguage} style={styles.toggle}>
      <Globe size={14} color={COLORS.primary} />
      <Text style={styles.text}>{language === 'ar' ? 'EN' : 'عربي'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },
});
