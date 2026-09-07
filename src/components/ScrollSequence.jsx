import { useState, useEffect, useMemo, useRef } from 'react';
import './ScrollSequence.css';

/**
 * ScrollSequence — simple scroll-driven animation.
 *
 * The image is a fixed-position layer. Scroll progress (0-1) directly
 * controls its position and scale:
 * 0.00 - 0.33: Image slides up from below into full view
 * 0.33 - 0.50: Image holds fullscreen
 * 0.50 - 0.60: Image zooms out to its original aspect ratio, cutting mat appears behind it
 * 0.60 - 1.00: Book is visible, pages turn (handled by Sketchbook component)
 *
 * Props:
 * - onMatVisible: callback when cutting mat should become visible
 * - onBookVisible: callback when zoom-out is complete and book should appear
 */
export default function ScrollSequence({ onMatVisible, onBookVisible }) {
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
  const zoomEnd = 0.60;

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
    if (progress >= zoomEnd) return 1;
    return (progress - holdEnd) / (zoomEnd - holdEnd);
  }, [progress]);

  // The image layer starts at viewport size with object-fit: cover (image fills screen, cropped).
  // As we zoom out, we shrink the layer AND transition its aspect ratio from the
  // viewport's to the image's natural aspect ratio. Since the layer ends up matching
  // the image's aspect ratio, object-fit: cover == contain at the final state, so
  // there's no jump. The transition is smooth because both size and aspect ratio
  // interpolate continuously.
  const layerStyle = useMemo(() => {
    const vw = viewport.w;
    const vh = viewport.h;

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
    const targetFraction = 0.35;

    let targetW, targetH;
    if (imgAspect > 0) {
      if (imgAspect >= vw / vh) {
        targetW = vw * targetFraction;
        targetH = targetW / imgAspect;
      } else {
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

    // Slight rotation as the image "lands" on the sketchbook page,
    // like it's being glued in at a casual angle
    const rotation = ease * -3; // -3 degrees at full zoom-out

    return {
      transform: `translateY(${translateY}) rotate(${rotation}deg)`,
      width: `${currentW}px`,
      height: `${currentH}px`,
      left: `${(vw - currentW) / 2}px`,
      top: `${(vh - currentH) / 2}px`,
    };
  }, [zoomT, translateY, imgAspect, viewport]);

  // Cutting mat appears when zoom-out starts
  const matShouldShow = progress > holdEnd;

  // Book is fully visible when zoom-out completes
  const bookShouldShow = progress >= zoomEnd;

  useEffect(() => {
    onMatVisible?.(matShouldShow);
  }, [matShouldShow, onMatVisible]);

  useEffect(() => {
    onBookVisible?.(bookShouldShow);
  }, [bookShouldShow, onBookVisible]);

  return (
    <div
      className="scroll-image-layer"
      style={{
        ...layerStyle,
        opacity: bookShouldShow ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      <img
        ref={imgRef}
        src="https://picsum.photos/id/1036/1920/1080?grayscale"
        alt="Featured work"
        className="scroll-image"
        onLoad={(e) => setImgAspect(e.target.naturalWidth / e.target.naturalHeight)}
      />
    </div>
  );
}
