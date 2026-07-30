/* eslint-disable react/no-multi-comp, max-lines, react/boolean-prop-naming */
import React, { useEffect, useState } from 'react';

import * as PrimitiveDropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';

import styles from './PopoverMenu.module.scss';

import useDirection from '@/hooks/useDirection';
import { Direction } from '@/utils/locale';

export enum PopoverMenuExpandDirection {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

export enum PopoverMenuAlign {
  START = 'start',
  CENTER = 'center',
  END = 'end',
}

export type PopoverMenuProps = {
  isOpen?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  isPortalled?: boolean;
  isModal?: boolean;
  onOpenChange?: (open: boolean) => void;
  expandDirection?: PopoverMenuExpandDirection | 'top' | 'right' | 'bottom' | 'left';
  side?: PopoverMenuExpandDirection | 'top' | 'right' | 'bottom' | 'left';
  align?: PopoverMenuAlign | 'start' | 'center' | 'end';
  sideOffset?: number;
  contentClassName?: string;
  className?: string;
  shouldClose?: boolean;
  shouldUseModalZIndex?: boolean;
  dir?: Direction;
};

export const PopoverMenuComponent = ({
  children,
  isOpen,
  trigger,
  isPortalled = true,
  isModal = true,
  shouldClose = true,
  shouldUseModalZIndex = false,
  onOpenChange,
  expandDirection,
  side = PopoverMenuExpandDirection.BOTTOM,
  align = PopoverMenuAlign.CENTER,
  sideOffset = 0,
  contentClassName,
  className,
  dir,
}: PopoverMenuProps) => {
  const [open, setOpen] = useState(isOpen);
  const pageDirection = useDirection();
  const direction = dir || pageDirection;

  const activeSide = expandDirection || side;
  const activeClassName = classNames(styles.content, contentClassName, className, {
    [styles.modalZIndex]: shouldUseModalZIndex,
  });

  const content = (
    <PrimitiveDropdownMenu.Content
      className={activeClassName}
      side={activeSide as PopoverMenuExpandDirection}
      align={align as PopoverMenuAlign}
      sideOffset={sideOffset}
    >
      {children}
    </PrimitiveDropdownMenu.Content>
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (!shouldClose) return;
    onOpenChange?.(newOpen);
    setOpen(newOpen);
  };

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <PrimitiveDropdownMenu.Root
      dir={direction as Direction}
      open={open}
      modal={isModal}
      onOpenChange={handleOpenChange}
    >
      {trigger && (
        <PrimitiveDropdownMenu.Trigger asChild>
          {React.isValidElement(trigger) ? trigger : <span>{trigger}</span>}
        </PrimitiveDropdownMenu.Trigger>
      )}
      {isPortalled ? (
        <PrimitiveDropdownMenu.Portal>{content}</PrimitiveDropdownMenu.Portal>
      ) : (
        content
      )}
    </PrimitiveDropdownMenu.Root>
  );
};

export type PopoverMenuItemProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isDisabled?: boolean;
  shouldCloseMenuAfterClick?: boolean;
  shouldFlipOnRTL?: boolean;
  className?: string;
  id?: string;
  isSelected?: boolean;
  shouldStopPropagation?: boolean;
  dataTestId?: string;
};

export const PopoverMenuItem = ({
  children,
  icon,
  onClick,
  disabled,
  isDisabled,
  shouldCloseMenuAfterClick = false,
  shouldFlipOnRTL = false,
  className,
  id,
  isSelected,
  shouldStopPropagation,
  dataTestId,
}: PopoverMenuItemProps) => {
  const activeDisabled = disabled ?? isDisabled;
  return (
    <PrimitiveDropdownMenu.Item
      className={classNames(styles.item, className, { [styles.selected]: isSelected })}
      onClick={(e) => {
        if (activeDisabled) return;
        if (shouldStopPropagation) e.stopPropagation();
        if (!shouldCloseMenuAfterClick) {
          // Prevent auto-close so menu only closes on outside click
          e.preventDefault();
        }
        if (onClick) onClick();
      }}
      disabled={activeDisabled}
      id={id}
      data-testid={dataTestId}
      data-selected={isSelected}
    >
      {icon && (
        <span
          className={classNames(styles.iconWrapper, {
            [styles.shouldFlipOnRTL]: shouldFlipOnRTL,
          })}
        >
          {icon}
        </span>
      )}
      {children}
    </PrimitiveDropdownMenu.Item>
  );
};

export const PopoverMenuDivider = () => {
  return <PrimitiveDropdownMenu.Separator className={styles.separator} />;
};

type PopoverMenuType = typeof PopoverMenuComponent & {
  Item: typeof PopoverMenuItem;
  Divider: typeof PopoverMenuDivider;
};

export const PopoverMenu = PopoverMenuComponent as PopoverMenuType;
PopoverMenu.Item = PopoverMenuItem;
PopoverMenu.Divider = PopoverMenuDivider;

export default PopoverMenu;
