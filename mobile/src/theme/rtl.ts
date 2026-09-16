import { I18nManager } from 'react-native';

/**
 * Single source of truth for bidirectional layout in the Quran.ir mobile app.
 *
 * In React Native:
 * - When `I18nManager.isRTL` is `true` (standard on Android when RTL is forced or device locale is RTL):
 *   - 'row' flows Right-to-Left (start is right, end is left).
 *   - 'row-reverse' flows Left-to-Right.
 *   - 'right' text alignment is mirrored by React Native's Android engine to Gravity.LEFT.
 *   - 'left' text alignment is mirrored to Gravity.RIGHT (aligning to physical right).
 * - When `I18nManager.isRTL` is `false` (standard on iOS Expo Go or LTR device locale):
 *   - 'row' flows Left-to-Right.
 *   - 'row-reverse' flows Right-to-Left.
 *   - 'right' text alignment aligns to the physical right.
 *
 * Using these helpers guarantees a 100% identical right-aligned, RTL reading experience
 * across iOS, Android, Expo Go, and standalone builds regardless of device system language.
 */
export const isRTL: boolean = Boolean(I18nManager.isRTL);

/** Flex direction that always flows Right-to-Left (first child on the physical right). */
export const rtlRow: 'row' | 'row-reverse' = isRTL ? 'row' : 'row-reverse';

/** Flex direction that flows Left-to-Right (first child on the physical left). */
export const rtlRowReverse: 'row' | 'row-reverse' = isRTL ? 'row-reverse' : 'row';

/** Text alignment that always aligns to the physical Right across both Android and iOS. */
export const rtlTextAlign: 'left' | 'right' = isRTL ? 'left' : 'right';

/** Text alignment that always aligns to the physical Left across both Android and iOS. */
export const ltrTextAlign: 'left' | 'right' = isRTL ? 'right' : 'left';

/** Cross-axis flex alignment that aligns to the physical Right in column layouts. */
export const rtlFlexStart: 'flex-start' | 'flex-end' = isRTL ? 'flex-start' : 'flex-end';

/** Cross-axis flex alignment that aligns to the physical Left in column layouts. */
export const rtlFlexEnd: 'flex-start' | 'flex-end' = isRTL ? 'flex-end' : 'flex-start';
