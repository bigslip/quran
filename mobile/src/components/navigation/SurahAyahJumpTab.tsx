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
import { Plus, Minus, Search, X } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius, rtlRow, rtlTextAlign } from '@/theme';
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
  const [loadedSurahs, setLoadedSurahs] = useState<Chapter[]>(surahs || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [verseInputText, setVerseInputText] = useState(toPersianDigits(selectedVerseNumber));

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
      .catch(() => {
        // Silently fallback in environments without SQLite provider
      });

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

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Top Section: Currently Selected Surah Header */}
      {selectedSurah && (
        <View style={styles.selectedHeaderCard}>
          <View style={styles.headerRow}>
            <View style={styles.surahNumberBadge}>
              <Text style={styles.surahNumberText}>{toPersianDigits(selectedSurah.id)}</Text>
            </View>

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
                {toPersianDigits(selectedSurah.verses_count)} آیه
              </Text>
            </View>

            <Text style={styles.surahArabicTitle}>{selectedSurah.name_arabic}</Text>
          </View>
        </View>
      )}

      {/* Ayah Selector: Stepper + Input + Quick Chips */}
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
            accessibilityHint="شماره آیه را یکی کاهش می‌دهد"
          >
            <Minus
              size={20}
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
              accessibilityHint={`شماره آیه بین ۱ تا ${toPersianDigits(maxVerses)}`}
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
            accessibilityHint="شماره آیه را یکی افزایش می‌دهد"
          >
            <Plus
              size={20}
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

      {/* Surahs Scrollable List */}
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        style={styles.surahList}
        contentContainerStyle={styles.surahListContent}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={5}
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
              {/* Start: Number Badge */}
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

              {/* Middle: Persian Title & Revelation Badge */}
              <View style={styles.surahItemDetails}>
                <View style={styles.surahItemTitleRow}>
                  <Text
                    style={[styles.surahItemNameFa, isSelected && styles.surahItemNameFaSelected]}
                  >
                    {cleanSurahNameFa(item.name_fa)}
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

              {/* End: Arabic Calligraphy Title */}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  selectedHeaderCard: {
    backgroundColor: colors.surfaceCard,
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
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1.5,
    borderColor: colors.goldAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing.sm,
  },
  surahNumberText: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.goldAccent,
  },
  surahTitlesCol: {
    flex: 1,
    justifyContent: 'center',
  },
  surahNameRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.xs,
  },
  surahNameFa: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: rtlTextAlign,
  },
  revelationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  revelationBadgeText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    fontWeight: '600',
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
  verseCountSubtitle: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
    textAlign: rtlTextAlign,
    marginTop: 2,
  },
  surahArabicTitle: {
    fontFamily: fonts.uthmanicHafs,
    fontSize: 22,
    color: colors.primaryLight,
    textAlign: 'right',
  },
  ayahSelectorSection: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: rtlTextAlign,
    marginBottom: spacing.sm,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.4,
    borderColor: colors.borderSeparator,
  },
  ayahInputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  ayahInput: {
    minWidth: 70,
    minHeight: 44,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  ayahInputSuffix: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: rtlRow,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickChip: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight,
  },
  quickChipText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textFaded,
  },
  quickChipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceFloating,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    height: 48,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchIcon: {
    marginEnd: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.primary,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahList: {
    flex: 1,
    minHeight: 180,
    maxHeight: 260,
  },
  surahListContent: {
    paddingBottom: spacing.sm,
  },
  surahListItem: {
    minHeight: 52,
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: 3,
  },
  surahListItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceCardHover,
  },
  surahItemBadge: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing.sm,
  },
  surahItemBadgeSelected: {
    borderColor: colors.goldAccent,
    backgroundColor: colors.goldGlow,
  },
  surahItemBadgeText: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  surahItemBadgeTextSelected: {
    color: colors.goldAccent,
  },
  surahItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  surahItemTitleRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.xs,
  },
  surahItemNameFa: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.sm,
    fontWeight: '600',
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
    fontFamily: fonts.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  surahItemVerses: {
    fontFamily: fonts.primary,
    fontSize: 10,
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
});
