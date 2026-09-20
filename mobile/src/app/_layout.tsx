import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, I18nManager } from 'react-native';
import { useAppTheme } from '@/theme';

// Ensure native RTL mirroring is disabled; Quran.ir manages its own bidirectional presentation
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

SplashScreen.preventAutoHideAsync();

const StatusBar = ExpoStatusBar as React.ComponentType<{
  style?: 'auto' | 'inverted' | 'light' | 'dark';
  backgroundColor?: string;
  translucent?: boolean;
  animated?: boolean;
  hidden?: boolean;
}>;

export default function RootLayout() {
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark' || theme === 'emerald';

  const [fontsLoaded, fontError] = useFonts({
    'Vazirmatn-Regular': require('../../assets/fonts/Vazirmatn-Regular.ttf'),
    'Vazirmatn-Medium': require('../../assets/fonts/Vazirmatn-Medium.ttf'),
    'Vazirmatn-Bold': require('../../assets/fonts/Vazirmatn-Bold.ttf'),
    UthmanicHafs: require('../../assets/fonts/UthmanicHafs.ttf'),
    IndoPakNastaleeq: require('../../assets/fonts/IndoPakNastaleeq.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={[styles.root, styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          style={isDark ? 'light' : 'dark'}
          backgroundColor={colors.background}
          translucent={true}
        />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="surah/[id]" options={{ presentation: 'card' }} />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    direction: 'ltr',
  },
  container: {
    flex: 1,
    direction: 'ltr',
  },
});
