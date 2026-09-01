import { useSyncExternalStore } from 'react';

export enum MobileSizeVariant {
  SMALL = 'small',
  LARGE = 'large',
}

const MOBILE_QUERY = '(max-width: 767.98px)';
const SMALL_MOBILE_QUERY = '(max-width: 374.98px)';

const createMediaQueryStore = (query: string) => {
  let mediaQueryList: MediaQueryList | null = null;

  const getMql = (): MediaQueryList | null => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return null;
    }
    if (!mediaQueryList) {
      mediaQueryList = window.matchMedia(query);
    }
    return mediaQueryList;
  };

  const subscribe = (callback: () => void) => {
    const mql = getMql();
    if (!mql) return () => {};

    if (mql.addEventListener) {
      mql.addEventListener('change', callback);
      return () => {
        mql.removeEventListener('change', callback);
      };
    }
    // Fallback for older browsers
    mql.addListener(callback);
    return () => {
      mql.removeListener(callback);
    };
  };

  const getSnapshot = () => {
    const mql = getMql();
    return mql ? mql.matches : false;
  };

  const getServerSnapshot = () => false;

  return { subscribe, getSnapshot, getServerSnapshot };
};

const mobileStore = createMediaQueryStore(MOBILE_QUERY);
const smallMobileStore = createMediaQueryStore(SMALL_MOBILE_QUERY);

/**
 * A hook that safely detects if the current viewport is mobile-sized.
 * Handles SSR by returning false on server and updates on client using matchMedia + useSyncExternalStore.
 *
 * @returns {boolean} True if the viewport is mobile-sized, false otherwise
 */
const useIsMobile = (variant?: MobileSizeVariant): boolean => {
  const store = variant === MobileSizeVariant.SMALL ? smallMobileStore : mobileStore;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
};

export default useIsMobile;
