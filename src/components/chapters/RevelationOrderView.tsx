import React, { useCallback, useMemo } from 'react';

import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import IslamicSanctuaryBoard from './IslamicSanctuaryBoard/IslamicSanctuaryBoard';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { setIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import PreferenceGroup from '@/types/auth/PreferenceGroup';
import Chapter from '@/types/Chapter';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getSurahNavigationUrl } from '@/utils/navigation';
import REVELATION_ORDER from '@/utils/revelationOrder';

const REVELATION_ORDER_MAP = new Map<number, number>(
  REVELATION_ORDER.map((id, index) => [id, index + 1]),
);

type RevelationOrderViewProps = {
  isDescending: boolean;
  chapters: Chapter[];
};

const RevelationOrderView: React.FC<RevelationOrderViewProps> = ({
  isDescending,
  chapters,
}: RevelationOrderViewProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();

  const onSurahClicked = useCallback(
    (surahId: string | number) => {
      if (isLoggedIn()) {
        onSettingsChange(
          'isReadingByRevelationOrder',
          true,
          setIsReadingByRevelationOrder(true),
          setIsReadingByRevelationOrder(false),
          PreferenceGroup.READING,
          () => {
            // navigate to the selected Surah on success
            router.push(getSurahNavigationUrl(surahId));
          },
        );
      } else {
        dispatch(setIsReadingByRevelationOrder(true));
        router.push(getSurahNavigationUrl(surahId));
      }
      logButtonClick('revelation_ordering_surah');
    },
    [dispatch, onSettingsChange, router],
  );

  const sortedChaptersByRevelationOrder = useMemo(
    () =>
      isDescending
        ? chapters
            .slice()
            .sort(
              (a, b) =>
                (REVELATION_ORDER_MAP.get(Number(b.id)) ?? 0) -
                (REVELATION_ORDER_MAP.get(Number(a.id)) ?? 0),
            )
        : chapters
            .slice()
            .sort(
              (a, b) =>
                (REVELATION_ORDER_MAP.get(Number(a.id)) ?? 0) -
                (REVELATION_ORDER_MAP.get(Number(b.id)) ?? 0),
            ),
    [isDescending, chapters],
  );

  const getOrderNumber = useCallback(
    (chapter: Chapter) => REVELATION_ORDER_MAP.get(Number(chapter.id)) ?? Number(chapter.id),
    [],
  );

  return (
    <IslamicSanctuaryBoard
      chapters={sortedChaptersByRevelationOrder}
      getOrderNumber={getOrderNumber}
      onChapterClick={onSurahClicked}
    />
  );
};

export default React.memo(RevelationOrderView);
