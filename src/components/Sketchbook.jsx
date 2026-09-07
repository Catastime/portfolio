import { useState, useEffect, useMemo, useRef } from 'react';
import './Sketchbook.css';

/**
 * Sketchbook — an A5-format open sketch block laying on the cutting mat.
 *
 * Content is glued/drawn onto the pages: images at slight angles with tape
 * corners, hand-drawn sketches, and text blocks. The first image (the one
 * that zoomed out in ScrollSequence) is glued onto the first right page.
 *
 * On mobile, only one page is shown at a time with swipe/tap to turn.
 *
 * Props:
 * - visible: boolean — whether the book should be shown
 * - scrollProgress: number (0-1) — drives page turns on desktop
 */

/**
 * @typedef {Object} SketchbookItem
 * @property {string} type - 'image' | 'sketch' | 'text'
 * @property {string} [img] - image URL (for type 'image')
 * @property {string} [text] - text content (for type 'text')
 * @property {string} [title] - heading text (for type 'text')
 * @property {number} x - x position as % of page width (0-100)
 * @property {number} y - y position as % of page height (0-100)
 * @property {number} w - width as % of page width (0-100)
 * @property {number} rotation - rotation in degrees
 * @property {boolean} [taped] - show black corner dots (for images)
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

const A5_ASPECT = 1 / 1.414; // width / height

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

  // Desktop: page turns driven by scroll progress (0.60 - 1.00 range)
  const bookStart = 0.60;
  const bookEnd = 1.00;
  const bookRange = bookEnd - bookStart;

  const totalSpreads = Math.ceil(pages.length / 2);
  const turns = Math.max(1, totalSpreads - 1);

  const scrollSpread = useMemo(() => {
    if (scrollProgress <= bookStart) return 0;
    if (scrollProgress >= bookEnd) return totalSpreads - 1;
    const t = (scrollProgress - bookStart) / bookRange;
    return Math.min(totalSpreads - 1, Math.floor(t * turns));
  }, [scrollProgress, totalSpreads, turns]);

  const turnProgress = useMemo(() => {
    if (scrollProgress <= bookStart) return 0;
    if (scrollProgress >= bookEnd) return 1;
    const t = (scrollProgress - bookStart) / bookRange;
    const turnIndex = Math.floor(t * turns);
    const turnStart = turnIndex / turns;
    const turnEnd = (turnIndex + 1) / turns;
    return Math.min(1, Math.max(0, (t - turnStart) / (turnEnd - turnStart)));
  }, [scrollProgress, turns]);

  // Book dimensions — A5 spread (296mm x 210mm), portrait pages
  const bookStyle = useMemo(() => {
    const vw = viewport.w;
    const vh = viewport.h;
    const maxBookH = vh * 0.80;
    const maxBookW = vw * (isMobile ? 0.80 : 0.75);

    let bookH = maxBookH;
    let bookW = isMobile ? bookH * A5_ASPECT : bookH * A5_ASPECT * 2;

    if (bookW > maxBookW) {
      bookW = maxBookW;
      bookH = isMobile ? bookW / A5_ASPECT : bookW / (A5_ASPECT * 2);
    }

    return {
      width: `${bookW}px`,
      height: `${bookH}px`,
    };
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
              {/* Floor plan sketch */}
              <rect x="30" y="30" width="140" height="90" strokeWidth="1" />
              <line x1="30" y1="70" x2="100" y2="70" />
              <line x1="100" y1="30" x2="100" y2="120" />
              <line x1="100" y1="70" x2="170" y2="70" />
              {/* Door arcs */}
              <path d="M60 70 Q60 55 75 55" strokeWidth="0.5" />
              <path d="M100 95 Q115 95 115 80" strokeWidth="0.5" />
              {/* Dimension lines */}
              <line x1="30" y1="20" x2="170" y2="20" strokeWidth="0.4" />
              <line x1="30" y1="16" x2="30" y2="24" strokeWidth="0.4" />
              <line x1="170" y1="16" x2="170" y2="24" strokeWidth="0.4" />
              <line x1="20" y1="30" x2="20" y2="120" strokeWidth="0.4" />
              <line x1="16" y1="30" x2="24" y2="30" strokeWidth="0.4" />
              <line x1="16" y1="120" x2="24" y2="120" strokeWidth="0.4" />
              {/* Annotations */}
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

  // Render a page's content
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
          style={bookStyle}
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

  // Desktop: open spread
  const leftIndex = scrollSpread * 2;
  const rightIndex = leftIndex + 1;

  return (
    <div className="sketchbook-container">
      <div className="sketchbook" style={bookStyle}>
        {renderPage(pages[leftIndex], 'left')}
        {renderPage(pages[rightIndex], 'right')}

        {/* Turning page overlay */}
        {turnProgress > 0 && turnProgress < 1 && scrollSpread < totalSpreads - 1 && (
          <div
            className="sketchbook-page-turning"
            style={{
              transform: `perspective(2000px) rotateY(${-turnProgress * 180}deg)`,
            }}
          >
            <div className="sketchbook-page-turning-front">
              {pages[scrollSpread * 2] && (
                <div className="sketchbook-page">
                  {pages[scrollSpread * 2].items?.map((item, i) => renderItem(item, `tf-${i}`))}
                </div>
              )}
            </div>
            <div className="sketchbook-page-turning-back">
              {pages[scrollSpread * 2 + 1] && (
                <div className="sketchbook-page">
                  {pages[scrollSpread * 2 + 1].items?.map((item, i) => renderItem(item, `tb-${i}`))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="sketchbook-spine" />
      </div>
    </div>
  );
}
