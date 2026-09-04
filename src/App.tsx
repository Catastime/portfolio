import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { BeamsBackground } from './components/BeamsBackground'
import { InfiniteSpiral } from './components/InfiniteSpiral'
import { StaggeredMenu } from './components/StaggeredMenu'
import { ScrollExpand } from './components/ScrollExpand'
import { DomeGallery } from './components/DomeGallery'
import { MorphSlider } from './components/MorphSlider'
import { AccordionGallery } from './components/AccordionGallery'

// Spiral items configuration
const spiralItems = [
  { id: 1, label: 'Project 1', component: 'scroll-expand' },
  { id: 2, label: 'Project 2', component: 'dome-gallery' },
  { id: 3, label: 'Project 3', component: 'morph-slider' },
  { id: 4, label: 'Project 4', component: 'accordion-gallery' },
  { id: 5, label: 'Project 5', component: 'scroll-expand' },
  { id: 6, label: 'Project 6', component: 'dome-gallery' },
  { id: 7, label: 'Project 7', component: 'morph-slider' },
  { id: 8, label: 'Project 8', component: 'accordion-gallery' },
  { id: 9, label: 'Project 9', component: 'scroll-expand' },
]

// Navigation items
const navItems = [
  { id: 1, label: 'Home' },
  { id: 2, label: 'Projects' },
  { id: 3, label: 'About' },
  { id: 4, label: 'Contact' },
]

// Component registry
const componentRegistry: Record<string, React.ReactNode> = {
  'scroll-expand': <ScrollExpand title="Scroll Expand Gallery" />,
  'dome-gallery': <DomeGallery title="Dome Gallery" />,
  'morph-slider': <MorphSlider title="Morph Slider" />,
  'accordion-gallery': <AccordionGallery title="Accordion Gallery" />,
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
      {/* Background */}
      <BeamsBackground />
      
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6">
        <StaggeredMenu 
          items={navItems} 
          isOpen={menuOpen} 
          onToggle={() => setMenuOpen(!menuOpen)}
          onItemClick={() => setMenuOpen(false)}
        />
      </div>
      
      {/* Main Content */}
      <main className="w-full h-full relative">
        {/* Infinite Spiral */}
        <div className="w-full h-full flex items-center justify-center">
          <InfiniteSpiral 
            items={spiralItems} 
            onItemClick={handleSpiralItemClick}
          />
        </div>
        
        {/* Component Viewer */}
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
              className="w-full max-w-4xl mx-auto p-8 relative"
            >
              <button
                onClick={closeComponent}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-2xl"
              >
                &times;
              </button>
              
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                {componentRegistry[selectedComponent]}
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default App
