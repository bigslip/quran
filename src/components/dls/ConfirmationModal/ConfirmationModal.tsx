import React, { ReactNode } from 'react';

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
  const { state: modalState, onCancel: onHookCancel, onConfirm: onHookConfirm } = useConfirmModal();

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : modalState.open;
  const title = propsTitle ?? modalState.title ?? 'Confirm';
  const body = propsBody ?? modalState.subtitle ?? modalState.description;
  const confirmText = propsConfirmText ?? modalState.confirmText ?? 'Confirm';
  const cancelText = propsCancelText ?? modalState.cancelText ?? 'Cancel';
  const onConfirm = propsOnConfirm ?? onHookConfirm;
  const onCancel = propsOnCancel ?? onHookCancel;

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
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
      hasCloseButton
      zIndexVariant={zIndexVariant}
    >
      <p style={{ margin: 0, color: 'var(--color-text-faded)' }}>{body}</p>
    </ContentModal>
  );
};

export default ConfirmationModal;
