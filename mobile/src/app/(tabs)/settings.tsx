import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Check, Download, Trash2, HardDrive } from 'lucide-react-native';
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
import {
  AVAILABLE_DOWNLOADABLE_TAFSIRS,
  isTafsirDownloaded,
  downloadTafsirDatabase,
  deleteTafsirDatabase,
  getDownloadedTafsirSize,
} from '@/services/db';
import {
  SETTINGS_TAFSIR_CONTRACTS,
  formatTafsirSizeFa,
  formatDownloadProgressFa,
  formatTotalStorageFa,
  getTafsirItemState,
} from '@/components/settings/settingsContracts';
import { WidgetSettingsSection } from '@/components/settings/WidgetSettingsSection';

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

  // Offline Tafsir state
  const [downloadedSlugs, setDownloadedSlugs] = React.useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = React.useState<Record<string, number>>({});
  const [activeDownloads, setActiveDownloads] = React.useState<Set<string>>(new Set());
  const [totalStorageBytes, setTotalStorageBytes] = React.useState<number>(0);

  const refreshTafsirStatus = React.useCallback(async () => {
    try {
      const downloaded: string[] = [];
      let totalBytes = 0;
      for (const t of AVAILABLE_DOWNLOADABLE_TAFSIRS) {
        const isDone = await isTafsirDownloaded(t.slug);
        if (isDone) {
          downloaded.push(t.slug);
          const size = await getDownloadedTafsirSize(t.slug);
          totalBytes += size;
        }
      }
      setDownloadedSlugs(downloaded);
      setTotalStorageBytes(totalBytes);
    } catch {
      // Non-fatal status check error
    }
  }, []);

  React.useEffect(() => {
    refreshTafsirStatus();
  }, [refreshTafsirStatus]);

  const handleDownload = async (slug: string) => {
    if (activeDownloads.has(slug)) return;
    setActiveDownloads((prev) => new Set(prev).add(slug));
    setDownloadProgress((prev) => ({ ...prev, [slug]: 0 }));

    try {
      await downloadTafsirDatabase(slug, (p) => {
        setDownloadProgress((prev) => ({ ...prev, [slug]: p }));
      });
      await refreshTafsirStatus();
    } catch (err) {
      console.warn('Tafsir download failed:', err);
      Alert.alert(
        'خطا در بارگیری تفسیر',
        'دریافت فایل تفسیر با خطا مواجه شد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.',
      );
    } finally {
      setActiveDownloads((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
      setDownloadProgress((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
    }
  };

  const handleDelete = (slug: string, name: string) => {
    Alert.alert('حذف فایل تفسیر', `آیا از حذف داده‌های آفلاین «${name}» اطمینان دارید؟`, [
      { text: 'انصراف', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTafsirDatabase(slug);
            await refreshTafsirStatus();
          } catch (err) {
            console.warn('Tafsir deletion failed:', err);
          }
        },
      },
    ]);
  };

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

        {/* 3. Offline Tafsirs Manager Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.primary }]}>
              {SETTINGS_TAFSIR_CONTRACTS.sectionTitle}
            </Text>
            {totalStorageBytes > 0 && (
              <View style={styles.storageBadge}>
                <HardDrive size={12} color={colors.textFaded} />
                <Text style={[styles.storageBadgeText, { color: colors.textFaded }]}>
                  {formatTotalStorageFa(totalStorageBytes)}
                </Text>
              </View>
            )}
          </View>

          {AVAILABLE_DOWNLOADABLE_TAFSIRS.map((tafsir) => {
            const state = getTafsirItemState(tafsir.slug, downloadedSlugs, activeDownloads);
            const progress = downloadProgress[tafsir.slug] || 0;

            return (
              <View
                key={tafsir.slug}
                testID={`tafsir-card-${tafsir.slug}`}
                style={[
                  styles.tafsirCard,
                  {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View style={styles.tafsirCardContent}>
                  {/* Left: Action Button / Progress */}
                  <View style={styles.tafsirActionGroup}>
                    {state === 'downloading' && (
                      <View style={styles.progressContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={[styles.progressText, { color: colors.primary }]}>
                          {formatDownloadProgressFa(progress)}
                        </Text>
                      </View>
                    )}

                    {state === 'downloaded' && (
                      <TouchableOpacity
                        testID={`tafsir-delete-btn-${tafsir.slug}`}
                        onPress={() => handleDelete(tafsir.slug, tafsir.name)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`${SETTINGS_TAFSIR_CONTRACTS.deleteActionLabel} ${tafsir.name}`}
                        style={[
                          styles.actionButton,
                          styles.deleteButton,
                          {
                            backgroundColor: colors.surfaceFloating,
                            borderColor: colors.borderSubtle,
                          },
                        ]}
                      >
                        <Trash2 size={18} color={colors.error} />
                      </TouchableOpacity>
                    )}

                    {state === 'not_downloaded' && (
                      <TouchableOpacity
                        testID={`tafsir-download-btn-${tafsir.slug}`}
                        onPress={() => handleDownload(tafsir.slug)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`${SETTINGS_TAFSIR_CONTRACTS.downloadActionLabel} ${tafsir.name}`}
                        style={[
                          styles.actionButton,
                          styles.downloadButton,
                          {
                            backgroundColor: colors.primary,
                          },
                        ]}
                      >
                        <Download size={18} color={colors.textInverse} />
                        <Text style={[styles.downloadButtonText, { color: colors.textInverse }]}>
                          دانلود
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Right: Info */}
                  <View style={styles.tafsirInfoGroup}>
                    <View style={styles.tafsirTitleRow}>
                      {state === 'downloaded' && (
                        <View
                          style={[
                            styles.downloadedPill,
                            {
                              backgroundColor: colors.surfaceFloating,
                              borderColor: colors.primary,
                            },
                          ]}
                        >
                          <Check size={10} color={colors.primary} />
                          <Text style={[styles.downloadedPillText, { color: colors.primary }]}>
                            {SETTINGS_TAFSIR_CONTRACTS.downloadedBadgeLabel}
                          </Text>
                        </View>
                      )}
                      <Text style={[styles.tafsirName, { color: colors.textPrimary }]}>
                        {tafsir.name}
                      </Text>
                    </View>
                    <Text style={[styles.tafsirAuthor, { color: colors.textSecondary }]}>
                      {tafsir.authorName}
                    </Text>
                    <Text style={[styles.tafsirSize, { color: colors.textFaded }]}>
                      حجم بسته: {formatTafsirSizeFa(tafsir.approximateSizeMb)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar when downloading */}
                {state === 'downloading' && (
                  <View
                    testID={`tafsir-progress-${tafsir.slug}`}
                    style={[styles.progressBarTrack, { backgroundColor: colors.surfaceFloating }]}
                  >
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${Math.round(progress * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* 4. Home Screen Widgets & Live Previewer */}
        <WidgetSettingsSection />

        {/* 5. About Section */}
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
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xl,
    textAlign: rtlTextAlign,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  sectionHeading: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
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
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
    textAlign: 'right',
  },
  themeSubtitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
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
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xxs,
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
    fontFamily: fonts.uiMedium,
    fontSize: fontSizes.sm,
  },
  settingSubLabel: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
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
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
  },
  appVersion: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
  },
  appDesc: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    lineHeight: 20,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storageBadgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
  },
  tafsirCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: SETTINGS_TAFSIR_CONTRACTS.cardMinHeight,
    borderWidth: 1,
    gap: spacing.sm,
  },
  tafsirCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tafsirActionGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  actionButton: {
    minWidth: SETTINGS_TAFSIR_CONTRACTS.actionButtonMinWidth,
    minHeight: SETTINGS_TAFSIR_CONTRACTS.actionButtonMinHeight,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  downloadButtonText: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xs,
  },
  deleteButton: {
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 44,
    minHeight: 44,
  },
  progressText: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xs,
  },
  tafsirInfoGroup: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: spacing.md,
    gap: 2,
  },
  tafsirTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tafsirName: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
    textAlign: 'right',
  },
  tafsirAuthor: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    textAlign: 'right',
  },
  tafsirSize: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xxs,
    textAlign: 'right',
  },
  downloadedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    gap: 3,
  },
  downloadedPillText: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xxs,
  },
  progressBarTrack: {
    height: SETTINGS_TAFSIR_CONTRACTS.progressBarHeight,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.pill,
  },
});
