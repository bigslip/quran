import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import {
  colors,
  fonts,
  fontSizes,
  borderRadius,
  spacing,
  rtlRow,
  themePalettes as THEME_PALETTES,
} from '@/theme';
import { useReadingStore } from '@/stores/useReadingStore';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  testID?: string;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const activeTheme = useReadingStore.getState()?.theme || 'emerald';
      const palette = THEME_PALETTES[activeTheme] || colors;

      return (
        <View
          style={[styles.container, { backgroundColor: palette.background }]}
          testID={this.props.testID || 'error-boundary-container'}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: palette.surfaceCard,
                borderColor: palette.borderSubtle,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <AlertTriangle size={32} color={palette.warning} />
            </View>

            <Text style={[styles.heading, { color: palette.textPrimary }]}>
              خطایی در بارگذاری رخ داد
            </Text>

            <Text style={[styles.body, { color: palette.textMuted }]}>
              متأسفانه در اجرای این بخش مشکلی پیش آمد. برای ادامه، دکمه تلاش مجدد را لمس کنید.
            </Text>

            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: palette.primary }]}
              onPress={this.handleReset}
              testID="error-boundary-retry-button"
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="تلاش مجدد"
            >
              <RefreshCw size={18} color={palette.textInverse} style={styles.buttonIcon} />
              <Text style={[styles.retryButtonText, { color: palette.textInverse }]}>
                تلاش مجدد
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#041410',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    direction: 'ltr',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(6, 32, 25, 0.75)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.circle,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  body: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  retryButton: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  buttonIcon: {
    marginHorizontal: spacing.xs,
  },
  retryButtonText: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.md,
    color: colors.textInverse,
    textAlign: 'center',
  },
});
