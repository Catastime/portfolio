import { useState, useEffect, useCallback, useRef } from 'react'
import Dither from '@/components/Dither'
import Dock from '@/components/Dock'
import Masonry from '@/components/Masonry'
import DecryptedText from '@/components/DecryptedText'
import CuttingMat from '@/components/CuttingMat'
import ScrollSequence from '@/components/ScrollSequence'
import Sketchbook from '@/components/Sketchbook'
import { PixelHome, PixelProjects, PixelContact, PixelArrowDown } from '@/components/PixelIcons'

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

// Sketchbook pages — content glued/drawn into a sketch block
// First right page has the image that zoomed out (at -3deg to match ScrollSequence)
const bookPages = [
  // Left page of first spread
  {
    items: [
      { type: 'image', img: 'https://picsum.photos/id/1015/800/600?grayscale', x: 8, y: 10, w: 55, rotation: -4, taped: true },
      { type: 'image', img: 'https://picsum.photos/id/1011/800/500?grayscale', x: 35, y: 55, w: 50, rotation: 3, taped: true },
      { type: 'text', title: 'Concept', text: 'Early studies exploring\nform and light.', x: 10, y: 75, w: 35, rotation: 1 },
    ],
  },
  // Right page of first spread — the zoomed-out image lands here, centered
  {
    items: [
      { type: 'image', img: 'https://picsum.photos/id/1036/1920/1080?grayscale', x: 20, y: 15, w: 60, rotation: -3, taped: true },
      { type: 'sketch', x: 55, y: 60, w: 30, rotation: 2 },
      { type: 'text', title: 'Notes', text: 'The interplay of\nstructure and space\ndefines the work.', x: 10, y: 65, w: 35, rotation: -1 },
    ],
  },
  // Left page of second spread
  {
    items: [
      { type: 'image', img: 'https://picsum.photos/id/1020/800/600?grayscale', x: 10, y: 8, w: 50, rotation: 2, taped: true },
      { type: 'text', title: 'Process', text: 'Iterative sketches\ninformed the final\ndesign.', x: 15, y: 65, w: 40, rotation: -2 },
    ],
  },
  // Right page of second spread
  {
    items: [
      { type: 'sketch', x: 8, y: 10, w: 40, rotation: -3 },
      { type: 'image', img: 'https://picsum.photos/id/1018/800/600?grayscale', x: 40, y: 15, w: 50, rotation: 4, taped: true },
      { type: 'text', title: 'Detail', text: 'Material study —\nconcrete and glass.', x: 10, y: 70, w: 35, rotation: 1 },
    ],
  },
]

function App() {
  const [showProjects, setShowProjects] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [matVisible, setMatVisible] = useState(false)
  const [bookVisible, setBookVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [arrowVisible, setArrowVisible] = useState(false)
  const [fadingHome, setFadingHome] = useState(false)

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

  const scrollAnimRef = useRef<number | null>(null)

  const smoothScrollTo = (target: number, duration = 4000) => {
    if (scrollAnimRef.current !== null) {
      cancelAnimationFrame(scrollAnimRef.current)
    }
    const start = window.scrollY
    const distance = target - start
    const startTime = performance.now()

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const step = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / duration)
      window.scrollTo(0, start + distance * easeInOutCubic(t))
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

  // Two-phase auto-play: first click scrolls to the image, second click
  // scrolls from there to the book on the cutting mat (zoom-out complete)
  const autoPlayPhase = useRef(0)
  const autoPlay = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const slideEnd = 0.33
    const bookEnd = 0.60
    const slideTarget = max * slideEnd
    const bookTarget = max * bookEnd

    if (autoPlayPhase.current === 0) {
      smoothScrollTo(slideTarget, 1500)
      autoPlayPhase.current = 1
    } else {
      smoothScrollTo(bookTarget, 2500)
      autoPlayPhase.current = 0
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
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [arrowVisible, atLanding, atImageStop])
  const handleMatVisible = useCallback((show: boolean) => {
    setMatVisible(show)
  }, [])

  const handleBookVisible = useCallback((show: boolean) => {
    setBookVisible(show)
  }, [])

  useEffect(() => {
    if (showProjects) {
      const t = setTimeout(() => setOverlayVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setOverlayVisible(false)
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

      {/* Title — starts centered, moves to top on scroll */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-center px-4 pt-10"
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

      {showProjects && (
        <div
          className="fixed inset-0 z-30 overflow-y-auto"
          onClick={() => setShowProjects(false)}
          style={{
            backgroundColor: 'rgba(5, 5, 5, 0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            opacity: overlayVisible ? 1 : 0,
            transition: 'opacity 0.4s ease',
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
