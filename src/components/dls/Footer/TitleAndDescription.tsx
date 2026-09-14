import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import AppStoreBadge from './AppStoreBadge';
import styles from './Footer.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import QuranTextLogo from '@/icons/quran-text-logo.svg';

const IOS_APP_URL = 'https://apps.apple.com/us/app/quran-by-quran-com-قرآن/id1118663303';
const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran';

const TitleAndDescription = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.titleAndDescriptionContainer}>
      <div className={styles.headingContainer}>
        <div className={styles.iconContainer}>
          <QuranTextLogo />
        </div>
        <div className={styles.title}>{t('footer.title')}</div>
      </div>
      <p className={styles.description}>
        <Trans
          i18nKey="common:footer.description"
          components={{
            br: <br />,
            link: <Link href="https://quran.foundation" variant={LinkVariant.Blend} isNewTab />,
          }}
        />
      </p>
      <div className={styles.appBadgesContainer}>
        <AppStoreBadge platform="ios" href={IOS_APP_URL} />
        <AppStoreBadge platform="android" href={ANDROID_APP_URL} />
      </div>
    </div>
  );
};

export default TitleAndDescription;

