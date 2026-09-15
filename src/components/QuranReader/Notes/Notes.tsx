import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './Notes.module.scss';

import { setIsVisible, selectNotes } from '@/redux/slices/QuranReader/notes';

const Notes = () => {
  const { t } = useTranslation('notes');
  const dispatch = useDispatch();
  const { isVisible } = useSelector(selectNotes, shallowEqual);

  return (
    <div className={classNames(styles.container, { [styles.visibleContainer]: isVisible })}>
      {t('body-placeholder', { defaultValue: 'Use this space to save general notes, or to write a reflection.' })}
      <br />
      <button type="button" onClick={() => dispatch({ type: setIsVisible.type, payload: false })}>
        {t('common:close')}
      </button>
    </div>
  );
};

export default Notes;
