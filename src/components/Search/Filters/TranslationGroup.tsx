import React, { useMemo } from 'react';

import styles from './TranslationGroup.module.scss';

import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import {
  getLanguageFlag,
  getLanguageNativeName,
  getTranslationNativeName,
  getTranslationSecondaryName,
} from '@/utils/translationInfo';
import AvailableTranslation from 'types/AvailableTranslation';

type TranslationGroupProps = {
  language: string;
  translations: AvailableTranslation[];
  selectedTranslations: string[];
  onTranslationsChange: (translationsId: string[]) => void;
};

const TranslationGroup = ({
  language,
  translations,
  selectedTranslations,
  onTranslationsChange,
}: TranslationGroupProps) => {
  const areAllTranslationsSelected = translations.every((translation) =>
    selectedTranslations.includes(translation.id.toString()),
  );

  const areSomeTranslationsSelected = translations.some((translation) =>
    selectedTranslations.includes(translation.id.toString()),
  );

  const onLanguageSelected = () => {
    const groupIds = new Set(translations.map((t) => t.id.toString()));
    const nextSelectedTranslations = areAllTranslationsSelected
      ? selectedTranslations.filter((id) => !groupIds.has(id))
      : Array.from(new Set(selectedTranslations.concat(Array.from(groupIds))));
    onTranslationsChange(nextSelectedTranslations);
  };

  const onSelectedTranslationsChange = (translationId: number) => (checked: boolean) => {
    const nextTranslations = checked
      ? [...selectedTranslations, translationId.toString()]
      : selectedTranslations.filter((id) => id !== translationId.toString());
    onTranslationsChange(nextTranslations);
  };

  const sortedTranslations = useMemo(
    () =>
      [...translations].sort((a: AvailableTranslation, b: AvailableTranslation) =>
        (a.authorName || '').localeCompare(b.authorName || ''),
      ),
    [translations],
  );

  let languageCheckboxCheckedStatus: boolean | 'indeterminate';
  if (areSomeTranslationsSelected) languageCheckboxCheckedStatus = 'indeterminate';
  if (areAllTranslationsSelected) languageCheckboxCheckedStatus = true;
  if (!areSomeTranslationsSelected && !areAllTranslationsSelected) {
    languageCheckboxCheckedStatus = false;
  }

  const flag = getLanguageFlag(language);
  const nativeLang = getLanguageNativeName(language);
  const capitalizedLang = language.charAt(0).toUpperCase() + language.slice(1);
  const displayTitle =
    nativeLang && nativeLang.toLowerCase() !== capitalizedLang.toLowerCase()
      ? `${flag} ${capitalizedLang} (${nativeLang})`
      : `${flag} ${capitalizedLang}`;

  return (
    <div role="group" aria-labelledby={language} key={language}>
      <span className={styles.header}>
        <Checkbox
          id={language}
          checked={languageCheckboxCheckedStatus}
          label={displayTitle}
          onChange={onLanguageSelected}
        />
      </span>
      <div className={styles.itemsContainer}>
        {sortedTranslations.map((translation: AvailableTranslation) => {
          const nativeName = getTranslationNativeName(translation);
          const secondaryName = getTranslationSecondaryName(translation);

          return (
            <div key={translation.id} className={styles.item}>
              <Checkbox
                id={translation.id.toString()}
                checked={selectedTranslations.includes(translation.id.toString())}
                label={
                  <span>
                    <span>{nativeName}</span>
                    {secondaryName && (
                      <span className={styles.secondaryAuthor}> ({secondaryName})</span>
                    )}
                  </span>
                }
                onChange={onSelectedTranslationsChange(translation.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranslationGroup;
