import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Play,
  BookOpen,
  Bookmark,
  Radio,
  Mic,
  Award,
  Compass,
  Sparkles,
} from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius, rtlRow, rtlTextAlign } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { SanctuaryBadge } from '@/components/common/SanctuaryBadge';
import { SanctuaryCard } from '@/components/common/SanctuaryCard';
import { SearchBar } from '@/components/common/SearchBar';
import { QuickJumpModal } from '@/components/navigation';
import { JumpDestination } from '@/services/db/quickJumpContracts';
import { useReadingStore } from '@/stores/useReadingStore';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('روز بخیر');
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);

  const { lastReadChapterId, lastReadVerseNumber, lastReadChapterNameFa } = useReadingStore();

  const handleQuickJump = useCallback(
    (destination: JumpDestination) => {
      setIsQuickJumpOpen(false);
      router.push(
        `/surah/${destination.chapterId}?verse=${destination.verseNumber}&page=${destination.pageNumber}` as any,
      );
    },
    [router],
  );

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) setGreeting('صبح بخیر');
    else if (hour >= 12 && hour < 17) setGreeting('روز بخیر');
    else if (hour >= 17 && hour < 21) setGreeting('عصر بخیر');
    else setGreeting('شامگاه بخیر');
  }, []);

  const quickSurahs = [
    { id: 36, name: 'یس', desc: 'قلب قرآن' },
    { id: 55, name: 'الرحمن', desc: 'عروس قرآن' },
    { id: 56, name: 'واقعه', desc: 'سوره برکت' },
    { id: 67, name: 'ملک', desc: 'نجات‌بخش' },
    { id: 18, name: 'کهف', desc: 'جمعه‌ها' },
    { id: 114, name: 'ناس', desc: 'پناه‌گاه' },
  ];

  return (
    <View style={styles.container}>
      <AmbientGlow height={320} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Sanctuary Badge & Greeting */}
        <View style={styles.header}>
          <SanctuaryBadge label="فضای معنوی قرآن کریم" />
          <Text style={styles.greetingText}>{greeting}، همراه قرآنی</Text>
          <Text style={styles.heroTitle}>قرآن من</Text>
        </View>

        {/* Search Command Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="جستجوی سوره، آیه، کلمه..."
          />
        </View>

        {/* Continue Reading Card */}
        <SanctuaryCard elevated style={styles.continueCard}>
          <View style={styles.continueHeader}>
            <View style={styles.continueBadge}>
              <Bookmark size={14} color={colors.primary} />
              <Text style={styles.continueBadgeText}>ادامه تلاوت</Text>
            </View>
            <Text style={styles.lastReadTime}>آخرین بازدید</Text>
          </View>

          <View style={styles.continueBody}>
            <View style={styles.continueInfo}>
              <Text style={styles.surahNameFa}>{lastReadChapterNameFa}</Text>
              <Text style={styles.verseLocation}>آیه {lastReadVerseNumber}</Text>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              activeOpacity={0.8}
              onPress={() => router.push(`/surah/${lastReadChapterId}` as any)}
            >
              <Play size={20} color="#ffffff" fill="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '45%' }]} />
          </View>
        </SanctuaryCard>

        {/* Quick Jump Action Card */}
        <TouchableOpacity
          style={styles.quickJumpButton}
          activeOpacity={0.8}
          onPress={() => setIsQuickJumpOpen(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="پرش سریع به متن قرآن"
          testID="home-quick-jump-button"
        >
          <SanctuaryCard elevated style={styles.quickJumpCard}>
            <View style={styles.quickJumpRow}>
              <View style={styles.quickJumpIconContainer}>
                <Compass size={24} color={colors.goldAccent} />
              </View>
              <View style={styles.quickJumpInfo}>
                <Text style={styles.quickJumpTitle}>پرش سریع به متن قرآن</Text>
                <Text style={styles.quickJumpSubtitle}>
                  انتقال مستقیم به سوره، آیه، شماره صفحه یا جزء
                </Text>
              </View>
            </View>
          </SanctuaryCard>
        </TouchableOpacity>

        {/* Quick Surah Access Pills */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>دسترسی سریع</Text>
          <Sparkles size={16} color={colors.goldAccent} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickSurahsRow}
        >
          {quickSurahs.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.quickSurahPill}
              onPress={() => router.push(`/surah/${s.id}` as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickSurahName}>سوره {s.name}</Text>
              <Text style={styles.quickSurahDesc}>{s.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Daily Ayah Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>آیه و تدبر روز</Text>
        </View>

        <SanctuaryCard style={styles.dailyAyahCard}>
          <Text style={styles.dailyAyahArabic}>أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</Text>
          <Text style={styles.dailyAyahTranslation}>
            «آگاه باشید که تنها با یاد خدا دل‌ها آرام می‌گیرد.»
          </Text>
          <View style={styles.dailyAyahFooter}>
            <Text style={styles.dailyAyahRef}>سوره رعد • آیه ۲۸</Text>
            <TouchableOpacity style={styles.listenButton}>
              <Play size={14} color={colors.primary} />
              <Text style={styles.listenButtonText}>استماع</Text>
            </TouchableOpacity>
          </View>
        </SanctuaryCard>

        {/* Quick Portal Services */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>بخش‌های منتخب</Text>
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.75}
            onPress={() => router.push('/surahs')}
          >
            <BookOpen size={24} color={colors.primary} />
            <Text style={styles.gridItemTitle}>فهرست ۱۱۴ سوره</Text>
            <Text style={styles.gridItemDesc}>فهرست ترتیبی و نزول</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} activeOpacity={0.75}>
            <Radio size={24} color={colors.goldAccent} />
            <Text style={styles.gridItemTitle}>رادیو ۲۴ ساعته</Text>
            <Text style={styles.gridItemDesc}>پخش زنده تلاوت قرآن</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} activeOpacity={0.75}>
            <Mic size={24} color="#38bdf8" />
            <Text style={styles.gridItemTitle}>قاریان برگزیده</Text>
            <Text style={styles.gridItemDesc}>اساتید ایرانی و جهان اسلام</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} activeOpacity={0.75}>
            <Award size={24} color="#ec4899" />
            <Text style={styles.gridItemTitle}>برنامه‌های آموزشی</Text>
            <Text style={styles.gridItemDesc}>تجوید و تفسیر کاربردی</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <QuickJumpModal
        visible={isQuickJumpOpen}
        onClose={() => setIsQuickJumpOpen(false)}
        onJump={handleQuickJump}
        initialChapterId={lastReadChapterId || 1}
        initialVerseNumber={lastReadVerseNumber || 1}
        testID="home-quick-jump-modal"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 54,
    paddingBottom: 40,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  heroTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.jumbo,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  searchSection: {
    marginBottom: spacing.lg,
  },
  continueCard: {
    marginBottom: spacing.xl,
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  continueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueBadgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  lastReadTime: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
  },
  continueBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  continueInfo: {
    alignItems: 'flex-start',
  },
  surahNameFa: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  verseLocation: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  quickSurahsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  quickSurahPill: {
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 90,
  },
  quickSurahName: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quickSurahDesc: {
    fontFamily: fonts.uiRegular,
    fontSize: 10,
    color: colors.textFaded,
    marginTop: 2,
  },
  dailyAyahCard: {
    marginBottom: spacing.xl,
  },
  dailyAyahArabic: {
    fontFamily: fonts.quranHafs,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: spacing.sm,
  },
  dailyAyahTranslation: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  dailyAyahFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderSeparator,
    paddingTop: spacing.sm,
  },
  dailyAyahRef: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    gap: 4,
  },
  listenButtonText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '47.5%',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  gridItemTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  gridItemDesc: {
    fontFamily: fonts.uiRegular,
    fontSize: 11,
    color: colors.textFaded,
  },
  quickJumpButton: {
    minHeight: 44,
    marginBottom: spacing.xl,
  },
  quickJumpCard: {
    padding: spacing.md,
  },
  quickJumpRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.md,
  },
  quickJumpIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.circle,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickJumpInfo: {
    flex: 1,
  },
  quickJumpTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: rtlTextAlign,
  },
  quickJumpSubtitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: rtlTextAlign,
  },
});
