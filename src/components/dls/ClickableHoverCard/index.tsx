import React, { ReactNode } from 'react';

import HoverCard from '@/dls/HoverCard';
import Popover from '@/dls/Popover';

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

export interface ClickableHoverCardProps {
  children: ReactNode | ReactNode[];
  content?: ReactNode;
  body?: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  contentSide?: ContentSide | 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  contentAlign?: ContentAlign | 'start' | 'center' | 'end';
  avoidCollisions?: boolean;
  tip?: boolean;
  openDelay?: number;
  closeDelay?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ClickableHoverCard: React.FC<ClickableHoverCardProps> = ({
  children,
  content,
  body,
  side,
  contentSide = ContentSide.BOTTOM,
  align,
  contentAlign = ContentAlign.CENTER,
  avoidCollisions = true,
  openDelay = 400,
  closeDelay = 300,
  tip = true,
  open,
  onOpenChange,
}) => {
  const actualContent = content ?? body;
  const actualSide = (side ?? contentSide) as ContentSide;
  const actualAlign = (align ?? contentAlign) as ContentAlign;

  return (
    <Popover
      open={open}
      contentSide={actualSide}
      contentAlign={actualAlign}
      avoidCollisions={avoidCollisions}
      useTooltipStyles={false}
      {...(onOpenChange && { onOpenChange })}
      trigger={
        <HoverCard
          openDelay={openDelay}
          closeDelay={closeDelay}
          body={actualContent}
          side={actualSide}
          align={actualAlign}
          avoidCollisions={avoidCollisions}
          tip={tip}
          {...(typeof open !== 'undefined' && { open })}
          {...(onOpenChange && { onOpenChange })}
        >
          {children}
        </HoverCard>
      }
      tip={tip}
    >
      {actualContent}
    </Popover>
  );
};

export default ClickableHoverCard;
