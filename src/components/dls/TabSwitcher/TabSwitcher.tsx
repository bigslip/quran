import React from 'react';
import classnames from 'classnames';
import styles from './TabSwitcher.module.scss';

export interface TabOption {
  label: string;
  value: string;
}

export interface TabSwitcherProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  options,
  value,
  onChange,
  className,
}) => {
  return (
    <div className={classnames(styles.container, className)} role="group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="button"
          className={classnames(styles.tab, {
            [styles.active]: value === option.value,
          })}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher;
