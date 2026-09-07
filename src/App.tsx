import { useState, useEffect, useCallback } from 'react'
import Dither from '@/components/Dither'
import Dock from '@/components/Dock'
import Masonry from '@/components/Masonry'
import DecryptedText from '@/components/DecryptedText'
import CuttingMat from '@/components/CuttingMat'
import ScrollSequence from '@/components/ScrollSequence'
import useScrollProgress from '@/hooks/useScrollProgress'
import { PixelHome, PixelProjects, PixelContact } from '@/components/PixelIcons'

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

function App() {
  const [showProjects, setShowProjects] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [matVisible, setMatVisible] = useState(false)
  const { ref: scrollRef, progress } = useScrollProgress()

  const handleMatVisible = useCallback((show: boolean) => {
    setMatVisible(show)
  }, [])

  useEffect(() => {
    if (showProjects) {
      const t = setTimeout(() => setOverlayVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setOverlayVisible(false)
    }
  }, [showProjects])

  // Title fades out as image fades in (0.15-0.30)
  const titleOpacity = progress <= 0.15 ? 1 : progress >= 0.30 ? 0 : 1 - (progress - 0.15) / 0.15

  const dockItems = [
    { icon: <PixelHome size={18} />, label: 'Home', onClick: () => {
      setShowProjects(false)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    } },
    { icon: <PixelProjects size={18} />, label: 'Projects', onClick: () => setShowProjects(prev => !prev) },
    { icon: <PixelContact size={18} />, label: 'Contact', onClick: () => console.log('Contact') },
  ]

  return (
    <div ref={scrollRef} className="relative h-screen w-full overflow-y-auto overflow-x-hidden scroll-smooth">
      {/* Scroll spacer — gives us scrollable height for the sequence */}
      <div className="h-[400vh] w-full" />

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

      {/* Scroll-driven image sequence */}
      <ScrollSequence progress={progress} onMatVisible={handleMatVisible} />

      {/* Cutting mat — appears after zoom-out */}
      <div
        className="fixed inset-0 z-10"
        style={{
          opacity: matVisible ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: matVisible ? 'auto' : 'none',
        }}
      >
        <CuttingMat startCm={7} />
      </div>

      {/* Title — fades out as image fades in */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-center px-4 pt-10"
        style={{ opacity: titleOpacity }}
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
