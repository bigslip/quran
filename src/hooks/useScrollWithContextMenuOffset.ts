import { useCallback, useRef, RefObject } from 'react';

import { isMobile } from '@/utils/responsive';

const DEFAULT_CONTEXT_MENU_HEIGHT = 70;
const DEFAULT_CONTEXT_MENU_HEIGHT_BEFORE_COLLAPSED = 156;
const MAX_SCROLL_POSITION_TO_NAVBAR_COLLAPSED = 13;

/**
 * A hook that scrolls to a specific element in the DOM with an offset for the context menu.
 * The scrolling will only happen when executeScroll function is invoked.
 *
 * @returns {[() => void, RefObject<T>]} A tuple containing the scroll function and the element ref
 */
const useScrollWithContextMenuOffset = <T extends HTMLElement>(): [() => void, RefObject<T>] => {
  const elementRef = useRef<T>(null);

  const executeScroll = useCallback((): void => {
    if (elementRef.current) {
      const isMobileDevice = isMobile();
      const currentScrollPosition = window.scrollY;
      const elementPosition =
        elementRef.current.getBoundingClientRect().top + currentScrollPosition;

      // Context menu height and responsive padding
      const contextMenuHeight =
        isMobileDevice && currentScrollPosition < MAX_SCROLL_POSITION_TO_NAVBAR_COLLAPSED
          ? DEFAULT_CONTEXT_MENU_HEIGHT_BEFORE_COLLAPSED
          : DEFAULT_CONTEXT_MENU_HEIGHT;
      const mobilePaddingOffset = 22; // Padding offset for mobile devices
      const desktopPaddingOffset = -23; // Padding offset for desktop devices
      const paddingOffset = isMobileDevice ? mobilePaddingOffset : desktopPaddingOffset;

      window.scrollTo({
        top: elementPosition - contextMenuHeight - paddingOffset,
        behavior: 'smooth',
      });
    }
  }, []);

  return [executeScroll, elementRef];
};

export default useScrollWithContextMenuOffset;
