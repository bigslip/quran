import React, { ReactNode } from 'react';

import classNames from 'classnames';

import styles from './PlainVerseTextWord.module.scss';

import InlineWordByWord from '@/dls/InlineWordByWord';
import Word from 'types/Word';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  word: Word;
  children: ReactNode;
  shouldShowWordByWordTranslation: boolean;
  shouldShowWordByWordTransliteration: boolean;
  isHighlighted?: boolean;
}

const PlainVerseTextWord: React.FC<Props> = ({
  word,
  children,
  shouldShowWordByWordTransliteration,
  shouldShowWordByWordTranslation,
  isHighlighted = false,
  className,
  ...props
}) => {
  return (
    <div
      className={classNames(styles.plainVerseWordContainer, className, {
        [styles.highlighted]: isHighlighted,
      })}
      key={word.location}
      {...props}
    >
      {children}
      {shouldShowWordByWordTranslation && (
        <InlineWordByWord
          className={styles.plainVerseWbwText}
          text={word?.translation?.text}
          data-testid="wbw-translation"
        />
      )}
      {shouldShowWordByWordTransliteration && (
        <InlineWordByWord
          className={styles.plainVerseWbwText}
          text={word?.transliteration?.text}
          data-testid="wbw-transliteration"
        />
      )}
    </div>
  );
};

export default PlainVerseTextWord;
