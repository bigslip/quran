import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import IconContainer, { IconSize, IconColor } from './IconContainer';
import CheckIcon from '@/icons/check.svg';

const meta: Meta<typeof IconContainer> = {
  title: 'dls/IconContainer',
  component: IconContainer,
  args: {
    icon: <CheckIcon />,
    size: IconSize.Medium,
    color: IconColor.default,
  },
};

export default meta;

type Story = StoryObj<typeof IconContainer>;

export const Default: Story = {};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <IconContainer icon={<CheckIcon />} color={IconColor.default} />
      <IconContainer icon={<CheckIcon />} color={IconColor.primary} />
      <IconContainer icon={<CheckIcon />} color={IconColor.secondary} />
      <IconContainer icon={<CheckIcon />} color={IconColor.tertiary} />
      <IconContainer icon={<CheckIcon />} color={IconColor.accent} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <IconContainer icon={<CheckIcon />} size={IconSize.Xsmall} />
      <IconContainer icon={<CheckIcon />} size={IconSize.Small} />
      <IconContainer icon={<CheckIcon />} size={IconSize.Medium} />
      <IconContainer icon={<CheckIcon />} size={IconSize.Large} />
    </div>
  ),
};
