import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// ReactBits-inspired components
import { HeroSection } from './components/HeroSection'
import { ProjectGrid } from './components/ProjectGrid'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { AboutSection } from './components/AboutSection'
import { ContactSection } from './components/ContactSection'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 bg-dotted">
        <div className="fixed inset-0 dither-background -z-10" />
        <div className="fixed inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/80 -z-10" />
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="container mx-auto px-4 py-20">
        <ProjectGrid />
      </div>
      <AboutSection />
      <ContactSection />
    </>
  )
}

function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AboutSection fullPage />
    </motion.div>
  )
}

function ProjectsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-20"
    >
      <h1 className="text-5xl font-bold text-center mb-16 gradient-text">
        Architecture Projects
      </h1>
      <ProjectGrid showAll />
    </motion.div>
  )
}

function ContactPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ContactSection fullPage />
    </motion.div>
  )
}

export default App
