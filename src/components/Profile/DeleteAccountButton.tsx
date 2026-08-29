import { useState } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '../dls/Button/Button';

import styles from './DeleteAccountButton.module.scss';
import sharedStyles from './SharedProfileStyles.module.scss';

import Input from '@/dls/Forms/Input';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useLogout from '@/hooks/auth/useLogout';
import { deleteAccount } from '@/utils/auth/api';
import { logButtonClick } from '@/utils/eventLogger';

type DeleteAccountButtonProps = {
  isDisabled?: boolean;
};

const DeleteAccountButton = ({ isDisabled }: DeleteAccountButtonProps) => {
  const { t } = useTranslation('profile');
  const toast = useToast();
  const logout = useLogout();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const closeModal = () => {
    if (isDeleting) return;
    setConfirmationText('');
    setIsModalVisible(false);
  };

  const onDeleteConfirmed = async () => {
    logButtonClick('profile_confirm_delete_account');
    setIsDeleting(true);

    try {
      await deleteAccount();
      toast(t('delete-confirmation.success'), { status: ToastStatus.Success });
      setIsModalVisible(false);
      await logout({ redirectToLogin: true });
    } catch (error) {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    } finally {
      setIsDeleting(false);
    }
  };

  const onDeleteAccountClicked = () => {
    logButtonClick('profile_delete_account');
    setIsModalVisible(true);
  };

  const CONFIRMATION_TEXT = t('delete-confirmation.confirmation-text');
  const canDeleteAccount = confirmationText.toLowerCase() === CONFIRMATION_TEXT.toLowerCase();

  return (
    <>
      <Button
        className={sharedStyles.button}
        size={ButtonSize.Small}
        type={ButtonType.Error}
        variant={ButtonVariant.Outlined}
        onClick={onDeleteAccountClicked}
        isDisabled={isDisabled}
      >
        {t('delete-account')}
      </Button>
      <Modal
        isOpen={isModalVisible}
        onClickOutside={closeModal}
        hasCloseButton={!isDeleting}
        onClose={closeModal}
      >
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('delete-confirmation.title')}</Modal.Title>
            <Modal.Subtitle>
              <div className={styles.deleteAccountWarningContainer}>
                <span className={styles.deleteAccountWarningTitle}>
                  {t('delete-account-warning-title')}:{' '}
                </span>
                {t('delete-confirmation.subtitle')}
              </div>
            </Modal.Subtitle>

            <p id="delete-account-instruction" className={styles.instructionText}>
              <Trans
                i18nKey="profile:delete-confirmation.instruction-text"
                values={{ text: CONFIRMATION_TEXT }}
                components={{
                  strong: <strong className={styles.confirmationText} />,
                }}
              />
            </p>
            <Input
              id="delete-account-confirmation"
              aria-labelledby="delete-account-instruction"
              value={confirmationText}
              onChange={setConfirmationText}
              fixedWidth={false}
              disabled={isDeleting}
              containerClassName={styles.inputContainer}
            />
          </Modal.Header>
          <Modal.Footer>
            <Button
              type={ButtonType.Error}
              variant={ButtonVariant.Outlined}
              className={styles.deleteButton}
              onClick={onDeleteConfirmed}
              isDisabled={!canDeleteAccount || isDeleting}
              isLoading={isDeleting}
            >
              {t('delete-confirmation.action-text')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeleteAccountButton;
