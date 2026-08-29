import React, { memo, useMemo } from 'react';

import styles from './Filter.module.scss';
import TranslationGroup from './TranslationGroup';

import AvailableTranslation from 'types/AvailableTranslation';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  onTranslationChange: (translationsId: string[]) => void;
  translationsByLanguages: Record<string, AvailableTranslation[]>;
  selectedTranslations: string;
}

const TranslationsFilter: React.FC<Props> = memo(
  ({ translationsByLanguages, selectedTranslations, onTranslationChange, className, ...props }) => {
    const selectedTranslationIds = useMemo(
      () => (selectedTranslations ? selectedTranslations.split(',').filter(Boolean) : []),
      [selectedTranslations],
    );

    return (
      <div className={[styles.items, className].filter(Boolean).join(' ')} {...props}>
        {Object.entries(translationsByLanguages).map(([language, languageTranslations]) => {
          return (
            <TranslationGroup
              language={language}
              key={language}
              translations={languageTranslations}
              onTranslationsChange={(nextTranslations) => onTranslationChange(nextTranslations)}
              selectedTranslations={selectedTranslationIds}
            />
          );
        })}
      </div>
    );
  },
);

export default TranslationsFilter;
