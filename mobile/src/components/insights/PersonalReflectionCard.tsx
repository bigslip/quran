import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BookOpen, Check, Trash2 } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import {
  INSIGHTS_COMPONENT_CONTRACTS,
  formatReflectionCharCount,
} from './insightsContracts';

export interface PersonalReflectionCardProps {
  verseKey: string;
  initialReflection?: string;
  onSaveReflection: (note: string) => Promise<void>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * PersonalReflectionCard provides a dedicated sanctuary journal card where
 * readers can write, update, clear, and save personal contemplation notes on an Ayah.
 */
export const PersonalReflectionCard: React.FC<PersonalReflectionCardProps> = React.memo(({
  verseKey,
  initialReflection = '',
  onSaveReflection,
  style,
  testID = 'personal-reflection-card',
}) => {
  const [note, setNote] = useState<string>(initialReflection);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Synchronize internal note state whenever verseKey or initialReflection prop changes
  useEffect(() => {
    setNote(initialReflection);
    setIsSaved(false);
  }, [verseKey, initialReflection]);

  const handleChangeText = useCallback((text: string) => {
    setNote(text);
    if (isSaved) {
      setIsSaved(false);
    }
  }, [isSaved]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      await onSaveReflection(note);
      setIsSaved(true);
    } catch {
      setIsSaved(false);
    } finally {
      setIsSaving(false);
    }
  }, [note, isSaving, onSaveReflection]);

  const handleClear = useCallback(() => {
    setNote('');
    setIsSaved(false);
  }, []);

  const hasContent = note.length > 0;

  return (
    <View style={[styles.card, style]} testID={testID}>
      {/* Header: Title with Icon & Subtitle */}
      <View style={styles.header} testID={`${testID}-header`}>
        <View style={styles.titleRow}>
          <View style={styles.headerIconWrapper}>
            <BookOpen size={18} color={colors.goldAccent} />
          </View>
          <Text style={styles.titleText}>یادداشت و تاملات شخصی</Text>
        </View>
        <Text style={styles.subtitleText}>
          «برداشت‌ها و تجربیات شخصی خود را در پرتو این آیه ثبت کنید»
        </Text>
      </View>

      {/* Multi-line TextInput with RTL formatting */}
      <TextInput
        testID={`${testID}-input`}
        style={styles.input}
        value={note}
        onChangeText={handleChangeText}
        placeholder="«تامل و برداشت شخصی خود را از این آیه شریفه بنویسید...»"
        placeholderTextColor={colors.textFaded}
        multiline
        textAlignVertical="top"
        textAlign="right"
        accessible={true}
        accessibilityLabel="متن یادداشت و تامل شخصی"
      />

      {/* Action Row: Character Counter, Status Badge, Clear and Save Buttons */}
      <View style={styles.actionRow} testID={`${testID}-action-row`}>
        {/* Character Count */}
        <Text style={styles.charCountText} testID={`${testID}-char-count`}>
          {formatReflectionCharCount(note.length)}
        </Text>

        {/* Actions Group */}
        <View style={styles.actionsGroup}>
          {/* Status Badge (rendered on successful save) */}
          {isSaved && (
            <View style={styles.statusBadge} testID={`${testID}-status-badge`}>
              <Check size={12} color={colors.primaryLight} />
              <Text style={styles.statusBadgeText}>ذخیره شد</Text>
            </View>
          )}

          {/* Clear Button (rendered when text is present) */}
          {hasContent && (
            <TouchableOpacity
              testID={`${testID}-clear-button`}
              onPress={handleClear}
              disabled={isSaving}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="پاک کردن یادداشت"
              style={styles.clearButton}
            >
              <Trash2 size={16} color={colors.textFaded} />
              <Text style={styles.clearButtonText}>پاک کردن</Text>
            </TouchableOpacity>
          )}

          {/* Save Button */}
          <TouchableOpacity
            testID={`${testID}-save-button`}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="ذخیره یادداشت"
            accessibilityState={{ disabled: isSaving }}
            style={[
              styles.saveButton,
              isSaving && styles.saveButtonDisabled,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <>
                <Check size={16} color={colors.textInverse} />
                <Text style={styles.saveButtonText}>ذخیره یادداشت</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

PersonalReflectionCard.displayName = 'PersonalReflectionCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  headerIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  subtitleText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 18,
  },
  input: {
    minHeight: INSIGHTS_COMPONENT_CONTRACTS.reflectionInputMinHeight,
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actionRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  charCountText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
  },
  actionsGroup: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusBadgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  clearButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    minHeight: INSIGHTS_COMPONENT_CONTRACTS.reflectionButtonMinHeight,
    minWidth: INSIGHTS_COMPONENT_CONTRACTS.reflectionButtonMinWidth,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceFloating,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    justifyContent: 'center',
  },
  clearButtonText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
  },
  saveButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: INSIGHTS_COMPONENT_CONTRACTS.reflectionButtonMinHeight,
    minWidth: INSIGHTS_COMPONENT_CONTRACTS.reflectionButtonMinWidth,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
