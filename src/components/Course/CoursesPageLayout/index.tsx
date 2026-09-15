/* eslint-disable react/no-multi-comp */
import { useCallback, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CoursesPageLayout.module.scss';

import ContentContainer from '@/components/Course/ContentContainer';
import CoursesList from '@/components/Course/CoursesList';
import LearningPlansHero from '@/components/Course/LearningPlansHero/LearningPlansHero';
import DataFetcher from '@/components/DataFetcher';
import Spinner from '@/dls/Spinner/Spinner';
import layoutStyles from '@/pages/index.module.scss';
import { TestId } from '@/tests/test-ids';
import { CoursesResponse } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';

const Loading = () => <Spinner />;

type Props = {
  isMyCourses?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const CoursesPageLayout: React.FC<Props> = ({ isMyCourses = false, className, ...props }) => {
  const { lang } = useTranslation('learn');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
  }, []);

  return (
    <div
      {...props}
      className={classNames(layoutStyles.pageContainer, styles.pageWrapper, className)}
    >
      <LearningPlansHero
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        isMyCourses={isMyCourses}
      />

      <ContentContainer className={styles.listSection}>
        <div
          className={classNames(layoutStyles.flow, styles.container)}
          data-testid={TestId.COURSES_LIST}
        >
          <DataFetcher
            loading={Loading}
            fetcher={privateFetcher}
            queryKey={makeGetCoursesUrl({ myCourses: isMyCourses, languages: [lang] })}
            render={(data: CoursesResponse) => (
              <CoursesList
                initialResponse={data}
                isMyCourses={isMyCourses}
                languages={[lang]}
                searchQuery={searchQuery}
                activeFilter={activeFilter}
                onResetFilters={handleResetFilters}
              />
            )}
          />
        </div>
      </ContentContainer>
    </div>
  );
};

export default CoursesPageLayout;
