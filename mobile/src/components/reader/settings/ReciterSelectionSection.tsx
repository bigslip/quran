import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
  useThemeColors,
  type ColorTheme,
} from '@/theme';
import { useReadingStore } from '@/stores/useReadingStore';
import {
  AVAILABLE_RECITERS,
  searchReciters,
  Reciter,
  ReciterStyle,
} from '@/services/audio/reciterService';
import { READER_COMPONENT_CONTRACTS } from '../readerContracts';

export interface ReciterSelectionSectionProps {
  selectedReciterId?: number;
  onSelectReciter?: (id: number) => void;
  testID?: string;
}

type StyleFilter = 'all' | ReciterStyle;

/**
 * ReciterSelectionSection provides an interactive list of Quran reciters:
 * 1. Search bar for Persian and English reciter names.
 * 2. Style filter pills ('همه', 'ترتیل', 'تحقیق').
 * 3. Interactive reciter cards with Persian names, style badges, and active checkmarks.
 * 4. WCAG touch targets >= 44x44px.
 */
export const ReciterSelectionSection: React.FC<ReciterSelectionSectionProps> = React.memo(
  ({
    selectedReciterId: propSelectedReciterId,
    onSelectReciter: propOnSelectReciter,
    testID = 'reciter-selection-section',
  }) => {
    const colors = useThemeColors();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const store = useReadingStore();
    const activeReciterId = propSelectedReciterId ?? store.selectedReciterId;
    const handleSelect = propOnSelectReciter ?? store.setSelectedReciterId;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<StyleFilter>('all');

    const filteredReciters = useMemo(() => {
      return searchReciters(searchQuery, selectedStyle);
    }, [searchQuery, selectedStyle]);

    const styleFilterOptions: { key: StyleFilter; label: string }[] = [
      { key: 'all', label: 'همه' },
      { key: 'Murattal', label: 'ترتیل' },
      { key: 'Mujawwad', label: 'تحقیق' },
    ];

    return (
      <View testID={testID} style={styles.container}>
        <Text style={styles.sectionTitle}>انتخاب قاری قرآن</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textFaded} style={styles.searchIcon} />
          <TextInput
            testID={`${testID}-search-input`}
            style={styles.searchInput}
            placeholder="جستجوی نام قاری (فارسی یا انگلیسی)..."
            placeholderTextColor={colors.textFaded}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            returnKeyType="search"
            accessible={true}
            accessibilityLabel="جستجوی نام قاری"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              testID={`${testID}-search-clear`}
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="پاک کردن متن جستجو"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Recitation Style Filter Pills */}
        <View style={styles.filterPillsRow}>
          {styleFilterOptions.map((opt) => {
            const isActive = selectedStyle === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                testID={`${testID}-style-filter-${opt.key}`}
                onPress={() => setSelectedStyle(opt.key)}
                activeOpacity={0.7}
                style={[
                  styles.pillButton,
                  isActive ? styles.pillButtonActive : styles.pillButtonInactive,
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`فیلتر سبک تلاوت ${opt.label}`}
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

        {/* Reciters List */}
        <View testID={`${testID}-list`} style={styles.recitersList}>
          {filteredReciters.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>قاری مورد نظر یافت نشد.</Text>
            </View>
          ) : (
            filteredReciters.map((reciter) => {
              const isSelected = reciter.id === activeReciterId;
              return (
                <TouchableOpacity
                  key={reciter.id}
                  testID={`${testID}-item-${reciter.id}`}
                  onPress={() => handleSelect(reciter.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.reciterCard,
                    isSelected ? styles.reciterCardSelected : styles.reciterCardUnselected,
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`${reciter.nameFa}، سبک ${reciter.styleFa}${
                    isSelected ? '، انتخاب شده' : ''
                  }`}
                  accessibilityState={{ selected: isSelected }}
                >
                  {/* Checkmark or Selection Emblem */}
                  <View style={styles.checkboxContainer}>
                    {isSelected ? (
                      <View style={styles.activeCheckBadge}>
                        <Check size={16} color={colors.primaryLight} strokeWidth={2.5} />
                      </View>
                    ) : (
                      <View style={styles.inactiveCheckBadge} />
                    )}
                  </View>

                  {/* Reciter Metadata */}
                  <View style={styles.reciterInfo}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[
                          styles.reciterNameFa,
                          isSelected ? styles.nameSelected : styles.nameUnselected,
                        ]}
                        numberOfLines={1}
                      >
                        {reciter.nameFa}
                      </Text>
                      {/* Style Chip */}
                      <View
                        style={[
                          styles.styleChip,
                          reciter.style === 'Murattal'
                            ? styles.styleChipMurattal
                            : styles.styleChipMujawwad,
                        ]}
                      >
                        <Text
                          style={[
                            styles.styleChipText,
                            reciter.style === 'Murattal'
                              ? styles.styleChipTextMurattal
                              : styles.styleChipTextMujawwad,
                          ]}
                        >
                          {reciter.styleFa}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reciterNameEn} numberOfLines={1}>
                      {reciter.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>
    );
  },
);

ReciterSelectionSection.displayName = 'ReciterSelectionSection';

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.sm,
      color: colors.goldAccent,
      textAlign: rtlTextAlign,
      writingDirection: rtlWritingDirection,
      marginBottom: spacing.sm,
    },
    searchBar: {
      flexDirection: rtlRow,
      alignItems: 'center',
      backgroundColor: colors.surfaceFloating,
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
      backgroundColor: colors.surfaceCardHover,
      borderColor: colors.borderSubtle,
    },
    pillText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
    },
    pillTextActive: {
      fontFamily: fonts.uiBold,
      color: colors.textInverse,
    },
    pillTextInactive: {
      color: colors.textSecondary,
    },
    recitersList: {
      gap: spacing.xs,
    },
    reciterCard: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 52,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderWidth: 1,
    },
    reciterCardSelected: {
      backgroundColor: colors.primarySubtle,
      borderColor: colors.primary,
    },
    reciterCardUnselected: {
      backgroundColor: colors.surfaceCard,
      borderColor: colors.borderSubtle,
    },
    checkboxContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 44,
      minWidth: 32,
    },
    activeCheckBadge: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.primaryGlow,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    inactiveCheckBadge: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
  reciterInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.sm,
  },
  reciterNameFa: {
    fontFamily: fonts.uiMedium,
    fontSize: fontSizes.sm,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
  },
  nameSelected: {
    fontFamily: fonts.uiBold,
    color: colors.primaryLight,
  },
  nameUnselected: {
    color: colors.textPrimary,
  },
  reciterNameEn: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
    textAlign: rtlTextAlign,
    marginTop: 1,
  },
  styleChip: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 0.5,
  },
  styleChipMurattal: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  styleChipMujawwad: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  styleChipText: {
    fontFamily: fonts.uiRegular,
    fontSize: 10,
  },
  styleChipTextMurattal: {
    color: '#6ee7b7',
  },
  styleChipTextMujawwad: {
    color: '#fcd34d',
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
