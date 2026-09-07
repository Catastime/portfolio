import { useState, useEffect, useMemo, useRef } from 'react';
import './ScrollSequence.css';

/**
 * ScrollSequence — simple scroll-driven animation.
 *
 * The image is a fixed-position layer. Scroll progress (0-1) directly
 * controls its position and scale:
 * 0.00 - 0.33: Image slides up from below into full view
 * 0.33 - 0.50: Image holds fullscreen
 * 0.50 - 1.00: Image zooms out to its original aspect ratio, cutting mat appears behind it
 *
 * Props:
 * - onMatVisible: callback when cutting mat should become visible
 */
export default function ScrollSequence({ onMatVisible }) {
  const [progress, setProgress] = useState(0);
  const [imgAspect, setImgAspect] = useState(0);
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });
  const imgRef = useRef(null);

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

  useEffect(() => {
    const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // During zoom-out, transition from cover (fullscreen, cropped) to contain
  // (original aspect ratio visible) at a book-like size.
  // We compute the scale so the image ends at ~60% of viewport width (or height
  // for tall images), preserving its natural aspect ratio.
  const zoomT = useMemo(() => {
    if (progress <= holdEnd) return 0;
    if (progress >= 1) return 1;
    return (progress - holdEnd) / (1 - holdEnd);
  }, [progress]);

  // The image layer starts at 100% x 100vh with object-fit: cover.
  // As we zoom out, we shrink the layer and switch to object-fit: contain
  // so the full image is visible at its original aspect ratio.
  const layerStyle = useMemo(() => {
    if (zoomT === 0) {
      return {
        transform: `translateY(${translateY})`,
        width: '100%',
        height: '100vh',
      };
    }

    // Eased zoom
    const ease = zoomT < 0.5 ? 4 * zoomT * zoomT * zoomT : 1 - Math.pow(-2 * zoomT + 2, 3) / 2;

    // Target: image at ~55% of viewport, preserving aspect ratio
    const vw = viewport.w;
    const vh = viewport.h;
    const targetFraction = 0.55;

    let targetW, targetH;
    if (imgAspect > 0) {
      if (imgAspect >= vw / vh) {
        // Image is wider than viewport ratio — fit to width
        targetW = vw * targetFraction;
        targetH = targetW / imgAspect;
      } else {
        // Image is taller — fit to height
        targetH = vh * targetFraction;
        targetW = targetH * imgAspect;
      }
    } else {
      targetW = vw * targetFraction;
      targetH = vh * targetFraction;
    }

    // Interpolate from fullscreen to target
    const currentW = vw + (targetW - vw) * ease;
    const currentH = vh + (targetH - vh) * ease;

    return {
      transform: `translateY(${translateY})`,
      width: `${currentW}px`,
      height: `${currentH}px`,
      left: `${(vw - currentW) / 2}px`,
      top: `${(vh - currentH) / 2}px`,
    };
  }, [zoomT, translateY, imgAspect, viewport]);

  // Cutting mat appears when zoom-out starts
  const matShouldShow = progress > holdEnd;

  useEffect(() => {
    onMatVisible?.(matShouldShow);
  }, [matShouldShow, onMatVisible]);

  return (
    <div
      className="scroll-image-layer"
      style={layerStyle}
    >
      <img
        ref={imgRef}
        src="https://picsum.photos/id/1036/1920/1080?grayscale"
        alt="Featured work"
        className="scroll-image"
        style={{ objectFit: zoomT > 0 ? 'contain' : 'cover' }}
        onLoad={(e) => setImgAspect(e.target.naturalWidth / e.target.naturalHeight)}
      />
    </div>
  );
}
