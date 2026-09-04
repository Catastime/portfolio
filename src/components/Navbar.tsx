import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gray-950/80 backdrop-blur-lg border-b border-white/10'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-lg">TM</span>
            </motion.div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              Architecture
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.div
              animate={isOpen ? 'open' : 'closed'}
              variants={{
                open: { rotate: 45 },
                closed: { rotate: 0 },
              }}
              className="w-6 h-0.5 bg-white"
            />
            <motion.div
              animate={isOpen ? 'open' : 'closed'}
              variants={{
                open: { opacity: 0 },
                closed: { opacity: 1 },
              }}
              className="w-6 h-0.5 bg-white my-1"
            />
            <motion.div
              animate={isOpen ? 'open' : 'closed'}
              variants={{
                open: { rotate: -45 },
                closed: { rotate: 0 },
              }}
              className="w-6 h-0.5 bg-white"
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col space-y-4 pt-4 border-t border-white/10 mt-4">
                <NavLink to="/" mobile onClick={() => setIsOpen(false)}>
                  Home
                </NavLink>
                <NavLink to="/about" mobile onClick={() => setIsOpen(false)}>
                  About
                </NavLink>
                <NavLink to="/projects" mobile onClick={() => setIsOpen(false)}>
                  Projects
                </NavLink>
                <NavLink to="/contact" mobile onClick={() => setIsOpen(false)}>
                  Contact
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

function NavLink({
  to,
  children,
  mobile = false,
  onClick,
}: {
  to: string
  children: React.ReactNode
  mobile?: boolean
  onClick?: () => void
}) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`nav-link ${
        mobile
          ? 'text-lg py-2 px-4 rounded-lg hover:bg-white/10'
          : 'relative'
      } ${isActive ? 'text-white' : 'text-gray-300'}`}
    >
      {children}
    </Link>
  )
}
