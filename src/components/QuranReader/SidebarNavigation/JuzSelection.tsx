import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ScrollableSelection from './ScrollableSelection';

import { RootState } from '@/redux/RootState';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { getJuzIds, getJuzNumberByHizb } from '@/utils/juz';
import { getJuzNavigationUrl } from '@/utils/navigation';

type Props = {
  onAfterNavigationItemRouted?: () => void;
};

const JuzSelection: React.FC<Props> = ({ onAfterNavigationItemRouted }) => {
  const { t, lang } = useTranslation('common');
  const juzIds = useMemo(() => getJuzIds(lang), [lang]);
  const hizb = useSelector((state: RootState) => selectLastReadVerseKey(state)?.hizb);
  const selectedJuz = useMemo(
    () => (hizb ? getJuzNumberByHizb(Number(hizb)) : 1),
    [hizb],
  );

  return (
    <ScrollableSelection
      items={juzIds}
      getHref={getJuzNavigationUrl}
      searchPlaceholder={t('sidebar.search-juz')}
      renderItem={(juz) => `${t('juz')} ${juz.label}`}
      selectedItem={selectedJuz}
      onAfterNavigationItemRouted={onAfterNavigationItemRouted}
    />
  );
};
export default React.memo(JuzSelection);
