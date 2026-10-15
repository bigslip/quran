import React, { ReactNode } from 'react';

import styles from './ConfirmationModal.module.scss';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonType, ButtonVariant } from '@/components/dls/Button/Button';
import { useConfirmModal } from '@/components/dls/ConfirmationModal/hooks';
import ContentModal from '@/components/dls/ContentModal/ContentModal';
import ZIndexVariant from '@/types/enums/ZIndexVariant';

export interface ConfirmationModalProps {
  isOpen?: boolean;
  title?: ReactNode;
  body?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isConfirmDanger?: boolean;
  zIndexVariant?: ZIndexVariant;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen: propsIsOpen,
  title: propsTitle,
  body: propsBody,
  confirmText: propsConfirmText,
  cancelText: propsCancelText,
  onConfirm: propsOnConfirm,
  onCancel: propsOnCancel,
  isConfirmDanger = false,
  zIndexVariant,
}) => {
  const { t } = useTranslation('common');
  const { state: modalState, onCancel: onHookCancel, onConfirm: onHookConfirm } = useConfirmModal();

  const isHookMode = propsIsOpen === undefined;
  const isOpen = isHookMode ? modalState.open : propsIsOpen;
  const rawTitle = t('confirm');
  const title = propsTitle ?? modalState.title ?? (rawTitle === 'confirm' ? 'Confirm' : rawTitle);
  const body = propsBody ?? modalState.subtitle ?? modalState.description;
  const rawConfirmText = t('confirm');
  const confirmText =
    propsConfirmText ?? modalState.confirmText ?? (rawConfirmText === 'confirm' ? 'Confirm' : rawConfirmText);
  const rawCancelText = t('cancel');
  const cancelText =
    propsCancelText ?? modalState.cancelText ?? (rawCancelText === 'cancel' ? 'Cancel' : rawCancelText);
  const onConfirm = propsOnConfirm ?? (isHookMode ? onHookConfirm : undefined);
  const onCancel = propsOnCancel ?? (isHookMode ? onHookCancel : undefined);

  const footer = (
    <div className={styles.footer}>
      {onCancel && (
        <Button variant={ButtonVariant.Ghost} onClick={onCancel}>
          {cancelText}
        </Button>
      )}
      {onConfirm && (
        <Button type={isConfirmDanger ? ButtonType.Error : ButtonType.Primary} onClick={onConfirm}>
          {confirmText}
        </Button>
      )}
    </div>
  );

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onCancel}
      header={title}
      footer={footer}
      hasCloseButton={Boolean(onCancel)}
      zIndexVariant={zIndexVariant}
    >
      {body && <p className={styles.body}>{body}</p>}
    </ContentModal>
  );
};

export default ConfirmationModal;
