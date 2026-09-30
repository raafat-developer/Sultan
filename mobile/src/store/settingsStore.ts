import { create } from 'zustand';
import { Language, TRANSLATIONS } from '../i18n';
import { I18nManager } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

export type ThemeMode = 'light' | 'dark';

interface SettingsState {
  language: Language;
  isRTL: boolean;
  theme: ThemeMode;
  colors: typeof LIGHT_COLORS;
  t: typeof TRANSLATIONS.ar;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'ar',
  isRTL: true,
  theme: 'light', // Light theme is default as requested
  colors: LIGHT_COLORS,
  t: TRANSLATIONS.ar,
  setLanguage: (lang: Language) => {
    const isRTL = lang === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
    set({
      language: lang,
      isRTL,
      t: TRANSLATIONS[lang],
    });
  },
  setTheme: (theme: ThemeMode) => {
    set({
      theme,
      colors: theme === 'dark' ? DARK_COLORS : LIGHT_COLORS,
    });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'light' ? 'dark' : 'light';
    set({
      theme: next,
      colors: next === 'dark' ? DARK_COLORS : LIGHT_COLORS,
    });
  },
}));
