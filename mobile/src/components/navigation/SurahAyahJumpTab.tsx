import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Plus, Minus, Search, X, ChevronDown, ArrowRight } from 'lucide-react-native';
import {
  useThemeColors,
  ColorTheme,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  rtlRow,
  rtlTextAlign,
} from '@/theme';
import { Chapter } from '@/types/quran';
import { getAllSurahs } from '@/services/db/surahService';
import {
  toPersianDigits,
  parseLocalizedNumber,
  cleanSurahNameFa,
  toAsciiDigits,
} from '@/services/db/quickJumpContracts';

export interface SurahAyahJumpTabProps {
  selectedChapterId: number;
  selectedVerseNumber: number;
  onSelectSurah: (chapterId: number) => void;
  onSelectVerse: (verseNumber: number) => void;
  surahs?: Chapter[];
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const SurahAyahJumpTab: React.FC<SurahAyahJumpTabProps> = ({
  selectedChapterId,
  selectedVerseNumber,
  onSelectSurah,
  onSelectVerse,
  surahs,
  testID,
  style,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [loadedSurahs, setLoadedSurahs] = useState<Chapter[]>(surahs || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [verseInputText, setVerseInputText] = useState(toPersianDigits(selectedVerseNumber));
  const [isSelectingSurah, setIsSelectingSurah] = useState(false);

  // Keep loadedSurahs synchronized if prop updates or fetch via getAllSurahs
  useEffect(() => {
    if (surahs && surahs.length > 0) {
      setLoadedSurahs(surahs);
      return;
    }

    let isMounted = true;
    getAllSurahs('id')
      .then((res) => {
        if (isMounted && res && res.length > 0) {
          setLoadedSurahs(res);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [surahs]);

  // Keep input text synchronized with prop updates
  useEffect(() => {
    setVerseInputText(toPersianDigits(selectedVerseNumber));
  }, [selectedVerseNumber]);

  // Resolve active Surah
  const selectedSurah = useMemo(() => {
    return loadedSurahs.find((s) => s.id === selectedChapterId) || loadedSurahs[0] || null;
  }, [loadedSurahs, selectedChapterId]);

  const maxVerses = selectedSurah?.verses_count || 286;
  const isMakki = selectedSurah?.revelation_place === 'makkah';

  // Handle Ayah stepper
  const handleDecrementVerse = () => {
    const nextVerse = Math.max(1, selectedVerseNumber - 1);
    onSelectVerse(nextVerse);
  };

  const handleIncrementVerse = () => {
    const nextVerse = Math.min(maxVerses, selectedVerseNumber + 1);
    onSelectVerse(nextVerse);
  };

  // Handle direct numeric input
  const handleVerseTextChange = (text: string) => {
    setVerseInputText(text);
    const parsed = parseLocalizedNumber(text);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= maxVerses) {
      onSelectVerse(parsed);
    }
  };

  const handleVerseBlur = () => {
    const parsed = parseLocalizedNumber(verseInputText);
    if (Number.isNaN(parsed) || parsed < 1) {
      onSelectVerse(1);
      setVerseInputText(toPersianDigits(1));
    } else if (parsed > maxVerses) {
      onSelectVerse(maxVerses);
      setVerseInputText(toPersianDigits(maxVerses));
    } else {
      onSelectVerse(parsed);
      setVerseInputText(toPersianDigits(parsed));
    }
  };

  // Handle Surah selection
  const handleSelectSurah = (chapter: Chapter) => {
    onSelectSurah(chapter.id);
    if (selectedVerseNumber > chapter.verses_count) {
      onSelectVerse(chapter.verses_count);
    }
    setIsSelectingSurah(false);
  };

  // Filtered Surahs based on Persian name, Arabic title, or ID
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return loadedSurahs;
    const q = searchQuery.trim().toLowerCase();
    const parsedNum = parseLocalizedNumber(q);
    const asciiQ = toAsciiDigits(q);

    return loadedSurahs.filter((s) => {
      if (!Number.isNaN(parsedNum) && s.id === parsedNum) return true;
      if (asciiQ && String(s.id).includes(asciiQ)) return true;
      if (s.name_fa && s.name_fa.toLowerCase().includes(q)) return true;
      if (s.name_arabic && s.name_arabic.includes(q)) return true;
      if (s.name_simple && s.name_simple.toLowerCase().includes(q)) return true;
      if (cleanSurahNameFa(s.name_fa).toLowerCase().includes(q)) return true;
      return false;
    });
  }, [loadedSurahs, searchQuery]);

  // Quick Ayah chips
  const quickAyahChips = useMemo(() => {
    const chips: { label: string; value: number }[] = [
      { label: `آیه ${toPersianDigits(1)}`, value: 1 },
    ];
    if (maxVerses > 25) {
      chips.push({ label: `آیه ${toPersianDigits(25)}`, value: 25 });
    }
    if (maxVerses > 50) {
      chips.push({ label: `آیه ${toPersianDigits(50)}`, value: 50 });
    }
    if (maxVerses > 1) {
      chips.push({ label: 'آخرین آیه', value: maxVerses });
    }
    return chips;
  }, [maxVerses]);

  // When selecting Surah: Render full-height Surah Picker mode
  if (isSelectingSurah) {
    return (
      <View style={[styles.container, style]} testID={testID}>
        {/* Header with Back button */}
        <View style={styles.surahPickerHeader}>
          <TouchableOpacity
            onPress={() => setIsSelectingSurah(false)}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="بازگشت به انتخاب آیه"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowRight size={18} color={colors.textPrimary} />
            <Text style={styles.backButtonText}>بازگشت</Text>
          </TouchableOpacity>
          <Text style={styles.surahPickerTitle}>انتخاب سوره از مصحف</Text>
        </View>

        {/* Surah Search Bar */}
        <View style={styles.searchBarContainer}>
          <Search size={18} color={colors.textFaded} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="جستجوی سوره (نام یا شماره)..."
            placeholderTextColor={colors.textFaded}
            textAlign={rtlTextAlign}
            accessible={true}
            accessibilityLabel="جستجوی سوره"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="پاک کردن جستجو"
            >
              <X size={16} color={colors.textFaded} />
            </TouchableOpacity>
          )}
        </View>

        {/* Full-height Surahs List */}
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          style={styles.surahListFull}
          contentContainerStyle={styles.surahListContent}
          initialNumToRender={15}
          maxToRenderPerBatch={20}
          windowSize={7}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedChapterId;
            const itemIsMakki = item.revelation_place === 'makkah';

            return (
              <TouchableOpacity
                onPress={() => handleSelectSurah(item)}
                style={[styles.surahListItem, isSelected && styles.surahListItemSelected]}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`سوره ${item.name_fa}، شماره ${toPersianDigits(item.id)}`}
                accessibilityHint="برای انتخاب این سوره ضربه بزنید"
              >
                <View style={[styles.surahItemBadge, isSelected && styles.surahItemBadgeSelected]}>
                  <Text
                    style={[
                      styles.surahItemBadgeText,
                      isSelected && styles.surahItemBadgeTextSelected,
                    ]}
                  >
                    {toPersianDigits(item.id)}
                  </Text>
                </View>

                <View style={styles.surahItemDetails}>
                  <View style={styles.surahItemNameRow}>
                    <Text
                      style={[styles.surahItemNameFa, isSelected && styles.surahItemNameFaSelected]}
                    >
                      سوره {cleanSurahNameFa(item.name_fa)}
                    </Text>
                    <View
                      style={[
                        styles.itemRevelationChip,
                        itemIsMakki ? styles.badgeMakki : styles.badgeMadani,
                      ]}
                    >
                      <Text
                        style={[
                          styles.itemRevelationText,
                          itemIsMakki ? styles.badgeMakkiText : styles.badgeMadaniText,
                        ]}
                      >
                        {itemIsMakki ? 'مکی' : 'مدنی'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.surahItemVerses}>
                    {toPersianDigits(item.verses_count)} آیه
                  </Text>
                </View>

                <Text
                  style={[
                    styles.surahItemNameArabic,
                    isSelected && styles.surahItemNameArabicSelected,
                  ]}
                >
                  {item.name_arabic}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptySearchContainer}>
              <Text style={styles.emptySearchText}>سوره‌ای با این مشخصات یافت نشد</Text>
            </View>
          }
        />
      </View>
    );
  }

