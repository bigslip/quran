import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, I18nManager } from 'react-native';
import { colors } from '@/theme';

// Ensure native RTL mirroring is disabled; Quran.ir manages its own bidirectional presentation
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Vazirmatn-Regular': require('../../assets/fonts/Vazirmatn-Regular.ttf'),
    'UthmanicHafs': require('../../assets/fonts/UthmanicHafs.ttf'),
    'IndoPakNastaleeq': require('../../assets/fonts/IndoPakNastaleeq.ttf'),
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
      <View style={styles.root}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
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
    backgroundColor: colors.background,
    direction: 'ltr',
  },
});
