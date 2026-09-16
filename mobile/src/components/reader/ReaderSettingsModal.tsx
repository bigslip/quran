import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X, Minus, Plus } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from '@/theme';
import {
  READER_COMPONENT_CONTRACTS,
  formatFontScalePercentage,
} from './readerContracts';

export interface ReaderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
  viewMode: 'continuous' | 'mushaf';
  onChangeViewMode: (mode: 'continuous' | 'mushaf') => void;
  quranFont: 'hafs' | 'indopak';
  onChangeQuranFont: (font: 'hafs' | 'indopak') => void;
  activeTranslation: 'makarem' | 'ansarian' | 'both';
  onChangeActiveTranslation: (translation: 'makarem' | 'ansarian' | 'both') => void;
  showWordByWord: boolean;
  onToggleWordByWord: (show: boolean) => void;
  showTranslation?: boolean;
  onToggleShowTranslation?: (show: boolean) => void;
  testID?: string;
}

/**
 * ReaderSettingsModal provides a comprehensive Sanctuary drawer/modal for reader preferences.
 *
 * Features:
 * - Slide-in bottom sheet with darkened backdrop dismiss.
 * - View mode segmented selection: Continuous text vs. Mushaf 15-line page.
 * - Quranic typography selection: Uthmanic Hafs vs. IndoPak Nastaleeq.
 * - Font scale stepper [0.8 .. 1.6] with Persian percentage label and live Arabic preview.
 * - Persian translation selection: Makarem Shirazi, Hossein Ansarian, or both.
 * - Word-by-word and Persian translation display toggles.
 * - All touch targets >= 44x44px satisfying WCAG standards with Persian accessibility labels.
 */
