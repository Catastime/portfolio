import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Dither from './components/Dither.jsx'
import GooeyNav from './components/GooeyNav.jsx'
import InfiniteSpiral from './components/InfiniteSpiral.jsx'
import ScrollExpand from './components/ScrollExpand.jsx'
import DomeGallery from './components/DomeGallery.jsx'
import MorphSlider from './components/MorphSlider.jsx'
import AccordionGallery from './components/AccordionGallery.jsx'
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

      {/* GooeyNav - scrolls with content, always at top */}
      <div className="relative z-50">
        <GooeyNav
          items={navItems}
          particleCount={15}
          particleDistances={[90, 10]}
          particleR={100}
          initialActiveIndex={0}
          animationTime={600}
          timeVariance={300}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
        />
      </div>

      {/* Hero Section - Split 2/3 left, 1/3 right */}
      <section className="relative z-10 min-h-screen flex">
        {/* Left Side - 2/3 width: Intro with photo, text, and capsule tower graphic */}
        <div className="w-2/3 p-8 flex flex-col justify-center relative">
          {/* Semi-transparent capsule tower graphic overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full border-4 border-white/20 bg-white/5 backdrop-blur-sm" 
                 style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }}>
            </div>
          </div>
          
          <div className="relative z-10 max-w-lg">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
              alt="Profile"
              className="w-48 h-48 rounded-full object-cover mb-6 border-4 border-white/30"
            />
            <h1 className="text-5xl font-bold mb-4">TM Architecture</h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Innovative architectural designs that blend form, function, and sustainability.
              Specializing in modern structures that inspire.
            </p>
          </div>
        </div>

        {/* Right Side - 1/3 width: Infinite Spiral */}
        <div className="w-1/3 flex items-center justify-center p-4">
          <div className="w-full h-[600px]">
            <InfiniteSpiral
              items={spiralItems}
              animationMode="drag"
              speed={0.55}
              radius={170}
              cardWidth={100}
              cardHeight={100}
              verticalSpacing={60}
              perspective={1000}
              cardRadius={10}
              centerScale={1.2}
              edgeBlur={6}
              cardsPerTurn={7}
              pauseOnHover
              onClick={handleSpiralItemClick}
            />
          </div>
        </div>
      </section>

      {/* 3x3 Gallery Section */}
      <section id="projects" className="relative z-10 p-8">
        <h2 className="text-4xl font-bold mb-8 text-center">Featured Projects</h2>
        <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto">
          {galleryItems.map((item) => (
            <div 
              key={item.id}
              className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => handleSpiralItemClick(spiralItems[item.id - 1])}
            >
              <img 
                src={item.src} 
                alt={item.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold">{item.alt}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

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
              className="w-full max-w-6xl mx-auto p-8 relative h-[90vh] flex flex-col"
            >
              <button
                onClick={closeComponent}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-2xl z-50"
              >
                &times;
              </button>
              
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 flex-1 overflow-auto">
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
