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
  // As we zoom out, it shrinks and moves to land exactly on the first image item
  // of the book's right page. The target position/size is computed to match the
  // book's layout (same formula as Sketchbook) and the item's position within the page.
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

    // Compute book dimensions the same way as Sketchbook
    const A4_ASPECT = 210 / 297;
    const gapFraction = 0.04;
    const maxBookH = vh * 0.80;
    const maxBookW = vw * 0.78;
    let pH = maxBookH;
    let pW = pH * A4_ASPECT;
    let g = pW * gapFraction;
    let totalW = pW * 2 + g;
    if (totalW > maxBookW) {
      pW = maxBookW / (2 + gapFraction);
      pH = pW / A4_ASPECT;
      g = pW * gapFraction;
      totalW = pW * 2 + g;
    }

    // The book is centered in the viewport
    const bookLeft = (vw - totalW) / 2;
    const bookTop = (vh - pH) / 2;

    // Right page starts after left page + gap
    const rightPageLeft = bookLeft + pW + g;
    const rightPageTop = bookTop;

    // First image item on right page: x:20%, y:12%, w:60%, rotation:-3
    const itemX = 0.20; // 20% of page width
    const itemY = 0.12; // 12% of page height
    const itemW = 0.60; // 60% of page width

    // Item pixel position and size
    const itemPxX = rightPageLeft + itemX * pW;
    const itemPxY = rightPageTop + itemY * pH;
    const itemPxW = itemW * pW;
    // Image aspect ratio determines height
    let itemPxH;
    if (imgAspect > 0) {
      itemPxH = itemPxW / imgAspect;
    } else {
      itemPxH = itemPxW;
    }

    // Target: the image layer should match the item's bounding box
    // (the image inside has object-fit: cover, so it fills the layer)
    const targetW = itemPxW;
    const targetH = itemPxH;
    const targetLeft = itemPxX;
    const targetTop = itemPxY;

    // Interpolate from fullscreen to target
    const currentW = vw + (targetW - vw) * ease;
    const currentH = vh + (targetH - vh) * ease;
    const currentLeft = 0 + (targetLeft - 0) * ease;
    const currentTop = 0 + (targetTop - 0) * ease;

    // Slight rotation as the image "lands" on the sketchbook page
    const rotation = ease * -3;

    return {
      transform: `translateY(${translateY}) rotate(${rotation}deg)`,
      width: `${currentW}px`,
      height: `${currentH}px`,
      left: `${currentLeft}px`,
      top: `${currentTop}px`,
    };
  }, [zoomT, translateY, imgAspect, viewport]);

  // Cutting mat appears when zoom-out starts
  const matShouldShow = progress > holdEnd;

  // Book appears when zoom-out starts so the image lands onto the page
  const bookShouldShow = progress > holdEnd;

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
        opacity: zoomT >= 1 ? 0 : 1,
        transition: 'opacity 0.15s ease',
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
