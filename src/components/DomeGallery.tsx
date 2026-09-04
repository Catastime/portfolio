import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface DomeGalleryProps {
  title?: string
}

// Placeholder images
const placeholderImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop',
]

export function DomeGallery({ title = 'Dome Gallery' }: DomeGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // Mouse movement for dome effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Spring for smooth following
  const springX = useSpring(mouseX, { damping: 50, stiffness: 400 })
  const springY = useSpring(mouseY, { damping: 50, stiffness: 400 })
  
  // Load placeholder images
  useEffect(() => {
    setImages(placeholderImages)
  }, [])
  
  // Handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    mouseX.set((e.clientX - rect.left - centerX) / centerX)
    mouseY.set((e.clientY - rect.top - centerY) / centerY)
  }
  
  // Calculate dome position for each image
  const getDomePosition = (index: number, total: number, radius: number = 300) => {
    const angle = ((index - selectedIndex) / total) * Math.PI * 2
    const distance = radius * Math.cos(angle)
    const height = radius * Math.sin(Math.abs(angle)) * 0.5
    
    return {
      x: distance * 0.8,
      y: height * 0.6,
      z: Math.abs(Math.sin(angle)) * 100,
      scale: 1 - Math.abs(angle) / (Math.PI * 2) * 0.5,
      opacity: 1 - Math.abs(angle) / (Math.PI * 2) * 0.8
    }
  }
  
  return (
    <div 
      ref={containerRef}
      onMouseMove={(e) => handleMouseMove(e as unknown as MouseEvent)}
      className="w-full h-screen relative overflow-hidden cursor-move"
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
          Move your mouse to explore the dome
        </p>
      </motion.div>
      
      {/* Central Selected Image */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-64 z-10"
        style={{
          x: springX,
          y: springY,
          perspective: 1000
        }}
      >
        <motion.div
          className="w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-white/20"
          style={{
            transformStyle: 'preserve-3d',
            rotateX: useTransform(springY, [-1, 1], ['-10deg', '10deg']),
            rotateY: useTransform(springX, [-1, 1], ['-10deg', '10deg'])
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {images[selectedIndex] && (
            <img
              src={images[selectedIndex]}
              alt={`Selected ${selectedIndex + 1}`}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
        
        {/* Selected image info */}
        <motion.div 
          className="absolute -bottom-20 left-0 right-0 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 text-black max-w-md">
            <h3 className="font-bold text-lg">Project {selectedIndex + 1}</h3>
            <p className="text-sm text-black/60 mt-1">
              Architecture Portfolio - Click to explore
            </p>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Dome Images */}
      <div className="absolute inset-0">
        {images.map((src, index) => {
          const pos = getDomePosition(index, images.length, 350)
          
          return (
            <motion.div
              key={index}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                x: pos.x,
                y: pos.y,
                z: pos.z,
                perspective: 1000,
                transformStyle: 'preserve-3d'
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: pos.opacity, 
                scale: pos.scale,
                x: pos.x + springX.get() * 50,
                y: pos.y + springY.get() * 50
              }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              onClick={() => setSelectedIndex(index)}
              whileHover={{ 
                scale: pos.scale * 1.1,
                zIndex: 30
              }}
            >
              <motion.div
                className="w-48 h-32 rounded-xl overflow-hidden shadow-lg shadow-white/10 cursor-pointer"
                style={{
                  rotateX: useTransform(springY, [-1, 1], ['-20deg', '20deg']),
                  rotateY: useTransform(springX, [-1, 1], ['-20deg', '20deg'])
                }}
              >
                <img
                  src={src}
                  alt={`Dome item ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors" />
              </motion.div>
            </motion.div>
          )
        })}
      </div>
      
      {/* Navigation Dots */}
      <motion.div 
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {images.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
              selectedIndex === index 
                ? 'bg-white shadow-lg shadow-white/50' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {selectedIndex === index && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white"
                layoutId="activeDot"
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
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p className="text-white/40 text-sm">
          Dome Gallery - ReactBits inspired
        </p>
      </motion.div>
    </div>
  )
}
