import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  rtlRow,
  rtlTextAlign,
  rtlWritingDirection,
} from '@/theme';
import { useReadingStore } from '@/stores/useReadingStore';
import { READER_COMPONENT_CONTRACTS } from '../readerContracts';

export interface WordByWordSectionProps {
  showWordByWord?: boolean;
  onToggleWordByWord?: (show: boolean) => void;
  wordByWordLocale?: 'fa' | 'en';
  onChangeWordByWordLocale?: (locale: 'fa' | 'en') => void;
  wordByWordDisplay?: 'inline' | 'tooltip';
  onChangeWordByWordDisplay?: (display: 'inline' | 'tooltip') => void;
  wordByWordContentType?: ('translation' | 'transliteration')[];
  onChangeWordByWordContentType?: (types: ('translation' | 'transliteration')[]) => void;
  testID?: string;
}

/**
 * WordByWordSection provides linguistic configuration for Quranic word-by-word analysis:
 * 1. Master toggle switch (showWordByWord).
 * 2. Language selector segmented buttons ('فارسی' vs 'English').
 * 3. Display mode segmented buttons ('درون‌خطی' vs 'حبابی').
 * 4. Content type multi-checkboxes ('ترجمه تحت‌اللفظی' vs 'آوانگاری صوتی').
 * 5. Guarantees WCAG touch targets >= 44x44px.
 */
