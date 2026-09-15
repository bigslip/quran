import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface AmbientGlowProps {
  height?: number;
}

export const AmbientGlow: React.FC<AmbientGlowProps> = ({ height = 260 }) => {
  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      <Svg height="100%" width="100%">
        <Defs>
          <RadialGradient
            id="emeraldGlow"
            cx="50%"
            cy="15%"
            rx="60%"
            ry="55%"
            fx="50%"
            fy="15%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <Stop offset="50%" stopColor="#059669" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#041410" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#emeraldGlow)" />
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
