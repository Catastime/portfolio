import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Beams from './components/Beams.jsx'
import InfiniteSpiral from './components/InfiniteSpiral.jsx'
import StaggeredMenu from './components/StaggeredMenu.jsx'
import ScrollExpand from './components/ScrollExpand.jsx'
import DomeGallery from './components/DomeGallery.jsx'
import MorphSlider from './components/MorphSlider.jsx'
import AccordionGallery from './components/AccordionGallery.jsx'
import './index.css'

// Spiral items configuration with 9 placeholder projects
const spiralItems = [
  { id: 1, src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop', alt: 'Project 1 - Scroll Expand', component: 'scroll-expand', label: 'Project 1' },
  { id: 2, src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop', alt: 'Project 2 - Dome Gallery', component: 'dome-gallery', label: 'Project 2' },
  { id: 3, src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop', alt: 'Project 3 - Morph Slider', component: 'morph-slider', label: 'Project 3' },
  { id: 4, src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', alt: 'Project 4 - Accordion Gallery', component: 'accordion-gallery', label: 'Project 4' },
  { id: 5, src: 'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=200&h=200&fit=crop', alt: 'Project 5 - Scroll Expand', component: 'scroll-expand', label: 'Project 5' },
  { id: 6, src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&h=200&fit=crop', alt: 'Project 6 - Dome Gallery', component: 'dome-gallery', label: 'Project 6' },
  { id: 7, src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop', alt: 'Project 7 - Morph Slider', component: 'morph-slider', label: 'Project 7' },
  { id: 8, src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop', alt: 'Project 8 - Accordion Gallery', component: 'accordion-gallery', label: 'Project 8' },
  { id: 9, src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop', alt: 'Project 9 - Scroll Expand', component: 'scroll-expand', label: 'Project 9' },
]

// Navigation items for StaggeredMenu
const navItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/portfolio/' },
  { label: 'Projects', ariaLabel: 'View projects', link: '/portfolio/#projects' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/portfolio/#about' },
  { label: 'Contact', ariaLabel: 'Get in touch', link: '/portfolio/#contact' },
]

const socialItems = [
  { label: 'GitHub', link: 'https://github.com/Catastime' },
  { label: 'LinkedIn', link: 'https://linkedin.com' },
  { label: 'Twitter', link: 'https://twitter.com' }
]

// Component registry with proper props
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
        <div className="text-center text-white">
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
  const [menuOpen, setMenuOpen] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  
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
    <div ref={containerRef} className="w-full h-screen relative overflow-hidden">
      {/* Background - Fixed position, full viewport */}
      <div className="fixed inset-0 z-0">
        <Beams
          beamWidth={2}
          beamHeight={25}
          beamNumber={25}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.5}
          scale={0.15}
          rotation={30}
          beamColor="#000000"
          backgroundColor="#000000"
        />
      </div>
      
      {/* Navigation - StaggeredMenu with milky glass effect - HIGH z-index */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <StaggeredMenu
          position="right"
          items={navItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          colors={['#B497CF', '#5227FF']}
          menuButtonColor="#fff"
          openMenuButtonColor="#fff"
          accentColor="#5227FF"
          changeMenuColorOnOpen={true}
          isFixed={true}
          closeOnClickAway={true}
          onMenuOpen={() => setMenuOpen(true)}
          onMenuClose={() => setMenuOpen(false)}
        />
      </div>
      
      {/* Main Content - z-index 1, above background but below menu */}
      <main className="fixed inset-0 z-10">
        {/* Infinite Spiral - Centered in viewport */}
        <div className="w-full h-full flex items-center justify-center">
          <div style={{ height: '600px', width: '100%' }}>
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
        
        {/* Component Viewer */}
        <AnimatePresence>
          {selectedComponent && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-lg"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-6xl mx-auto p-8 relative h-full flex flex-col"
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
      </main>
    </div>
  )
}

export default App
