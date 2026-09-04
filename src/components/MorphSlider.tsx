import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MorphSliderProps {
  title?: string
}

// Placeholder images
const placeholderImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=800&h=500&fit=crop',
]

export function MorphSlider({ title = 'Morph Slider' }: MorphSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % placeholderImages.length)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying])
  
  // Handle navigation
  const goTo = (newIndex: number) => {
    setDirection(newIndex > currentIndex ? 1 : -1)
    setCurrentIndex(newIndex)
  }
  
  // Slide variants for morph animation
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8
    })
  }
  
  // Morph shape variants
  const morphVariants = {
    initial: {
      borderRadius: '0%'
    },
    animate: {
      borderRadius: '20%'
    }
  }
  
  // Background morph
  const bgVariants = {
    circle: {
      borderRadius: '50%'
    },
    square: {
      borderRadius: '0%'
    },
    pill: {
      borderRadius: '50px'
    }
  }
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-screen relative overflow-hidden"
    >
      {/* Header */}
      <motion.div 
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/60 text-sm">
          Morphing transitions between slides
        </p>
      </motion.div>
      
      {/* Main Slider */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Background morph shape */}
        <motion.div
          className="absolute w-[600px] h-[400px]"
          animate={bgVariants.circle}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        />
        
        {/* Slide Container */}
        <div className="relative w-[600px] h-[400px] overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 }
              }}
              className="absolute inset-0"
            >
              {/* Morphing image container */}
              <motion.div
                className="w-full h-full overflow-hidden"
                initial={{ borderRadius: '0%' }}
                animate={{ borderRadius: '20%' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              >
                <img
                  src={placeholderImages[currentIndex]}
                  alt={`Slide ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </motion.div>
              
              {/* Content Overlay */}
              <motion.div 
                className="absolute inset-0 flex flex-col justify-end p-8"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div 
                  className="bg-white/90 backdrop-blur-md rounded-xl p-6 text-black max-w-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-2xl font-bold mb-2">Project {currentIndex + 1}</h3>
                  <p className="text-black/60 mb-4">
                    Architecture Portfolio
                  </p>
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isAutoPlaying ? 'Pause' : 'Play'}
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Navigation Arrows */}
      <motion.div 
        className="absolute top-1/2 left-4 right-4 flex justify-between z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.button
          onClick={() => {
            setDirection(-1)
            setCurrentIndex((prev) => (prev - 1 + placeholderImages.length) % placeholderImages.length)
          }}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ←
        </motion.button>
        <motion.button
          onClick={() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % placeholderImages.length)
          }}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          →
        </motion.button>
      </motion.div>
      
      {/* Navigation Dots */}
      <motion.div 
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {placeholderImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goTo(index)}
            className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? 'bg-white shadow-lg shadow-white/50' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {currentIndex === index && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white"
                layoutId="activeSliderDot"
                transition={{ type: 'spring', damping: 50, stiffness: 400 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>
      
      {/* Footer */}
      <motion.div 
        className="absolute bottom-6 right-6 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <p className="text-white/40 text-sm">
          Morph Slider - ReactBits inspired
        </p>
      </motion.div>
    </div>
  )
}
