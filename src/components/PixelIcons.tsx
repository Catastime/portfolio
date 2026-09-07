// Pixel-block icons rendered as inline SVG grids.
// Each icon is a 5x5 pixel grid to match the dithered aesthetic.

function PixelIcon({ grid, size = 18 }: { grid: number[][]; size?: number }) {
  const cellSize = 4
  const cols = grid[0]?.length ?? 5
  const rows = grid.length
  const w = cols * cellSize
  const h = rows * cellSize

  return (
    <svg
      width={size}
      height={size * (rows / cols)}
      viewBox={`0 0 ${w} ${h}`}
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      {grid.map((row: number[], y: number) =>
        row.map((cell: number, x: number) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
            />
          ) : null,
        ),
      )}
    </svg>
  )
}

// Home: a pixel house shape
const homeGrid = [
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
]

// Projects: a pixel grid/blocks shape
const projectsGrid = [
  [1, 1, 0, 1, 1],
  [1, 1, 0, 1, 1],
  [0, 0, 0, 0, 0],
  [1, 1, 0, 0, 1],
  [1, 1, 0, 1, 1],
]

// Contact: a pixel envelope/mail shape
const contactGrid = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
]

// Down arrow: pixel arrow pointing down
const arrowDownGrid = [
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [1, 0, 1, 0, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
]

export function PixelHome({ size = 18 }) {
  return <PixelIcon grid={homeGrid} size={size} />
}

export function PixelProjects({ size = 18 }) {
  return <PixelIcon grid={projectsGrid} size={size} />
}

export function PixelContact({ size = 18 }) {
  return <PixelIcon grid={contactGrid} size={size} />
}

export function PixelArrowDown({ size = 18 }) {
  return <PixelIcon grid={arrowDownGrid} size={size} />
}