export const WordByWordSection: React.FC<WordByWordSectionProps> = React.memo(
  ({
    showWordByWord: propShowWordByWord,
    onToggleWordByWord: propOnToggleWordByWord,
    wordByWordLocale: propWordByWordLocale,
    onChangeWordByWordLocale: propOnChangeWordByWordLocale,
    wordByWordDisplay: propWordByWordDisplay,
    onChangeWordByWordDisplay: propOnChangeWordByWordDisplay,
    wordByWordContentType: propWordByWordContentType,
    onChangeWordByWordContentType: propOnChangeWordByWordContentType,
    testID = 'word-by-word-section',
  }) => {
    const store = useReadingStore();

    const isWbwActive = propShowWordByWord ?? store.showWordByWord;
    const toggleWbw = () => {
      if (propOnToggleWordByWord) {
        propOnToggleWordByWord(!isWbwActive);
      } else {
        store.toggleWordByWord();
      }
    };

    const currentLocale = propWordByWordLocale ?? store.wordByWordLocale;
    const setLocale = propOnChangeWordByWordLocale ?? store.setWordByWordLocale;

    const currentDisplay = propWordByWordDisplay ?? store.wordByWordDisplay;
    const setDisplay = propOnChangeWordByWordDisplay ?? store.setWordByWordDisplay;

    const currentContentType = propWordByWordContentType ?? store.wordByWordContentType;
    const setContentType = propOnChangeWordByWordContentType ?? store.setWordByWordContentType;

    const handleToggleContentType = (type: 'translation' | 'transliteration') => {
      const isSelected = currentContentType.includes(type);
      if (isSelected) {
        // Keep at least one content type selected
        if (currentContentType.length > 1) {
          setContentType(currentContentType.filter((t) => t !== type));
        }
      } else {
        setContentType([...currentContentType, type]);
      }
    };

    return (
      <View testID={testID} style={styles.container}>
        {/* 1. Master Switch Toggle */}
        <View style={styles.masterToggleRow}>
          <View style={styles.masterLabelContainer}>
            <Text style={styles.masterTitle}>نمایش ترجمه واژه به واژه</Text>
            <Text style={styles.masterSubtitle}>تحلیل لغوی و آوانگاری کلمات قرآن کریم</Text>
          </View>
          <View style={styles.switchTouchArea}>
            <Switch
              testID={`${testID}-master-switch`}
              value={isWbwActive}
              onValueChange={toggleWbw}
              trackColor={{ false: 'rgba(255, 255, 255, 0.15)', true: colors.primary }}
              thumbColor={isWbwActive ? colors.textPrimary : colors.textFaded}
              accessibilityLabel="فعال‌سازی نمایش واژه به واژه"
            />
          </View>
        </View>

        {/* Sub-options container */}
        <View style={[styles.subOptionsContainer, !isWbwActive && styles.subOptionsDisabled]}>
          {/* 2. Language Selector */}
          <View style={styles.optionBlock}>
            <Text style={styles.optionTitle}>زبان ترجمه کلمات</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                testID={`${testID}-lang-fa`}
                onPress={() => setLocale('fa')}
                disabled={!isWbwActive}
                activeOpacity={0.7}
                style={[
                  styles.segmentButton,
                  currentLocale === 'fa'
                    ? styles.segmentButtonActive
                    : styles.segmentButtonInactive,
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="زبان واژه به واژه فارسی"
              >
                <Text
                  style={[
                    styles.segmentText,
                    currentLocale === 'fa' ? styles.segmentTextActive : styles.segmentTextInactive,
                  ]}
                >
                  فارسی
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID={`${testID}-lang-en`}
                onPress={() => setLocale('en')}
                disabled={!isWbwActive}
                activeOpacity={0.7}
                style={[
                  styles.segmentButton,
                  currentLocale === 'en'
                    ? styles.segmentButtonActive
                    : styles.segmentButtonInactive,
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="زبان واژه به واژه انگلیسی"
              >
                <Text
                  style={[
                    styles.segmentText,
                    currentLocale === 'en' ? styles.segmentTextActive : styles.segmentTextInactive,
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. Display Mode */}
          <View style={styles.optionBlock}>
            <Text style={styles.optionTitle}>شیوه نمایش کلمات</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                testID={`${testID}-display-inline`}
                onPress={() => setDisplay('inline')}
                disabled={!isWbwActive}
                activeOpacity={0.7}
                style={[
                  styles.segmentButton,
                  currentDisplay === 'inline'
                    ? styles.segmentButtonActive
                    : styles.segmentButtonInactive,
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="نمایش درون‌خطی زیر هر کلمه"
              >
                <Text
                  style={[
                    styles.segmentText,
                    currentDisplay === 'inline'
                      ? styles.segmentTextActive
                      : styles.segmentTextInactive,
                  ]}
                >
                  درون‌خطی
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID={`${testID}-display-tooltip`}
                onPress={() => setDisplay('tooltip')}
                disabled={!isWbwActive}
                activeOpacity={0.7}
                style={[
                  styles.segmentButton,
                  currentDisplay === 'tooltip'
                    ? styles.segmentButtonActive
                    : styles.segmentButtonInactive,
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="نمایش حبابی با لمس هر کلمه"
              >
                <Text
                  style={[
                    styles.segmentText,
                    currentDisplay === 'tooltip'
                      ? styles.segmentTextActive
                      : styles.segmentTextInactive,
                  ]}
                >
                  حبابی
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Content Type Checkboxes */}
          <View style={styles.optionBlock}>
            <Text style={styles.optionTitle}>اطلاعات واژه</Text>
            <View style={styles.checkboxesColumn}>
              {/* Translation Checkbox */}
              <TouchableOpacity
                testID={`${testID}-type-translation`}
                onPress={() => handleToggleContentType('translation')}
                disabled={!isWbwActive}
                activeOpacity={0.7}
                style={styles.checkboxRow}
                accessible={true}
                accessibilityRole="checkbox"
                accessibilityLabel={`ترجمه تحت‌اللفظی کلمه${
                  currentContentType.includes('translation') ? '، انتخاب شده' : ''
                }`}
                accessibilityState={{ checked: currentContentType.includes('translation') }}
              >
                <View style={styles.checkboxIconWrapper}>
                  {currentContentType.includes('translation') ? (
                    <View style={styles.checkedBox}>
                      <Check size={16} color={colors.primaryLight} strokeWidth={2.5} />
                    </View>
                  ) : (
                    <View style={styles.uncheckedBox} />
                  )}
                </View>
                <Text
                  style={[
                    styles.checkboxLabel,
                    currentContentType.includes('translation')
                      ? styles.labelActive
                      : styles.labelInactive,
                  ]}
                >
                  ترجمه تحت‌اللفظی
                </Text>
              </TouchableOpacity>

              {/* Transliteration Checkbox */}
              <TouchableOpacity
                testID={`${testID}-type-transliteration`}
                onPress={() => handleToggleContentType('transliteration')}
                disabled={!isWbwActive}
                activeOpacity={0.7}
                style={styles.checkboxRow}
                accessible={true}
                accessibilityRole="checkbox"
                accessibilityLabel={`آوانگاری صوتی کلمه${
                  currentContentType.includes('transliteration') ? '، انتخاب شده' : ''
                }`}
                accessibilityState={{ checked: currentContentType.includes('transliteration') }}
              >
                <View style={styles.checkboxIconWrapper}>
                  {currentContentType.includes('transliteration') ? (
                    <View style={styles.checkedBox}>
                      <Check size={16} color={colors.primaryLight} strokeWidth={2.5} />
                    </View>
                  ) : (
                    <View style={styles.uncheckedBox} />
                  )}
                </View>
                <Text
                  style={[
                    styles.checkboxLabel,
                    currentContentType.includes('transliteration')
                      ? styles.labelActive
                      : styles.labelInactive,
                  ]}
                >
                  آوانگاری صوتی
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

WordByWordSection.displayName = 'WordByWordSection';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  masterToggleRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 64,
  },
  masterLabelContainer: {
    flex: 1,
  },
  masterTitle: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
  },
  masterSubtitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: rtlTextAlign,
    marginTop: 2,
  },
  switchTouchArea: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subOptionsContainer: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  subOptionsDisabled: {
    opacity: 0.38,
  },
  optionBlock: {},
  optionTitle: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xs,
    color: colors.goldAccent,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
    marginBottom: spacing.xs,
  },
  segmentedRow: {
    flexDirection: rtlRow,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentButtonInactive: {
    backgroundColor: 'transparent',
  },
  segmentText: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  segmentTextActive: {
    fontFamily: fonts.uiBold,
    color: colors.textPrimary,
  },
  segmentTextInactive: {
    fontFamily: fonts.uiRegular,
    color: colors.textSecondary,
  },
  checkboxesColumn: {
    gap: spacing.xs,
  },
  checkboxRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  checkboxIconWrapper: {
    minHeight: 44,
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  uncheckedBox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  checkboxLabel: {
    fontSize: fontSizes.sm,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
  },
  labelActive: {
    fontFamily: fonts.uiBold,
    color: colors.textPrimary,
  },
  labelInactive: {
    fontFamily: fonts.uiRegular,
    color: colors.textSecondary,
  },
});
