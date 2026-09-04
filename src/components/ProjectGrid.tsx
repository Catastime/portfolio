import { useState } from 'react'
import { motion } from 'framer-motion'

// Placeholder project data - you can replace with your actual projects
const projects = [
  {
    id: 1,
    title: 'Modern Villa Design',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    description: 'Contemporary villa with panoramic views and sustainable features',
    tags: ['Modern', 'Sustainable', 'Luxury'],
  },
  {
    id: 2,
    title: 'Urban Office Complex',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    description: 'Innovative office space designed for collaboration and creativity',
    tags: ['Commercial', 'Innovative', 'Green'],
  },
  {
    id: 3,
    title: 'Coastal Retreat',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    description: 'Beachfront property blending natural materials with modern aesthetics',
    tags: ['Beach', 'Natural', 'Modern'],
  },
  {
    id: 4,
    title: 'Cultural Center',
    category: 'Public',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    description: 'Community space celebrating local heritage and contemporary design',
    tags: ['Public', 'Heritage', 'Community'],
  },
  {
    id: 5,
    title: 'Mountain Lodge',
    category: 'Hospitality',
    image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=800&h=600&fit=crop',
    description: 'Rustic yet modern lodge nestled in the mountain landscape',
    tags: ['Rustic', 'Mountain', 'Cozy'],
  },
  {
    id: 6,
    title: 'Eco-Friendly Housing',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    description: 'Sustainable housing development with minimal environmental impact',
    tags: ['Eco', 'Sustainable', 'Green'],
  },
]

const categories = ['All', 'Residential', 'Commercial', 'Public', 'Hospitality']

export function ProjectGrid({ showAll = false }: { showAll?: boolean }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [hoveredProject, setHoveredProject] = useState<number | null>(null)

  const filteredProjects = showAll
    ? projects
    : selectedCategory === 'All'
      ? projects.slice(0, 4)
      : projects.filter(p => p.category === selectedCategory)

  return (
    <section className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured <span className="gradient-text">Projects</span>
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore our portfolio of architectural masterpieces that combine innovation,
            sustainability, and timeless design.
          </motion.p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="project-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredProject(project.id)}
              onHoverEnd={() => setHoveredProject(null)}
            >
              {/* Project Image */}
              <div className="relative overflow-hidden rounded-xl">
                <motion.img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-4 py-2 bg-primary-600/80 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-primary-500/30">
                    {project.category}
                  </span>
                </div>

                {/* Project Info Overlay */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-6"
                  initial={{ y: 100 }}
                  whileHover={{ y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.h3
                    className="text-xl font-bold text-white mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {project.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-300 text-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {project.description}
                  </motion.p>
                  <motion.div
                    className="flex flex-wrap gap-2 mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-xs rounded-full border border-white/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                </motion.div>
              </div>

              {/* Project Footer */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {project.description}
                </p>
                <motion.button
                  className="mt-4 px-6 py-2 bg-transparent hover:bg-primary-600/20 text-primary-400 hover:text-primary-300 font-medium rounded-lg border border-primary-600/30 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        {!showAll && filteredProjects.length >= 4 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-transparent hover:bg-white/10 text-white font-semibold rounded-full border border-white/20 transition-all duration-300"
            >
              View All Projects
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