export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = React.memo(({
  visible,
  onClose,
  fontScale,
  onChangeFontScale,
  viewMode,
  onChangeViewMode,
  quranFont,
  onChangeQuranFont,
  activeTranslation,
  onChangeActiveTranslation,
  showWordByWord,
  onToggleWordByWord,
  showTranslation = true,
  onToggleShowTranslation,
  testID = 'reader-settings-modal',
}) => {
  const { minScale, maxScale, scaleStep, previewFontSize, previewText } =
    READER_COMPONENT_CONTRACTS.settingsModal;

  const isMinScale = fontScale <= minScale;
  const isMaxScale = fontScale >= maxScale;

  const handleDecrementScale = () => {
    const next = Math.round((fontScale - scaleStep) * 10) / 10;
    onChangeFontScale(Math.max(minScale, next));
  };

  const handleIncrementScale = () => {
    const next = Math.round((fontScale + scaleStep) * 10) / 10;
    onChangeFontScale(Math.min(maxScale, next));
  };

  const scaledPreviewFontSize = Math.round(previewFontSize * fontScale);
  const arabicFontFamily = quranFont === 'indopak' ? fonts.quranIndoPak : fonts.quranHafs;

  return (
    <Modal
      testID={testID}
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop dismissable area */}
        <TouchableWithoutFeedback
          testID={`${testID}-backdrop`}
          onPress={onClose}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="بستن پنجره تنظیمات"
        >
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet Card */}
        <View testID={`${testID}-sheet`} style={styles.sheetContainer}>
          {/* Sheet Header */}
          <View testID={`${testID}-header`} style={styles.header}>
            <Text style={styles.headerTitle}>تنظیمات مطالعه قرآن</Text>
            <TouchableOpacity
              testID={`${testID}-close`}
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.closeButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="بستن تنظیمات"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X
                size={READER_COMPONENT_CONTRACTS.settingsModal.closeIconSize}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Section 1: View Mode */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>حالت نمایش</Text>
              <View style={styles.segmentedRow}>
                <TouchableOpacity
                  testID={`${testID}-mode-continuous`}
                  onPress={() => onChangeViewMode('continuous')}
                  activeOpacity={0.7}
                  style={[
                    styles.segmentButton,
                    viewMode === 'continuous' ? styles.segmentButtonActive : styles.segmentButtonInactive,
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="نمای متنی پیوسته"
                >
                  <Text
                    style={[
                      styles.segmentText,
                      viewMode === 'continuous' ? styles.segmentTextActive : styles.segmentTextInactive,
                    ]}
                  >
                    نمای متنی (پیوسته)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID={`${testID}-mode-mushaf`}
                  onPress={() => onChangeViewMode('mushaf')}
                  activeOpacity={0.7}
                  style={[
                    styles.segmentButton,
                    viewMode === 'mushaf' ? styles.segmentButtonActive : styles.segmentButtonInactive,
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="مصحف چاپی ۱۵ خطی"
                >
                  <Text
                    style={[
                      styles.segmentText,
                      viewMode === 'mushaf' ? styles.segmentTextActive : styles.segmentTextInactive,
                    ]}
                  >
                    مصحف چاپی (۱۵ خطی)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 2: Quran Font */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>قلم رسم‌الخط قرآن</Text>
              <View style={styles.segmentedRow}>
                <TouchableOpacity
                  testID={`${testID}-font-hafs`}
                  onPress={() => onChangeQuranFont('hafs')}
                  activeOpacity={0.7}
                  style={[
                    styles.segmentButton,
                    quranFont === 'hafs' ? styles.segmentButtonActive : styles.segmentButtonInactive,
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="قلم عثمان طه حفص"
                >
                  <Text
                    style={[
                      styles.segmentText,
                      quranFont === 'hafs' ? styles.segmentTextActive : styles.segmentTextInactive,
                    ]}
                  >
                    عثمان طه (حفص)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID={`${testID}-font-indopak`}
                  onPress={() => onChangeQuranFont('indopak')}
                  activeOpacity={0.7}
                  style={[
                    styles.segmentButton,
                    quranFont === 'indopak' ? styles.segmentButtonActive : styles.segmentButtonInactive,
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="قلم نستعلیق شبه‌قاره"
                >
                  <Text
                    style={[
                      styles.segmentText,
                      quranFont === 'indopak' ? styles.segmentTextActive : styles.segmentTextInactive,
                    ]}
                  >
                    نستعلیق (اردو / شبه‌قاره)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 3: Font Scale Stepper & Live Preview */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>اندازه قلم قرآن</Text>
              <View testID={`${testID}-font-scale-stepper`} style={styles.stepperContainer}>
                {/* Decrement Button */}
                <TouchableOpacity
                  testID={`${testID}-font-scale-decrement`}
                  onPress={handleDecrementScale}
                  disabled={isMinScale}
                  activeOpacity={0.7}
                  style={[styles.stepperButton, isMinScale && styles.stepperButtonDisabled]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="کاهش اندازه قلم"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Minus
                    size={READER_COMPONENT_CONTRACTS.settingsModal.stepperIconSize}
                    color={isMinScale ? colors.textFaded : colors.primaryLight}
                    strokeWidth={2}
                  />
                </TouchableOpacity>

                {/* Percentage Display */}
                <View style={styles.percentageContainer}>
                  <Text
                    testID={`${testID}-font-scale-percentage`}
                    style={styles.percentageText}
                  >
                    {formatFontScalePercentage(fontScale)}
                  </Text>
                </View>

                {/* Increment Button */}
                <TouchableOpacity
                  testID={`${testID}-font-scale-increment`}
                  onPress={handleIncrementScale}
                  disabled={isMaxScale}
                  activeOpacity={0.7}
                  style={[styles.stepperButton, isMaxScale && styles.stepperButtonDisabled]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="افزایش اندازه قلم"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Plus
                    size={READER_COMPONENT_CONTRACTS.settingsModal.stepperIconSize}
                    color={isMaxScale ? colors.textFaded : colors.primaryLight}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>

              {/* Live Arabic Font Sample Preview */}
              <View style={styles.previewContainer}>
                <Text
                  testID={`${testID}-font-preview`}
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

            {/* Section 4: Persian Translation Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>انتخاب مترجم فارسی</Text>
              <View style={styles.segmentedRow}>
                <TouchableOpacity
                  testID={`${testID}-trans-makarem`}
                  onPress={() => onChangeActiveTranslation('makarem')}
                  activeOpacity={0.7}
                  style={[
                    styles.segmentButton,
                    activeTranslation === 'makarem' ? styles.segmentButtonActive : styles.segmentButtonInactive,
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="ترجمه مکارم شیرازی"
                >
                  <Text
                    style={[
                      styles.segmentText,
                      activeTranslation === 'makarem' ? styles.segmentTextActive : styles.segmentTextInactive,
                    ]}
                  >
                    مکارم شیرازی
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID={`${testID}-trans-ansarian`}
                  onPress={() => onChangeActiveTranslation('ansarian')}
                  activeOpacity={0.7}
                  style={[
                    styles.segmentButton,
                    activeTranslation === 'ansarian' ? styles.segmentButtonActive : styles.segmentButtonInactive,
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="ترجمه حسین انصاریان"
                >
                  <Text
                    style={[
                      styles.segmentText,
                      activeTranslation === 'ansarian' ? styles.segmentTextActive : styles.segmentTextInactive,
                    ]}
                  >
                    حسین انصاریان
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID={`${testID}-trans-both`}
                  onPress={() => onChangeActiveTranslation('both')}
                  activeOpacity={0.7}
                  style={[
                    styles.segmentButton,
                    activeTranslation === 'both' ? styles.segmentButtonActive : styles.segmentButtonInactive,
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="نمایش هر دو ترجمه"
                >
                  <Text
                    style={[
                      styles.segmentText,
                      activeTranslation === 'both' ? styles.segmentTextActive : styles.segmentTextInactive,
                    ]}
                  >
                    هر دو
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 5: Auxiliary Toggles */}
            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionLabel}>تنظیمات تکمیلی</Text>

              {/* Word by Word Toggle */}
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>نمایش ترجمه واژه به واژه</Text>
                <Switch
                  testID={`${testID}-toggle-wbw`}
                  value={showWordByWord}
                  onValueChange={onToggleWordByWord}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.15)', true: colors.primary }}
                  thumbColor={showWordByWord ? colors.textPrimary : colors.textFaded}
                  accessibilityLabel="نمایش ترجمه واژه به واژه"
                />
              </View>

              {/* Persian Translation Toggle */}
              {onToggleShowTranslation && (
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>نمایش ترجمه فارسی</Text>
                  <Switch
                    testID={`${testID}-toggle-translation`}
                    value={showTranslation}
                    onValueChange={onToggleShowTranslation}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.15)', true: colors.primary }}
                    thumbColor={showTranslation ? colors.textPrimary : colors.textFaded}
                    accessibilityLabel="نمایش ترجمه فارسی"
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
    ...shadows.card,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSeparator,
  },
  headerTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  closeButton: {
    minWidth: READER_COMPONENT_CONTRACTS.settingsModal.closeButtonSize,
    minHeight: READER_COMPONENT_CONTRACTS.settingsModal.closeButtonSize,
    width: READER_COMPONENT_CONTRACTS.settingsModal.closeButtonSize,
    height: READER_COMPONENT_CONTRACTS.settingsModal.closeButtonSize,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.circle,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  lastSection: {
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  segmentedRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  segmentButton: {
    flex: 1,
    minHeight: READER_COMPONENT_CONTRACTS.minTouchTarget,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  segmentButtonActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.borderActive,
  },
  segmentButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.borderSubtle,
  },
  segmentText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs + 1,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  segmentTextInactive: {
    color: colors.textFaded,
  },
  stepperContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: READER_COMPONENT_CONTRACTS.minTouchTarget,
  },
  stepperButton: {
    minWidth: READER_COMPONENT_CONTRACTS.settingsModal.stepperButtonSize,
    minHeight: READER_COMPONENT_CONTRACTS.settingsModal.stepperButtonSize,
    width: READER_COMPONENT_CONTRACTS.settingsModal.stepperButtonSize,
    height: READER_COMPONENT_CONTRACTS.settingsModal.stepperButtonSize,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceCard,
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  percentageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  previewContainer: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  previewArabicText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: READER_COMPONENT_CONTRACTS.minTouchTarget,
    paddingVertical: spacing.xs,
  },
  toggleLabel: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    textAlign: 'right',
  },
});
