/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import classNames from 'classnames';

import styles from './SelectionCard.module.scss';

import ChevronRightIcon from '@/icons/chevron-right.svg';
import { TestId } from '@/tests/test-ids';

export type SelectionCardProps = {
  label?: string;
  value?: string;
  onClick?: () => void;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const SelectionCard = ({
  label,
  value,
  onClick,
  className,
  valueClassName,
  labelClassName,
  ...props
}: SelectionCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={classNames(styles.container, className)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      data-testid={props['data-testid'] || TestId.TRANSLATION_CARD}
      {...props}
    >
      <div className={styles.labelContainer}>
        <div className={classNames(styles.label, labelClassName)}>{label}</div>
        <div className={classNames(styles.value, valueClassName)}>{value}</div>
      </div>
      <div className={styles.iconContainer}>
        <ChevronRightIcon />
      </div>
    </div>
  );
};

export default SelectionCard;
