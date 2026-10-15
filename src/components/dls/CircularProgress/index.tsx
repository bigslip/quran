import classNames from 'classnames';
import defaults from 'lodash/defaults';
import defaultsDeep from 'lodash/defaultsDeep';

import styles from './CircularProgress.module.scss';
import Path from './Path';

import {
  VIEWBOX_WIDTH,
  VIEWBOX_HEIGHT,
  VIEWBOX_HEIGHT_HALF,
  VIEWBOX_CENTER_X,
  VIEWBOX_CENTER_Y,
} from '@/utils/circularProgress';

export type CircularProgressbarStyles = {
  root?: React.CSSProperties;
  trail?: React.CSSProperties;
  path?: React.CSSProperties;
  text?: React.CSSProperties;
  background?: React.CSSProperties;
};

export type CircularProgressbarDefaultProps = {
  background: boolean;
  backgroundPadding: number;
  circleRatio: number;
  classes: {
    root?: string;
    trail: string;
    path: string;
    text: string;
    background?: string;
  };
  className: string;
  counterClockwise: boolean;
  maxValue: number;
  minValue: number;
  strokeWidth: number;
  text: string;
};

export type CircularProgressbarProps = CircularProgressbarDefaultProps &
  Omit<React.SVGProps<SVGSVGElement>, 'value' | 'text' | 'className'> & {
    value: number;
  };

const defaultProps: Partial<CircularProgressbarDefaultProps> = {
  background: false,
  backgroundPadding: 0,
  circleRatio: 1,
  classes: {
    root: styles.progressbar,
    trail: styles.trail,
    path: styles.path,
    text: styles.text,
    background: styles.background,
  },
  counterClockwise: false,
  maxValue: 100,
  minValue: 0,
  strokeWidth: 8,
};

const CircularProgressbar: React.FC<Partial<CircularProgressbarProps>> = ({ ...initialProps }) => {
  const {
    background,
    backgroundPadding,
    circleRatio,
    className,
    classes,
    counterClockwise,
    strokeWidth,
    text,
    value,
    minValue,
    maxValue,
    ...svgProps
  } = defaultsDeep(initialProps, defaults(initialProps, defaultProps));

  const getBackgroundPadding = () => {
    if (!background) {
      // Don't add padding if not displaying background
      return 0;
    }

    return backgroundPadding;
  };

  const getPathRadius = () => {
    // The radius of the path is defined to be in the middle, so in order for the path to
    // fit perfectly inside the 100x100 viewBox, need to subtract half the strokeWidth
    return VIEWBOX_HEIGHT_HALF - strokeWidth / 2 - getBackgroundPadding();
  };

  const boundedValue = Math.min(Math.max(value as number, minValue as number), maxValue as number);

  // Ratio of path length to trail length, as a value between 0 and 1
  const getPathRatio = () => {
    return (boundedValue - (minValue as number)) / ((maxValue as number) - (minValue as number));
  };

  const pathRadius = getPathRadius();
  const pathRatio = getPathRatio();

  return (
    <svg
      className={classNames(classes?.root, className)}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      data-test-id="CircularProgressbar"
      role="progressbar"
      aria-valuenow={boundedValue}
      aria-valuemin={minValue}
      aria-valuemax={maxValue}
      aria-valuetext={text}
      {...svgProps}
    >
      {background ? (
        <path
          className={classNames(classes?.background)}
          d={`M ${VIEWBOX_CENTER_X} ${VIEWBOX_CENTER_Y - VIEWBOX_HEIGHT_HALF} a ${VIEWBOX_HEIGHT_HALF} ${VIEWBOX_HEIGHT_HALF} 0 1 0 0.0001 0 Z`}
        />
      ) : null}

      <Path
        className={classNames(classes?.trail)}
        counterClockwise={counterClockwise}
        dashRatio={circleRatio as number}
        pathRadius={pathRadius}
        strokeWidth={strokeWidth as number}
      />

      <Path
        className={classNames(classes?.path)}
        counterClockwise={counterClockwise}
        dashRatio={pathRatio * (circleRatio as number)}
        pathRadius={pathRadius}
        strokeWidth={strokeWidth as number}
      />

      {text ? (
        <text
          className={classNames(classes?.text)}
          x={VIEWBOX_CENTER_X}
          y={VIEWBOX_CENTER_Y}
          aria-hidden="true"
        >
          {text}
        </text>
      ) : null}
    </svg>
  );
};

export default CircularProgressbar;
