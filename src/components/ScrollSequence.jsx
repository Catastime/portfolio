import { useMemo, useEffect } from 'react';
import './ScrollSequence.css';

/**
 * ScrollSequence — scroll-driven animation sequence.
 *
 * Phases (mapped from scroll progress 0-1):
 * 0.00 - 0.15: Landing (title visible, nothing else)
 * 0.15 - 0.30: Full-screen image fades in
 * 0.30 - 0.55: Image zooms out to reveal sketchbook on cutting mat
 * 0.55 - 1.00: Sketchbook pages turn on continued scroll
 *
 * Props:
 * - progress: 0-1 scroll progress
 * - onMatVisible: callback when cutting mat should become visible
 */
export default function ScrollSequence({ progress, onMatVisible }) {
  // Phase boundaries
  const phases = useMemo(() => ({
    landingEnd: 0.15,
    imageFadeEnd: 0.30,
    zoomOutEnd: 0.55,
  }), []);

  // Image opacity: fades in during 0.15-0.30
  const imageOpacity = useMemo(() => {
    if (progress <= phases.landingEnd) return 0;
    if (progress >= phases.imageFadeEnd) return 1;
    return (progress - phases.landingEnd) / (phases.imageFadeEnd - phases.landingEnd);
  }, [progress, phases]);

  // Image scale: 1 (full screen) at imageFadeEnd, zooms out to 0.3 at zoomOutEnd
  const imageScale = useMemo(() => {
    if (progress <= phases.imageFadeEnd) return 1;
    if (progress >= phases.zoomOutEnd) return 0.3;
    const t = (progress - phases.imageFadeEnd) / (phases.zoomOutEnd - phases.imageFadeEnd);
    return 1 - t * 0.7;
  }, [progress, phases]);

  // Cutting mat visibility: appears at zoomOutEnd
  const matShouldShow = progress >= phases.zoomOutEnd;

  // Trigger mat visibility callback
  useEffect(() => {
    onMatVisible?.(matShouldShow);
  }, [matShouldShow, onMatVisible]);

  return (
    <div
      className="scroll-image-layer"
      style={{
        opacity: imageOpacity,
        transform: `scale(${imageScale})`,
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