  // Default: Ayah Selection Mode (Uncluttered, Focused, Spacious)
  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Top Section: Currently Selected Surah Header Card */}
      {selectedSurah && (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setIsSelectingSurah(true)}
          style={styles.selectedHeaderCard}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`سوره ${cleanSurahNameFa(
            selectedSurah.name_fa,
          )}، برای تغییر سوره ضربه بزنید`}
        >
          <View style={styles.headerRow}>
            {/* Start: Surah Number Badge */}
            <View style={styles.surahNumberBadge}>
              <Text style={styles.surahNumberText}>{toPersianDigits(selectedSurah.id)}</Text>
            </View>

            {/* Middle: Surah Titles */}
            <View style={styles.surahTitlesCol}>
              <View style={styles.surahNameRow}>
                <Text style={styles.surahNameFa}>
                  سوره {cleanSurahNameFa(selectedSurah.name_fa)}
                </Text>
                <View
                  style={[styles.revelationBadge, isMakki ? styles.badgeMakki : styles.badgeMadani]}
                >
                  <Text
                    style={[
                      styles.revelationBadgeText,
                      isMakki ? styles.badgeMakkiText : styles.badgeMadaniText,
                    ]}
                  >
                    {isMakki ? 'مکی' : 'مدنی'}
                  </Text>
                </View>
              </View>
              <Text style={styles.verseCountSubtitle}>
                {toPersianDigits(selectedSurah.verses_count)} آیه • {selectedSurah.name_arabic}
              </Text>
            </View>

            {/* End: Change Surah Pill */}
            <View style={styles.changeSurahButton}>
              <Text style={styles.changeSurahButtonText}>تغییر سوره</Text>
              <ChevronDown size={14} color={colors.primaryLight} style={styles.chevronIcon} />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Ayah Selector Section */}
      <View style={styles.ayahSelectorSection}>
        <Text style={styles.sectionLabel}>انتخاب شماره آیه</Text>

        <View style={styles.stepperContainer}>
          {/* Decrement Button (-) */}
          <TouchableOpacity
            onPress={handleDecrementVerse}
            disabled={selectedVerseNumber <= 1}
            style={[styles.stepperButton, selectedVerseNumber <= 1 && styles.stepperButtonDisabled]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="کاهش شماره آیه"
          >
            <Minus
              size={22}
              color={selectedVerseNumber <= 1 ? colors.textFaded : colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Ayah Input Box */}
          <View style={styles.ayahInputWrapper}>
            <TextInput
              style={styles.ayahInput}
              value={verseInputText}
              onChangeText={handleVerseTextChange}
              onBlur={handleVerseBlur}
              keyboardType="numeric"
              textAlign="center"
              selectTextOnFocus
              maxLength={4}
              accessible={true}
              accessibilityLabel="شماره آیه انتخابی"
            />
            <Text style={styles.ayahInputSuffix}>از {toPersianDigits(maxVerses)}</Text>
          </View>

          {/* Increment Button (+) */}
          <TouchableOpacity
            onPress={handleIncrementVerse}
            disabled={selectedVerseNumber >= maxVerses}
            style={[
              styles.stepperButton,
              selectedVerseNumber >= maxVerses && styles.stepperButtonDisabled,
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="افزایش شماره آیه"
          >
            <Plus
              size={22}
              color={selectedVerseNumber >= maxVerses ? colors.textFaded : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Ayah Chips */}
        <View style={styles.chipsRow}>
          {quickAyahChips.map((chip) => {
            const isSelected = selectedVerseNumber === chip.value;
            return (
              <TouchableOpacity
                key={`${chip.label}-${chip.value}`}
                onPress={() => onSelectVerse(chip.value)}
                style={[styles.quickChip, isSelected && styles.quickChipActive]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`انتخاب سریع ${chip.label}`}
              >
                <Text style={[styles.quickChipText, isSelected && styles.quickChipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    // Surah Picker Mode Styles
    surahPickerHeader: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.sm,
      marginBottom: spacing.xs,
    },
    surahPickerTitle: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
      textAlign: rtlTextAlign,
    },
    backButton: {
      flexDirection: rtlRow,
      alignItems: 'center',
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.surfaceCardHover,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      gap: spacing.xs,
    },
    backButtonText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },
    searchBarContainer: {
      flexDirection: rtlRow,
      alignItems: 'center',
      backgroundColor: colors.surfaceFloating,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingHorizontal: spacing.sm,
      height: 46,
      marginBottom: spacing.sm,
    },
    searchIcon: {
      marginEnd: spacing.xs,
    },
    searchInput: {
      flex: 1,
      fontFamily: fonts.primary,
      fontSize: fontSizes.sm,
      color: colors.textPrimary,
      paddingVertical: 0,
    },
    clearButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    surahListFull: {
      flex: 1,
      width: '100%',
    },
    surahListContent: {
      paddingBottom: spacing.lg,
    },
    surahListItem: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaceFloating,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.xs,
      minHeight: 52,
    },
    surahListItemSelected: {
      backgroundColor: colors.primarySubtle,
      borderColor: colors.borderActive,
    },
    surahItemBadge: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.circle,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      justifyContent: 'center',
      alignItems: 'center',
      marginEnd: spacing.sm,
    },
    surahItemBadgeSelected: {
      borderColor: colors.goldAccent,
      backgroundColor: colors.goldGlow,
    },
    surahItemBadgeText: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },
    surahItemBadgeTextSelected: {
      color: colors.goldAccent,
    },
    surahItemDetails: {
      flex: 1,
      justifyContent: 'center',
      marginEnd: spacing.sm,
    },
    surahItemNameRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: spacing.xs,
    },
    surahItemNameFa: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.sm,
      color: colors.textPrimary,
      textAlign: rtlTextAlign,
    },
    surahItemNameFaSelected: {
      color: colors.primaryLight,
    },
    itemRevelationChip: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: borderRadius.pill,
    },
    itemRevelationText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xxs,
    },
    surahItemVerses: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xxs,
      color: colors.textFaded,
      textAlign: rtlTextAlign,
      marginTop: 2,
    },
    surahItemNameArabic: {
      fontFamily: fonts.uthmanicHafs,
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'right',
    },
    surahItemNameArabicSelected: {
      color: colors.goldAccent,
    },
    emptySearchContainer: {
      paddingVertical: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptySearchText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.sm,
      color: colors.textFaded,
      textAlign: 'center',
    },

    // Default Ayah Selection Mode Styles
    selectedHeaderCard: {
      backgroundColor: colors.surfaceFloating,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderIridescent,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    headerRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    surahNumberBadge: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.circle,
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.goldAccent,
      alignItems: 'center',
      justifyContent: 'center',
      marginEnd: spacing.md,
    },
    surahNumberText: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.md,
      color: colors.goldAccent,
    },
    surahTitlesCol: {
      flex: 1,
      justifyContent: 'center',
      marginEnd: spacing.sm,
    },
    surahNameRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: spacing.xs,
    },
    surahNameFa: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
      textAlign: rtlTextAlign,
    },
    revelationBadge: {
      paddingHorizontal: 7,
      paddingVertical: 1,
      borderRadius: borderRadius.pill,
    },
    badgeMakki: {
      backgroundColor: colors.badgeMakki,
    },
    badgeMakkiText: {
      color: colors.badgeMakkiText,
    },
    badgeMadani: {
      backgroundColor: colors.badgeMadani,
    },
    badgeMadaniText: {
      color: colors.badgeMadaniText,
    },
    revelationBadgeText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xxs,
    },
    verseCountSubtitle: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.textMuted,
      textAlign: rtlTextAlign,
      marginTop: 2,
    },
    changeSurahButton: {
      flexDirection: rtlRow,
      alignItems: 'center',
      backgroundColor: colors.primarySubtle,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderActive,
      gap: 4,
    },
    changeSurahButtonText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.primaryLight,
    },
    chevronIcon: {
      marginStart: 2,
    },

    // Ayah Selector Section
    ayahSelectorSection: {
      backgroundColor: colors.surfaceFloating,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: spacing.md,
    },
    sectionLabel: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: rtlTextAlign,
      marginBottom: spacing.md,
    },
    stepperContainer: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    stepperButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceCardHover,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepperButtonDisabled: {
      opacity: 0.35,
    },
    ayahInputWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 110,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      borderWidth: 1.5,
      borderColor: colors.borderActive,
    },
    ayahInput: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.display,
      color: colors.goldAccent,
      textAlign: 'center',
      minHeight: 44,
      paddingVertical: 0,
    },
    ayahInputSuffix: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.textFaded,
      marginTop: -2,
    },
    chipsRow: {
      flexDirection: rtlRow,
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.xs,
    },
    quickChip: {
      flex: 1,
      minHeight: 44,
      height: 44,
      paddingVertical: spacing.xs,
      paddingHorizontal: 4,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceCardHover,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickChipActive: {
      backgroundColor: colors.primarySubtle,
      borderColor: colors.borderActive,
    },
    quickChipText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    quickChipTextActive: {
      fontFamily: fonts.uiBold,
      color: colors.primaryLight,
    },
  });
