import { useState, useEffect, useContext } from 'react';

import { useRouter } from 'next/router';

import { getChapterIdsForJuz, getChapterIdsForPage } from '@/utils/chapter';
import { getChapterIdsForHizb } from '@/utils/hizb';
import { formatStringNumber } from '@/utils/number';
import { getChapterIdsForRub } from '@/utils/rub';
import { isValidChapterId, isValidVerseKey } from '@/utils/validator';
import { getChapterNumberFromKey } from '@/utils/verse';
import { getChapterIdBySlug } from 'src/api';
import DataContext from 'src/contexts/DataContext';

/**
 * Given a url path such as `/chapter/1`, return the chapters id
 * This will also handle case where chapterId is not specified in the url path
 * For example: `/juz/1`, `/pages/323`. We will get the data for those url path from json files
 *
 * @returns {string[]} chapterIds
 *
 * example:
 * - /juz/1 => ["1", "2"]
 * - /page/2 => ["2"]
 * - /chapter/1 => ["1"]
 */
const AYAH_KURSI_SLUGS = ['ayatul-kursi', 'آیت الکرسی']; // TODO: this needs to be refactored when we localize Ayatul Kursi

const useChapterIdsByUrlPath = (lang?: string): string[] => {
  const router = useRouter();
  const { chapterId, juzId, pageId, hizbId, rubId } = router.query;
  const chaptersData = useContext(DataContext);

  const getSyncChapterIds = (): string[] => {
    if (chapterId) {
      const chapterIdOrVerseKeyOrSlug = chapterId as string;
      const param = chapterIdOrVerseKeyOrSlug.toLowerCase();
      if (isValidChapterId(chapterIdOrVerseKeyOrSlug)) {
        return [formatStringNumber(chapterIdOrVerseKeyOrSlug)];
      }
      if (isValidVerseKey(chaptersData, chapterIdOrVerseKeyOrSlug)) {
        return [getChapterNumberFromKey(chapterIdOrVerseKeyOrSlug).toString()];
      }
      if (AYAH_KURSI_SLUGS.includes(param)) {
        return ['2'];
      }
      if (chaptersData) {
        const match = Object.entries(chaptersData).find(
          ([, ch]) => ch.slug?.toLowerCase() === param || ch.slugs?.some((s) => s.slug?.toLowerCase() === param),
        );
        if (match) {
          return [match[0]];
        }
      }
    }
    return [];
  };

  const [chapterIds, setChapterIds] = useState<string[]>(getSyncChapterIds);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (chapterId) {
        const chapterIdOrVerseKeyOrSlug = chapterId as string;
        const param = chapterIdOrVerseKeyOrSlug.toLowerCase();
        // if it's a chapter id
        if (isValidChapterId(chapterIdOrVerseKeyOrSlug)) {
          if (isMounted) setChapterIds([formatStringNumber(chapterIdOrVerseKeyOrSlug)]);
        } else if (isValidVerseKey(chaptersData, chapterIdOrVerseKeyOrSlug)) {
          // if it's a verse key e.g 5:1
          if (isMounted)
            setChapterIds([getChapterNumberFromKey(chapterIdOrVerseKeyOrSlug).toString()]);
        } else if (AYAH_KURSI_SLUGS.includes(param)) {
          // if it's Ayatul Kursi
          if (isMounted) setChapterIds(['2']);
        } else {
          // In-memory synchronous lookup in DataContext (chaptersData) matching chapter.slug === param.toLowerCase()
          if (chaptersData) {
            const match = Object.entries(chaptersData).find(
              ([, ch]) =>
                ch.slug?.toLowerCase() === param ||
                ch.slugs?.some((s) => s.slug?.toLowerCase() === param),
            );
            if (match) {
              if (isMounted) setChapterIds([match[0]]);
              return;
            }
          }
          // we need to convert the slug into a chapterId by calling BE
          const sluggedChapterId = await getChapterIdBySlug(
            chapterIdOrVerseKeyOrSlug,
            lang || (router.locale || 'en'),
          );
          // if it's a valid slug and the call doesn't have any errors
          if (isMounted && sluggedChapterId) {
            setChapterIds([sluggedChapterId.toString()]);
          }
        }
      } else if (pageId) {
        const chapterIdsForPage = await getChapterIdsForPage(formatStringNumber(pageId as string));
        if (isMounted) setChapterIds(chapterIdsForPage);
      } else if (juzId) {
        const ids = await getChapterIdsForJuz(formatStringNumber(juzId as string));
        if (isMounted) setChapterIds(ids);
      } else if (hizbId) {
        const ids = await getChapterIdsForHizb(formatStringNumber(hizbId as string));
        if (isMounted) setChapterIds(ids);
      } else if (rubId) {
        const ids = await getChapterIdsForRub(formatStringNumber(rubId as string));
        if (isMounted) setChapterIds(ids);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [pageId, juzId, hizbId, rubId, lang, chapterId, chaptersData, router.locale]);

  return chapterIds;
};

export { useChapterIdsByUrlPath as useChapterId };
export default useChapterIdsByUrlPath;
