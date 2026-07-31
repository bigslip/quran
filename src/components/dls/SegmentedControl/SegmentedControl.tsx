import React from 'react';
import classnames from 'classnames';
import styles from './SegmentedControl.module.scss';

export interface TabOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + options.length) % options.length;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      onChange(options[nextIndex].value);
      const nextBtn = e.currentTarget.parentElement?.children[nextIndex] as HTMLElement;
      nextBtn?.focus();
    }
  };

  return (
    <div className={classnames(styles.container, className)} role="tablist">
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          className={classnames(styles.tab, {
            [styles.active]: value === option.value,
          })}
          onClick={() => onChange(option.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          aria-selected={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
