import React, { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import styles from '../ChapterHeader.module.scss';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ShareIcon from '@/icons/share.svg';
import copyTextToClipboard from '@/utils/clipboard';
import { logButtonClick } from '@/utils/eventLogger';

interface ShareSurahButtonProps {
  chapterId: string | number;
  chapterName: string;
}

const ShareSurahButton: React.FC<ShareSurahButtonProps> = ({ chapterId, chapterName }) => {
  const { t } = useTranslation('common');
  const toast = useToast();

  const handleShare = useCallback(async () => {
    logButtonClick(`surah_header_share_${chapterId}`);
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/${chapterId}`
        : `https://quran.ir/${chapterId}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Surah ${chapterName} - Quran.ir`,
          url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard copy if share canceled or failed
      }
    }

    try {
      await copyTextToClipboard(url);
      toast(t('copied-to-clipboard', { defaultValue: 'Copied to clipboard!' }), {
        status: ToastStatus.Success,
      });
    } catch {
      toast(t('error.general', { defaultValue: 'Failed to copy URL' }), {
        status: ToastStatus.Error,
      });
    }
  }, [chapterId, chapterName, toast, t]);

  return (
    <button
      type="button"
      onClick={handleShare}
      className={styles.actionPillButton}
      aria-label={t('share', { defaultValue: 'Share Surah' })}
      data-testid="surah-share-button"
    >
      <ShareIcon className={styles.actionIcon} aria-hidden="true" />
      <span>{t('share', { defaultValue: 'Share' })}</span>
    </button>
  );
};

export default React.memo(ShareSurahButton);
