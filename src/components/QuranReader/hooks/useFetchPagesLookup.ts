import useSWRImmutable from 'swr/immutable';

import { getPagesLookupParams } from '@/components/QuranReader/api';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getMushafId, STATIC_DEDUPING_INTERVAL } from '@/utils/api';
import { makePagesLookupUrl } from '@/utils/apiPaths';
import { fetcher } from 'src/api';
import { PagesLookUpResponse, VersesResponse } from 'types/ApiResponses';
import LookupRange from 'types/LookupRange';
import LookupRecord from 'types/LookupRecord';

const EMPTY_PAGES_MAP: Record<number, LookupRecord> = {};

/**
 * This hooks fetches the total number of pages of a specific Mushaf of
 * a resource e.g. a page/juz/verse/range/hiz etc.
 *
 * @param {number|string} resourceId
 * @param {QuranReaderDataType} quranReaderDataType
 * @param {VersesResponse} initialData
 * @param {QuranReaderStyles} quranReaderStyles
 *
 * @returns {{ pagesCount: number; hasError: boolean }}
 */
const useFetchPagesLookup = (
  resourceId: number | string,
  quranReaderDataType: QuranReaderDataType,
  initialData: VersesResponse,
  quranReaderStyles: QuranReaderStyles,
  isUsingDefaultFont: boolean,
): {
  data: PagesLookUpResponse;
  pagesCount: number;
  hasError: boolean;
  pagesVersesRange: Record<number, LookupRecord>;
  lookupRange: LookupRange;
  isLoading: boolean;
} => {
  const { data, error, isValidating } = useSWRImmutable<PagesLookUpResponse>(
    makePagesLookupUrl(
      getPagesLookupParams(
        resourceId,
        quranReaderDataType,
        getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
        initialData,
      ),
    ),
    fetcher,
    {
      fallbackData: initialData.pagesLookup,
      revalidateOnMount: !isUsingDefaultFont,
      dedupingInterval: STATIC_DEDUPING_INTERVAL,
    },
  );

  return {
    data,
    pagesCount: data?.totalPage ?? 0,
    pagesVersesRange: data?.pages ?? EMPTY_PAGES_MAP,
    lookupRange: data?.lookupRange,
    hasError: !!error,
    isLoading: isValidating && !data,
  };
};

export default useFetchPagesLookup;
