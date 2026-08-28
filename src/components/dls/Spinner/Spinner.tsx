import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import classNames from 'classnames';

import styles from './Spinner.module.scss';

export enum SpinnerSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}
export type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  dataTestId?: string;
  size?: SpinnerSize;
  isCentered?: boolean;
  className?: string;
  shouldDelayVisibility?: boolean;
  label?: string;
};

const Spinner = ({
  dataTestId,
  size = SpinnerSize.Medium,
  isCentered = true,
  className,
  shouldDelayVisibility,
  label = 'Loading...',
  ...props
}: SpinnerProps) => (
  <div
    data-testid={dataTestId}
    className={classNames(styles.spinner, className, {
      [styles.large]: size === SpinnerSize.Large,
      [styles.normal]: size === SpinnerSize.Medium,
      [styles.small]: size === SpinnerSize.Small,
      [styles.centered]: isCentered,
      [styles.delayVisibility]: shouldDelayVisibility,
    })}
    role="status"
    {...props}
  >
    <VisuallyHidden>{label}</VisuallyHidden>
    <div className={styles.container}>{getSpans()}</div>
  </div>
);

const getSpans = () =>
  // eslint-disable-next-line @typescript-eslint/naming-convention
  [...new Array(12)].map((_, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <span className={styles.span} key={`spinner-${index}`} />
  ));

export default Spinner;
