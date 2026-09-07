import { useState, useEffect, useMemo } from 'react';
import './ScrollSequence.css';

/**
 * ScrollSequence — simple scroll-driven animation.
 *
 * The image is a fixed-position layer. Scroll progress (0-1) directly
 * controls its position and scale:
 * 0.00 - 0.33: Image slides up from below into full view
 * 0.33 - 0.50: Image holds fullscreen
 * 0.50 - 1.00: Image zooms out, cutting mat appears behind it
 *
 * Props:
 * - onMatVisible: callback when cutting mat should become visible
 */
export default function ScrollSequence({ onMatVisible }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) { setProgress(0); return; }
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Phase boundaries
  const slideEnd = 0.33;
  const holdEnd = 0.50;

  // Image translateY: slides from 100vh (below viewport) to 0 (filling viewport)
  const translateY = useMemo(() => {
    if (progress <= slideEnd) {
      const t = progress / slideEnd;
      return `${(1 - t) * 100}vh`;
    }
    return '0vh';
  }, [progress]);

  // Image scale: 1 until holdEnd, then zoom out to 0.3
  const scale = useMemo(() => {
    if (progress <= holdEnd) return 1;
    if (progress >= 1) return 0.3;
    const t = (progress - holdEnd) / (1 - holdEnd);
    return 1 - t * 0.7;
  }, [progress]);

  // Cutting mat appears when zoom-out starts
  const matShouldShow = progress > holdEnd;

  useEffect(() => {
    onMatVisible?.(matShouldShow);
  }, [matShouldShow, onMatVisible]);

  return (
    <div
      className="scroll-image-layer"
      style={{
        transform: `translateY(${translateY}) scale(${scale})`,
      }}
    >
      <img
        src="https://picsum.photos/id/1036/1920/1080?grayscale"
        alt="Featured work"
        className="scroll-image"
      />
    </div>
  );
}
