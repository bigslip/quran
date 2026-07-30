import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import ConfirmationModal from './ConfirmationModal';

import Button from '@/components/dls/Button/Button';

const meta = {
  title: 'dls/ConfirmationModal',
  component: ConfirmationModal,
  tags: ['autodocs'],
} as Meta<typeof ConfirmationModal>;

export default meta;

const DefaultStory = () => {
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

export const Default: StoryObj<typeof ConfirmationModal> = {
  render: () => <DefaultStory />,
};
