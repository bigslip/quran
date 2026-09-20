import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import {
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  useThemeColors,
  themePalettes,
  AppTheme,
  rtlTextAlign,
} from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { useReadingStore } from '@/stores/useReadingStore';

interface ThemeCardData {
  id: AppTheme;
  title: string;
  subtitle: string;
  testID: string;
}

const THEME_OPTIONS: ThemeCardData[] = [
  {
    id: 'dark',
    title: 'شبستان',
    subtitle: 'کنتراست تاریک عمیق، مناسب تلاوت شبانه و کاهش خستگی چشم',
    testID: 'settings-theme-dark',
  },
  {
    id: 'emerald',
    title: 'شب معنوی (پیش‌فرض)',
    subtitle: 'زمردین قدسی و اصیل با آرامش معنوی و درخشش نورانی آیات',
    testID: 'settings-theme-emerald',
  },
  {
    id: 'sepia',
    title: 'مصحف پوستی',
    subtitle: 'کاغذ کهن بدون نور آبی، آرامش مطالعه طولانی مانند نسخه‌های خطی',
    testID: 'settings-theme-sepia',
  },
  {
    id: 'light',
    title: 'وضوح روز',
    subtitle: 'کنتراست حداکثری و پس‌زمینه روشن، بهینه‌شده برای قرائت در روشنایی روز',
    testID: 'settings-theme-light',
  },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const {
    showWordByWord,
    toggleWordByWord,
    showTranslation,
    toggleTranslation,
    quranScript,
    setQuranScript,
    theme,
    setTheme,
  } = useReadingStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientGlow height={200} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>تنظیمات قرآن کریم</Text>
        </View>

        {/* 1. Theme & Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>پوسته و رنگ‌بندی</Text>

          {THEME_OPTIONS.map((t) => {
            const isActive = theme === t.id;
            const palette = themePalettes[t.id];

            return (
              <TouchableOpacity
                key={t.id}
                testID={t.testID}
                onPress={() => setTheme(t.id)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`فعالسازی تم ${t.title}`}
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: colors.surfaceCard,
                    borderColor: isActive ? colors.primary : colors.borderSubtle,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.themeCardRow}>
                  {/* Left: Swatches & Active Indicator */}
                  <View style={styles.themeLeftGroup}>
                    {isActive ? (
                      <View
                        style={[
                          styles.activeBadge,
                          {
                            backgroundColor: colors.primarySubtle,
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        <Check size={12} color={colors.primary} strokeWidth={2.5} />
                        <Text style={[styles.activeBadgeText, { color: colors.primary }]}>
                          فعال
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.inactiveDot, { borderColor: colors.borderSubtle }]} />
                    )}

                    {/* Color Preview Swatches (background, text ink, rosette gold) */}
                    <View style={styles.swatchRow}>
                      <View
                        style={[
                          styles.swatchItem,
                          {
                            backgroundColor: palette.background,
                            borderColor: palette.borderSubtle,
                            borderWidth: 1,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.swatchItem,
                          {
                            backgroundColor: palette.textPrimary,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.swatchItem,
                          {
                            backgroundColor: palette.goldAccent,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Right: Theme Persian Title & Description */}
                  <View style={styles.themeRightGroup}>
                    <Text style={[styles.themeTitle, { color: colors.textPrimary }]}>
                      {t.title}
                    </Text>
                    <Text style={[styles.themeSubtitle, { color: colors.textFaded }]}>
                      {t.subtitle}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Display & Text Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>نمایش و متن</Text>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Switch
              value={showWordByWord}
              onValueChange={toggleWordByWord}
              trackColor={{ false: colors.borderSubtle, true: colors.primary }}
            />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                ترجمه کلمه به کلمه
              </Text>
              <Text style={[styles.settingSubLabel, { color: colors.textFaded }]}>
                نمایش معنای فارسی هر کلمه در زیر آن
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Switch
              value={showTranslation}
              onValueChange={toggleTranslation}
              trackColor={{ false: colors.borderSubtle, true: colors.primary }}
            />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                ترجمه روان آیات
              </Text>
              <Text style={[styles.settingSubLabel, { color: colors.textFaded }]}>
                ترجمه آیت‌الله مکارم شیرازی
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.scriptSelector,
                {
                  backgroundColor: colors.surfaceFloating,
                  borderColor: colors.borderIridescent,
                },
              ]}
              onPress={() => setQuranScript(quranScript === 'uthmani' ? 'indopak' : 'uthmani')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="تغییر رسم‌الخط قرآن"
            >
              <Text style={[styles.scriptSelectedText, { color: colors.textSecondary }]}>
                {quranScript === 'uthmani' ? 'عثمان طه (حفص)' : 'رسم‌الخط شبه‌قاره (هند و پاک)'}
              </Text>
            </TouchableOpacity>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                رسم‌الخط قرآن
              </Text>
              <Text style={[styles.settingSubLabel, { color: colors.textFaded }]}>
                قلم و نگارش متن مقدس
              </Text>
            </View>
          </View>
        </View>

        {/* 3. About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>درباره سامانه</Text>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.appName, { color: colors.textPrimary }]}>
              قرآن کریم • پایگاه تخصصی Quran.ir
            </Text>
            <Text style={[styles.appVersion, { color: colors.primary }]}>
              نسخه ۱.۰.۰ (طرح معنوی سَنکتوری)
            </Text>
            <Text style={[styles.appDesc, { color: colors.textFaded }]}>
              توسعه‌یافته به صورت کاملاً آفلاین و رایگان، همراه با داده‌های رسمی بنیاد قرآن و خطاطی
              اصیل عثمان طه.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    textAlign: rtlTextAlign,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  sectionHeading: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    textAlign: rtlTextAlign,
  },
  themeCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 56,
  },
  themeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeRightGroup: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  themeTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    textAlign: 'right',
  },
  themeSubtitle: {
    fontFamily: fonts.uiRegular,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'right',
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    gap: 3,
  },
  activeBadgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: 10,
    fontWeight: '700',
  },
  inactiveDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swatchItem: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 52,
  },
  settingTextContainer: {
    alignItems: 'flex-end',
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  settingSubLabel: {
    fontFamily: fonts.uiRegular,
    fontSize: 11,
    marginTop: 2,
  },
  scriptSelector: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  scriptSelectedText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
  },
  infoCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'flex-end',
    gap: spacing.xs,
    borderWidth: 1,
  },
  appName: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  appVersion: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
  },
  appDesc: {
    fontFamily: fonts.uiRegular,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
