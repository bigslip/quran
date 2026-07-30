import { useState } from 'react';

import Button from '@/components/dls/Button/Button';
import ConfirmationModal from '@/components/dls/ConfirmationModal/ConfirmationModal';

export default {
  title: 'dls/ConfirmationModal',
  component: ConfirmationModal,
};

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Delete Account</Button>
      <ConfirmationModal
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
        title="Delete Account?"
        body="Are you absolutely sure you want to delete your account? This action cannot be undone."
        confirmText="Yes, delete"
        cancelText="Cancel"
        isConfirmDanger
      />
    </>
  );
};
