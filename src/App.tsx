import { useState, useEffect, useCallback, useRef } from 'react'
import Dither from '@/components/Dither'
import Dock from '@/components/Dock'
import Masonry from '@/components/Masonry'
import DecryptedText from '@/components/DecryptedText'
import CuttingMat from '@/components/CuttingMat'
import ScrollSequence from '@/components/ScrollSequence'
import Sketchbook from '@/components/Sketchbook'
import { PixelHome, PixelProjects, PixelContact, PixelArrowDown, PixelArrowUp, PixelArrowRight, PixelArrowLeft } from '@/components/PixelIcons'

const projectItems = [
  { id: '1', img: 'https://picsum.photos/id/1015/600/900?grayscale', url: 'https://example.com/one', height: 400 },
  { id: '2', img: 'https://picsum.photos/id/1011/600/750?grayscale', url: 'https://example.com/two', height: 250 },
  { id: '3', img: 'https://picsum.photos/id/1020/600/800?grayscale', url: 'https://example.com/three', height: 600 },
  { id: '4', img: 'https://picsum.photos/id/1016/600/700?grayscale', url: 'https://example.com/four', height: 350 },
  { id: '5', img: 'https://picsum.photos/id/1018/600/650?grayscale', url: 'https://example.com/five', height: 450 },
  { id: '6', img: 'https://picsum.photos/id/1019/600/550?grayscale', url: 'https://example.com/six', height: 300 },
  { id: '7', img: 'https://picsum.photos/id/1024/600/800?grayscale', url: 'https://example.com/seven', height: 500 },
  { id: '8', img: 'https://picsum.photos/id/1025/600/600?grayscale', url: 'https://example.com/eight', height: 350 },
  { id: '9', img: 'https://picsum.photos/id/1043/600/750?grayscale', url: 'https://example.com/nine', height: 400 },
  { id: '10', img: 'https://picsum.photos/id/1035/600/850?grayscale', url: 'https://example.com/ten', height: 550 },
]

// Sketchbook pages — 13 spreads (26 pages).
// Spread 0: Introduction & CV (no corner text)
// Spread 1: Master Thesis — "Artificial Intelligence in Architectural Design"
// Spreads 2-12: Placeholder for future projects
// Corner text (spread number, year, place, title) is auto-injected by Sketchbook
// for all spreads except spread 0, using the `meta` field on the left page.

const THESIS_IMG = '/portfolio/master-thesis'

