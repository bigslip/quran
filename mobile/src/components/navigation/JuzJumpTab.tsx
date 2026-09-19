import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius, rtlRow, rtlTextAlign } from '@/theme';
import { JuzCardInfo, toPersianDigits, cleanSurahNameFa } from '@/services/db/quickJumpContracts';
import { getAllJuzCards } from '@/services/db/quickJumpService';

export interface JuzJumpTabProps {
  selectedJuzNumber: number;
  onSelectJuz: (juzNumber: number) => void;
  juzCards?: JuzCardInfo[];
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const FALLBACK_JUZ_CARDS: JuzCardInfo[] = Array.from({ length: 30 }, (_, i) => {
  const num = i + 1;
  return {
    juzNumber: num,
    startChapterId: 1,
    startVerseNumber: 1,
    startPageNumber: num === 1 ? 1 : num === 30 ? 582 : (num - 1) * 20 + 2,
    verseCount: 200,
    firstSurahNameArabic: '',
    firstSurahNameFa: '',
  };
});

export const JuzJumpTab: React.FC<JuzJumpTabProps> = ({
  selectedJuzNumber,
  onSelectJuz,
  juzCards,
  testID,
  style,
}) => {
  const [cards, setCards] = useState<JuzCardInfo[]>(
    juzCards && juzCards.length > 0 ? juzCards : FALLBACK_JUZ_CARDS,
  );

  // Keep cards in sync with juzCards prop or load asynchronously from quickJumpService
  useEffect(() => {
    if (juzCards && juzCards.length > 0) {
      setCards(juzCards);
      return;
    }

    let isMounted = true;
    getAllJuzCards()
      .then((loaded) => {
        if (isMounted && loaded && loaded.length > 0) {
          setCards(loaded);
        }
      })
      .catch(() => {
        // Retain fallback cards if database provider is unavailable
      });

    return () => {
      isMounted = false;
    };
  }, [juzCards]);

  return (
    <View style={[styles.container, style]} testID={testID}>
      <FlatList
        data={cards}
        numColumns={2}
        keyExtractor={(item) => String(item.juzNumber)}
        keyboardShouldPersistTaps="handled"
        style={styles.gridList}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={5}
        renderItem={({ item }) => {
          const isSelected = item.juzNumber === selectedJuzNumber;
          const cleanFa = cleanSurahNameFa(item.firstSurahNameFa);

          return (
            <TouchableOpacity
              onPress={() => onSelectJuz(item.juzNumber)}
              style={[styles.juzCard, isSelected && styles.juzCardSelected]}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`جزء ${toPersianDigits(item.juzNumber)}${
                cleanFa ? `، شروع از سوره ${cleanFa}` : ''
              }`}
              accessibilityHint="برای انتخاب این جزء ضربه بزنید"
            >
              {/* Header: Juz Title Badge + Verse Count */}
              <View style={styles.cardHeaderRow}>
                <View style={[styles.juzBadge, isSelected && styles.juzBadgeSelected]}>
                  <Text style={[styles.juzBadgeText, isSelected && styles.juzBadgeTextSelected]}>
                    جزء {toPersianDigits(item.juzNumber)}
                  </Text>
                </View>

                <View style={styles.verseCountPill}>
                  <Text style={styles.verseCountPillText}>
                    {toPersianDigits(item.verseCount)} آیه
                  </Text>
                </View>
              </View>

              {/* Middle: Arabic Calligraphy & Persian Name */}
              <View style={styles.cardCenter}>
                {Boolean(item.firstSurahNameArabic) && (
                  <Text
                    style={[styles.arabicName, isSelected && styles.arabicNameSelected]}
                    numberOfLines={1}
                  >
                    {item.firstSurahNameArabic}
                  </Text>
                )}
                {Boolean(cleanFa) && (
                  <Text
                    style={[styles.persianName, isSelected && styles.persianNameSelected]}
                    numberOfLines={1}
                  >
                    سوره {cleanFa}
                  </Text>
                )}
              </View>

              {/* Footer: Start Page Badge */}
              <View style={styles.cardFooter}>
                <Text style={styles.pageBadgeText}>
                  صفحه {toPersianDigits(item.startPageNumber)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  gridList: {
    flex: 1,
  },
  gridContent: {
    paddingBottom: spacing.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  juzCard: {
    flex: 1,
    minHeight: 110,
    backgroundColor: '#07241c',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  juzCardSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  cardHeaderRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  juzBadge: {
    backgroundColor: colors.surfaceFloating,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  juzBadgeSelected: {
    borderColor: colors.goldAccent,
    backgroundColor: colors.goldGlow,
  },
  juzBadgeText: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.goldAccent,
  },
  juzBadgeTextSelected: {
    color: colors.goldAccent,
  },
  verseCountPill: {
    backgroundColor: colors.primarySubtle,
    borderRadius: borderRadius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  verseCountPillText: {
    fontFamily: fonts.primary,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardCenter: {
    marginVertical: spacing.xs,
    alignItems: 'center',
  },
  arabicName: {
    fontFamily: fonts.uthmanicHafs,
    fontSize: 18,
    color: colors.primaryLight,
    textAlign: 'center',
    marginBottom: 2,
  },
  arabicNameSelected: {
    color: colors.goldAccent,
  },
  persianName: {
    fontFamily: fonts.primaryBold,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  persianNameSelected: {
    color: colors.primaryLight,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSeparator,
    paddingTop: spacing.xs,
    alignItems: 'center',
  },
  pageBadgeText: {
    fontFamily: fonts.primary,
    fontSize: 10,
    color: colors.textFaded,
    textAlign: 'center',
  },
});
