import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Dither from './components/Dither.jsx'
import GooeyNav from './components/GooeyNav.jsx'
import InfiniteSpiral from './components/InfiniteSpiral.jsx'
import ScrollExpand from './components/ScrollExpand.jsx'
import DomeGallery from './components/DomeGallery.jsx'
import MorphSlider from './components/MorphSlider.jsx'
import AccordionGallery from './components/AccordionGallery.jsx'
import Portrait from './components/Portrait.jsx'
import './index.css'

// Navigation items
const navItems = [
  { label: 'Home', href: '#' },
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

// Spiral items configuration with 9 placeholder projects
const spiralItems = [
  { id: 1, src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop', alt: 'Project 1', component: 'scroll-expand', label: 'Project 1' },
  { id: 2, src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop', alt: 'Project 2', component: 'dome-gallery', label: 'Project 2' },
  { id: 3, src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop', alt: 'Project 3', component: 'morph-slider', label: 'Project 3' },
  { id: 4, src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', alt: 'Project 4', component: 'accordion-gallery', label: 'Project 4' },
  { id: 5, src: 'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=200&h=200&fit=crop', alt: 'Project 5', component: 'scroll-expand', label: 'Project 5' },
  { id: 6, src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&h=200&fit=crop', alt: 'Project 6', component: 'dome-gallery', label: 'Project 6' },
  { id: 7, src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop', alt: 'Project 7', component: 'morph-slider', label: 'Project 7' },
  { id: 8, src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop', alt: 'Project 8', component: 'accordion-gallery', label: 'Project 8' },
  { id: 9, src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop', alt: 'Project 9', component: 'scroll-expand', label: 'Project 9' },
]

// Gallery items for 3x3 grid
const galleryItems = [
  { id: 1, src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop', alt: 'Project 1', component: 'scroll-expand' },
  { id: 2, src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop', alt: 'Project 2', component: 'dome-gallery' },
  { id: 3, src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop', alt: 'Project 3', component: 'morph-slider' },
  { id: 4, src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', alt: 'Project 4', component: 'accordion-gallery' },
  { id: 5, src: 'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=400&h=300&fit=crop', alt: 'Project 5', component: 'scroll-expand' },
  { id: 6, src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop', alt: 'Project 6', component: 'dome-gallery' },
  { id: 7, src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop', alt: 'Project 7', component: 'morph-slider' },
  { id: 8, src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop', alt: 'Project 8', component: 'accordion-gallery' },
  { id: 9, src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop', alt: 'Project 9', component: 'scroll-expand' },
]

// Component registry
const componentRegistry: Record<string, React.ReactNode> = {
  'scroll-expand': (
    <div className="w-full h-[400vh] bg-black/50">
      <ScrollExpand
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop"
        alt="Architecture Project"
        title="Built to Scale"
        scrollHint="Scroll to explore"
        startWidth={42}
        startHeight={58}
        startRadius={24}
        mediaZoom={1.35}
        scrollDistance={1.2}
        useWindowScroll
      >
        <div className="text-center text-white p-8">
          <h2 className="text-4xl font-bold mb-4">Every pixel, everywhere</h2>
          <p className="text-xl">The frame opens up as you scroll and hands the whole stage to your media.</p>
        </div>
      </ScrollExpand>
    </div>
  ),
  'dome-gallery': (
    <div className="w-full h-screen">
      <DomeGallery
        images={[
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
        ]}
        fit={0.5}
        minRadius={400}
        overlayBlurColor="#000000"
        grayscale={false}
      />
    </div>
  ),
  'morph-slider': (
    <div className="w-full h-screen">
      <MorphSlider
        items={[
          { image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=900&fit=crop', caption: 'Project Alpha' },
          { image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&h=900&fit=crop', caption: 'Project Beta' },
          { image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&h=900&fit=crop', caption: 'Project Gamma' },
          { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop', caption: 'Project Delta' },
        ]}
        transition="melt"
        intensity={0.55}
        aberration={0.35}
        drift={0.4}
        autoplay
        autoplayDelay={4}
        showCaptions
        showControls
        showIndicators
      />
    </div>
  ),
  'accordion-gallery': (
    <div className="w-full h-screen flex items-center justify-center p-8">
      <AccordionGallery
        items={[
          { image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=1200&fit=crop', label: 'Modern Villa', link: '#' },
          { image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&h=1200&fit=crop', label: 'Urban Tower', link: '#' },
          { image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&h=1200&fit=crop', label: 'Coastal House', link: '#' },
          { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop', label: 'Industrial Loft', link: '#' },
          { image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=900&h=1200&fit=crop', label: 'Minimalist Home', link: '#' },
        ]}
        defaultIndex={2}
        expandRatio={0.52}
        trigger="hover"
        showLabels
        grayscale
      />
    </div>
  ),
}

function App() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [activeNavIndex, setActiveNavIndex] = useState(0)

  // Handle spiral item click
  const handleSpiralItemClick = (item: typeof spiralItems[0]) => {
    setSelectedComponent(item.component)
    setSelectedProject(item.id)
  }

  // Close component view
  const closeComponent = () => {
    setSelectedComponent(null)
    setSelectedProject(null)
  }

  // Handle navigation
  const handleNavClick = (index: number, href: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
    }
    setActiveNavIndex(index)
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Dither Background - does NOT scroll */}
      <div className="fixed inset-0 z-0">
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
          backgroundColor={[0, 0, 0]}
        />
      </div>

      {/* GooeyNav - SCROLLS with content, always visible, centered */}
      <div className="relative z-50 w-full">
        <GooeyNav
          items={navItems.map((item, index) => ({
            ...item,
            onClick: (e: React.MouseEvent) => handleNavClick(index, item.href, e)
          }))}
          particleCount={15}
          particleDistances={[90, 10]}
          particleR={100}
          initialActiveIndex={activeNavIndex}
          animationTime={600}
          timeVariance={300}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
        />
      </div>

      {/* Main Content Container with breathing room */}
      <main className="relative z-10">
        
        {/* Hero Section - Split 2/3 left, 1/3 right with breathing room */}
        <section className="flex flex-col lg:flex-row min-h-screen py-8 px-4 lg:px-8 gap-6 lg:gap-12">
          
          {/* Left Side - 2/3 width on desktop, full on mobile */}
          <div className="flex-1 lg:w-2/3 flex flex-col justify-center relative">
            
            {/* Content with breathing room */}
            <div className="relative z-10 max-w-2xl mx-auto lg:mx-0">
              {/* Portrait with blobby transparency and minimal frame */}
              <div className="mb-8">
                <Portrait 
                  src="/media/portrait/portrait.jpg"
                  alt="TM Architecture Portrait"
                  width={400}
                  height={500}
                  frameColor="rgba(255, 255, 255, 0.3)"
                />
              </div>
              
              {/* Text content with breathing room */}
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-white">
                  TM Architecture
                </h1>
                <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-xl">
                  Innovative architectural designs that blend form, function, and sustainability.
                  Specializing in modern structures that inspire.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - 1/3 width: Infinite Spiral */}
          <div className="flex-1 lg:w-1/3 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full h-[400px] lg:h-[600px] min-h-[400px] max-w-md">
              <InfiniteSpiral
                items={spiralItems}
                animationMode="drag"
                speed={0.55}
                radius={150}
                cardWidth={90}
                cardHeight={90}
                verticalSpacing={50}
                perspective={1000}
                cardRadius={8}
                centerScale={1.2}
                edgeBlur={4}
                cardsPerTurn={7}
                pauseOnHover
                onClick={handleSpiralItemClick}
              />
            </div>
          </div>
        </section>

        {/* 3x3 Gallery Section with breathing room */}
        <section id="projects" className="relative z-10 px-4 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold mb-12 text-center text-white">
              Featured Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {galleryItems.map((item) => (
                <div 
                  key={item.id}
                  className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                  onClick={() => handleSpiralItemClick(spiralItems[item.id - 1])}
                >
                  <img 
                    src={item.src} 
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg lg:text-xl font-bold text-white drop-shadow-lg">
                      {item.alt}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spacer for breathing room at bottom */}
        <div className="h-20" />

      </main>

      {/* Component Viewer Modal */}
      <AnimatePresence>
        {selectedComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl mx-auto p-4 lg:p-6 relative h-[90vh] flex flex-col"
            >
              <button
                onClick={closeComponent}
                className="absolute top-4 right-4 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center text-white text-2xl z-50"
              >
                &times;
              </button>
              
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/10 flex-1 overflow-auto">
                {componentRegistry[selectedComponent]}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
