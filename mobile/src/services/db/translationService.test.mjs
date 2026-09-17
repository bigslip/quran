import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  AVAILABLE_TRANSLATIONS,
  getTranslationById,
  searchTranslations,
  getVerseTranslationText,
} from './translationService.ts';

describe('Translation Catalog Service Tests', () => {
  it('should list all 15 Persian translations with localized author names', () => {
    const persianTranslations = AVAILABLE_TRANSLATIONS.filter((t) => t.languageCode === 'fa');
    assert.strictEqual(persianTranslations.length, 15);

    const makarem = getTranslationById(841);
    assert.ok(makarem);
    assert.strictEqual(makarem.nameFa, 'ناصر مکارم شیرازی');

    const ansarian = getTranslationById(842);
    assert.ok(ansarian);
    assert.strictEqual(ansarian.nameFa, 'حسین انصاریان');

    const fooladvand = getTranslationById(843);
    assert.ok(fooladvand);
    assert.strictEqual(fooladvand.nameFa, 'محمدمهدی فولادوند');

    const ghomshei = getTranslationById(844);
    assert.ok(ghomshei);
    assert.strictEqual(ghomshei.nameFa, 'مهدی الهی قمشه‌ای');

    const gharaati = getTranslationById(846);
    assert.ok(gharaati);
    assert.strictEqual(gharaati.nameFa, 'محسن قرائتی');
  });

  it('should list top English translations', () => {
    const saheeh = getTranslationById(20);
    assert.ok(saheeh);
    assert.strictEqual(saheeh.languageCode, 'en');
    assert.strictEqual(saheeh.nameFa, 'صحیح اینترنشنال (انگلیسی)');

    const clearQuran = getTranslationById(131);
    assert.ok(clearQuran);
    assert.strictEqual(clearQuran.nameFa, 'کلیر قرآن - مصطفی خطاب');
  });

  it('should search translations by Persian or English name and filter by language', () => {
    const searchMakarem = searchTranslations('مکارم');
    assert.strictEqual(searchMakarem.length, 1);
    assert.strictEqual(searchMakarem[0].id, 841);

    const searchEn = searchTranslations('', 'en');
    assert.ok(searchEn.length >= 2);
    assert.ok(searchEn.every((t) => t.languageCode === 'en'));

    const searchFa = searchTranslations('', 'fa');
    assert.strictEqual(searchFa.length, 15);
  });

  it('should retrieve text for embedded translations (Makarem, Ansarian, Saheeh)', () => {
    const mockVerse = {
      translation_fa_makarem: 'به نام خداوند بخشنده مهربان',
      translation_fa_ansarian: 'به نام خدا که رحمتش بی اندازه است',
      translation_en_saheeh: 'In the name of Allah, the Entirely Merciful',
    };

    assert.strictEqual(getVerseTranslationText(mockVerse, 841), mockVerse.translation_fa_makarem);
    assert.strictEqual(getVerseTranslationText(mockVerse, 842), mockVerse.translation_fa_ansarian);
    assert.strictEqual(getVerseTranslationText(mockVerse, 20), mockVerse.translation_en_saheeh);
    assert.strictEqual(getVerseTranslationText(mockVerse, 999), null);
  });
});
