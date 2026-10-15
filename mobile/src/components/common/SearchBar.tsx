import React, { useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type ReturnKeyTypeOptions,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import {
  borderRadius,
  spacing,
  fonts,
  fontSizes,
  useThemeColors,
  type ColorTheme,
} from '@/theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: ReturnKeyTypeOptions;
  onFocus?: () => void;
  onPress?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  testID?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'جستجو در قرآن (سوره، آیه، ترجمه)...',
  onClear,
  onSubmitEditing,
  returnKeyType = 'search',
  onFocus,
  onPress,
  autoFocus = false,
  editable = true,
  testID,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container} testID={testID ? `${testID}-container` : undefined}>
      <TouchableOpacity
        onPress={onSubmitEditing || onPress}
        disabled={!onSubmitEditing && !onPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="جستجو"
        testID={testID ? `${testID}-submit-button` : 'search-bar-submit-button'}
      >
        <Search
          size={18}
          color={value.trim().length > 0 ? colors.primary : colors.textFaded}
          style={styles.icon}
        />
      </TouchableOpacity>
      <TextInput
        testID={testID ? `${testID}-input` : 'search-bar-input'}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaded}
        textAlign="right"
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        onFocus={onFocus}
        autoFocus={autoFocus}
        editable={editable}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="پاک کردن متن جستجو"
          testID={testID ? `${testID}-clear-button` : 'search-bar-clear-button'}
        >
          <X size={16} color={colors.textFaded} />
        </TouchableOpacity>
      )}
    </View>
  );
};


const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.lg,
    height: 48,
    width: '100%',
  },
  icon: {
    marginEnd: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
