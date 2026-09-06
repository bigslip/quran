import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ExploreTopicsSection.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import ArrowIcon from '@/icons/arrow.svg';
import BookIcon from '@/icons/book-open.svg';
import SparkleIcon from '@/icons/diamond.svg';
import StarIcon from '@/icons/star.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface TopicItem {
  slug: string;
  logKey: string;
  key: string;
  isHighlighted?: boolean;
  iconType?: 'sparkle' | 'star' | 'book';
}

const TOPICS: TopicItem[] = [
  {
    slug: 'what-is-ramadan',
    logKey: 'what-is-ramadan',
    key: 'what-is-ramadan',
    isHighlighted: true,
    iconType: 'sparkle',
  },
  {
    slug: 'about-the-quran',
    logKey: 'about-quran',
    key: 'about-quran',
    iconType: 'book',
  },
  {
    slug: 'collections/the-authority-and-importance-of-the-sunnah-clem7p7lf15921610rsdk4xzulfj',
    key: 'sunnah',
    logKey: 'sunnah_collection',
    iconType: 'star',
  },
  {
    slug: 'jesus-in-quran',
    key: 'jesus-in-quran',
    logKey: 'jesus_in_quran',
    iconType: 'book',
  },
  {
    slug: 'ayat-ul-kursi',
    key: 'ayat-ul-kursi',
    logKey: 'ayat_ul_kursi',
    iconType: 'star',
  },
];

const renderTopicIcon = (type?: 'sparkle' | 'star' | 'book') => {
  switch (type) {
    case 'sparkle':
      return <SparkleIcon className={styles.iconBadge} aria-hidden="true" />;
    case 'star':
      return <StarIcon className={styles.iconBadge} aria-hidden="true" />;
    case 'book':
    default:
      return <BookIcon className={styles.iconBadge} aria-hidden="true" />;
  }
};

const ExploreTopicsSection: React.FC = () => {
  const { t } = useTranslation('quick-links');

  const handleTopicClick = React.useCallback((logKey: string) => {
    logButtonClick(`explore_topics_${logKey}`);
  }, []);

  return (
    <section className={styles.section} aria-label={t('home:explore-topics')}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>{t('home:explore-topics')}</h2>
        </div>
      </div>
      <div className={styles.container} data-testid="explore-topics-container">
        {TOPICS.map((topic) => {
          return (
            <Button
              size={ButtonSize.Small}
              key={topic.slug}
              href={`/${topic.slug}`}
              type={ButtonType.Primary}
              variant={ButtonVariant.Compact}
              shape={ButtonShape.Pill}
              onClick={() => handleTopicClick(topic.logKey)}
              isNewTab
              className={classNames(styles.topic, {
                [styles.highlighted]: topic.isHighlighted,
              })}
            >
              <div className={styles.topicContent}>
                <span className={styles.iconWrapper}>{renderTopicIcon(topic.iconType)}</span>
                <span className={styles.topicText}>{t(topic.key)}</span>
                <ArrowIcon className={styles.arrowIcon} aria-hidden="true" />
              </div>
            </Button>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(ExploreTopicsSection);
