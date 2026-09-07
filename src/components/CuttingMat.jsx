import { useEffect, useRef, useState, useMemo } from 'react';
import './CuttingMat.css';

/**
 * CuttingMat — translucent dark grey cutting mat with square grid lines
 * and centimeter numbers along the bottom edge (starting at `startCm`).
 *
 * Only the bottom edge of the mat is visible; left/right/top extend off-screen.
 * The grid stays square on every screen format.
 */
/**
 * @typedef {Object} CuttingMatProps
 * @property {number} [startCm]
 * @property {string} [className]
 * @property {Object} [style]
 */

/** @param {CuttingMatProps} props */
export default function CuttingMat({
  startCm = 7,
  className = '',
  style,
}) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const numberRowHeight = 28;
  const numberGap = 6;

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Grid cell size in px. We want square cells, so we pick a cell size
  // that divides evenly into the container width. Target ~40px per cell,
  // adjusted to fit an integer number of columns.
  const { cellSize, cols, rows } = useMemo(() => {
    const targetCell = 40;
    if (size.width === 0) return { cellSize: targetCell, cols: 0, rows: 0 };
    const c = Math.max(1, Math.round(size.width / targetCell));
    const cell = size.width / c;
    const gridHeight = size.height - numberRowHeight - numberGap;
    const r = Math.ceil(gridHeight / cell);
    return { cellSize: cell, cols: c, rows: r };
  }, [size, numberRowHeight, numberGap]);

  // Generate cm labels for the bottom edge.
  // Each column = 1 cm. Labels start at `startCm`.
  const cmLabels = useMemo(() => {
    if (cols === 0) return [];
    return Array.from({ length: cols }, (_, i) => startCm + i);
  }, [cols, startCm]);

  const gridHeight = rows * cellSize;
  const vlineBottom = numberRowHeight - 4;
  const hOffset = cellSize * (2 / 3);
  const vOffset = -cellSize / 3;

  return (
    <div
      ref={containerRef}
      className={`cutting-mat ${className}`}
      style={style}
    >
      {/* Vertical lines — shifted 1/3 cell left, extend down into number area */}
      <div className="cutting-mat-vlines">
        {Array.from({ length: cols + 2 }, (_, i) => (
          <div
            key={`v-${i}`}
            className="cutting-mat-vline"
            style={{
              left: `${i * cellSize + vOffset}px`,
              top: 0,
              bottom: `${vlineBottom}px`,
            }}
          />
        ))}
      </div>

      {/* Horizontal lines — bottom-up: thick line is fixed, lines extend upward */}
      <div
        className="cutting-mat-hlines"
        style={{
          height: `${gridHeight}px`,
          bottom: `${numberRowHeight}px`,
        }}
      >
        {Array.from({ length: rows + 1 }, (_, i) => {
          // All lines are cellSize apart, starting from the thick line at 0.
          const fromBottom = (rows - i) * cellSize;
          const isLast = i === rows;
          return (
            <div
              key={`h-${i}`}
              className={`cutting-mat-hline${isLast ? ' cutting-mat-hline-thick' : ''}`}
              style={{ bottom: `${fromBottom}px` }}
            />
          );
        })}
      </div>

      {/* Bottom edge bar with cm numbers — shifted one vertical line left */}
      <div className="cutting-mat-bottom-edge">
        <div
          className="cutting-mat-cm-row"
          style={{ height: `${numberRowHeight}px` }}
        >
          {cmLabels.map((cm, i) => (
            <div
              key={cm}
              className="cutting-mat-cm-label"
              style={{
                position: 'absolute',
                left: `${(i + 1) * cellSize + vOffset}px`,
                width: `${cellSize}px`,
                marginLeft: `${-cellSize / 2}px`,
                textAlign: 'center',
              }}
            >
              {cm}
            </div>
          ))}
        </div>
        <div className="cutting-mat-edge-line" />
      </div>
    </div>
  );
}
