import React from 'react';

import HelperTooltip from './HelperTooltip';

import { ContentSide } from '@/dls/Popover';

export default {
  title: 'dls/HelperTooltip',
  component: HelperTooltip,
};

export const Default = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem' }}>
    <span>Tajweed Rules</span>
    <HelperTooltip>
      Displays color-coded tajweed rules to help with proper pronunciation.
    </HelperTooltip>
  </div>
);

export const CustomContentSide = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem' }}>
    <span>Side Tooltip</span>
    <HelperTooltip contentSide={ContentSide.RIGHT}>
      This tooltip opens on the right side of the icon.
    </HelperTooltip>
  </div>
);
