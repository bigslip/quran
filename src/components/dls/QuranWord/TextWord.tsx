import React from 'react';

import classNames from 'classnames';
import { decamelizeKeys } from 'humps';

import styles from './TextWord.module.scss';

import { CharType } from 'types/Word';

type MadaniWordTextProps = {
  text: string;
  font: string;
  charType: CharType;
} & React.HTMLAttributes<HTMLSpanElement>;

const DEFAULT_FONT_FAMILY = 'UthmanicHafs';
const INDO_PAK = 'IndoPak';

const UTHMANI_HAFS_FONTS = decamelizeKeys({
  qpcUthmaniHafs: DEFAULT_FONT_FAMILY,
  textIndopak: INDO_PAK,
});

const TextWord: React.FC<MadaniWordTextProps> = ({ text, font, charType, className, ...props }) => (
  <span
    className={classNames(className, styles.word, {
      [styles[DEFAULT_FONT_FAMILY]]:
        charType === CharType.End ||
        !UTHMANI_HAFS_FONTS[font] ||
        UTHMANI_HAFS_FONTS[font] === DEFAULT_FONT_FAMILY,
      [styles[INDO_PAK]]: UTHMANI_HAFS_FONTS[font] === INDO_PAK,
    })}
    {...props}
  >
    {text}
  </span>
);

export default TextWord;
