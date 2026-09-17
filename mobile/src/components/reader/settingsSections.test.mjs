import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  formatFontScalePercentage,
  clampFontScale,
  formatSelectedTranslationsCount,
  READER_COMPONENT_CONTRACTS,
} from './readerContracts.ts';
import { searchReciters, AVAILABLE_RECITERS } from '../../services/audio/reciterService.ts';
import { searchTranslations, AVAILABLE_TRANSLATIONS } from '../../services/db/translationService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_DIR = path.resolve(__dirname, 'settings');

describe('Modular Settings Sections Source & WCAG Tests', () => {
  it('should export all 4 settings section components from settings/index.ts', () => {
    const indexPath = path.join(SETTINGS_DIR, 'index.ts');
    assert.ok(fs.existsSync(indexPath), 'settings/index.ts must exist');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes('DisplayFontSection'), 'Must export DisplayFontSection');
    assert.ok(content.includes('ReciterSelectionSection'), 'Must export ReciterSelectionSection');
    assert.ok(content.includes('TranslationSelectionSection'), 'Must export TranslationSelectionSection');
    assert.ok(content.includes('WordByWordSection'), 'Must export WordByWordSection');
  });

  it('DisplayFontSection should include view mode, Quran font, font scale stepper, live preview, and touch targets >= 44', () => {
    const filePath = path.join(SETTINGS_DIR, 'DisplayFontSection.tsx');
    assert.ok(fs.existsSync(filePath), 'DisplayFontSection.tsx must exist');
    const code = fs.readFileSync(filePath, 'utf8');

    // View mode segmented toggle
    assert.ok(code.includes('نمای متنی (پیوسته)'), 'Must have continuous view option');
    assert.ok(code.includes('مصحف چاپی (۱۵ خطی)'), 'Must have mushaf view option');
    assert.ok(code.includes('viewMode') || code.includes('setViewMode'), 'Must handle viewMode');

    // Quran font segmented toggle
    assert.ok(code.includes('عثمان طه (حفص)'), 'Must have Hafs font option');
    assert.ok(code.includes('نستعلیق (اردو / شبه‌قاره)') || code.includes('نستعلیق'), 'Must have IndoPak font option');
    assert.ok(code.includes('quranFont') || code.includes('setQuranFont'), 'Must handle quranFont');

    // Stepper & Live Preview
    assert.ok(code.includes('formatFontScalePercentage'), 'Must format font scale percentage');
    assert.ok(code.includes('previewArabicText') || code.includes('previewText') || code.includes('fontScale'), 'Must show preview');
    assert.ok(code.includes('minHeight: 44') || code.includes('minHeight: READER_COMPONENT_CONTRACTS.minTouchTarget') || code.includes('stepperButtonSize'), 'Must guarantee touch targets >= 44');
    assert.ok(code.includes('accessibilityRole="button"'), 'Buttons must have accessibilityRole');
  });

  it('ReciterSelectionSection should include search input, style filters, reciter list, and touch targets >= 44', () => {
    const filePath = path.join(SETTINGS_DIR, 'ReciterSelectionSection.tsx');
    assert.ok(fs.existsSync(filePath), 'ReciterSelectionSection.tsx must exist');
    const code = fs.readFileSync(filePath, 'utf8');

    assert.ok(code.includes('accessibilityRole="button"'), 'Items must have accessibilityRole="button"');
    assert.ok(code.includes('minHeight: 44') || code.includes('READER_COMPONENT_CONTRACTS.minTouchTarget'), 'Touch targets >= 44px');
    assert.ok(code.includes('AVAILABLE_RECITERS') || code.includes('searchReciters'), 'Must use reciters source');
    assert.ok(code.includes('ترتیل'), 'Must have Tartil style filter');
    assert.ok(code.includes('تحقیق'), 'Must have Tahqiq style filter');
    assert.ok(code.includes('همه'), 'Must have All filter pill');
    assert.ok(code.includes('selectedReciterId'), 'Must support selectedReciterId');
    assert.ok(code.includes('nameFa'), 'Must render Persian reciter name');
    assert.ok(code.includes('styleFa'), 'Must render Persian style chip');
  });

  it('TranslationSelectionSection should support multi-selection checkboxes, language filter pills, counter badge, and search', () => {
    const filePath = path.join(SETTINGS_DIR, 'TranslationSelectionSection.tsx');
    assert.ok(fs.existsSync(filePath), 'TranslationSelectionSection.tsx must exist');
    const code = fs.readFileSync(filePath, 'utf8');

    assert.ok(code.includes('AVAILABLE_TRANSLATIONS') || code.includes('searchTranslations'), 'Must use translation service');
    assert.ok(code.includes('toggleSelectedTranslationId') || code.includes('onToggleTranslation'), 'Must support toggling');
    assert.ok(code.includes('accessibilityRole="checkbox"'), 'Items must have accessibilityRole="checkbox"');
    assert.ok(code.includes('minHeight: 44') || code.includes('READER_COMPONENT_CONTRACTS.minTouchTarget'), 'Touch targets >= 44px');
    assert.ok(code.includes('فارسی'), 'Must have Persian filter pill');
    assert.ok(code.includes('انگلیسی'), 'Must have English filter pill');
    assert.ok(code.includes('همه'), 'Must have All filter pill');
    assert.ok(code.includes('formatSelectedTranslationsCount'), 'Must display selected count badge');
  });

  it('WordByWordSection should support master switch, language toggle, display mode, and content type checkboxes', () => {
    const filePath = path.join(SETTINGS_DIR, 'WordByWordSection.tsx');
    assert.ok(fs.existsSync(filePath), 'WordByWordSection.tsx must exist');
    const code = fs.readFileSync(filePath, 'utf8');

    // Master switch
    assert.ok(code.includes('showWordByWord'), 'Must handle showWordByWord');

    // Language selector
    assert.ok(code.includes('wordByWordLocale'), 'Must handle wordByWordLocale');
    assert.ok(code.includes('فارسی'), 'Must have Persian option');
    assert.ok(code.includes('English'), 'Must have English option');

    // Display mode
    assert.ok(code.includes('wordByWordDisplay'), 'Must handle wordByWordDisplay');
    assert.ok(code.includes('درون‌خطی'), 'Must have inline option');
    assert.ok(code.includes('حبابی'), 'Must have tooltip/bubble option');

    // Content types
    assert.ok(code.includes('wordByWordContentType'), 'Must handle wordByWordContentType');
    assert.ok(code.includes('ترجمه تحت‌اللفظی') || code.includes('ترجمه تحتاللفظی'), 'Must have literal translation option');
    assert.ok(code.includes('آوانگاری صوتی'), 'Must have phonetic transliteration option');

    // WCAG touch targets >= 44px
    assert.ok(code.includes('minHeight: 44') || code.includes('READER_COMPONENT_CONTRACTS.minTouchTarget'), 'Touch targets >= 44px');
  });

  describe('Functional Contracts Integration', () => {
    it('verifies searchReciters with Arabic/Persian and English queries', () => {
      assert.ok(AVAILABLE_RECITERS.length >= 10);
      const parhizgar = searchReciters('پرهیزگار');
      assert.strictEqual(parhizgar.length, 1);
      assert.strictEqual(parhizgar[0].id, 201);

      const tartil = searchReciters('', 'Murattal');
      assert.ok(tartil.length > 0);
      assert.ok(tartil.every((r) => r.style === 'Murattal'));

      const tahqiq = searchReciters('', 'Mujawwad');
      assert.ok(tahqiq.length > 0);
      assert.ok(tahqiq.every((r) => r.style === 'Mujawwad'));
    });

    it('verifies searchTranslations with language filtering and text query', () => {
      assert.ok(AVAILABLE_TRANSLATIONS.length >= 15);
      const faOnly = searchTranslations('', 'fa');
      assert.ok(faOnly.length >= 10);
      assert.ok(faOnly.every((t) => t.languageCode === 'fa'));

      const enOnly = searchTranslations('', 'en');
      assert.ok(enOnly.length >= 2);
      assert.ok(enOnly.every((t) => t.languageCode === 'en'));

      const makarem = searchTranslations('مکارم');
      assert.ok(makarem.length >= 1);
      assert.strictEqual(makarem[0].id, 841);
    });

    it('verifies formatSelectedTranslationsCount and formatFontScalePercentage formatting', () => {
      assert.strictEqual(formatSelectedTranslationsCount(1), '۱ ترجمه انتخاب شده');
      assert.strictEqual(formatSelectedTranslationsCount(3), '۳ ترجمه انتخاب شده');
      assert.strictEqual(formatFontScalePercentage(1.0), '۱۰۰٪');
      assert.strictEqual(formatFontScalePercentage(1.5), '۱۵۰٪');
      assert.strictEqual(clampFontScale(0.7), 0.8);
      assert.strictEqual(clampFontScale(1.8), 1.6);
    });
  });
});
