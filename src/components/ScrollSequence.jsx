import { useState, useEffect, useMemo, useRef } from 'react';
import { BASE } from '@/paths'
import './ScrollSequence.css';

/**
 * ScrollSequence — scroll-driven animation.
 *
 * The image is a fixed-position layer that tracks the book's image item
 * position at every frame, so the image appears to be part of the book
 * throughout the zoom-out (not a separate layer that fades away).
 *
 * 0.00 - 0.33: Image slides up from below into full view
 * 0.33 - 0.36: Image holds fullscreen
 * 0.36 - 0.60: Zoom-out: image layer shrinks with the book, staying on the
 *              right-page item. Book scales from zoomed-in to resting size.
 * 0.60 - 1.00: Book is at rest, pages turn (handled by Sketchbook component)
 *
 * Props:
 * - onMatVisible: callback when cutting mat should become visible
 * - onBookVisible: callback when zoom-out starts and book should appear
 * - onZoomProgress: callback with zoomT (0-1) so the book can scale in sync
 * - onImgAspect: callback with the image's natural aspect ratio
 * - imageFadeStart: scroll progress at which the image starts fading (page turn)
 * - imageFadeEnd: scroll progress at which the image is fully faded
 */
export default function ScrollSequence({ onMatVisible, onBookVisible, onZoomProgress, onImgAspect, imageFadeStart = 1, imageFadeEnd = 1 }) {
  const [progress, setProgress] = useState(0);
  const [imgAspect, setImgAspect] = useState(0);

  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });
  const imgRef = useRef(null);
  const isMobile = viewport.w < 768;

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
  const holdEnd = 0.36;
  const zoomEnd = 0.60;

  // Image translateY: slides from 100vh (below viewport) to 0 (filling viewport)
  const translateY = useMemo(() => {
    if (progress <= slideEnd) {
      const t = progress / slideEnd;
      return `${(1 - t) * 100}vh`;
    }
    return '0vh';
  }, [progress]);

  // Zoom-out progress: 0 at holdEnd, 1 at zoomEnd
  const zoomT = useMemo(() => {
    if (progress <= holdEnd) return 0;
    if (progress >= zoomEnd) return 1;
    return (progress - holdEnd) / (zoomEnd - holdEnd);
  }, [progress]);

  // The image layer tracks the book's image item position at every frame
  // during zoom-out, so the image appears to be part of the book as it
  // zooms out. At zoomT=0 the item fills the viewport (cover); at zoomT=1
  // it's at its resting position on the right page.
  const layerStyle = useMemo(() => {
    const vw = viewport.w;
    const vh = viewport.h;

    // Mobile: no book item to land on, shrink toward the center and
    // crossfade into the single-page book scaling in underneath
    if (isMobile) {
      if (zoomT === 0) {
        return {
          transform: `translateY(${translateY})`,
          width: '100%',
          height: '100vh',
        };
      }
      const ease = zoomT < 0.5 ? 4 * zoomT * zoomT * zoomT : 1 - Math.pow(-2 * zoomT + 2, 3) / 2;
      return {
        transform: `translateY(0vh) scale(${1 - 0.35 * ease})`,
        width: '100%',
        height: '100vh',
      };
    }

    if (zoomT === 0) {
      return {
        transform: `translateY(${translateY})`,
        width: '100%',
        height: '100vh',
      };
    }

    // Eased zoom — must match Sketchbook's bookTransform ease
    const ease = zoomT < 0.5 ? 4 * zoomT * zoomT * zoomT : 1 - Math.pow(-2 * zoomT + 2, 3) / 2;

    // Compute book dimensions the same way as Sketchbook
    const PAGE_ASPECT = 1510 / 2153;
    const gapFraction = 0;
    const maxBookH = vh * 0.80;
    const maxBookW = vw * 0.78;
    let pH = maxBookH;
    let pW = pH * PAGE_ASPECT;
    let g = pW * gapFraction;
    let totalW = pW * 2 + g;
    if (totalW > maxBookW) {
      pW = maxBookW / (2 + gapFraction);
      pH = pW / PAGE_ASPECT;
      g = pW * gapFraction;
      totalW = pW * 2 + g;
    }

    // Image item on right page: x:-4%, y:10%, w:108% (Atelier Anthrazit)
    // Account for the 5% page inset (.sketchbook-page has inset: 5%)
    const pageInset = 0.05;
    const contentW = pW * (1 - 2 * pageInset); // content area width
    const contentH = pH * (1 - 2 * pageInset); // content area height
    const itemX = pW + g + (pageInset - 0.04 * (1 - 2 * pageInset)) * pW;
    const itemY = (pageInset + 0.1 * (1 - 2 * pageInset)) * pH;
    const itemW = 1.08 * contentW;
    const itemH = imgAspect > 0 ? itemW / imgAspect : itemW;

    // Item center relative to book center (book-local coords)
    const itemCenterX = itemX + itemW / 2;
    const itemCenterY = itemY + itemH / 2;
    const bookCenterX = totalW / 2;
    const bookCenterY = pH / 2;
    const offsetX = itemCenterX - bookCenterX;
    const offsetY = itemCenterY - bookCenterY;

    // Scale so the image fills the viewport (cover) at max zoom
    const scaleByW = vw / itemW;
    const scaleByH = vh / itemH;
    const maxScale = Math.max(scaleByW, scaleByH);
    const maxTranslateX = -maxScale * offsetX;
    const maxTranslateY = -maxScale * offsetY;

    // Current scale and translate (interpolated from max zoom to resting)
    const scale = 1 + (maxScale - 1) * (1 - ease);
    const translateX = maxTranslateX * (1 - ease);
    const translateYBook = maxTranslateY * (1 - ease);

    // On-screen position of the item's top-left corner:
    // book center is at viewport center (flexbox), then apply transform
    const screenCenterX = vw / 2 + translateX + scale * offsetX;
    const screenCenterY = vh / 2 + translateYBook + scale * offsetY;
    const screenW = scale * itemW;
    const screenH = scale * itemH;
    const screenLeft = screenCenterX - screenW / 2;
    const screenTop = screenCenterY - screenH / 2;

    return {
      transform: `translateY(${translateY})`,
      width: `${screenW}px`,
      height: `${screenH}px`,
      left: `${screenLeft}px`,
      top: `${screenTop}px`,
    };
  }, [zoomT, translateY, imgAspect, viewport, isMobile]);

  // Cutting mat appears when zoom-out starts
  const matShouldShow = progress > holdEnd;

  // Book appears when zoom-out starts
  const bookShouldShow = progress > holdEnd;

  // Image layer stays visible at rest (the image is on page 1).
  // Disappears when the first page turn begins and stays hidden.
  const imageOpacity = useMemo(() => {
    // Mobile: fade out during the zoom-out so the book underneath is reachable
    if (isMobile) {
      if (zoomT >= 0.9) return 0;
      if (zoomT >= 0.5) return 1 - (zoomT - 0.5) / 0.4;
      return 1;
    }
    if (progress >= imageFadeEnd) return 0;
    if (progress >= imageFadeStart) {
      return 1 - (progress - imageFadeStart) / (imageFadeEnd - imageFadeStart);
    }
    return 1;
  }, [progress, imageFadeStart, imageFadeEnd, isMobile, zoomT]);

  useEffect(() => {
    onMatVisible?.(matShouldShow);
  }, [matShouldShow, onMatVisible]);

  useEffect(() => {
    onBookVisible?.(bookShouldShow);
  }, [bookShouldShow, onBookVisible]);

  useEffect(() => {
    onZoomProgress?.(zoomT);
  }, [zoomT, onZoomProgress]);

  if (imageOpacity <= 0) return null;

  return (
    <div
      className="scroll-image-layer"
      style={{
        ...layerStyle,
        opacity: imageOpacity,
        pointerEvents: imageOpacity > 0 && !isMobile ? 'auto' : 'none',
      }}
    >
      <img
        ref={imgRef}
        src={`${BASE}tim/Atelier%20Anthrazit-039-breit-bw.jpg`}
        alt="Featured work"
        className="scroll-image"
        style={isMobile ? { objectPosition: '66% 50%' } : undefined}
        onLoad={(e) => {
          const aspect = e.target.naturalWidth / e.target.naturalHeight;
          setImgAspect(aspect);
          onImgAspect?.(aspect);
        }}
      />
      <div className="scroll-hole scroll-hole-tl" />
      <div className="scroll-hole scroll-hole-tr" />
      <div className="scroll-hole scroll-hole-bl" />
      <div className="scroll-hole scroll-hole-br" />
    </div>
  );
}
