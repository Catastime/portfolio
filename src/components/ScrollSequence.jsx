import { useState, useEffect, useMemo } from 'react';
import { BASE } from '@/paths'
import './ScrollSequence.css';

/**
 * ScrollSequence — mobile-only intro image layer.
 *
 * On desktop the book itself is the intro: at max zoom only its image
 * item is on screen, and the whole book slides up (see Sketchbook).
 * Mobile's first book page is the text page, so the intro image lives
 * here instead: it slides up fullscreen, then shrinks and crossfades
 * into the single-page book scaling in underneath.
 *
 * 0.00 - 0.33: Image slides up from below into full view (ease-out)
 * 0.33 - 0.60: Image shrinks toward the center and fades out while the
 *              mobile book scales in underneath (handled by Sketchbook)
 */
export default function ScrollSequence() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Coalesce scroll events to one state update per frame
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) { setProgress(0); return; }
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Phase boundaries — the zoom overlaps the slide tail
  const slideEnd = 0.33;
  const zoomStart = 0.15;
  const zoomEnd = 0.60;

  // Image translateY: slides from 100vh (below viewport) to 0 (filling viewport)
  const translateY = useMemo(() => {
    if (progress <= slideEnd) {
      const t = progress / slideEnd;
      const eased = 1 - Math.pow(1 - t, 3);
      return `${(1 - eased) * 100}vh`;
    }
    return '0vh';
  }, [progress]);

  // Zoom-out progress: 0 at zoomStart, 1 at zoomEnd
  const zoomT = useMemo(() => {
    if (progress <= zoomStart) return 0;
    if (progress >= zoomEnd) return 1;
    return (progress - zoomStart) / (zoomEnd - zoomStart);
  }, [progress]);

  // Shrink toward the center as the book scales in underneath
  const layerStyle = useMemo(() => {
    if (zoomT === 0) {
      return {
        transform: `translateY(${translateY})`,
        width: '100%',
        height: '100vh',
      };
    }
    const ease = 1 - Math.pow(1 - zoomT, 3);
    return {
      transform: `translateY(${translateY}) scale(${1 - 0.45 * ease})`,
      width: '100%',
      height: '100vh',
    };
  }, [zoomT, translateY]);

  // Fade out during the zoom-out so the book underneath is reachable
  const imageOpacity = useMemo(() => {
    if (zoomT >= 0.9) return 0;
    if (zoomT >= 0.5) return 1 - (zoomT - 0.5) / 0.4;
    return 1;
  }, [zoomT]);

  if (imageOpacity <= 0) return null;

  return (
    <div
      className="scroll-image-layer"
      style={{
        ...layerStyle,
        opacity: imageOpacity,
        pointerEvents: 'none',
      }}
    >
      <img
        src={`${BASE}tim/Atelier%20Anthrazit-039-breit-bw-mobile.jpg`}
        alt="Featured work"
        className="scroll-image"
        style={{ objectPosition: '66% 50%' }}
      />
    </div>
  );
}
