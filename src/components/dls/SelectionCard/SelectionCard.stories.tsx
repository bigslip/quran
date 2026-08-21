import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import SelectionCard from './SelectionCard';

const meta: Meta<typeof SelectionCard> = {
  title: 'dls/SelectionCard',
  component: SelectionCard,
  args: {
    label: 'Translation',
    value: 'English',
  },
};

export default meta;

type Story = StoryObj<typeof SelectionCard>;

export const Default: Story = {};

export const CustomStyling: Story = {
  args: {
    label: 'Reciter',
    value: 'Mishary Rashid Alafasy',
    className: 'custom-class', // You can demonstrate overriding styles here
  },
};
