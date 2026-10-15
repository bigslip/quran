import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './PageFooter.module.scss';

import Link from '@/dls/Link/Link';
import { toLocalizedNumber } from '@/utils/locale';
import { getPageNavigationUrl } from '@/utils/navigation';

interface Props {
  page: number;
}

const PageFooter: React.FC<Props> = ({ page }) => {
  const { lang, t } = useTranslation('quran-reader');
  const pageUrl = getPageNavigationUrl(page);
  const localizedPage = toLocalizedNumber(page, lang);

  return (
    <div className={styles.pageText}>
      <Link
        href={pageUrl}
        shouldPassHref
        shouldPrefetch={false}
        ariaLabel={t('page-number', { page: localizedPage })}
      >
        <p className={styles.pageLink}>{localizedPage}</p>
      </Link>
    </div>
  );
};

export default PageFooter;
