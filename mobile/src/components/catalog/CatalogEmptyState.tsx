import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { CATALOG_COMPONENT_CONTRACTS } from './catalogFormatters';

export interface CatalogEmptyStateProps {
  query: string;
  onClearQuery: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const CatalogEmptyState: React.FC<CatalogEmptyStateProps> = ({
  query,
  onClearQuery,
  style,
  testID = 'catalog-empty-state',
}) => {
  const trimmedQuery = query.trim();
  const titleText = trimmedQuery ? `موردی برای «${trimmedQuery}» یافت نشد` : 'موردی یافت نشد';

  return (
    <View testID={testID} style={[styles.container, style]}>
      {/* Centered Emerald Circular Badge with Search Icon */}
      <View style={styles.iconBadge}>
        <Search size={28} color={colors.primary} strokeWidth={2} testID={`${testID}-search-icon`} />
      </View>

      {/* Main Title */}
      <Text style={styles.title} testID={`${testID}-title`}>
        {titleText}
      </Text>

      {/* Persian Subtitle */}
      <Text style={styles.subtitle} testID={`${testID}-subtitle`}>
        لطفاً عبارت دیگری را جستجو کنید
      </Text>

      {/* Clear Search Button */}
      <TouchableOpacity
        testID={`${testID}-clear-button`}
        activeOpacity={0.7}
        onPress={onClearQuery}
        style={styles.clearButton}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="پاک کردن جستجو"
        accessibilityHint="برای پاک کردن عبارت جستجو ضربه بزنید"
      >
        <Text style={styles.clearButtonText}>پاک کردن جستجو</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: CATALOG_COMPONENT_CONTRACTS.emptyState.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  iconBadge: {
    width: CATALOG_COMPONENT_CONTRACTS.emptyState.iconBadgeSize,
    height: CATALOG_COMPONENT_CONTRACTS.emptyState.iconBadgeSize,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  clearButton: {
    minHeight: CATALOG_COMPONENT_CONTRACTS.emptyState.clearButtonMinHeight,
    minWidth: CATALOG_COMPONENT_CONTRACTS.emptyState.clearButtonMinWidth,
    backgroundColor: colors.primarySubtle,
    borderWidth: CATALOG_COMPONENT_CONTRACTS.emptyState.clearButtonBorderWidth,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
});
