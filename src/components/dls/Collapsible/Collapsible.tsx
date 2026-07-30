/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useMemo, useState } from 'react';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import classNames from 'classnames';

import styles from './Collapsible.module.scss';

type ChildrenRenderProps = {
  isOpen: boolean;
};

export interface CollapsibleProps {
  id?: string;
  title?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children: ({ isOpen }: ChildrenRenderProps) => React.ReactNode;
  isDefaultOpen?: boolean;
  shouldOpen?: boolean;
  shouldRotatePrefixOnToggle?: boolean;
  shouldRotateSuffixOnToggle?: boolean;
  shouldSuffixTrigger?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  direction?: CollapsibleDirection;
  headerClassName?: string;
  headerLeftClassName?: string;
  className?: string;
}

export enum CollapsibleDirection {
  Left = 'left',
  Right = 'right',
}

const Collapsible: React.FC<CollapsibleProps> = ({
  id,
  isDefaultOpen = false,
  prefix,
  title,
  suffix,
  children,
  shouldRotatePrefixOnToggle,
  shouldRotateSuffixOnToggle,
  shouldSuffixTrigger = false,
  shouldOpen,
  onOpenChange,
  direction = CollapsibleDirection.Left,
  headerClassName,
  headerLeftClassName,
  className,
}) => {
  const isControlled = typeof shouldOpen === 'boolean';
  const [uncontrolledOpen, setUncontrolledOpen] = useState(isDefaultOpen);
  const isOpen = isControlled ? (shouldOpen as boolean) : uncontrolledOpen;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      if (onOpenChange) onOpenChange(newOpen);
    },
    [isControlled, onOpenChange],
  );

  const onSuffixClicked = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!shouldSuffixTrigger) {
        e.stopPropagation();
      }
    },
    [shouldSuffixTrigger],
  );

  const onSuffixKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!shouldSuffixTrigger && (e.key === 'Enter' || e.key === ' ')) {
        e.stopPropagation();
      }
    },
    [shouldSuffixTrigger],
  );

  const suffixProps = useMemo(
    () => ({
      onClick: onSuffixClicked,
      onKeyDown: onSuffixKeyDown,
    }),
    [onSuffixClicked, onSuffixKeyDown],
  );

  const renderPrefix = () =>
    prefix && (
      <div
        className={classNames(styles.prefixContainer, {
          [styles.prefixRotated]: shouldRotatePrefixOnToggle && isOpen,
        })}
      >
        {prefix}
      </div>
    );

  const renderSuffix = () =>
    suffix && (
      <div
        className={classNames(styles.suffixContainer, {
          [styles.suffixRotated]: shouldRotateSuffixOnToggle && isOpen,
        })}
        {...suffixProps}
      >
        {suffix}
      </div>
    );

  const renderHeaderContent = () => {
    if (direction === CollapsibleDirection.Left) {
      return (
        <div className={classNames(styles.headerLeft, headerLeftClassName)}>
          {renderPrefix()}
          {title}
          {renderSuffix()}
        </div>
      );
    }
    return (
      <>
        <div className={styles.headerLeft}>{title}</div>
        {renderPrefix()}
      </>
    );
  };

  return (
    <CollapsiblePrimitive.Root
      className={classNames(styles.root, className)}
      onOpenChange={handleOpenChange}
      open={isOpen}
    >
      <CollapsiblePrimitive.Trigger asChild data-testid={id} id={id}>
        <div role="button" tabIndex={0} className={classNames(styles.header, headerClassName)}>
          {renderHeaderContent()}
        </div>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.CollapsibleContent className={styles.content}>
        {children({ isOpen })}
      </CollapsiblePrimitive.CollapsibleContent>
    </CollapsiblePrimitive.Root>
  );
};

export default Collapsible;
