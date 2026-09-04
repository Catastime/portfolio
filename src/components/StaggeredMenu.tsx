import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MenuItem {
  id: number
  label: string
}

interface StaggeredMenuProps {
  items: MenuItem[]
  isOpen: boolean
  onToggle: () => void
  onItemClick: (item: MenuItem) => void
}

export function StaggeredMenu({ items, isOpen, onToggle, onItemClick }: StaggeredMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggle()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onToggle])
  
  // Menu button animation
  const menuButtonVariants = {
    open: {
      rotate: 45
    },
    closed: {
      rotate: 0
    }
  }
  
  // Menu item animation
  const menuItemVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      x: -10
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  }
  
  // Container animation
  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }
  
  return (
    <div ref={menuRef} className="relative">
      {/* Menu Button */}
      <motion.button
        onClick={onToggle}
        className="relative w-12 h-12 rounded-xl bg-white/5 backdrop-blur-lg border border-white/20 flex items-center justify-center z-50 hover:bg-white/10 transition-colors"
        animate={isOpen ? 'open' : 'closed'}
        variants={menuButtonVariants}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Hamburger Icon */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2 }}
              className="absolute"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="hamburger"
              initial={{ opacity: 0, rotate: 45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
              className="absolute flex flex-col justify-center space-y-1.5"
            >
              <motion.span
                className="block w-6 h-0.5 rounded-full bg-white"
                initial={{ y: 0 }}
                animate={{ y: 0 }}
              />
              <motion.span
                className="block w-6 h-0.5 rounded-full bg-white"
                initial={{ y: 0 }}
                animate={{ y: 0 }}
              />
              <motion.span
                className="block w-6 h-0.5 rounded-full bg-white"
                initial={{ y: 0 }}
                animate={{ y: 0 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Menu Container */}
            <motion.div
              key="menu"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-16 left-6 z-50 milky-glass rounded-2xl p-6 shadow-2xl shadow-black/50 border border-white/10"
            >
              <motion.ul className="space-y-3 min-w-[200px]">
                {items.map((item, index) => (
                  <motion.li
                    key={item.id}
                    custom={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <button
                      onClick={() => {
                        onItemClick(item)
                        onToggle()
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
              
              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: items.length * 0.1 + 0.2 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <p className="text-xs text-white/40">
                  TM Architecture
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
