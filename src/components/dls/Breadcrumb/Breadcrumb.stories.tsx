import type { Meta, StoryObj } from '@storybook/react';
import Breadcrumb from './Breadcrumb';

const meta = {
  title: 'dls/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
} as Meta<typeof Breadcrumb>;
export default meta;

export const Default: StoryObj<typeof Breadcrumb> = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'My Quran', href: '/my-quran' },
      { label: 'Notes' },
    ],
  },
};
