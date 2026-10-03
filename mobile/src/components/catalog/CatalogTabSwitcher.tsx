import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  useThemeColors,
  type ColorTheme,
} from '@/theme';
import {
  CATALOG_COMPONENT_CONTRACTS,
  CATALOG_TABS,
  type CatalogTabId,
  type CatalogTab,
} from './catalogFormatters';

export interface CatalogTabSwitcherProps {
  activeTab: CatalogTabId;
  onTabChange: (tab: CatalogTabId) => void;
  tabs?: readonly CatalogTab[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const CatalogTabSwitcher: React.FC<CatalogTabSwitcherProps> = ({
  activeTab,
  onTabChange,
  tabs = CATALOG_TABS,
  style,
  testID = 'catalog-tab-switcher',
}: CatalogTabSwitcherProps) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View testID={testID} style={[styles.container, style]} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            testID={`${testID}-${tab.id}`}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.id)}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <Text
              style={[styles.tabText, isActive ? styles.activeTabText : styles.inactiveTabText]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
    minHeight: CATALOG_COMPONENT_CONTRACTS.tabSwitcher.containerMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceFloating,
    borderRadius: borderRadius.pill,
    borderColor: colors.borderSubtle,
    borderWidth: CATALOG_COMPONENT_CONTRACTS.tabSwitcher.containerBorderWidth,
    padding: CATALOG_COMPONENT_CONTRACTS.tabSwitcher.padding,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    minHeight: CATALOG_COMPONENT_CONTRACTS.tabSwitcher.tabMinHeight,
    minWidth: CATALOG_COMPONENT_CONTRACTS.tabSwitcher.tabMinWidth,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: CATALOG_COMPONENT_CONTRACTS.tabSwitcher.activeTabBorderWidth,
    borderColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.goldAccent,
  },
  tabText: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  activeTabText: {
    fontFamily: fonts.uiBold,
    color: colors.goldAccent,
  },
  inactiveTabText: {
    fontFamily: fonts.uiMedium,
    color: colors.textSecondary,
  },
});
