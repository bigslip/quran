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
  onConfirmJump?: () => void;
  surahs?: Chapter[];
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const SurahAyahJumpTab: React.FC<SurahAyahJumpTabProps> = ({
  selectedChapterId,
  selectedVerseNumber,
  onSelectSurah,
  onSelectVerse,
  onConfirmJump,
  surahs,
  testID,
  style,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [loadedSurahs, setLoadedSurahs] = useState<Chapter[]>(surahs || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [verseInputText, setVerseInputText] = useState(toPersianDigits(selectedVerseNumber));
  const [isAyahTuningOpen, setIsAyahTuningOpen] = useState(false);

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

  // Handle Surah selection: default to verse 1 (beginning) as requested
  const handleSelectSurah = (chapter: Chapter) => {
    if (chapter.id === selectedChapterId) {
      // If already selected, allow one-tap jump confirmation if handler provided
      onConfirmJump?.();
      return;
    }
    onSelectSurah(chapter.id);
    // When switching Surahs, default to starting from the beginning (Ayah 1)
    onSelectVerse(1);
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

  // Quick Ayah chips for selected Surah
  const quickAyahChips = useMemo(() => {
    const chips: { label: string; value: number }[] = [
      { label: `شروع (آیه ${toPersianDigits(1)})`, value: 1 },
    ];
    if (maxVerses > 25) {
      chips.push({ label: `آیه ${toPersianDigits(25)}`, value: 25 });
    }
    if (maxVerses > 50) {
      chips.push({ label: `آیه ${toPersianDigits(50)}`, value: 50 });
    }
    if (maxVerses > 1) {
      chips.push({ label: `آخرین آیه (${toPersianDigits(maxVerses)})`, value: maxVerses });
    }
    return chips;
  }, [maxVerses]);

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* 1. Fast Surah Search Header */}
      <View style={styles.searchBarContainer}>
        <Search size={18} color={colors.textFaded} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="جستجوی فوری سوره (نام یا شماره)..."
          placeholderTextColor={colors.textFaded}
          textAlign={rtlTextAlign}
          accessible={true}
          accessibilityLabel="جستجوی سوره"
          testID="quick-jump-surah-search-input"
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

      {/* 2. Compact Active Surah & Ayah Tuning Toolbar */}
      {selectedSurah && (
        <View style={styles.activeSurahBar}>
          <View style={styles.activeSurahRow}>
            {/* Selected Surah Badge & Info */}
            <View style={styles.activeSurahInfo}>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{toPersianDigits(selectedSurah.id)}</Text>
              </View>
              <View style={styles.activeTextCol}>
                <Text style={styles.activeSurahTitle} numberOfLines={1}>
                  سوره {cleanSurahNameFa(selectedSurah.name_fa)}
                </Text>
                <Text style={styles.activeSurahSubtitle}>
                  {toPersianDigits(maxVerses)} آیه • {isMakki ? 'مکی' : 'مدنی'}
                </Text>
              </View>
            </View>

            {/* Compact Ayah Stepper */}
            <View style={styles.compactAyahControls}>
              <TouchableOpacity
                onPress={handleDecrementVerse}
                disabled={selectedVerseNumber <= 1}
                style={[
                  styles.compactStepperBtn,
                  selectedVerseNumber <= 1 && styles.stepperButtonDisabled,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="کاهش شماره آیه"
              >
                <Minus
                  size={16}
                  color={selectedVerseNumber <= 1 ? colors.textFaded : colors.textPrimary}
                />
              </TouchableOpacity>

              <View style={styles.compactAyahInputBox}>
                <Text style={styles.compactAyahPrefix}>آیه</Text>
                <TextInput
                  style={styles.compactAyahInput}
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
              </View>

              <TouchableOpacity
                onPress={handleIncrementVerse}
                disabled={selectedVerseNumber >= maxVerses}
                style={[
                  styles.compactStepperBtn,
                  selectedVerseNumber >= maxVerses && styles.stepperButtonDisabled,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="افزایش شماره آیه"
              >
                <Plus
                  size={16}
                  color={selectedVerseNumber >= maxVerses ? colors.textFaded : colors.textPrimary}
                />
              </TouchableOpacity>

              {/* Ayah Chips Toggle Button */}
              <TouchableOpacity
                onPress={() => setIsAyahTuningOpen((prev) => !prev)}
                style={[styles.ayahTuningToggle, isAyahTuningOpen && styles.ayahTuningToggleActive]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="تغییر آیه یا انتخاب سریع"
              >
                <ChevronDown
                  size={14}
                  color={isAyahTuningOpen ? colors.primaryLight : colors.textMuted}
                  style={isAyahTuningOpen ? styles.chevronRotated : undefined}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Optional Expanded Quick Ayah Chips */}
          {isAyahTuningOpen && (
            <View style={styles.chipsRow}>
              {quickAyahChips.map((chip) => {
                const isSelected = selectedVerseNumber === chip.value;
                return (
                  <TouchableOpacity
                    key={`${chip.label}-${chip.value}`}
                    onPress={() => onSelectVerse(chip.value)}
                    style={[styles.quickChip, isSelected && styles.quickChipActive]}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
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
          )}
        </View>
      )}

      {/* 3. Hero Section: Full 114 Surahs Scrollable List */}
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
              testID={`quick-jump-surah-item-${item.id}`}
            >
              {/* Surah Number Badge */}
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

              {/* Surah Title & Details */}
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
                <Text style={styles.surahItemVerses}>{toPersianDigits(item.verses_count)} آیه</Text>
              </View>

              {/* Arabic Calligraphy & Selection / Arrow Indicator */}
              <View style={styles.surahItemEnd}>
                <Text
                  style={[
                    styles.surahItemNameArabic,
                    isSelected && styles.surahItemNameArabicSelected,
                  ]}
                >
                  {item.name_arabic}
                </Text>
                {isSelected ? (
                  <View style={styles.selectedCheckmark}>
                    <Text style={styles.selectedCheckmarkText}>✓</Text>
                  </View>
                ) : (
                  <ArrowRight size={14} color={colors.textFaded} style={styles.rowArrow} />
                )}
              </View>
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
};

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    // Search Bar
    searchBarContainer: {
      flexDirection: rtlRow,
      alignItems: 'center',
      backgroundColor: colors.surfaceFloating,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingHorizontal: spacing.sm,
      height: 44,
      marginBottom: spacing.xs,
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

    // Active Surah & Ayah Tuning Bar
    activeSurahBar: {
      backgroundColor: colors.surfaceFloating,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      marginBottom: spacing.xs,
      gap: spacing.xs,
    },
    activeSurahRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    activeSurahInfo: {
      flexDirection: rtlRow,
      alignItems: 'center',
      flex: 1,
      gap: spacing.xs,
    },
    activeBadge: {
      width: 28,
      height: 28,
      borderRadius: borderRadius.circle,
      backgroundColor: colors.goldGlow,
      borderWidth: 1,
      borderColor: colors.goldAccent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeBadgeText: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xxs,
      color: colors.goldAccent,
    },
    activeTextCol: {
      justifyContent: 'center',
    },
    activeSurahTitle: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xs,
      color: colors.textPrimary,
      textAlign: rtlTextAlign,
    },
    activeSurahSubtitle: {
      fontFamily: fonts.primary,
      fontSize: 10,
      color: colors.textFaded,
      textAlign: rtlTextAlign,
    },
    compactAyahControls: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: 3,
    },
    compactStepperBtn: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.surfaceCardHover,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperButtonDisabled: {
      opacity: 0.35,
    },
    compactAyahInputBox: {
      flexDirection: rtlRow,
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderActive,
      borderRadius: borderRadius.sm,
      paddingHorizontal: 4,
      height: 32,
      minWidth: 54,
      justifyContent: 'center',
    },
    compactAyahPrefix: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xxs,
      color: colors.textFaded,
      marginEnd: 2,
    },
    compactAyahInput: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xs,
      color: colors.goldAccent,
      paddingVertical: 0,
      textAlign: 'center',
      minWidth: 24,
    },
    ayahTuningToggle: {
      width: 28,
      height: 32,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceCardHover,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      marginStart: 2,
    },
    ayahTuningToggleActive: {
      backgroundColor: colors.primarySubtle,
      borderColor: colors.borderActive,
    },
    chevronRotated: {
      transform: [{ rotate: '180deg' }],
    },

    // Expanded Quick Chips
    chipsRow: {
      flexDirection: rtlRow,
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.xs,
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.borderSeparator,
    },
    quickChip: {
      flex: 1,
      minHeight: 32,
      height: 32,
      paddingHorizontal: 4,
      borderRadius: borderRadius.sm,
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
      fontSize: fontSizes.xxs,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    quickChipTextActive: {
      fontFamily: fonts.uiBold,
      color: colors.primaryLight,
    },

    // 114 Surahs Scrollable List
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
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      marginBottom: 6,
      minHeight: 48,
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
    surahItemEnd: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: spacing.xs,
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
    selectedCheckmark: {
      width: 20,
      height: 20,
      borderRadius: borderRadius.circle,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginStart: 4,
    },
    selectedCheckmarkText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: 'bold',
      lineHeight: 13,
    },
    rowArrow: {
      opacity: 0.5,
      marginStart: 4,
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
  });
