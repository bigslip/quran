import { describe, it } from 'node:test';
import assert from 'node:assert';
import { useReadingStore } from './useReadingStore.ts';
import {
  formatSelectedTranslationsCount,
  formatReciterBadge,
} from '../components/reader/readerContracts.ts';

describe('useReadingStore Parity State Tests', () => {
  it('should initialize with feature-rich defaults matching web', () => {
    const state = useReadingStore.getState();
    assert.strictEqual(state.selectedReciterId, 201); // Shahriar Parhizgar default
    assert.deepStrictEqual(state.selectedTranslationIds, [841]); // Makarem default
    assert.strictEqual(state.wordByWordLocale, 'fa');
    assert.strictEqual(state.wordByWordDisplay, 'inline');
    assert.deepStrictEqual(state.wordByWordContentType, ['translation']);
  });

  it('should toggle and update selected translations', () => {
    const { setSelectedTranslationIds, toggleSelectedTranslationId } = useReadingStore.getState();

    setSelectedTranslationIds([841, 842]);
    assert.deepStrictEqual(useReadingStore.getState().selectedTranslationIds, [841, 842]);

    // Toggling 843 should add it
    toggleSelectedTranslationId(843);
    assert.deepStrictEqual(useReadingStore.getState().selectedTranslationIds, [841, 842, 843]);

    // Toggling 841 should remove it
    toggleSelectedTranslationId(841);
    assert.deepStrictEqual(useReadingStore.getState().selectedTranslationIds, [842, 843]);

    // Restoring default
    setSelectedTranslationIds([841]);
  });

  it('should update word-by-word preferences', () => {
    const { setWordByWordLocale, setWordByWordDisplay, setWordByWordContentType } = useReadingStore.getState();

    setWordByWordLocale('en');
    assert.strictEqual(useReadingStore.getState().wordByWordLocale, 'en');

    setWordByWordDisplay('tooltip');
    assert.strictEqual(useReadingStore.getState().wordByWordDisplay, 'tooltip');

    setWordByWordContentType(['translation', 'transliteration']);
    assert.deepStrictEqual(useReadingStore.getState().wordByWordContentType, ['translation', 'transliteration']);

    // Restore defaults
    setWordByWordLocale('fa');
    setWordByWordDisplay('inline');
    setWordByWordContentType(['translation']);
  });

  describe('Reader Contracts Formatters', () => {
    it('formats selected translations count in Persian digits', () => {
      assert.strictEqual(formatSelectedTranslationsCount(1), '۱ ترجمه انتخاب شده');
      assert.strictEqual(formatSelectedTranslationsCount(2), '۲ ترجمه انتخاب شده');
      assert.strictEqual(formatSelectedTranslationsCount(5), '۵ ترجمه انتخاب شده');
    });

    it('formats reciter badge with name and style', () => {
      assert.strictEqual(
        formatReciterBadge('استاد شهریار پرهیزگار', 'ترتیل'),
        'استاد شهریار پرهیزگار (ترتیل)'
      );
      assert.strictEqual(
        formatReciterBadge('مشاری راشد العفاسی', 'ترتیل'),
        'مشاری راشد العفاسی (ترتیل)'
      );
    });
  });
});
