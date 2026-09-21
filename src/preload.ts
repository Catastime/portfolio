import { BASE } from '@/paths'

const warmImage = (src: string) => {
  const img = new Image()
  img.src = src
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
  // Critical: first reveal + spread 0 surfaces.
  // Small screens get the compressed hero variant (the full scan is 21MB).
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const hero = `${BASE}tim/Atelier Anthrazit-039-breit-bw${isMobile ? '-mobile' : ''}.jpg`
  ;[
    hero,
    `${BASE}textures/left_page-black.png`,
    `${BASE}textures/right_page.png`,
  ].forEach(warmImage)

  const warmRest = () => {
    ;[
      `${BASE}textures/left_page.png`,
      `${BASE}textures/right_page.png`,
      `${BASE}master-thesis/comics-pipelineRendering.png`,
      `${BASE}master-thesis/thesis-starter.jpeg`,
      `${BASE}master-thesis/website-concept2.png`,
      `${BASE}master-thesis/Example_start.png`,
      `${BASE}master-thesis/Cityhotel_Sketch.jpg`,
      `${BASE}master-thesis/Cityhotel_Concrete.jpg`,
      `${BASE}master-thesis/Cityhotel_Scandi.jpg`,
      `${BASE}master-thesis/Cityhotel_Blade-Runner.jpg`,
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
