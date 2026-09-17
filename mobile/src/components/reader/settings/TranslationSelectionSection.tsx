import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Search, X, Check } from 'lucide-react-native';
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
  AVAILABLE_TRANSLATIONS,
  searchTranslations,
  TranslationItem,
} from '@/services/db/translationService';
import {
  READER_COMPONENT_CONTRACTS,
  formatSelectedTranslationsCount,
} from '../readerContracts';

export interface TranslationSelectionSectionProps {
  selectedTranslationIds?: number[];
  onToggleTranslation?: (id: number) => void;
  testID?: string;
}

type LanguageFilter = 'all' | 'fa' | 'en';

/**
 * TranslationSelectionSection provides multi-translation management:
 * 1. Search bar for translators and translations.
 * 2. Language filter pills ('همه', 'فارسی', 'انگلیسی').
 * 3. Selected translations counter badge via formatSelectedTranslationsCount.
 * 4. Multi-selection checkboxes enforcing at least 1 translation remains selected.
 * 5. WCAG touch targets >= 44x44px.
 */
export const TranslationSelectionSection: React.FC<TranslationSelectionSectionProps> = React.memo(({
  selectedTranslationIds: propSelectedTranslationIds,
  onToggleTranslation: propOnToggleTranslation,
  testID = 'translation-selection-section',
}) => {
  const store = useReadingStore();
  const activeTranslationIds = propSelectedTranslationIds ?? store.selectedTranslationIds;
  const toggleTranslation = propOnToggleTranslation ?? store.toggleSelectedTranslationId;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFilter>('all');

  const filteredTranslations = useMemo(() => {
    return searchTranslations(searchQuery, selectedLanguage);
  }, [searchQuery, selectedLanguage]);

  const languageFilterOptions: { key: LanguageFilter; label: string }[] = [
    { key: 'all', label: 'همه' },
    { key: 'fa', label: 'فارسی' },
    { key: 'en', label: 'انگلیسی' },
  ];

  const handleToggle = (id: number) => {
    const isSelected = activeTranslationIds.includes(id);
    // Enforce at least 1 translation remains selected
    if (isSelected && activeTranslationIds.length <= 1) {
      return;
    }
    toggleTranslation(id);
  };

  return (
    <View testID={testID} style={styles.container}>
      {/* Header and Selected Count Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>انتخاب ترجمه‌های قرآن</Text>
        <View style={styles.counterBadge}>
          <Text testID={`${testID}-count-badge`} style={styles.counterBadgeText}>
            {formatSelectedTranslationsCount(activeTranslationIds.length)}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.textFaded} style={styles.searchIcon} />
        <TextInput
          testID={`${testID}-search-input`}
          style={styles.searchInput}
          placeholder="جستجوی ترجمه یا نام مترجم..."
          placeholderTextColor={colors.textFaded}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          returnKeyType="search"
          accessible={true}
          accessibilityLabel="جستجوی ترجمه یا مترجم"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            testID={`${testID}-search-clear`}
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="پاک کردن جستجو"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Language Filter Pills */}
      <View style={styles.filterPillsRow}>
        {languageFilterOptions.map((opt) => {
          const isActive = selectedLanguage === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              testID={`${testID}-lang-filter-${opt.key}`}
              onPress={() => setSelectedLanguage(opt.key)}
              activeOpacity={0.7}
              style={[
                styles.pillButton,
                isActive ? styles.pillButtonActive : styles.pillButtonInactive,
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`فیلتر زبان ${opt.label}`}
            >
              <Text
                style={[
                  styles.pillText,
                  isActive ? styles.pillTextActive : styles.pillTextInactive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Translations List */}
      <View testID={`${testID}-list`} style={styles.translationsList}>
        {filteredTranslations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>ترجمه‌ای با این مشخصات یافت نشد.</Text>
          </View>
        ) : (
          filteredTranslations.map((translation) => {
            const isSelected = activeTranslationIds.includes(translation.id);
            const isSoleSelected = isSelected && activeTranslationIds.length <= 1;

            return (
              <TouchableOpacity
                key={translation.id}
                testID={`${testID}-item-${translation.id}`}
                onPress={() => handleToggle(translation.id)}
                activeOpacity={0.7}
                style={[
                  styles.translationCard,
                  isSelected ? styles.translationCardSelected : styles.translationCardUnselected,
                ]}
                accessible={true}
                accessibilityRole="checkbox"
                accessibilityLabel={`${translation.nameFa}، مترجم: ${translation.authorName}، زبان ${translation.languageNameFa}${isSelected ? '، انتخاب شده' : ''}`}
                accessibilityState={{ checked: isSelected }}
              >
                {/* Multi-selection Checkbox */}
                <View style={styles.checkboxContainer}>
                  {isSelected ? (
                    <View
                      style={[
                        styles.checkedBox,
                        isSoleSelected && styles.checkedBoxLocked,
                      ]}
                    >
                      <Check size={16} color={colors.primaryLight} strokeWidth={2.5} />
                    </View>
                  ) : (
                    <View style={styles.uncheckedBox} />
                  )}
                </View>

                {/* Translation Info */}
                <View style={styles.translationInfo}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.translationName,
                        isSelected ? styles.nameSelected : styles.nameUnselected,
                      ]}
                      numberOfLines={1}
                    >
                      {translation.nameFa}
                    </Text>
                    {/* Language Badge */}
                    <View style={styles.langBadge}>
                      <Text style={styles.langBadgeText}>
                        {translation.languageNameFa}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.authorName} numberOfLines={1}>
                    مترجم: {translation.authorName}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
});

TranslationSelectionSection.displayName = 'TranslationSelectionSection';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.uiRegular,
    fontWeight: '600',
    fontSize: fontSizes.sm,
    color: colors.goldAccent,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
  },
  counterBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  counterBadgeText: {
    fontFamily: fonts.uiRegular,
    fontWeight: '500',
    fontSize: 11,
    color: colors.goldAccent,
  },
  searchBar: {
    flexDirection: rtlRow,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginHorizontal: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textPrimary,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
    minHeight: 44,
    paddingVertical: 0,
  },
  clearButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillsRow: {
    flexDirection: rtlRow,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pillButton: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  pillButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: colors.borderSubtle,
  },
  pillText: {
    fontFamily: fonts.uiRegular,
    fontWeight: '500',
    fontSize: fontSizes.xs,
  },
  pillTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  pillTextInactive: {
    color: colors.textSecondary,
  },
  translationsList: {
    gap: spacing.xs,
  },
  translationCard: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
  },
  translationCardSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: colors.primary,
  },
  translationCardUnselected: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.borderSubtle,
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 32,
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
  checkedBoxLocked: {
    opacity: 0.8,
  },
  uncheckedBox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  translationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.sm,
  },
  translationName: {
    fontFamily: fonts.uiRegular,
    fontWeight: '600',
    fontSize: fontSizes.sm,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
  },
  nameSelected: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  nameUnselected: {
    color: colors.textPrimary,
  },
  authorName: {
    fontFamily: fonts.uiRegular,
    fontSize: 11,
    color: colors.textFaded,
    textAlign: rtlTextAlign,
    marginTop: 1,
  },
  langBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0.5,
    borderColor: colors.borderSubtle,
  },
  langBadgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: 10,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
    textAlign: 'center',
  },
});
