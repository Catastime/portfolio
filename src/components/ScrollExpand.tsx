import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ScrollExpandProps {
  title?: string
}

// Placeholder images
const placeholderImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
]

export function ScrollExpand({ title = 'Scroll Expand Gallery' }: ScrollExpandProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<string[]>([])
  
  // Load placeholder images
  useEffect(() => {
    setImages(placeholderImages)
  }, [])
  
  // Scroll animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })
  
  // Transform scroll progress to scale
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 1])
  
  return (
    <div className="w-full">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/60 text-sm">
          Scroll to expand and explore the gallery
        </p>
      </motion.div>
      
      {/* Gallery Container */}
      <div 
        ref={containerRef}
        className="relative h-[400vh] w-full overflow-hidden"
      >
        {/* Scroll-triggered content */}
        <motion.div 
          className="sticky top-0 h-screen w-full flex items-center justify-center"
          style={{ scale, opacity }}
        >
          <div className="relative w-full max-w-6xl mx-auto px-6">
            {/* Expanding Image Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              style={{ scale: useTransform(scrollYProgress, [0, 1], [0.8, 1.2]) }}
            >
              {images.map((src, index) => {
                // Calculate position based on scroll
                const yOffset = useTransform(
                  scrollYProgress,
                  [0, 1],
                  [100, -100 * index]
                )
                
                return (
                  <motion.div
                    key={index}
                    className="relative overflow-hidden rounded-2xl"
                    style={{ y: yOffset }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.1 
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.img
                      src={src}
                      alt={`Gallery item ${index + 1}`}
                      className="w-full h-64 object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <motion.div 
                        className="bg-white/90 backdrop-blur-md rounded-lg p-4 text-black"
                        initial={{ y: 100 }}
                        whileHover={{ y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="font-semibold text-lg">Project {index + 1}</h3>
                        <p className="text-sm text-black/60">Architecture Portfolio</p>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Spacer for scroll */}
        <div className="h-screen" />
      </div>
      
      {/* Footer */}
      <motion.div 
        className="mt-12 pt-8 border-t border-white/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-white/40 text-sm text-center">
          Scroll Expand Animation - ReactBits inspired
        </p>
      </motion.div>
    </div>
  )
}
