import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
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
import {
  READER_COMPONENT_CONTRACTS,
  formatFontScalePercentage,
  clampFontScale,
} from '../readerContracts';

export interface DisplayFontSectionProps {
  viewMode?: 'continuous' | 'mushaf';
  onChangeViewMode?: (mode: 'continuous' | 'mushaf') => void;
  quranFont?: 'hafs' | 'indopak';
  onChangeQuranFont?: (font: 'hafs' | 'indopak') => void;
  fontScale?: number;
  onChangeFontScale?: (scale: number) => void;
  testID?: string;
}

/**
 * DisplayFontSection provides reading view configuration:
 * 1. View Mode segmented toggle (Continuous text vs. 15-line Mushaf page).
 * 2. Quranic Font segmented toggle (Uthmanic Hafs vs. IndoPak Nastaleeq).
 * 3. Font Scale stepper [0.8 .. 1.6] with Persian percentage label and live Arabic preview.
 *
 * Guarantees WCAG touch targets >= 44x44px and Persian accessibility labels.
 */
export const DisplayFontSection: React.FC<DisplayFontSectionProps> = React.memo(({
  viewMode: propViewMode,
  onChangeViewMode: propOnChangeViewMode,
  quranFont: propQuranFont,
  onChangeQuranFont: propOnChangeQuranFont,
  fontScale: propFontScale,
  onChangeFontScale: propOnChangeFontScale,
  testID = 'display-font-section',
}) => {
  const store = useReadingStore();

  const currentViewMode = propViewMode ?? store.viewMode;
  const setViewMode = propOnChangeViewMode ?? store.setViewMode;

  const currentQuranFont = propQuranFont ?? store.quranFont;
  const setQuranFont = propOnChangeQuranFont ?? store.setQuranFont;

  const currentFontScale = propFontScale ?? store.fontScale;
  const setFontScale = propOnChangeFontScale ?? store.setFontScale;

  const { minScale, maxScale, scaleStep, stepperButtonSize, stepperIconSize, previewFontSize, previewText } =
    READER_COMPONENT_CONTRACTS.settingsModal;

  const isMinScale = currentFontScale <= minScale;
  const isMaxScale = currentFontScale >= maxScale;

  const handleDecrementScale = () => {
    const next = Math.round((currentFontScale - scaleStep) * 10) / 10;
    setFontScale(clampFontScale(next));
  };

  const handleIncrementScale = () => {
    const next = Math.round((currentFontScale + scaleStep) * 10) / 10;
    setFontScale(clampFontScale(next));
  };

  const scaledPreviewFontSize = Math.round(previewFontSize * currentFontScale);
  const arabicFontFamily = currentQuranFont === 'indopak' ? fonts.quranIndoPak : fonts.quranHafs;

  return (
    <View testID={testID} style={styles.container}>
      {/* 1. View Mode Segmented Selection */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>حالت نمایش</Text>
        <View style={styles.segmentedRow}>
          <TouchableOpacity
            testID={`${testID}-mode-continuous`}
            onPress={() => setViewMode('continuous')}
            activeOpacity={0.7}
            style={[
              styles.segmentButton,
              currentViewMode === 'continuous' ? styles.segmentButtonActive : styles.segmentButtonInactive,
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="نمای متنی پیوسته"
          >
            <Text
              style={[
                styles.segmentText,
                currentViewMode === 'continuous' ? styles.segmentTextActive : styles.segmentTextInactive,
              ]}
            >
              نمای متنی (پیوسته)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID={`${testID}-mode-mushaf`}
            onPress={() => setViewMode('mushaf')}
            activeOpacity={0.7}
            style={[
              styles.segmentButton,
              currentViewMode === 'mushaf' ? styles.segmentButtonActive : styles.segmentButtonInactive,
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="مصحف چاپی ۱۵ خطی"
          >
            <Text
              style={[
                styles.segmentText,
                currentViewMode === 'mushaf' ? styles.segmentTextActive : styles.segmentTextInactive,
              ]}
            >
              مصحف چاپی (۱۵ خطی)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Quran Font Segmented Selection */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>قلم رسم‌الخط قرآن</Text>
        <View style={styles.segmentedRow}>
          <TouchableOpacity
            testID={`${testID}-font-hafs`}
            onPress={() => setQuranFont('hafs')}
            activeOpacity={0.7}
            style={[
              styles.segmentButton,
              currentQuranFont === 'hafs' ? styles.segmentButtonActive : styles.segmentButtonInactive,
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="قلم عثمان طه حفص"
          >
            <Text
              style={[
                styles.segmentText,
                currentQuranFont === 'hafs' ? styles.segmentTextActive : styles.segmentTextInactive,
              ]}
            >
              عثمان طه (حفص)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID={`${testID}-font-indopak`}
            onPress={() => setQuranFont('indopak')}
            activeOpacity={0.7}
            style={[
              styles.segmentButton,
              currentQuranFont === 'indopak' ? styles.segmentButtonActive : styles.segmentButtonInactive,
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="قلم نستعلیق اردو و شبه‌قاره"
          >
            <Text
              style={[
                styles.segmentText,
                currentQuranFont === 'indopak' ? styles.segmentTextActive : styles.segmentTextInactive,
              ]}
            >
              نستعلیق (اردو / شبه‌قاره)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Font Scale Stepper & Live Preview */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>اندازه قلم قرآن</Text>
        <View testID={`${testID}-stepper`} style={styles.stepperRow}>
          {/* Decrement (-) Button */}
          <TouchableOpacity
            testID={`${testID}-stepper-decrement`}
            onPress={handleDecrementScale}
            disabled={isMinScale}
            activeOpacity={0.7}
            style={[
              styles.stepperButton,
              { minWidth: stepperButtonSize, minHeight: stepperButtonSize },
              isMinScale && styles.stepperButtonDisabled,
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="کاهش اندازه قلم قرآن"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Minus
              size={stepperIconSize}
              color={isMinScale ? colors.textFaded : colors.primaryLight}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* Persian percentage badge */}
          <View style={styles.percentageBadge}>
            <Text testID={`${testID}-percentage-text`} style={styles.percentageText}>
              {formatFontScalePercentage(currentFontScale)}
            </Text>
          </View>

          {/* Increment (+) Button */}
          <TouchableOpacity
            testID={`${testID}-stepper-increment`}
            onPress={handleIncrementScale}
            disabled={isMaxScale}
            activeOpacity={0.7}
            style={[
              styles.stepperButton,
              { minWidth: stepperButtonSize, minHeight: stepperButtonSize },
              isMaxScale && styles.stepperButtonDisabled,
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="افزایش اندازه قلم قرآن"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Plus
              size={stepperIconSize}
              color={isMaxScale ? colors.textFaded : colors.primaryLight}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        {/* Live Arabic Preview Box */}
        <View style={styles.previewContainer}>
          <Text
            testID={`${testID}-preview-text`}
            style={[
              styles.previewArabicText,
              {
                fontFamily: arabicFontFamily,
                fontSize: scaledPreviewFontSize,
              },
            ]}
          >
            {previewText}
          </Text>
        </View>
      </View>
    </View>
  );
});

DisplayFontSection.displayName = 'DisplayFontSection';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionBlock: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.uiRegular,
    fontWeight: '600',
    fontSize: fontSizes.sm,
    color: colors.goldAccent,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
    marginBottom: spacing.sm,
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
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  segmentTextInactive: {
    color: colors.textSecondary,
  },
  stepperRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.xs,
    gap: spacing.md,
  },
  stepperButton: {
    minHeight: 44,
    minWidth: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.35,
  },
  percentageBadge: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontFamily: fonts.uiRegular,
    fontWeight: '700',
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  previewContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  previewArabicText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
