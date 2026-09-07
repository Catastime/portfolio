import { useState, useEffect, useMemo, useRef } from 'react';
import './Sketchbook.css';

/**
 * Sketchbook — two stacks of A4 pages with a gap between them, laying on
 * the cutting mat. Content is glued/drawn onto pages: images at slight
 * angles with black corner dots, architectural sketches, and text blocks.
 *
 * Scroll progress drives page turns with flat zones (page settled) and
 * turn zones (page flipping). The right page only updates after a turn
 * completes, not when it starts.
 *
 * On mobile, one page is shown at a time with swipe/tap to turn.
 *
 * Props:
 * - visible: boolean
 * - scrollProgress: number (0-1) — drives page turns on desktop
 * - onTurnForward: callback when user wants to turn forward (arrow click)
 * - onTurnBack: callback when user wants to turn back (arrow click)
 */

/**
 * @typedef {Object} SketchbookItem
 * @property {string} type - 'image' | 'sketch' | 'text'
 * @property {string} [img]
 * @property {string} [text]
 * @property {string} [title]
 * @property {number} x - x position as % of page width (0-100)
 * @property {number} y - y position as % of page height (0-100)
 * @property {number} w - width as % of page width (0-100)
 * @property {number} rotation - rotation in degrees
 * @property {boolean} [taped] - show black corner dots
 */

/**
 * @typedef {Object} SketchbookPage
 * @property {SketchbookItem[]} items
 */

/**
 * @typedef {Object} SketchbookProps
 * @property {SketchbookPage[]} [pages]
 * @property {boolean} [visible]
 * @property {number} [scrollProgress]
 */

const A4_ASPECT = 210 / 297; // width / height (portrait)

