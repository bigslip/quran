import { describe, expect, it } from 'vitest';

import {
  getLanguageFlag,
  getLanguageNativeName,
  getLanguageHeaderTitle,
  getTranslationNativeName,
  getTranslationSecondaryName,
} from './translationInfo';

import AvailableTranslation from 'types/AvailableTranslation';

describe('translationInfo', () => {
  describe('getLanguageFlag', () => {
    it('returns correct country flags for major languages', () => {
      expect(getLanguageFlag('persian')).toBe('🇮🇷');
      expect(getLanguageFlag('farsi')).toBe('🇮🇷');
      expect(getLanguageFlag('arabic')).toBe('🇸🇦');
      expect(getLanguageFlag('english')).toBe('🇬🇧');
      expect(getLanguageFlag('turkish')).toBe('🇹🇷');
      expect(getLanguageFlag('urdu')).toBe('🇵🇰');
      expect(getLanguageFlag('russian')).toBe('🇷🇺');
      expect(getLanguageFlag('french')).toBe('🇫🇷');
      expect(getLanguageFlag('german')).toBe('🇩🇪');
      expect(getLanguageFlag('bengali')).toBe('🇧🇩');
      expect(getLanguageFlag('indonesian')).toBe('🇮🇩');
    });

    it('returns globe fallback for unknown language', () => {
      expect(getLanguageFlag('unknown_lang')).toBe('🌐');
      expect(getLanguageFlag('')).toBe('🌐');
    });
  });

  describe('getLanguageNativeName', () => {
    it('returns native endonyms', () => {
      expect(getLanguageNativeName('persian')).toBe('فارسی');
      expect(getLanguageNativeName('arabic')).toBe('العربية');
      expect(getLanguageNativeName('russian')).toBe('Русский');
      expect(getLanguageNativeName('turkish')).toBe('Türkçe');
      expect(getLanguageNativeName('urdu')).toBe('اردو');
    });
  });

  describe('getLanguageHeaderTitle', () => {
    it('formats group titles with flag and native name', () => {
      expect(getLanguageHeaderTitle('persian')).toBe('🇮🇷 Persian (فارسی)');
      expect(getLanguageHeaderTitle('arabic')).toBe('🇸🇦 Arabic (العربية)');
      expect(getLanguageHeaderTitle('english')).toBe('🇬🇧 English');
      expect(getLanguageHeaderTitle('turkish')).toBe('🇹🇷 Turkish (Türkçe)');
    });
  });

  describe('getTranslationNativeName', () => {
    it('returns native translator name for Persian', () => {
      const translation: AvailableTranslation = {
        id: 29,
        name: 'Hussein Taji Kal Dari',
        languageName: 'persian',
      };
      expect(getTranslationNativeName(translation)).toBe('حسین تاجی کله‌داری');
    });

    it('returns native translator name for Russian', () => {
      const translation: AvailableTranslation = {
        id: 45,
        name: 'Russian Translation ( Elmir Kuliev )',
        languageName: 'russian',
      };
      expect(getTranslationNativeName(translation)).toBe('Эльмир Кулиев');
    });

    it('returns native translator name for Urdu', () => {
      const translation: AvailableTranslation = {
        id: 54,
        name: 'Maulana Muhammad Junagarhi',
        languageName: 'urdu',
      };
      expect(getTranslationNativeName(translation)).toBe('مولانا محمد جوناگڑھی');
    });

    it('returns fallback for unmapped ID', () => {
      const translation: AvailableTranslation = {
        id: 9999,
        name: 'Custom Translation',
        languageName: 'english',
      };
      expect(getTranslationNativeName(translation)).toBe('Custom Translation');
    });
  });

  describe('getTranslationSecondaryName', () => {
    it('returns secondary name when English differs from native', () => {
      const translation: AvailableTranslation = {
        id: 29,
        name: 'Hussein Taji Kal Dari',
        languageName: 'persian',
      };
      expect(getTranslationSecondaryName(translation)).toBe('Hussein Taji Kal Dari');
    });
  });
});
