import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AccordionGalleryProps {
  title?: string
}

// Placeholder data
const galleryItems = [
  {
    id: 1,
    title: 'Modern Villas',
    subtitle: 'Contemporary Architecture',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    ]
  },
  {
    id: 2,
    title: 'Urban Spaces',
    subtitle: 'City Architecture',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    ]
  },
  {
    id: 3,
    title: 'Coastal Retreats',
    subtitle: 'Beachfront Properties',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    ]
  },
  {
    id: 4,
    title: 'Commercial Buildings',
    subtitle: 'Office Complexes',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
    ]
  }
]

export function AccordionGallery({ title = 'Accordion Gallery' }: AccordionGalleryProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Toggle accordion
  const toggleAccordion = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }
  
  // Accordion item animation
  const accordionVariants = {
    collapsed: {
      height: 80,
      marginBottom: 16
    },
    expanded: {
      height: 'auto',
      marginBottom: 16
    }
  }
  
  // Content animation
  const contentVariants = {
    hidden: {
      opacity: 0,
      height: 0
    },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }
  
  // Image animation
  const imageVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1
    }
  }
  
  return (
    <div 
      ref={containerRef}
      className="w-full max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/60 text-sm">
          Click to expand and reveal nested galleries
        </p>
      </motion.div>
      
      {/* Accordion Items */}
      <div className="space-y-0">
        {galleryItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="relative overflow-hidden rounded-2xl"
            variants={accordionVariants}
            initial="collapsed"
            animate={expandedId === item.id ? 'expanded' : 'collapsed'}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <motion.button
              onClick={() => toggleAccordion(item.id)}
              className="w-full h-20 flex items-center justify-between p-6 bg-white/5 backdrop-blur-lg border border-white/10"
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-white text-xl font-bold">{item.id}</span>
                </motion.div>
                <div className="text-left">
                  <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.subtitle}</p>
                </div>
              </div>
              
              {/* Chevron Icon */}
              <motion.div
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </motion.button>
            
            {/* Content */}
            <AnimatePresence mode="wait">
              {expandedId === item.id && (
                <motion.div
                  key={`content-${item.id}`}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="p-6 bg-white/2 backdrop-blur-lg border-t border-white/10"
                >
                  {/* Image Grid */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                  >
                    {item.images.map((src, imgIndex) => (
                      <motion.div
                        key={imgIndex}
                        variants={imageVariants}
                        className="relative overflow-hidden rounded-xl cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={src}
                          alt={`${item.title} ${imgIndex + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <motion.div 
                            className="bg-white/90 backdrop-blur-md rounded-lg p-3 text-black"
                            initial={{ y: 50 }}
                            whileHover={{ y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className="text-sm font-medium">Image {imgIndex + 1}</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* Nested Gallery Indicator */}
                  <motion.div 
                    className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <p className="text-white/80 text-sm">
                      This gallery can contain nested galleries
                    </p>
                    <button
                      onClick={() => {}}
                      className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      Explore Sub-Gallery
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
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
          Accordion Gallery - ReactBits inspired
        </p>
      </motion.div>
    </div>
  )
}
