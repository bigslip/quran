import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useAppTheme, AppTheme } from '@/theme';

const { width } = Dimensions.get('window');

interface AmbientGlowProps {
  height?: number;
}

export const THEME_GLOW_CONFIG: Record<AppTheme, { centerColor: string; centerOpacity: number }> = {
  emerald: { centerColor: '#10b981', centerOpacity: 0.25 },
  dark: { centerColor: '#10b981', centerOpacity: 0.05 },
  sepia: { centerColor: '#d97706', centerOpacity: 0.06 },
  light: { centerColor: '#059669', centerOpacity: 0.04 },
};

export const AmbientGlow: React.FC<AmbientGlowProps> = ({ height = 260 }) => {
  const { theme, colors } = useAppTheme();
  const glowConfig = THEME_GLOW_CONFIG[theme] ?? THEME_GLOW_CONFIG.emerald;

  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      <Svg height="100%" width="100%">
        <Defs>
          <RadialGradient
            id={`ambientGlow-${theme}`}
            cx="50%"
            cy="15%"
            rx="60%"
            ry="55%"
            fx="50%"
            fy="15%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop
              offset="0%"
              stopColor={glowConfig.centerColor}
              stopOpacity={glowConfig.centerOpacity}
            />
            <Stop offset="100%" stopColor={colors.background} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#ambientGlow-${theme})`} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width,
    zIndex: 0,
  },
});
