import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import { toLocalizedNumber } from '@/utils/locale';

interface RemainingRangeCountProps {
  rangeActor?: any;
}

const RemainingRangeCount = ({ rangeActor }: RemainingRangeCountProps) => {
  const { lang } = useTranslation('common');
  const remainingCount = useSelector(rangeActor, (state) => {
    if (!state) return null;
    const { totalRangeCycle, currentRangeCycle } = (state as any).context ?? {};
    if (totalRangeCycle === undefined || currentRangeCycle === undefined) return null;
    return totalRangeCycle - currentRangeCycle + 1; // +1 to include the current cycle
  });

  if (remainingCount === null || remainingCount === undefined) {
    return null;
  }

  const localizedRemainingCount = toLocalizedNumber(remainingCount, lang);

  return <span>{localizedRemainingCount}</span>;
};

export default RemainingRangeCount;
