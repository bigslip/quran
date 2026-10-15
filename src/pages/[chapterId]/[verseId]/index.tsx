/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { getChapterIdBySlug, getChapterVerses, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData, getChapterData, getChapterIdBySlugOrId } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber, toLocalizedVersesRange } from '@/utils/locale';
import { getCanonicalUrl, getVerseNavigationUrl } from '@/utils/navigation';
import getPlainTranslationText from '@/utils/plainTranslationText';
import { getSurahSeoTitle, isAyatulKursi } from '@/utils/seo';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import {
  getToAndFromFromRange,
  isValidVerseRange,
  isValidVerseId,
  isValidVerseNumber,
  isValidChapterId,
} from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import { ChapterResponse, VersesResponse, PagesLookUpResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import MetaData from 'types/MetaData';

type VerseProps = {
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  isVerse?: boolean;
  chaptersData?: ChaptersData;
};

const Verse: NextPage<VerseProps> = ({ chapterResponse, versesResponse, isVerse }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const verseIdFromQuery = router.query.verseId;
  const currentVerseId =
    (typeof verseIdFromQuery === 'string' ? verseIdFromQuery : null) ||
    (isVerse
      ? versesResponse?.verses?.[0]?.verseNumber?.toString()
      : `${versesResponse?.verses?.[0]?.verseNumber}-${versesResponse?.verses?.[versesResponse?.verses?.length - 1]?.verseNumber}`) ||
    '';
  const path = getVerseNavigationUrl(chapterResponse.chapter.slug, currentVerseId);

  const getSEOTitle = () => {
    if (!isVerse) {
      return `${t('surah')} ${chapterResponse.chapter.transliteratedName} - ${toLocalizedVersesRange(currentVerseId, lang)}`;
    }
    const verseNumber = Number(currentVerseId);
    return getSurahSeoTitle({
      chapter: chapterResponse.chapter,
      lang,
      isChapter: false,
      verseNumber,
      isAyatulKursi: isAyatulKursi(chapterResponse.chapter.id as string, verseNumber),
    });
  };

  return (
    <>
      <NextSeoWrapper
        title={getSEOTitle()}
        titleTemplate="%s"
        image={getChapterOgImageUrl({
          chapterId: chapterResponse.chapter.id,
          verseNumber: isVerse ? Number(currentVerseId) : undefined,
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
        description={getOgDescription(versesResponse, isVerse, lang)}
      />
      <QuranReader
        initialData={versesResponse}
        id={isVerse ? `${chapterResponse.chapter.id}:${currentVerseId}` : chapterResponse.chapter.id}
        quranReaderDataType={
          isVerse ? QuranReaderDataType.Verse : QuranReaderDataType.ChapterVerseRanges
        }
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  let chapterIdOrSlug = String(params.chapterId);
  const verseIdOrRange = String(params.verseId);
  const chaptersData = await getAllChaptersData(locale);

  // If chapterId is numeric (e.g. /2/255, /1/1-5), redirect permanently to its canonical slug URL
  if (isValidChapterId(chapterIdOrSlug)) {
    const chapterData = getChapterData(chaptersData, chapterIdOrSlug);
    if (chapterData?.slug) {
      return {
        redirect: {
          destination: getVerseNavigationUrl(chapterData.slug, verseIdOrRange),
          permanent: true,
        },
      };
    }
  }

  // In-memory synchronous slug resolution first before network call
  const localChapterId = getChapterIdBySlugOrId(chaptersData, chapterIdOrSlug);
  const resolvedChapterId =
    localChapterId || (await getChapterIdBySlug(chapterIdOrSlug, locale));

  if (resolvedChapterId) {
    chapterIdOrSlug = resolvedChapterId;
  }
  // 2. make sure that verse id/range are valid before calling BE to get the verses.
  if (
    !isValidVerseId(chaptersData, chapterIdOrSlug, verseIdOrRange) &&
    !isValidVerseRange(chaptersData, chapterIdOrSlug, verseIdOrRange)
  ) {
    return { notFound: true };
  }
  /*
    Since we already validated the value, if the verseIdOrRange is a number it means we are
    viewing the verse's page otherwise it's a range page.
  */
  const isVerse = isValidVerseNumber(verseIdOrRange);
  const defaultMushafId = getMushafId(
    getQuranReaderStylesInitialState(locale).quranFont,
    getQuranReaderStylesInitialState(locale).mushafLines,
  ).mushaf;
  // common API params between a single verse and range of verses.
  let apiParams = {
    ...getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
    mushaf: defaultMushafId,
  };
  const metaData = { numberOfVerses: 1 } as MetaData;
  let [from, to] = [null, null];
  if (isVerse) {
    apiParams = { ...apiParams, ...{ page: verseIdOrRange, perPage: 1 } };
  } else {
    const [fromVerseNumber, toVerseNumber] = getToAndFromFromRange(verseIdOrRange);
    [from, to] = getToAndFromFromRange(verseIdOrRange).map((ayah) => `${chapterIdOrSlug}:${ayah}`);
    apiParams = { ...apiParams, ...{ from, to } };
    metaData.from = from;
    metaData.to = to;
    metaData.numberOfVerses = Number(toVerseNumber) - Number(fromVerseNumber) + 1;
  }
  try {
    let pagesLookupResponse: PagesLookUpResponse;
    let versesResponse: VersesResponse;

    if (isVerse) {
      const [lookupRes, versesRes] = await Promise.all([
        getPagesLookup({
          chapterNumber: Number(chapterIdOrSlug),
          mushaf: defaultMushafId,
          from: `${chapterIdOrSlug}:${verseIdOrRange}`,
          to: `${chapterIdOrSlug}:${verseIdOrRange}`,
        }),
        getChapterVerses(chapterIdOrSlug, locale, apiParams),
      ]);
      pagesLookupResponse = lookupRes;
      versesResponse = versesRes;
    } else {
      pagesLookupResponse = await getPagesLookup({
        chapterNumber: Number(chapterIdOrSlug),
        mushaf: defaultMushafId,
        from: metaData.from,
        to: metaData.to,
      });

      // if it's range, we need to set the per page as the number of verses of the first page of the range in the actual Mushaf
      const firstRangeMushafPage = Object.keys(pagesLookupResponse.pages)[0];
      const firstRangeMushafPageLookup = pagesLookupResponse.pages[firstRangeMushafPage];
      const firstRangeMushafPageNumberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
        chaptersData,
        firstRangeMushafPageLookup.from,
        firstRangeMushafPageLookup.to,
      ).length;
      apiParams = { ...apiParams, ...{ perPage: firstRangeMushafPageNumberOfVerses } };

      versesResponse = await getChapterVerses(chapterIdOrSlug, locale, apiParams);
    }
    // if any of the APIs have failed due to internal server error, we will still receive a response but the body will be something like {"status":500,"error":"Internal Server Error"}.
    if (!versesResponse.verses || !versesResponse.verses.length) {
      return {
        notFound: true,
        revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
      };
    }
    const chapterData = getChapterData(chaptersData, chapterIdOrSlug);
    if (!chapterData) {
      return {
        props: {},
        revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
      };
    }
    return {
      props: {
        chaptersData,
        chapterResponse: {
          chapter: { ...chapterData, id: chapterIdOrSlug },
        },
        versesResponse: {
          ...versesResponse,
          pagesLookup: pagesLookupResponse,
          metaData,
        },
        isVerse,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-VerseViewPage',
      metadata: {
        chapterIdOrSlug: String(params.chapterId),
        verseIdOrRange: String(params.verseId),
        locale,
      },
    });

    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

// Generates the description and open graph description for the page.
const getOgDescription = (versesResponse: VersesResponse, isVerse: boolean, lang: string) => {
  let ogText = '';

  // Single verse pages
  if (isVerse) {
    const verse = versesResponse.verses[0];
    ogText =
      verse?.translations?.length > 0
        ? getPlainTranslationText(verse?.translations[0]?.text)
        : verse?.textImlaeiSimple;
  }

  // For verse ranges, return the first 3 verses in the format of `(verse number) verse translation text`
  else {
    const firstThreeVerses = versesResponse.verses.slice(0, 3);
    ogText = firstThreeVerses
      .map((verse) => {
        return `(${toLocalizedNumber(Number(verse.verseNumber), lang)}) ${
          verse?.translations?.length > 0
            ? getPlainTranslationText(verse?.translations[0]?.text)
            : verse?.textImlaeiSimple
        }`;
      })
      .join(' ');
  }

  // Check if the text is longer than 300 characters, if it is, trim it and add ellipsis.
  if (ogText.length > 300) {
    ogText = `${ogText.substring(0, 297)}...`;
  }

  return ogText;
};
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default Verse;