const bookPages = [
  // ===== SPREAD 0: Introduction & CV =====
  // Left page — intro text
  {
    items: [
      { type: 'text', title: 'Introduction', text: 'Architecture Portfolio of Tim.Mkr\nMaster of Architecture, 2024\n\nThis collection presents selected\nworks from my academic and\nprofessional journey, exploring\nthe intersection of design,\ntechnology, and the built\nenvironment.', x: 8, y: 10, w: 80, rotation: 0, font: "'Epoch', sans-serif", fontSize: 0.7 },
    ],
  },
  // Right page — font comparison test
  {
    items: [
      { type: 'text', title: 'Epoch', text: 'Architecture 0123', x: 8, y: 10, w: 28, rotation: 0, font: "'Epoch', sans-serif", sizes: [0.5, 0.7, 1.0] },
      { type: 'text', title: 'Endless', text: 'Architecture 0123', x: 36, y: 10, w: 28, rotation: 0, font: "'Endless', sans-serif", sizes: [0.5, 0.7, 1.0] },
      { type: 'text', title: 'Futura', text: 'Architecture 0123', x: 64, y: 10, w: 28, rotation: 0, font: "'Futura', sans-serif", sizes: [0.5, 0.7, 1.0] },
    ],
  },

  // ===== SPREAD 1: Master Thesis =====
  // Left page
  {
    meta: { year: '2024', place: 'Hannover', title: 'Artificial Intelligence in Architectural Design' },
    items: [
      // Upper text block — narrowed to make room for comics on the right
      { type: 'text', text: 'The current development in the field of artificial intelligence promises unprecedented potentials for creative fields such as architecture. Instead of mere automation of simple processes and efficiency improvement through enhanced tools, it could herald the beginning of a true symbiosis between humans and machines, a vision pursued in the 20th century by researchers like John McCarthy and later Nicolas Negroponte.', x: 8, y: 10, w: 58, rotation: 0, font: "'Epoch', sans-serif", fontSize: 0.55 },
      // Comics image — right side, 10% smaller, slightly more right
      { type: 'image', img: `${THESIS_IMG}/comics-pipelineRendering.png`, x: 74, y: 10, w: 18, rotation: 2, noBg: true },
      // thesis-starter — between the two text blocks, 20% bigger than original w:28
      { type: 'image', img: `${THESIS_IMG}/thesis-starter.jpeg`, x: 8, y: 27, w: 42, rotation: -2, taped: true },
      // website-concept — below the lower text, poking into it, 20% bigger than original w:38
      { type: 'image', img: `${THESIS_IMG}/website-concept.png`, x: 48, y: 76, w: 46, rotation: 1, noBg: true },
      // Second text block — part 1: below comic, right of starter, above concept
      { type: 'text', text: 'However, the concept of artificial intelligence has undergone significant changes since its inception in the 1950s by John McCarthy. While he viewed AI as the understanding and reproduction of human intelligence, the term has now become vastly expansive, encompassing various categories of programs, from personal assistants to deep learning algorithms.', x: 52, y: 60, w: 38, rotation: 0, font: "'Epoch', sans-serif", fontSize: 0.5, align: 'right' },
      // Second text block — part 2: left of concept, below starter
      { type: 'text', text: 'When someone speaks of AI today, it generally refers to a deep learning algorithm attempting to simulate cognitive functions based on vast amounts of data. However, truly autonomous thinking programs, as envisaged in the 1950s, have not been realized yet, as current computers lack the necessary level of perception or self-reflection to develop actual intelligence.', x: 8, y: 78, w: 34, rotation: 0, font: "'Epoch', sans-serif", fontSize: 0.5 },
    ],
  },
  // Right page
  {
    meta: { year: '2024', place: 'Hannover', title: 'Artificial Intelligence in Architectural Design' },
    items: [
      // Top text block
      { type: 'text', text: 'The rapid development in this renaissance of artificial intelligence has ignited in me a desire to delve into this topic through a master\'s thesis. The goal of this work is to examine the connections between past and current developments, describe the theoretical ideas and aspirations of these developments and their instigators, and develop a simple tool that showcases current possibilities of generative deep learning artificial intelligence in a user-friendly and helpful manner.', x: 8, y: 10, w: 84, rotation: 0, font: "'Epoch', sans-serif", fontSize: 0.55 },
      // Three images — positioned below the text (y:30 to y:95)
      { type: 'image', img: `${THESIS_IMG}/Example_start.png`, x: 8, y: 32, w: 35, rotation: -1, taped: true },
      { type: 'image', img: `${THESIS_IMG}/Example_finished.png`, x: 50, y: 32, w: 38, rotation: 1, taped: true },
      { type: 'image', img: `${THESIS_IMG}/website.png`, x: 12, y: 62, w: 72, rotation: -2, taped: true },
    ],
  },

  // ===== SPREADS 2-12: Placeholder pages for future projects =====
  // Spread 2
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 3
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 4
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 5
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 6
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 7
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 8
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 9
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 10
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 11
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 12
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
]

