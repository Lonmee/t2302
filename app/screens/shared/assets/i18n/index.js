import en from './locales/en';
import zh_cn from './locales/zh_cn';
import I18n from 'react-native-i18n';

/**
 * Created on 08 Nov 2021 by lonmee
 */
I18n.fallbacks = true;

I18n.translations = {
  en,
  zh_cn,
};

export const Lan = I18n;
