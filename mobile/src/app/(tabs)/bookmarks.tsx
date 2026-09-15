import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';

export default function BookmarksScreen() {
  return (
    <View style={styles.container}>
      <AmbientGlow height={200} />
      <View style={styles.header}>
        <Text style={styles.title}>نشانه‌ها و یادداشت‌ها</Text>
      </View>
      <View style={styles.emptyContainer}>
        <Bookmark size={48} color={colors.textFaded} />
        <Text style={styles.emptyTitle}>هنوز نشانه‌ای ذخیره نکرده‌اید</Text>
        <Text style={styles.emptyDesc}>
          در حین تلاوت قرآن، با لمس آیکون نشانه می‌توانید آیات دلخواه خود را ذخیره کنید.
        </Text>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.mega,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyDesc: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textFaded,
    textAlign: 'center',
    lineHeight: 22,
  },
});
