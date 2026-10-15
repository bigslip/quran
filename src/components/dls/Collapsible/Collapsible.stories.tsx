import type { Meta, StoryObj } from '@storybook/react';

import Button, { ButtonSize, ButtonVariant } from '../Button/Button';
import PopoverMenu from '../PopoverMenu/PopoverMenu';

import Collapsible from './Collapsible';

import ChevronDownIcon from '@/icons/chevron-down.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';

const meta = {
  title: 'dls/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  args: {
    title: 'Advanced Settings',
    children: ({ isOpen }) => (
      <div
        style={{
          padding: '1rem',
          background: 'var(--color-background-alternative)',
          borderRadius: '4px',
          marginTop: '0.5rem',
        }}
      >
        {isOpen && (
          <p style={{ margin: 0 }}>
            Here are some advanced settings that are usually hidden to keep the UI clean.
          </p>
        )}
      </div>
    ),
  },
};

export const WithPrefixAndSuffix: Story = {
  render: () => (
    <Collapsible
      title="Woman in Quran"
      prefix={<ChevronDownIcon />}
      suffix={
        <PopoverMenu
          isPortalled={false}
          trigger={
            <Button variant={ButtonVariant.Ghost} size={ButtonSize.Small}>
              <OverflowMenuIcon />
            </Button>
          }
        >
          <PopoverMenu.Item>Option 1</PopoverMenu.Item>
        </PopoverMenu>
      }
    >
      {({ isOpen }) => {
        if (!isOpen) return null;
        return <div style={{ padding: '1rem' }}>Content example here</div>;
      }}
    </Collapsible>
  ),
};

export const OpenByDefault: Story = {
  args: {
    isDefaultOpen: true,
    title: 'Default Open Collapsible',
    children: ({ isOpen }) => (
      <div style={{ padding: '1rem' }}>
        {isOpen && <p>This collapsible starts in an expanded state.</p>}
      </div>
    ),
  },
};
