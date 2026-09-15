import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Type, Globe, Volume2, Shield } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { useReadingStore } from '@/stores/useReadingStore';

export default function SettingsScreen() {
  const {
    showWordByWord,
    toggleWordByWord,
    showTranslation,
    toggleTranslation,
    quranScript,
    setQuranScript,
  } = useReadingStore();

  return (
    <View style={styles.container}>
      <AmbientGlow height={200} />
      <View style={styles.header}>
        <Text style={styles.title}>تنظیمات قرآن کریم</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>نمایش و متن</Text>

        <View style={styles.settingRow}>
          <Switch
            value={showWordByWord}
            onValueChange={toggleWordByWord}
            trackColor={{ false: '#334155', true: colors.primary }}
          />
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>ترجمه کلمه به کلمه</Text>
            <Text style={styles.settingSubLabel}>نمایش معنای فارسی هر کلمه در زیر آن</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Switch
            value={showTranslation}
            onValueChange={toggleTranslation}
            trackColor={{ false: '#334155', true: colors.primary }}
          />
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>ترجمه روان آیات</Text>
            <Text style={styles.settingSubLabel}>ترجمه آیت‌الله مکارم شیرازی</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <TouchableOpacity
            style={styles.scriptSelector}
            onPress={() => setQuranScript(quranScript === 'uthmani' ? 'indopak' : 'uthmani')}
          >
            <Text style={styles.scriptSelectedText}>
              {quranScript === 'uthmani' ? 'عثمان طه (حفص)' : 'رسم‌الخط شبه‌قاره (هند و پاک)'}
            </Text>
          </TouchableOpacity>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>رسم‌الخط قرآن</Text>
            <Text style={styles.settingSubLabel}>قلم و نگارش متن مقدس</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>درباره سامانه</Text>
        <View style={styles.infoCard}>
          <Text style={styles.appName}>قرآن کریم • پایگاه تخصصی Quran.ir</Text>
          <Text style={styles.appVersion}>نسخه ۱.۰.۰ (طرح معنوی سَنکتوری)</Text>
          <Text style={styles.appDesc}>
            توسعه‌یافته به صورت کاملاً آفلاین و رایگان، همراه با داده‌های رسمی بنیاد قرآن و خطاطی اصیل عثمان طه.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
    textAlign: 'right',
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
    color: colors.primary,
    textAlign: 'right',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
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
    color: colors.textPrimary,
  },
  settingSubLabel: {
    fontFamily: fonts.uiRegular,
    fontSize: 11,
    color: colors.textFaded,
    marginTop: 2,
  },
  scriptSelector: {
    backgroundColor: colors.surfaceFloating,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
  },
  scriptSelectedText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  appName: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  appVersion: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.primary,
  },
  appDesc: {
    fontFamily: fonts.uiRegular,
    fontSize: 12,
    color: colors.textFaded,
    lineHeight: 20,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
