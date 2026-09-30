import { create } from 'zustand';
import { Language, TRANSLATIONS } from '../i18n';
import { I18nManager } from 'react-native';

interface SettingsState {
  language: Language;
  isRTL: boolean;
  t: typeof TRANSLATIONS.ar;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'ar',
  isRTL: true,
  t: TRANSLATIONS.ar,
  setLanguage: (lang: Language) => {
    const isRTL = lang === 'ar';
    // Configure layout direction
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
}));
