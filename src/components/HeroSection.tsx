import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: 'Architectural',
      subtitle: 'Innovation',
      description: 'Pushing boundaries with cutting-edge designs',
    },
    {
      title: 'Sustainable',
      subtitle: 'Solutions',
      description: 'Building for the future with eco-conscious approaches',
    },
    {
      title: 'Timeless',
      subtitle: 'Design',
      description: 'Creating spaces that inspire across generations',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const currentSlideData = slides[currentSlide]

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
    >
      {/* ReactBits Dither Background */}
      <div className="absolute inset-0 dither-background" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/60" />

      {/* Mouse Trail Effect */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-primary-500/10 pointer-events-none"
        animate={{
          x: mousePosition.x - 32,
          y: mousePosition.y - 32,
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 400 }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="gradient-text">{currentSlideData.title}</span>
            <br />
            <span className="gradient-text">{currentSlideData.subtitle}</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {currentSlideData.description}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full border border-primary-500/30 transition-all duration-300 shadow-lg shadow-primary-500/25"
          >
            Explore Projects
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-transparent hover:bg-white/10 text-white font-semibold rounded-full border border-white/20 transition-all duration-300"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-primary-500 rounded-full"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-primary-500 shadow-lg shadow-primary-500/50'
                : 'bg-white/20 hover:bg-white/40'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {currentSlide === index && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary-500"
                layoutId="activeSlide"
                transition={{ type: 'spring', damping: 50, stiffness: 400 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </section>
  )
}
