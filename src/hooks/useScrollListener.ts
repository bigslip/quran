import { useEffect, useRef } from 'react';

const useScrollListener = (threshold: number, onThresholdReached: () => void) => {
  const onThresholdReachedRef = useRef(onThresholdReached);
  onThresholdReachedRef.current = onThresholdReached;

  useEffect(() => {
    const detectScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = winScroll / height;
      if (scrolled > threshold) {
        onThresholdReachedRef.current?.();
      }
    };
    window.addEventListener('scroll', detectScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', detectScroll);
    };
  }, [threshold]);
};

export default useScrollListener;
