import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import zhCNTranslation from './locales/zh-CN.json';
import zhTWTranslation from './locales/zh-TW.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      'zh-CN': {
        translation: zhCNTranslation,
      },
      'zh-TW': {
        translation: zhTWTranslation,
      },
    },
    lng: 'zh-CN', // 默认语言
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
