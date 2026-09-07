import { useState, useEffect, useRef } from 'react';

/**
 * Tracks scroll progress of a scroll container as a 0-1 value.
 * Returns the ref to attach to the scrollable element and the current progress.
 */
export default function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(1, Math.max(0, el.scrollTop / max)));
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return { ref, progress };
}
