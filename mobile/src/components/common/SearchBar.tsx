import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, borderRadius, spacing, fonts, fontSizes } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'جستجو در قرآن (سوره، آیه، ترجمه)...',
  onClear,
}) => {
  return (
    <View style={styles.container}>
      <Search size={18} color={colors.textFaded} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaded}
        textAlign="right"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        >
          <X size={16} color={colors.textFaded} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
});
