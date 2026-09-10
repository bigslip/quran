import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './RouteLoadingIndicator.module.scss';

import { LoadingState } from '@/components/ui';

export const RouteLoadingIndicator: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string>('');

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleStart = (url: string) => {
      // Ignore shallow route updates that do not trigger data fetching
      const currentPath = router.asPath.split('#')[0].split('?')[0];
      const nextPath = url.split('#')[0].split('?')[0];
      if (currentPath === nextPath && url.includes('#')) {
        return;
      }

      setTargetUrl(url);
      setIsLoading(true);
    };

    const handleComplete = () => {
      // Clean up smoothly
      timer = setTimeout(() => {
        setIsLoading(false);
        setTargetUrl('');
      }, 150);
    };

    const handleError = () => {
      setIsLoading(false);
      setTargetUrl('');
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      clearTimeout(timer);
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  if (!isLoading) {
    return null;
  }

  const getLoadingLabel = () => {
    if (!targetUrl) return t('loading', { defaultValue: 'Loading...' });

    const cleanPath = targetUrl.replace(/^\/[a-z]{2}(\/|$)/, '/'); // remove locale prefix

    if (cleanPath.startsWith('/juz/')) {
      return t('sidebar.loading-juz', { defaultValue: 'Loading Juz...' });
    }
    if (cleanPath.startsWith('/page/')) {
      return t('sidebar.loading-page', { defaultValue: 'Loading Page...' });
    }
    if (cleanPath.startsWith('/search')) {
      return t('sidebar.searching', { defaultValue: 'Searching...' });
    }
    if (/^\/\d+(\/|\?|$)/.test(cleanPath)) {
      return t('sidebar.loading-surah', { defaultValue: 'Loading Surah...' });
    }

    return t('loading', { defaultValue: 'Loading...' });
  };

  return (
    <div
      className={styles.portalContainer}
      data-testid="route-loading-indicator"
      aria-hidden="true"
    >
      <div className={styles.topBar} />
      <div className={styles.floatingCapsuleWrapper}>
        <div className={styles.capsule}>
          <LoadingState label={getLoadingLabel()} variant="Drive" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(RouteLoadingIndicator);
