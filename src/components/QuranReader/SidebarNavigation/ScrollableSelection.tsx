import { useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';

import styles from './SidebarNavigation.module.scss';

import { LoadingState } from '@/components/ui';
import Link from '@/dls/Link/Link';
import { SCROLL_TO_NEAREST_ELEMENT, useScrollToElement } from '@/hooks/useScrollToElement';
import NavigationItemType from '@/types/NavigationItemType';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logEmptySearchResults, logTextSearchQuery } from '@/utils/eventLogger';

const ScrollableSelection = ({
  items,
  searchPlaceholder,
  renderItem,
  getHref,
  isJuz = true,
  selectedItem,
  onAfterNavigationItemRouted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingItemValue, setLoadingItemValue] = useState<string | number | null>(null);
  const router = useRouter();

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.value.toString().startsWith(searchQuery) ||
          item.label.toString().startsWith(searchQuery),
      ),
    [items, searchQuery],
  );

  useEffect(() => {
    const handleRouteChange = () => {
      setLoadingItemValue(null);
    };
    router.events?.on('routeChangeComplete', handleRouteChange);
    router.events?.on('routeChangeError', handleRouteChange);
    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange);
      router.events?.off('routeChangeError', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    if (!filteredItems.length) {
      logEmptySearchResults({
        query: searchQuery,
        source: isJuz
          ? SearchQuerySource.SidebarNavigationJuzsList
          : SearchQuerySource.SidebarNavigationPagesList,
      });
    } else {
      logTextSearchQuery(
        searchQuery,
        isJuz
          ? SearchQuerySource.SidebarNavigationJuzsList
          : SearchQuerySource.SidebarNavigationPagesList,
      );
    }
  }, [searchQuery, filteredItems.length, isJuz]);

  const [scroll, selectedItemRef] = useScrollToElement<HTMLDivElement>(SCROLL_TO_NEAREST_ELEMENT);
  useEffect(() => {
    scroll();
  }, [selectedItem, scroll]);

  const navigateAndHandleAfterNavigation = (href: string, itemValue: string | number) => {
    const itemType = isJuz ? NavigationItemType.JUZ : NavigationItemType.PAGE;
    if (router.asPath === href || router.pathname === href) {
      if (onAfterNavigationItemRouted) {
        onAfterNavigationItemRouted(itemValue?.toString(), itemType);
      }
      return;
    }
    setLoadingItemValue(itemValue);
    router
      .push(href)
      .then(() => {
        setLoadingItemValue(null);
        if (onAfterNavigationItemRouted) {
          onAfterNavigationItemRouted(itemValue?.toString(), itemType);
        }
      })
      .catch(() => {
        setLoadingItemValue(null);
      });
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const firstFilteredItem = filteredItems[0];
    if (firstFilteredItem) {
      const href = getHref(firstFilteredItem.value);
      navigateAndHandleAfterNavigation(href, firstFilteredItem.value);
    }
  };

  const handleItemClick = (e: React.MouseEvent, href: string, itemValue: string | number) => {
    e.preventDefault();
    navigateAndHandleAfterNavigation(href, itemValue);
  };

  return (
    <div className={styles.scrollableSectionContainer}>
      <form onSubmit={handleInputSubmit}>
        <input
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </form>
      <div className={styles.listContainer}>
        <div className={styles.list}>
          {filteredItems.map((item) => {
            const href = getHref(item.value);
            const isLoading = loadingItemValue === item.value;
            return (
              <Link
                href={href}
                key={item.value}
                shouldPrefetch={false}
                onClick={(e) => handleItemClick(e, href, item.value)}
              >
                <div
                  ref={item.value === selectedItem ? selectedItemRef : null}
                  className={classNames(
                    styles.listItem,
                    item.value === selectedItem && styles.selectedItem,
                    isLoading && styles.loadingItem,
                  )}
                >
                  {isLoading ? (
                    <LoadingState label={renderItem(item)} variant="Drive" />
                  ) : (
                    renderItem(item)
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScrollableSelection;
