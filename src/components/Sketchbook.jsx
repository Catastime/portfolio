import { useState, useEffect, useMemo, useRef } from 'react';
import { BASE } from '@/paths'
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
 * @property {number} [bookZoom] - 0 to 1, scales book from zoomed-in on image to resting size
 * @property {number} [imgAspect] - natural aspect ratio of the zoom image (w/h)
 * @property {(src: string) => void} [onVideoOpen]
 * @property {() => void} [onMoreOpen]
 * @property {(page: number) => void} [onNavigatePage]
 * @property {'forward' | 'back' | null} [turnHint] - desktop scroll hint: highlights the page side being scrolled toward
 */

// Measured from the scanned paper textures (width / height)
const PAGE_ASPECT = 1510 / 2153; // average of left (1505) and right (1515) page textures

// Page heights the type sizes are anchored to — text scales uniformly with
// the page on every screen. Desktop rem sizes were tuned in a maximized
// browser on a 3440x1440 screen; the mobile fit values (fontSizeMobile)
// are calibrated on a 390x844 phone, nudged ~5% smaller for readability.
const REF_PAGE_H = 1040;
const REF_MOBILE_PAGE_H = 540;

/** @param {SketchbookProps} props */
export default function Sketchbook({
  pages = [],
  visible = false,
  scrollProgress = 0,
  bookZoom = 1,
  imgAspect = 0,
  onVideoOpen,
  onMoreOpen,
  onNavigatePage,
  turnHint,
}) {
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });
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

  // Mobile: single pages are scroll-driven, one page per slice of the book range.
  // Each slice: first half at rest, second half crossfades to the next page.
  const mobileFlat = 0.5;
  const mobilePos = useMemo(() => {
    const raw = ((scrollProgress - bookStart) / bookRange) * pages.length;
    return Math.max(0, Math.min(pages.length - 1, raw));
  }, [scrollProgress, pages.length]);
  const mobilePage = Math.floor(mobilePos);
  const mobileFrac = mobilePos - mobilePage;
  const mobileTurnP = useMemo(() => {
    if (mobileFrac <= mobileFlat) return 0;
    const raw = Math.min(1, (mobileFrac - mobileFlat) / (1 - mobileFlat));
    return raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
  }, [mobileFrac]);

  // Book dimensions — two A4 pages with a gap between them
  const { bookW, bookH, pageW, pageH, gap } = useMemo(() => {
    const vw = viewport.w;
    const vh = viewport.h;
    // Mobile: the single page fills ~92% of the screen (page aspect permitting)
    if (isMobile) {
      const fill = 0.92;
      const mW = Math.min(vw * fill, vh * fill * PAGE_ASPECT);
      const mH = mW / PAGE_ASPECT;
      return { bookW: mW, bookH: mH, pageW: mW, pageH: mH, gap: 0 };
    }
    const maxBookH = vh * 0.80;
    const gapFraction = 0;
    const maxBookW = vw * (isMobile ? 0.80 : 0.78);

    // Try fitting by height first
    let pH = maxBookH;
    let pW = pH * PAGE_ASPECT;
    let g = pW * gapFraction;
    let totalW = pW * 2 + g;

    // If too wide, fit by width
    if (totalW > maxBookW) {
      // pW * 2 + pW * gapFraction = maxBookW
      // pW * (2 + gapFraction) = maxBookW
      pW = maxBookW / (2 + gapFraction);
      pH = pW / PAGE_ASPECT;
      g = pW * gapFraction;
      totalW = pW * 2 + g;
    }

    return { bookW: totalW, bookH: pH, pageW: pW, pageH: pH, gap: g };
  }, [viewport, isMobile]);

  // Intro slide: the whole book slides up from below until slideEnd — at
  // max zoom only the image item is on screen, so this reads as the
  // fullscreen image sliding in (desktop; mobile keeps its own layer)
  const slideEnd = 0.33;
  const slideTranslateY = useMemo(() => {
    if (scrollProgress >= slideEnd) return 0;
    const t = Math.max(0, scrollProgress / slideEnd);
    const eased = 1 - Math.pow(1 - t, 3);
    return (1 - eased) * viewport.h;
  }, [scrollProgress, viewport.h]);

  // Book zoom-out: at bookZoom=0 the book is scaled and translated so the
  // right-page image item fills the viewport (we're "zoomed in" on it).
  // At bookZoom=1 the book is at resting size, centered.
  // The image item on the right page: x:-4%, y:10%, w:108% (Atelier Anthrazit).
  const bookTransform = useMemo(() => {
    // Mobile: no two-page zoom geometry to track, scale/fade the page in.
    // Ease-out so the motion responds immediately (the small scale range
    // makes an ease-in start look like nothing is happening).
    if (isMobile) {
      if (bookZoom >= 1) return { transform: 'scale(1)', transformOrigin: 'center center' };
      const ease = 1 - Math.pow(1 - bookZoom, 3);
      return {
        transform: `scale(${0.8 + 0.2 * ease})`,
        transformOrigin: 'center center',
        opacity: ease,
      };
    }
    if (bookZoom >= 1 || bookH === 0 || pageW === 0) {
      return { transform: 'scale(1)', transformOrigin: 'center center' };
    }

    // Item position and size on the right page (in book-local px)
    // Account for the 5% page inset (.sketchbook-page has inset: 5%)
    const pageInset = 0.05;
    const contentW = pageW * (1 - 2 * pageInset);
    const contentH = pageH * (1 - 2 * pageInset);
    const itemX = pageW + gap + (pageInset - 0.04 * (1 - 2 * pageInset)) * pageW;
    const itemY = (pageInset + 0.1 * (1 - 2 * pageInset)) * pageH;
    const itemW = 1.08 * contentW;
    // Item height depends on image aspect; use the item's natural aspect
    // from the loaded image. Fall back to square if unknown.
    const itemH = imgAspect > 0
      ? itemW / imgAspect
      : itemW;

    // Item center relative to book center (book-local coords)
    const itemCenterX = itemX + itemW / 2;
    const itemCenterY = itemY + itemH / 2;
    const bookCenterX = bookW / 2;
    const bookCenterY = bookH / 2;
    const offsetX = itemCenterX - bookCenterX;
    const offsetY = itemCenterY - bookCenterY;

    // Scale so the image fills the viewport completely (cover, not contain).
    // Use the larger scale so the image overflows — no paper visible at max zoom.
    const scaleByW = viewport.w / itemW;
    const scaleByH = viewport.h / itemH;
    const maxScale = Math.max(scaleByW, scaleByH);

    // At maxScale, the item fills the viewport. We need to translate so
    // the item center maps to the viewport center. Since the book is
    // centered by flexbox, the book center is already at viewport center.
    // After scaling around book center, the item center is at:
    //   viewportCenter + maxScale * offset
    // We need to translate by -maxScale * offset to bring it to viewport center.
    const maxTranslateX = -maxScale * offsetX;
    const maxTranslateY = -maxScale * offsetY;

    // Ease the zoom-out
    const ease = bookZoom < 0.5
      ? 4 * bookZoom * bookZoom * bookZoom
      : 1 - Math.pow(-2 * bookZoom + 2, 3) / 2;

    // Interpolate from max zoom to resting
    const scale = 1 + (maxScale - 1) * (1 - ease);
    const translateX = maxTranslateX * (1 - ease);
    const translateY = maxTranslateY * (1 - ease);

    // While the book slides in, everything above the image item is
    // clipped away so the intro reads as a clean fullscreen image. The
    // clip edge tracks the slide offset: as the zoom-out overlaps the
    // slide tail, the page above the photo is revealed at exactly its
    // natural zoom rate, and by the time the slide ends the edge has
    // reached the screen top — so releasing the clip is invisible.
    const clipY = Math.min(itemY, Math.max(0, bookH / 2 - (viewport.h / 2 + translateY) / scale));

    return {
      transform: `translate(${translateX}px, ${translateY + slideTranslateY}px) scale(${scale})`,
      transformOrigin: 'center center',
      clipPath: slideTranslateY > 0 ? `inset(${(clipY / pageH) * 100}% 0 0 0)` : undefined,
    };
  }, [bookZoom, bookW, bookH, pageW, pageH, gap, viewport.w, viewport.h, imgAspect, isMobile, slideTranslateY]);

  // Mobile: swipe/tap
  const touchStartX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const suppressClickRef = useRef(false);

  const navigateToPage = (page) => {
    if (page < 0 || page > pages.length - 1) return;
    onNavigatePage?.(page);
  };

  const handleTouchEnd = (e) => {
    // All touch navigation happens here; suppress the synthetic click that follows
    suppressClickRef.current = true;
    setTimeout(() => { suppressClickRef.current = false; }, 400);
    // Don't turn the page when tapping interactive items (video, MORE, links)
    if (e.target.closest('.sketch-item-clickable, .sketch-more-btn, a')) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) >= 40) {
      navigateToPage(mobilePage + (diff > 0 ? 1 : -1));
      return;
    }
    // Tap: left half goes back, right half goes forward
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.changedTouches[0].clientX - rect.left;
    navigateToPage(mobilePage + (x > rect.width / 2 ? 1 : -1));
  };

  const handleClick = (e) => {
    if (suppressClickRef.current) return;
    // Don't turn the page when tapping interactive items (video, MORE, links)
    if (e.target.closest('.sketch-item-clickable, .sketch-more-btn, a')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    navigateToPage(mobilePage + (x > rect.width / 2 ? 1 : -1));
  };

  if (!visible) return null;

  // Render a single item on a page
  const renderItem = (item, key, pageIndex) => {
    const style = {
      position: 'absolute',
      left: `${item.x}%`,
      top: `${item.y}%`,
      width: `${item.w}%`,
      transform: `rotate(${item.rotation}deg)`,
    };

    if (item.type === 'image') {
      const classes = ['sketch-item', 'sketch-item-image'];
      if (item.noBg) classes.push('sketch-item-image-nobg');
      if (item.polaroid) classes.push('sketch-item-image-polaroid');
      if (item.bringToFront) classes.push('sketch-item-bring-to-front');
      if (item.video) classes.push('sketch-item-clickable');
      const imageStyle = { ...style };
      if (item.shadow) imageStyle.boxShadow = item.shadow;
      return (
        <div
          key={key}
          className={classes.join(' ')}
          style={imageStyle}
          onClick={item.video ? () => onVideoOpen?.(item.video) : undefined}
        >
          {item.taped && (() => {
            const holeColor = holeColorFor(pageIndex);
            return (
              <>
                <div className="sketch-hole sketch-hole-tl" style={{ backgroundColor: holeColor }} />
                <div className="sketch-hole sketch-hole-tr" style={{ backgroundColor: holeColor }} />
                <div className="sketch-hole sketch-hole-bl" style={{ backgroundColor: holeColor }} />
                <div className="sketch-hole sketch-hole-br" style={{ backgroundColor: holeColor }} />
              </>
            );
          })()}
          {item.video && (
            <div className="sketch-play-btn"><div className="sketch-play-triangle" /></div>
          )}
          <img src={isMobile && item.imgMobile ? item.imgMobile : item.img} alt="" className="sketch-image" />
        </div>
      );
    }

    if (item.type === 'arrow') {
      return (
        <div key={key} className="sketch-item sketch-item-arrow" style={style}>
          <svg viewBox="0 0 100 100" className="sketch-svg" preserveAspectRatio="none">
            <g stroke="#2a2a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 50 C 20 40, 40 55, 60 45 S 85 50, 95 50" />
              <path d="M88 44 L 95 50 L 88 56" />
            </g>
          </svg>
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
      const textStyle = { ...style };
      if (item.font) textStyle.fontFamily = item.font;
      const itemFontSize = isMobile && item.fontSizeMobile != null ? item.fontSizeMobile : item.fontSize;
      if (itemFontSize) textStyle.fontSize = `calc(${itemFontSize}rem * var(--page-scale, 1))`;
      if (item.align) textStyle.textAlign = item.align;
      if (item.weight) textStyle.fontWeight = item.weight;
      const floatImg = item.floatImage;
      return (
        <div key={key} className="sketch-item sketch-item-text" style={textStyle}>
          {item.title && <div className="sketch-text-title">{item.title}</div>}
          {floatImg && (
            <img
              src={floatImg.img}
              alt=""
              className="sketch-float-image"
              style={{
                float: floatImg.side || 'right',
                width: `${floatImg.w}%`,
                margin: floatImg.side === 'left' ? '0 0.5em 0 0' : '0 0 0.5em 0',
                marginTop: `${floatImg.marginTop || 0}%`,
              }}
            />
          )}
          {item.sizes ? (
            item.sizes.map((s, i) => (
              <div key={i} className="sketch-text-body" style={{ fontSize: `calc(${s}rem * var(--page-scale, 1))` }}>
                {item.text}
              </div>
            ))
          ) : (
            <div className="sketch-text-body" style={(isMobile && item.fontSizeMobile != null) ? { fontSize: `calc(${item.fontSizeMobile}rem * var(--page-scale, 1))` } : (item.bodySize || item.bodyLineHeight) ? { fontSize: item.bodySize ? `calc(${item.bodySize}rem * var(--page-scale, 1))` : undefined, lineHeight: item.bodyLineHeight } : undefined}>{item.text}</div>
          )}
        </div>
      );
    }

    if (item.type === 'holes') {
      const holesStyle = { ...style };
      if (item.h) holesStyle.height = `${item.h}%`;
      const holeColor = holeColorFor(pageIndex);
      return (
        <div key={key} className="sketch-item sketch-holes" style={holesStyle}>
          {item.frame && (
            <div style={{ position: 'absolute', inset: 0, border: '1px solid #cfcfcf', opacity: 0.25 }} />
          )}
          <div className="sketch-hole sketch-hole-tl" style={{ backgroundColor: holeColor }} />
          <div className="sketch-hole sketch-hole-tr" style={{ backgroundColor: holeColor }} />
          <div className="sketch-hole sketch-hole-bl" style={{ backgroundColor: holeColor }} />
          <div className="sketch-hole sketch-hole-br" style={{ backgroundColor: holeColor }} />
        </div>
      );
    }

    if (item.type === 'cv') {
      const cvStyle = { ...style };
      const cvFontSize = isMobile && item.fontSizeMobile != null ? item.fontSizeMobile : item.fontSize;
      if (cvFontSize) cvStyle.fontSize = `calc(${cvFontSize}rem * var(--page-scale, 1))`;
      return (
        <div key={key} className="sketch-item sketch-item-text sketch-cv" style={cvStyle}>
          {item.sections.map((sec, si) => (
            <div key={si} className="cv-section">
              <div className="cv-section-name">{sec.name}</div>
              {sec.entries.map((e, i) => (
                <div key={i} className="cv-entry">
                  <div className="cv-head">
                    <span className="cv-role">{e.head}</span>
                    {e.date && (
                      <>
                        <span className="cv-line" />
                        <span className="cv-date">{e.date}</span>
                      </>
                    )}
                  </div>
                  {e.desc && <div className="cv-desc">{e.desc}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (item.type === 'button') {
      return (
        <div
          key={key}
          className="sketch-item sketch-more-btn"
          style={{ ...style, cursor: 'pointer' }}
          onClick={() => onMoreOpen?.()}
        >
          <span className="sketch-more-btn-label">{item.label}</span>
        </div>
      );
    }

    if (item.type === 'statement') {
      const statementStyle = { ...style };
      if (item.h) statementStyle.height = `${item.h}%`;
      // Font scales with the page so the statement fills its block
      const blockH = pageH * 0.9 * ((item.h || 100) / 100);
      statementStyle.fontSize = `${blockH * 0.16}px`;
      return (
        <div key={key} className="sketch-item sketch-item-statement" style={statementStyle}>
          {item.text.split('\n').map((line, i, all) => (
            <div key={i} style={i === 0 && all.length > 1 ? { textAlign: 'right' } : i < all.length - 1 ? { textAlignLast: 'justify' } : undefined}>
              {line}
            </div>
          ))}
        </div>
      );
    }

    if (item.type === 'corner-text') {
      const align = item.align || 'left';
      const offset = item.x || 5;
      const cornerStyle = {
        ...style,
        textAlign: align,
        right: align === 'right' ? `${offset}%` : undefined,
        left: align === 'left' ? `${offset}%` : undefined,
        width: 'auto',
        maxWidth: '45%',
      };
      if (item.href) {
        return (
          <a key={key} href={item.href} className="sketch-item sketch-corner-text sketch-corner-link" style={cornerStyle}>
            {item.text}
          </a>
        );
      }
      return (
        <div key={key} className="sketch-item sketch-corner-text" style={cornerStyle}>
          {item.text}
        </div>
      );
    }

    return null;
  };

  // Font for all pages
  const fontForPage = () => "'Epoch', 'Futura', sans-serif";

  // Paper texture for a page — pages can override via the `texture` field
  const pageTexture = (pageIndex) =>
    pages[pageIndex]?.texture || (pageIndex % 2 === 0 ? 'left_page' : 'right_page');
  const textureUrl = (pageIndex) => `url('${BASE}textures/${pageTexture(pageIndex)}.png')`;

  // Punched-hole color: reads as the page underneath in the stack —
  // black paper on white pages, paper color on black/dark pages
  const holeColorFor = (pageIndex) => {
    const tex = pageTexture(pageIndex);
    return tex.includes('black') || tex.includes('dark') ? '#cfcfcf' : '#1d1d1d';
  };

  // Text color per page paper: paper tone on black/dark pages, black-page tone on white
  const textColorFor = (pageIndex) => {
    const tex = pageTexture(pageIndex);
    return tex.includes('black') || tex.includes('dark') ? '#cfcfcf' : '#2e2e2e';
  };

  // Inject corner text items for a page based on spread metadata
  // Spread 0 (intro) has no corner text. All other spreads get:
  //   Left page:  top-left = "WORK.NN/13", top-right = year
  //   Right page: top-left = place, top-right = project title
  const cornerItemsForPage = (pageIndex, pages) => {
    const spread = Math.floor(pageIndex / 2);
    if (spread === 0) {
      // Spread 0: contact field in the upper right corner of the right page
      if (pageIndex % 2 === 0) return [];
      return [
        { type: 'corner-text', text: 'https://timmkr.space', href: 'https://timmkr.space', x: 1.4, y: 2, align: 'right' },
        { type: 'corner-text', text: 'tim.moedeker@gmail.com', href: 'mailto:tim.moedeker@gmail.com', x: 1.4, y: 4.3, align: 'right' },
        { type: 'corner-text', text: '+49 177 9000982', href: 'tel:+491779000982', x: 1.4, y: 6.6, align: 'right' },
      ];
    }
    const meta = pages[pageIndex]?.meta || pages[spread * 2]?.meta;
    if (!meta) return [];
    const isLeft = pageIndex % 2 === 0;
    const spreadNum = String(spread).padStart(2, '0');
    if (isLeft) {
      return [
        { type: 'corner-text', text: `WORK.${spreadNum}/13`, x: 5, y: 2.5, align: 'left' },
        { type: 'corner-text', text: meta.year || '', x: 5, y: 2.5, align: 'right' },
      ];
    } else {
      return [
        { type: 'corner-text', text: meta.place || '', x: 5, y: 2, align: 'left' },
        { type: 'corner-text', text: meta.title || '', x: 5, y: 2, align: 'right' },
      ];
    }
  };

  const renderCorners = (pageIndex) => {
    if (pageIndex === undefined) return null;
    const corners = cornerItemsForPage(pageIndex, pages);
    if (corners.length === 0) return null;
    return (
      <div className="sketchbook-corners" style={{ '--page-text': textColorFor(pageIndex) }}>
        {corners.map((item, i) => renderItem(item, `corner-${i}`))}
      </div>
    );
  };

  const renderPage = (page, key, fontFamily, pageIndex) => {
    if (!page) return <div key={key} className="sketchbook-page sketchbook-page-empty" />;
    return (
      <div key={key} className="sketchbook-page" style={{ fontFamily, '--page-text': textColorFor(pageIndex) }}>
        {page.items?.map((item, i) => renderItem(item, i, pageIndex))}
      </div>
    );
  };

  if (isMobile) {
    const nextMobilePage = Math.min(pages.length - 1, mobilePage + 1);
    const isTurning = mobileTurnP > 0 && nextMobilePage !== mobilePage;
    return (
      <div className="sketchbook-container" style={{ '--hole-size': `${pageH * 0.0102}px`, '--page-scale': pageH / (isMobile ? REF_MOBILE_PAGE_H : REF_PAGE_H) }}>
        <div
          className="sketchbook-mobile"
          style={{
            width: `${pageW}px`,
            height: `${pageH}px`,
            ...bookTransform,
          }}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="sketchbook-mobile-layer"
            style={{
              backgroundImage: `url('${BASE}textures/${pageTexture(mobilePage)}.png')`,
              transform: `translateX(${-6 * mobileTurnP}%)`,
            }}
          >
            {renderPage(pages[mobilePage], 'mobile', fontForPage(mobilePage), mobilePage)}
            {renderCorners(mobilePage)}
          </div>
          {isTurning && (
            <div
              className="sketchbook-mobile-layer"
              style={{
                backgroundImage: `url('${BASE}textures/${pageTexture(nextMobilePage)}.png')`,
                transform: `translateX(${6 * (1 - mobileTurnP)}%)`,
                opacity: mobileTurnP,
              }}
            >
              {renderPage(pages[nextMobilePage], 'mobile-next', fontForPage(nextMobilePage), nextMobilePage)}
              {renderCorners(nextMobilePage)}
            </div>
          )}
          <div className="sketchbook-page-indicator">
            {mobilePage + 1} / {pages.length}
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

  // The left stack underneath switches to the next spread by the turn's
  // halfway point — once the turning page passes edge-on, the new spread
  // is fully visible underneath it.
  const underT = Math.min(1, Math.max(0, (turnProgress - 0.4) / 0.1));

  // During a turn:
  //   - Left page underneath: crossfades from current left to next left
  //   - Right page underneath: shows next right page (destination)
  //   - Turning page front: current right page (being flipped away)
  //   - Turning page back: next left page (revealed as it lands on left)
  const displayRightUnderneath = isTurning ? nextRightIndex : rightIndex;

  return (
    <div className="sketchbook-container" style={{ '--hole-size': `${pageH * 0.0102}px`, '--page-scale': pageH / (isMobile ? REF_MOBILE_PAGE_H : REF_PAGE_H) }}>
      <div
        className="sketchbook"
        style={{
          width: `${bookW}px`,
          height: `${bookH}px`,
          ...bookTransform,
        }}
      >
        {/* Left page stack — crossfades from current to next left during turn */}
        <div
          className="sketchbook-page-stack sketchbook-page-stack-left"
          style={{ width: `${pageW}px`, height: `${pageH}px`, backgroundImage: textureUrl(leftIndex), transform: turnHint === 'back' ? 'perspective(2000px) rotateY(3deg)' : undefined, transformOrigin: 'right center', transition: 'transform 0.25s ease-out' }}
        >
          {isTurning ? (
            <>
              <div style={{ position: 'absolute', inset: 0, opacity: 1 - underT, backgroundImage: textureUrl(leftIndex), backgroundSize: '100% 100%' }}>
                {renderPage(pages[leftIndex], 'left-current', fontForPage(leftIndex), leftIndex)}
              </div>
              <div style={{ position: 'absolute', inset: 0, opacity: underT, backgroundImage: textureUrl(nextLeftIndex), backgroundSize: '100% 100%' }}>
                {renderPage(pages[nextLeftIndex], 'left-next', fontForPage(nextLeftIndex), nextLeftIndex)}
              </div>
            </>
          ) : (
            renderPage(pages[leftIndex], 'left', fontForPage(leftIndex), leftIndex)
          )}
          {renderCorners(leftIndex)}
        </div>

        {/* Gap between stacks */}
        <div style={{ width: `${gap}px` }} />

        {/* Right page stack */}
        <div
          className="sketchbook-page-stack sketchbook-page-stack-right"
          style={{ width: `${pageW}px`, height: `${pageH}px`, backgroundImage: textureUrl(displayRightUnderneath), transform: turnHint === 'forward' ? 'perspective(2000px) rotateY(-3deg)' : undefined, transformOrigin: 'left center', transition: 'transform 0.25s ease-out' }}
        >
          {/* Underneath: the destination right page */}
          {renderPage(pages[displayRightUnderneath], 'right-under', fontForPage(displayRightUnderneath), displayRightUnderneath)}
          {renderCorners(displayRightUnderneath)}
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
            <div className="sketchbook-page-turning-front" style={{ backgroundImage: textureUrl(rightIndex), visibility: turnProgress < 0.5 ? 'visible' : 'hidden' }}>
              {renderPage(pages[rightIndex], 'turn-front', fontForPage(rightIndex), rightIndex)}
            </div>
            <div className="sketchbook-page-turning-back" style={{ backgroundImage: textureUrl(nextLeftIndex), visibility: turnProgress < 0.5 ? 'hidden' : 'visible' }}>
              {renderPage(pages[nextLeftIndex], 'turn-back', fontForPage(nextLeftIndex), nextLeftIndex)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
