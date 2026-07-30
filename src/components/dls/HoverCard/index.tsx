import React, { ReactNode } from 'react';

import * as RadixHoverCard from '@radix-ui/react-hover-card';
import classnames from 'classnames';

import styles from './HoverCard.module.scss';

export enum ContentSide {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

export enum ContentAlign {
  START = 'start',
  CENTER = 'center',
  END = 'end',
}

export interface HoverCardProps {
  children: ReactNode;
  content?: ReactNode;
  body?: ReactNode;
  openDelay?: number;
  closeDelay?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  contentSide?: ContentSide | 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  contentAlign?: ContentAlign | 'start' | 'center' | 'end';
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  avoidCollisions?: boolean;
  tip?: boolean;
}

const HoverCard: React.FC<HoverCardProps> = ({
  children,
  content,
  body,
  openDelay = 200,
  closeDelay = 300,
  side,
  contentSide = ContentSide.BOTTOM,
  align,
  contentAlign = ContentAlign.CENTER,
  className,
  open,
  onOpenChange,
  avoidCollisions = true,
  tip = true,
}) => {
  const actualContent = content ?? body;
  const actualSide = side ?? contentSide;
  const actualAlign = align ?? contentAlign;

  return (
    <RadixHoverCard.Root
      openDelay={openDelay}
      closeDelay={closeDelay}
      {...(typeof open !== 'undefined' && { open })}
      {...(onOpenChange && { onOpenChange })}
    >
      <RadixHoverCard.Trigger asChild>{children}</RadixHoverCard.Trigger>
      <RadixHoverCard.Portal>
        <RadixHoverCard.Content
          className={classnames(styles.content, className)}
          side={actualSide}
          align={actualAlign}
          avoidCollisions={avoidCollisions}
          sideOffset={5}
        >
          {actualContent}
          {tip && <RadixHoverCard.Arrow className={styles.arrow} />}
        </RadixHoverCard.Content>
      </RadixHoverCard.Portal>
    </RadixHoverCard.Root>
  );
};

export default HoverCard;