function App() {
  const [showProjects, setShowProjects] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [matVisible, setMatVisible] = useState(false)
  const [bookVisible, setBookVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [arrowVisible, setArrowVisible] = useState(false)
  const [fadingHome, setFadingHome] = useState(false)
  const scrollAnimRef = useRef<number | null>(null)

  // Show arrow after DecryptedText finishes (28 chars * 80ms speed + buffer)
  useEffect(() => {
    const decryptDuration = 28 * 80 + 300
    const t = setTimeout(() => setArrowVisible(true), decryptDuration)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) { setScrollProgress(0); return }
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / max)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Title moves from center of viewport to top during the first 33% of scroll
  // At progress 0: centered (translateY = ~40vh), at progress 0.33: at top (translateY = 0)
  const titleMoveEnd = 0.33
  const titleTranslateY = scrollProgress <= titleMoveEnd
    ? `${(1 - scrollProgress / titleMoveEnd) * 40}vh`
    : '0vh'

  // Arrow visible at landing (progress < 0.02) and at the image stop (~0.33)
  // so the user can click again to continue to the cutting mat
  const atLanding = scrollProgress < 0.02
  const atImageStop = scrollProgress >= 0.30 && scrollProgress <= 0.36
  const arrowOpacity = !arrowVisible ? 0 : (atLanding || atImageStop) ? 1 : 0

  // Book page turn arrows — visible when the book is visible
  // The book scroll range is 0.60-1.00, with flat zones and turn zones
  const bookStart = 0.60
  const bookEnd = 1.00
  const bookRange = bookEnd - bookStart
  const totalSpreads = Math.ceil(bookPages.length / 2)
  const flatRatio = 0.35

  // Determine which spread we're on and whether we're in a flat zone
  const bookT = Math.max(0, Math.min(1, (scrollProgress - bookStart) / bookRange))
  const sliceSize = 1 / totalSpreads
  const currentSpread = Math.min(totalSpreads - 1, Math.floor(bookT / sliceSize))
  const sliceStart = currentSpread * sliceSize
  const sliceT = (bookT - sliceStart) / sliceSize
  const inFlatZone = sliceT <= flatRatio || currentSpread >= totalSpreads - 1

  // Show book arrows when in the book's flat zone
  const bookArrowVisible = bookVisible && inFlatZone && scrollProgress >= bookStart && scrollProgress <= bookEnd
  const canTurnForward = bookArrowVisible && currentSpread < totalSpreads - 1
  const canTurnBack = bookArrowVisible && currentSpread > 0
  // Up arrow: at image stop, or at book flat zone on the first spread only
  const canGoUp = atImageStop || (bookArrowVisible && currentSpread === 0)

  // Scroll to a specific spread's flat zone center
  const scrollToSpreadFlat = (spread: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const sStart = bookStart + spread * sliceSize * bookRange
    const flatCenter = sStart + sliceSize * flatRatio * 0.5 * bookRange
    smoothScrollTo(max * flatCenter, 1500)
  }

  const turnPageForward = () => {
    if (canTurnForward) {
      scrollToSpreadFlat(currentSpread + 1)
    }
  }

  const turnPageBack = () => {
    if (canTurnBack) {
      scrollToSpreadFlat(currentSpread - 1)
    }
  }

  const smoothScrollTo = (target: number, duration = 4000) => {
    if (scrollAnimRef.current !== null) {
      cancelAnimationFrame(scrollAnimRef.current)
    }
    const start = window.scrollY
    const distance = target - start
    const startTime = performance.now()

    // Ease-out: starts fast, decelerates — no initial pause
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const step = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / duration)
      window.scrollTo(0, start + distance * easeOutCubic(t))
      if (t < 1) {
        scrollAnimRef.current = requestAnimationFrame(step)
      } else {
        scrollAnimRef.current = null
      }
    }
    scrollAnimRef.current = requestAnimationFrame(step)
  }

  const cancelScroll = () => {
    if (scrollAnimRef.current !== null) {
      cancelAnimationFrame(scrollAnimRef.current)
      scrollAnimRef.current = null
    }
  }

  // Navigation: three steps — landing (0), image (0.33), book (0.60)
  const scrollToStep = (step: 'landing' | 'image' | 'book', duration = 1500) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const targets = { landing: 0, image: titleMoveEnd, book: bookStart }
    smoothScrollTo(max * targets[step], duration)
  }

  // Two-phase auto-play: first click scrolls to the image, second click
  // scrolls from there to the book on the cutting mat (zoom-out complete)
  const autoPlayPhase = useRef(0)
  const autoPlay = () => {
    if (autoPlayPhase.current === 0) {
      scrollToStep('image', 1500)
      autoPlayPhase.current = 1
    } else {
      scrollToStep('book', 2500)
      autoPlayPhase.current = 0
    }
  }

  // Go back to the previous step
  const goBack = () => {
    if (atImageStop) {
      autoPlayPhase.current = 0
      scrollToStep('landing', 1500)
    } else if (bookVisible && inFlatZone) {
      autoPlayPhase.current = 1
      scrollToStep('image', 1500)
    }
  }

  const goHome = () => {
    setShowProjects(false)
    setFadingHome(true)
    autoPlayPhase.current = 0
    // Scroll up while fading to black, then cut scroll, jump to top and fade in
    smoothScrollTo(0, 1200)
    setTimeout(() => {
      cancelScroll()
      window.scrollTo(0, 0)
      setFadingHome(false)
    }, 450)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && arrowVisible && (atLanding || atImageStop)) {
        e.preventDefault()
        autoPlay()
      }
      if (e.key === 'ArrowUp' && canGoUp) {
        e.preventDefault()
        goBack()
      }
      if (e.key === 'ArrowRight' && canTurnForward) {
        e.preventDefault()
        turnPageForward()
      }
      if (e.key === 'ArrowLeft' && canTurnBack) {
        e.preventDefault()
        turnPageBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [arrowVisible, atLanding, atImageStop, canGoUp, canTurnForward, canTurnBack])

  // Trigger autoPlay/goBack after 2 wheel ticks in the appropriate direction
  const wheelTickRef = useRef(0)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (showProjects) return
      if (scrollAnimRef.current !== null) return
      if (!arrowVisible) return

      const goingDown = e.deltaY > 0
      const goingUp = e.deltaY < 0

      // Determine which step we're at
      const canGoForward = atLanding || atImageStop
      const canGoBack = canGoUp

      if (!canGoForward && !canGoBack) {
        wheelTickRef.current = 0
        return
      }

      if (goingDown && !canGoForward) {
        wheelTickRef.current = 0
        return
      }
      if (goingUp && !canGoBack) {
        wheelTickRef.current = 0
        return
      }

      e.preventDefault()
      wheelTickRef.current += 1
      if (wheelTickRef.current >= 2) {
        wheelTickRef.current = 0
        if (goingDown) autoPlay()
        else goBack()
      }
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [arrowVisible, atLanding, atImageStop, canGoUp, showProjects])

  const handleMatVisible = useCallback((show: boolean) => {
    setMatVisible(show)
  }, [])

  const handleBookVisible = useCallback((show: boolean) => {
    setBookVisible(show)
  }, [])

  useEffect(() => {
    if (showProjects) {
      const t = setTimeout(() => setOverlayVisible(true), 10)
      document.body.style.overflow = 'hidden'
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ''
      }
    } else {
      setOverlayVisible(false)
      document.body.style.overflow = ''
    }
  }, [showProjects])

  const dockItems = [
    { icon: <PixelHome size={18} />, label: 'Home', onClick: goHome },
    { icon: <PixelProjects size={18} />, label: 'Projects', onClick: () => setShowProjects(prev => !prev) },
    { icon: <PixelContact size={18} />, label: 'Contact', onClick: () => console.log('Contact') },
  ]

  return (
    <div className="relative w-full">
      {/* Fade overlay for home transition */}
      <div
        className="fixed inset-0 z-50 bg-black"
        style={{
          opacity: fadingHome ? 1 : 0,
          transition: 'opacity 0.45s ease',
          pointerEvents: fadingHome ? 'auto' : 'none',
        }}
      />

      {/* Scroll spacer — gives the document scrollable height for the sequence */}
      <div className="h-[700vh] w-full" />

      {/* Fixed background layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          backgroundColor={[0, 0, 0]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>

      {/* Scroll-driven image — fixed layer, moves/scales with scroll */}
      <ScrollSequence onMatVisible={handleMatVisible} onBookVisible={handleBookVisible} />

      {/* Cutting mat — behind the image, appears when zoom-out starts */}
      <div
        className="fixed inset-0 z-5"
        style={{
          opacity: matVisible ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: matVisible ? 'auto' : 'none',
        }}
      >
        <CuttingMat startCm={7} />
      </div>

      {/* Sketchbook — appears on the cutting mat after zoom-out completes */}
      <Sketchbook
        pages={bookPages}
        visible={bookVisible}
        scrollProgress={scrollProgress}
      />

      {/* Title — starts centered, moves to top on scroll.
          Underneath the cutting mat (z-5) so it shows through the translucent mat. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-1 flex justify-center px-4 pt-10"
        style={{ transform: `translateY(${titleTranslateY})` }}
      >
        <div className="w-full max-w-5xl">
          <DecryptedText
            text="ARCH1TECTURE.PORTF0LIO_TIM.MKR"
            speed={80}
            maxIterations={10}
            sequential
            revealDirection="start"
            animateOn="view"
            className="text-white"
            parentClassName="decrypted-title"
          />
        </div>
      </div>

      {/* Scroll arrow — appears after decrypt animation, lower right corner */}
      {arrowVisible && arrowOpacity > 0.01 && (
        <button
          onClick={autoPlay}
          className="fixed bottom-8 right-8 z-20 flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
          style={{
            opacity: arrowOpacity,
            transition: 'opacity 0.5s ease',
            lineHeight: 0,
            paddingBottom: '48px',
          }}
          aria-label="Scroll to explore"
        >
          <PixelArrowDown size={48} />
        </button>
      )}

      {/* Up arrow — go back to previous step, top right corner */}
      {arrowVisible && canGoUp && (
        <button
          onClick={goBack}
          className="fixed top-8 right-8 z-20 flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
          style={{
            opacity: 1,
            transition: 'opacity 0.5s ease',
            lineHeight: 0,
            paddingTop: '48px',
          }}
          aria-label="Go back"
        >
          <PixelArrowUp size={48} />
        </button>
      )}

      {/* Book page turn arrows — right arrow for forward, left arrow for back */}
      {canTurnForward && (
        <button
          onClick={turnPageForward}
          className="fixed bottom-8 right-8 z-20 flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
          style={{
            opacity: 1,
            transition: 'opacity 0.3s ease',
            lineHeight: 0,
            paddingBottom: '48px',
          }}
          aria-label="Next page"
        >
          <PixelArrowRight size={48} />
        </button>
      )}

      {canTurnBack && (
        <button
          onClick={turnPageBack}
          className="fixed bottom-8 left-8 z-20 flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
          style={{
            opacity: 1,
            transition: 'opacity 0.3s ease',
            lineHeight: 0,
            paddingBottom: '48px',
          }}
          aria-label="Previous page"
        >
          <PixelArrowLeft size={48} />
        </button>
      )}

      {showProjects && (
        <div
          className="fixed inset-0 overflow-y-auto"
          onClick={() => setShowProjects(false)}
          style={{
            zIndex: 45,
            backgroundColor: 'rgba(5, 5, 5, 0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            opacity: overlayVisible ? 1 : 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: overlayVisible ? 'auto' : 'none',
          }}
        >
          <div
            className="mx-auto w-full max-w-6xl px-6 pb-32 pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Masonry
              items={projectItems}
              ease="power3.out"
              duration={0.3}
              stagger={0.04}
              animateFrom="bottom"
              scaleOnHover
              hoverScale={0.95}
              blurToFocus
              colorShiftOnHover={false}
            />
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <Dock
          items={dockItems}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>
    </div>
  )
}

export default App
