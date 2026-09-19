import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius, rtlRow, rtlTextAlign } from '@/theme';
import { toPersianDigits, parseLocalizedNumber } from '@/services/db/quickJumpContracts';

export interface PageJumpTabProps {
  selectedPageNumber: number;
  onSelectPage: (pageNumber: number) => void;
  previewText?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

interface Milestone {
  title: string;
  page: number;
}

const MILESTONES: Milestone[] = [
  { title: `شروع مصحف (ص ${toPersianDigits(1)})`, page: 1 },
  { title: `سوره کهف (ص ${toPersianDigits(293)})`, page: 293 },
  { title: `سوره یاسین (ص ${toPersianDigits(440)})`, page: 440 },
  { title: `جزء ${toPersianDigits(30)} (ص ${toPersianDigits(582)})`, page: 582 },
];

export const PageJumpTab: React.FC<PageJumpTabProps> = ({
  selectedPageNumber,
  onSelectPage,
  previewText,
  testID,
  style,
}) => {
  const [pageInputText, setPageInputText] = useState(toPersianDigits(selectedPageNumber));

  // Keep input text synchronized with external prop updates
  useEffect(() => {
    setPageInputText(toPersianDigits(selectedPageNumber));
  }, [selectedPageNumber]);

  // Handle direct text input
  const handlePageTextChange = (text: string) => {
    setPageInputText(text);
    const parsed = parseLocalizedNumber(text);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 604) {
      onSelectPage(parsed);
    }
  };

  const handlePageBlur = () => {
    const parsed = parseLocalizedNumber(pageInputText);
    if (Number.isNaN(parsed) || parsed < 1) {
      onSelectPage(1);
      setPageInputText(toPersianDigits(1));
    } else if (parsed > 604) {
      onSelectPage(604);
      setPageInputText(toPersianDigits(604));
    } else {
      onSelectPage(parsed);
      setPageInputText(toPersianDigits(parsed));
    }
  };

  // Fast stepper actions
  const handleStep = (delta: number) => {
    const target = Math.min(604, Math.max(1, selectedPageNumber + delta));
    onSelectPage(target);
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Central Large Numeric Page Display & Input */}
      <View style={styles.pageCard}>
        <Text style={styles.pageCardTitle}>شماره صفحه مصحف</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.pageInput}
            value={pageInputText}
            onChangeText={handlePageTextChange}
            onBlur={handlePageBlur}
            keyboardType="numeric"
            textAlign="center"
            selectTextOnFocus
            maxLength={3}
            accessible={true}
            accessibilityLabel="شماره صفحه"
            accessibilityHint="شماره صفحه بین ۱ تا ۶۰۴ را وارد کنید"
          />
          <Text style={styles.pageTotalSuffix}>از {toPersianDigits(604)}</Text>
        </View>

        {/* Fast Page Steppers: -10, -1, +1, +10 */}
        <View style={styles.steppersRow}>
          {/* -10 Pages */}
          <TouchableOpacity
            onPress={() => handleStep(-10)}
            disabled={selectedPageNumber <= 1}
            style={[styles.stepperButton, selectedPageNumber <= 1 && styles.stepperButtonDisabled]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="۱۰ صفحه به عقب"
            accessibilityHint="۱۰ صفحه به عقب می‌رود"
          >
            <Text
              style={[
                styles.stepperButtonText,
                selectedPageNumber <= 1 && styles.stepperTextDisabled,
              ]}
            >
              -{toPersianDigits(10)}
            </Text>
          </TouchableOpacity>

          {/* -1 Page */}
          <TouchableOpacity
            onPress={() => handleStep(-1)}
            disabled={selectedPageNumber <= 1}
            style={[styles.stepperButton, selectedPageNumber <= 1 && styles.stepperButtonDisabled]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="یک صفحه به عقب"
            accessibilityHint="یک صفحه به عقب می‌رود"
          >
            <Text
              style={[
                styles.stepperButtonText,
                selectedPageNumber <= 1 && styles.stepperTextDisabled,
              ]}
            >
              -{toPersianDigits(1)}
            </Text>
          </TouchableOpacity>

          {/* +1 Page */}
          <TouchableOpacity
            onPress={() => handleStep(1)}
            disabled={selectedPageNumber >= 604}
            style={[
              styles.stepperButton,
              selectedPageNumber >= 604 && styles.stepperButtonDisabled,
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="یک صفحه به جلو"
            accessibilityHint="یک صفحه به جلو می‌رود"
          >
            <Text
              style={[
                styles.stepperButtonText,
                selectedPageNumber >= 604 && styles.stepperTextDisabled,
              ]}
            >
              +{toPersianDigits(1)}
            </Text>
          </TouchableOpacity>

          {/* +10 Pages */}
          <TouchableOpacity
            onPress={() => handleStep(10)}
            disabled={selectedPageNumber >= 604}
            style={[
              styles.stepperButton,
              selectedPageNumber >= 604 && styles.stepperButtonDisabled,
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="۱۰ صفحه به جلو"
            accessibilityHint="۱۰ صفحه به جلو می‌رود"
          >
            <Text
              style={[
                styles.stepperButtonText,
                selectedPageNumber >= 604 && styles.stepperTextDisabled,
              ]}
            >
              +{toPersianDigits(10)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Milestone Quick Chips */}
      <View style={styles.milestonesSection}>
        <Text style={styles.milestonesSectionTitle}>بخش‌ها و نشان‌های شاخص</Text>
        <View style={styles.milestonesGrid}>
          {MILESTONES.map((milestone) => {
            const isSelected = selectedPageNumber === milestone.page;
            return (
              <TouchableOpacity
                key={milestone.page}
                onPress={() => onSelectPage(milestone.page)}
                style={[styles.milestoneChip, isSelected && styles.milestoneChipSelected]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={milestone.title}
                accessibilityHint="پرش مستقیم به این بخش"
              >
                <Text style={[styles.milestoneText, isSelected && styles.milestoneTextSelected]}>
                  {milestone.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Live Destination Preview Card */}
      <View style={styles.previewCard}>
        <View style={styles.previewHeaderRow}>
          <View style={styles.previewIconWrapper}>
            <BookOpen size={18} color={colors.goldAccent} />
          </View>
          <Text style={styles.previewPageTitle}>
            صفحه {toPersianDigits(selectedPageNumber)} از {toPersianDigits(604)}
          </Text>
        </View>

        <Text style={styles.previewDescriptionText} numberOfLines={2}>
          {previewText || `مصحف شریف مدینه عثمان طه • صفحه ${toPersianDigits(selectedPageNumber)}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pageCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pageCardTitle: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  pageInput: {
    minWidth: 100,
    minHeight: 52,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  pageTotalSuffix: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
    marginTop: spacing.xs,
  },
  steppersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  stepperButton: {
    minWidth: 54,
    minHeight: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  stepperButtonDisabled: {
    opacity: 0.35,
    borderColor: colors.borderSeparator,
  },
  stepperButtonText: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepperTextDisabled: {
    color: colors.textFaded,
  },
  milestonesSection: {
    marginBottom: spacing.md,
  },
  milestonesSectionTitle: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: rtlTextAlign,
    marginBottom: spacing.sm,
  },
  milestonesGrid: {
    flexDirection: rtlRow,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  milestoneChip: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneChipSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight,
  },
  milestoneText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textFaded,
  },
  milestoneTextSelected: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  previewCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    padding: spacing.md,
  },
  previewHeaderRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  previewIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceFloating,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPageTitle: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.goldAccent,
    textAlign: rtlTextAlign,
  },
  previewDescriptionText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: rtlTextAlign,
    lineHeight: 20,
  },
});
