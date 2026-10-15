import React, { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';
import styles from '../ChapterHeader.module.scss';
import SearchIcon from '@/icons/search.svg';
import { setIsSearchDrawerOpen } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';

interface JumpToAyahButtonProps {
  chapterId: string | number;
}

const JumpToAyahButton: React.FC<JumpToAyahButtonProps> = ({ chapterId }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const handleJump = useCallback(() => {
    logButtonClick(`surah_header_jump_to_ayah_${chapterId}`);
    dispatch(setIsSearchDrawerOpen(true));
  }, [chapterId, dispatch]);

  return (
    <button
      type="button"
      onClick={handleJump}
      className={styles.actionPillButton}
      aria-label={t('quick-jump', { defaultValue: 'Jump to Ayah' })}
      data-testid="surah-jump-button"
    >
      <SearchIcon className={styles.actionIcon} aria-hidden="true" />
      <span>{t('quick-jump', { defaultValue: 'Jump to Ayah' })}</span>
    </button>
  );
};

export default React.memo(JumpToAyahButton);
