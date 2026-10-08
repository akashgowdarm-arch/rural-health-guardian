import { en } from './en';
import { hi } from './hi';
import { kn } from './kn';
import { LanguageCode } from '../types';

export const translations = {
  en,
  hi,
  kn,
};

export type TranslationKey = keyof typeof en;

export function getTranslation(lang: LanguageCode, key: TranslationKey): string {
  const langDict = translations[lang] || translations.en;
  return langDict[key] || translations.en[key] || String(key);
}
