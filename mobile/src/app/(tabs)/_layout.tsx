import React from 'react';
import { Tabs } from 'expo-router';
import { BookOpen, ListFilter, Search, Bookmark, Settings } from 'lucide-react-native';
import { useThemeColors, fonts, fontSizes } from '@/theme';

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surfaceFloating,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.uiMedium,
          fontSize: fontSizes.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'خانه',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="surahs"
        options={{
          title: 'سوره‌ها',
          tabBarIcon: ({ color, size }) => <ListFilter color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'جستجو',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'نشانه‌ها',
          tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'تنظیمات',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
