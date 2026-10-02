import { BASE } from '@/paths'

// Warmed images are retained so the browser can't garbage-collect the
// pending requests — a dropped request means the asset misses the cache
// and re-fetches when the user reaches it.
const warmed: HTMLImageElement[] = []

const warmImage = (src: string) => {
  const img = new Image()
  img.src = src
  warmed.push(img)
}

/**
 * startPreload — warms media before the user reaches it.
 *
 * Critical assets (the first fullscreen image and the book's paper
 * textures) start loading immediately on mount. Everything the later
 * spreads need is fetched once the browser goes idle, so slow
 * connections get a head start without competing with the first paint.
 */
export function startPreload() {
  // Critical: first reveal + spread 0/1 surfaces (the thesis pages use
  // the black paper on both sides).
  // Small screens get the compressed hero variant (the full scan is 21MB).
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const hero = `${BASE}tim/Atelier Anthrazit-039-breit-bw${isMobile ? '-mobile' : ''}.jpg`
  ;[
    hero,
    `${BASE}textures/left_page-black.png`,
    `${BASE}textures/right_page-black.png`,
    `${BASE}textures/right_page.png`,
  ].forEach(warmImage)

  const warmRest = () => {
    ;[
      `${BASE}textures/left_page.png`,
      `${BASE}master-thesis/thesis-starter-full-page.png`,
      `${BASE}master-thesis/Example_start.png`,
      `${BASE}master-thesis/polaroid-composed-sketch.png`,
      `${BASE}master-thesis/polaroid-composed-concrete.png`,
      `${BASE}master-thesis/polaroid-composed-scandi.png`,
      `${BASE}master-thesis/polaroid-composed-bladerunner.png`,
      `${BASE}master-thesis/Timeline.png`,
      `${BASE}master-thesis/Alternative Realities Diagramm film-preview.png`,
      `${BASE}master-thesis/Sections/filmstrip1-small.png`,
      `${BASE}master-thesis/comic/comic1.png`,
      `${BASE}master-thesis/comic/comic2.png`,
      `${BASE}master-thesis/comic/comic3.png`,
      `${BASE}master-thesis/comic/comic4.png`,
      `${BASE}master-thesis/comic/comic-terminate.png`,
      `${BASE}master-thesis/cleanup/cleanup.jpg`,
      `${BASE}master-thesis/website.png`,
    ].forEach(warmImage)
  }

  const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(warmRest, { timeout: 3000 })
  } else {
    setTimeout(warmRest, 2000)
  }
}
