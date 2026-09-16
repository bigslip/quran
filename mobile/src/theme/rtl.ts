import { Platform, I18nManager } from 'react-native';

/**
 * Single source of truth for bidirectional layout in the Quran.ir mobile app.
 *
 * To ensure 100% deterministic layout across both iOS (which operates in standard LTR coordinate
 * space in Expo Go) and Android, Quran.ir manages its own RTL layout explicitly:
 * - In standard (LTR) coordinate space, 'row-reverse' places child 0 on the physical RIGHT.
 * - For Arabic and Persian text, React Native's Fabric TextLayoutManager on Android automatically
 *   swaps ALIGN_OPPOSITE for RTL scripts (TextDirectionHeuristics.FIRSTSTRONG_LTR.isRtl == true).
 *   Therefore, 'left' maps to Gravity.RIGHT on Android, while 'right' aligns to physical right on iOS.
 */
export const isRTL: boolean = Boolean(I18nManager.isRTL);

/** Flex direction that always flows Right-to-Left (first child on the physical right). */
export const rtlRow: 'row' | 'row-reverse' = 'row-reverse';

/** Flex direction that flows Left-to-Right (first child on the physical left). */
export const rtlRowReverse: 'row' | 'row-reverse' = 'row';

/** Text alignment that always aligns to the physical Right across both Android and iOS. */
export const rtlTextAlign: 'left' | 'right' = 'right';

/** Text alignment that always aligns to the physical Left across both Android and iOS. */
export const ltrTextAlign: 'left' | 'right' = 'left';

/** Cross-axis flex alignment that aligns to the physical Right in column layouts. */
export const rtlFlexStart: 'flex-start' | 'flex-end' = 'flex-end';

/** Cross-axis flex alignment that aligns to the physical Left in column layouts. */
export const rtlFlexEnd: 'flex-start' | 'flex-end' = 'flex-start';

/** Safe writing direction: 'rtl' on iOS; undefined on Android to avoid triggering layout inversion. */
export const rtlWritingDirection: 'rtl' | undefined = Platform.OS === 'ios' ? 'rtl' : undefined;
