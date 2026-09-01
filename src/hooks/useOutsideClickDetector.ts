import React, { useEffect, useRef } from 'react';

/**
 * A hook that detects clicking outside an element.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {()=> void} onClickOutsideDetected
 * @param {boolean} enableDetection
 * @param {boolean} preventDefault
 */
const useOutsideClickDetector = (
  ref: React.RefObject<HTMLElement>,
  onClickOutsideDetected: () => void,
  enableDetection: boolean,
  preventDefault: boolean = false,
) => {
  const onClickOutsideDetectedRef = useRef(onClickOutsideDetected);
  onClickOutsideDetectedRef.current = onClickOutsideDetected;

  useEffect(() => {
    if (!enableDetection) return () => {};

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        onClickOutsideDetectedRef.current?.();
      }
    };

    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [ref, enableDetection, preventDefault]);
};

export default useOutsideClickDetector;