/** @param {SketchbookProps} props */
export default function Sketchbook({
  pages = [],
  visible = false,
  scrollProgress = 0,
}) {
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const isMobile = viewport.w < 768;

  useEffect(() => {
    const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll-driven page turns with flat zones and turn zones.
  // bookStart = 0.60, bookEnd = 1.00
  // Each spread gets: flat zone (settled) + turn zone (flipping)
  // The last spread has no turn zone after it.
  const bookStart = 0.60;
  const bookEnd = 1.00;
  const bookRange = bookEnd - bookStart;

  const totalSpreads = Math.max(1, Math.ceil(pages.length / 2));

  // Each spread gets an equal slice. Within each slice:
  //   first 35% = flat (settled), last 65% = turn (flipping to next)
  // The last spread is 100% flat (no turn after it).
  const flatRatio = 0.35;

  const scrollSpread = useMemo(() => {
    if (scrollProgress <= bookStart) return 0;
    if (scrollProgress >= bookEnd) return totalSpreads - 1;
    const t = (scrollProgress - bookStart) / bookRange;
    const sliceSize = 1 / totalSpreads;
    return Math.min(totalSpreads - 1, Math.floor(t / sliceSize));
  }, [scrollProgress, totalSpreads]);

  // Turn progress within the current spread's turn zone (0 = flat, 1 = fully turned)
  const turnProgress = useMemo(() => {
    if (scrollProgress <= bookStart) return 0;
    if (scrollProgress >= bookEnd) return 0;
    const t = (scrollProgress - bookStart) / bookRange;
    const sliceSize = 1 / totalSpreads;
    const sliceStart = scrollSpread * sliceSize;
    const sliceT = (t - sliceStart) / sliceSize; // 0-1 within this spread's slice

    // Flat during first flatRatio, then turn during the rest
    if (scrollSpread >= totalSpreads - 1) return 0; // last spread, no turn
    if (sliceT <= flatRatio) return 0;
    const raw = Math.min(1, Math.max(0, (sliceT - flatRatio) / (1 - flatRatio)));
    // Ease-in-out for smoother turn
    return raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
  }, [scrollProgress, scrollSpread, totalSpreads]);

  // Book dimensions — two A4 pages with a gap between them
  const { bookW, bookH, pageW, pageH, gap } = useMemo(() => {
    const vw = viewport.w;
    const vh = viewport.h;
    const maxBookH = vh * 0.80;
    const gapFraction = 0.04; // gap is 4% of page width
    const maxBookW = vw * (isMobile ? 0.80 : 0.78);

    // Try fitting by height first
    let pH = maxBookH;
    let pW = pH * A4_ASPECT;
    let g = pW * gapFraction;
    let totalW = pW * 2 + g;

    // If too wide, fit by width
    if (totalW > maxBookW) {
      // pW * 2 + pW * gapFraction = maxBookW
      // pW * (2 + gapFraction) = maxBookW
      pW = maxBookW / (2 + gapFraction);
      pH = pW / A4_ASPECT;
      g = pW * gapFraction;
      totalW = pW * 2 + g;
    }

    return { bookW: totalW, bookH: pH, pageW: pW, pageH: pH, gap: g };
  }, [viewport, isMobile]);

  // Mobile: swipe/tap
  const touchStartX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0 && currentPage < pages.length - 1) {
      setCurrentPage(p => p + 1);
    } else if (diff < 0 && currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width / 2 && currentPage < pages.length - 1) {
      setCurrentPage(p => p + 1);
    } else if (x <= rect.width / 2 && currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
  };

  if (!visible) return null;

  // Render a single item on a page
  const renderItem = (item, key) => {
    const style = {
      position: 'absolute',
      left: `${item.x}%`,
      top: `${item.y}%`,
      width: `${item.w}%`,
      transform: `rotate(${item.rotation}deg)`,
    };

    if (item.type === 'image') {
      return (
        <div key={key} className="sketch-item sketch-item-image" style={style}>
          {item.taped && (
            <>
              <div className="sketch-dot sketch-dot-tl" />
              <div className="sketch-dot sketch-dot-tr" />
              <div className="sketch-dot sketch-dot-bl" />
              <div className="sketch-dot sketch-dot-br" />
            </>
          )}
          <img src={item.img} alt="" className="sketch-image" />
        </div>
      );
    }

    if (item.type === 'sketch') {
      return (
        <div key={key} className="sketch-item sketch-item-sketch" style={style}>
          <svg viewBox="0 0 200 150" className="sketch-svg" preserveAspectRatio="xMidYMid meet">
            <g stroke="#2a2a2a" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="30" y="30" width="140" height="90" strokeWidth="1" />
              <line x1="30" y1="70" x2="100" y2="70" />
              <line x1="100" y1="30" x2="100" y2="120" />
              <line x1="100" y1="70" x2="170" y2="70" />
              <path d="M60 70 Q60 55 75 55" strokeWidth="0.5" />
              <path d="M100 95 Q115 95 115 80" strokeWidth="0.5" />
              <line x1="30" y1="20" x2="170" y2="20" strokeWidth="0.4" />
              <line x1="30" y1="16" x2="30" y2="24" strokeWidth="0.4" />
              <line x1="170" y1="16" x2="170" y2="24" strokeWidth="0.4" />
              <line x1="20" y1="30" x2="20" y2="120" strokeWidth="0.4" />
              <line x1="16" y1="30" x2="24" y2="30" strokeWidth="0.4" />
              <line x1="16" y1="120" x2="24" y2="120" strokeWidth="0.4" />
              <line x1="50" y1="135" x2="80" y2="135" strokeWidth="0.3" strokeDasharray="2 2" />
            </g>
          </svg>
        </div>
      );
    }

    if (item.type === 'text') {
      return (
        <div key={key} className="sketch-item sketch-item-text" style={style}>
          {item.title && <div className="sketch-text-title">{item.title}</div>}
          <div className="sketch-text-body">{item.text}</div>
        </div>
      );
    }

    return null;
  };

  const renderPage = (page, key) => {
    if (!page) return <div key={key} className="sketchbook-page sketchbook-page-empty" />;
    return (
      <div key={key} className="sketchbook-page">
        {page.items?.map((item, i) => renderItem(item, i))}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="sketchbook-container">
        <div
          className="sketchbook-mobile"
          style={{ width: `${pageW}px`, height: `${pageH}px` }}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {renderPage(pages[currentPage], 'mobile')}
          <div className="sketchbook-page-indicator">
            {currentPage + 1} / {pages.length}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: two page stacks with a gap.
  // During a turn, the turning page flips from right to left:
  //   - front shows current right page (being flipped away)
  //   - back shows next left page (revealed as it lands)
  // Underneath, both stacks show the destination spread.
  const leftIndex = scrollSpread * 2;
  const rightIndex = leftIndex + 1;

  const nextSpread = Math.min(totalSpreads - 1, scrollSpread + 1);
  const nextLeftIndex = nextSpread * 2;
  const nextRightIndex = nextLeftIndex + 1;

  const isTurning = turnProgress > 0 && turnProgress < 1 && scrollSpread < totalSpreads - 1;

  // During a turn:
  //   - Left page underneath: crossfades from current left to next left
  //   - Right page underneath: shows next right page (destination)
  //   - Turning page front: current right page (being flipped away)
  //   - Turning page back: next left page (revealed as it lands on left)
  const displayRightUnderneath = isTurning ? nextRightIndex : rightIndex;

  return (
    <div className="sketchbook-container">
      <div
        className="sketchbook"
        style={{ width: `${bookW}px`, height: `${bookH}px` }}
      >
        {/* Left page stack — crossfades from current to next left during turn */}
        <div
          className="sketchbook-page-stack"
          style={{ width: `${pageW}px`, height: `${pageH}px` }}
        >
          {isTurning ? (
            <>
              <div style={{ position: 'absolute', inset: 0, opacity: 1 - turnProgress }}>
                {renderPage(pages[leftIndex], 'left-current')}
              </div>
              <div style={{ position: 'absolute', inset: 0, opacity: turnProgress }}>
                {renderPage(pages[nextLeftIndex], 'left-next')}
              </div>
            </>
          ) : (
            renderPage(pages[leftIndex], 'left')
          )}
        </div>

        {/* Gap between stacks */}
        <div style={{ width: `${gap}px` }} />

        {/* Right page stack */}
        <div
          className="sketchbook-page-stack"
          style={{ width: `${pageW}px`, height: `${pageH}px` }}
        >
          {/* Underneath: the destination right page */}
          {renderPage(pages[displayRightUnderneath], 'right-under')}
        </div>

        {/* Turning page — positioned over the right stack, not clipped by it */}
        {isTurning && (
          <div
            className="sketchbook-page-turning"
            style={{
              transform: `perspective(2000px) rotateY(${-turnProgress * 180}deg)`,
              width: `${pageW}px`,
              height: `${pageH}px`,
              left: `${pageW + gap}px`,
            }}
          >
            <div className="sketchbook-page-turning-front">
              {renderPage(pages[rightIndex], 'turn-front')}
            </div>
            <div className="sketchbook-page-turning-back">
              {renderPage(pages[nextLeftIndex], 'turn-back')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
