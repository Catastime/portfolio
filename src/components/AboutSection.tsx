import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export function AboutSection({ fullPage = false }: { fullPage?: boolean }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const stats = [
    { label: 'Years Experience', value: '15+' },
    { label: 'Completed Projects', value: '120+' },
    { label: 'Awards Won', value: '25+' },
    { label: 'Happy Clients', value: '80+' },
  ]

  const skills = [
    'Architectural Design',
    'Sustainable Building',
    'Space Planning',
    '3D Visualization',
    'Project Management',
    'Interior Design',
    'Landscape Architecture',
    'Building Codes',
  ]

  return (
    <section
      ref={ref}
      className={`py-20 ${fullPage ? 'min-h-screen' : ''}`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              About <span className="gradient-text">Us</span>
            </motion.h2>
            <motion.p
              className="text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We are a passionate team of architects dedicated to creating spaces
              that inspire, innovate, and endure. Our approach combines artistic
              vision with technical expertise to deliver exceptional results.
            </motion.p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image/Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="w-full h-96 bg-gradient-to-br from-primary-600/20 to-accent-600/20 rounded-2xl border border-white/10 flex items-center justify-center">
                <motion.div
                  className="w-64 h-64 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
              </div>
              {/* Decorative Elements */}
              <motion.div
                className="absolute -top-4 -left-4 w-20 h-20 border border-primary-500/30 rounded-lg"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -right-4 w-16 h-16 border border-accent-500/30 rounded-lg"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                Our Philosophy
              </h3>
              <p className="text-gray-300 mb-6">
                We believe that great architecture should not only look beautiful
                but also serve its purpose effectively. Every design we create is
                a reflection of our commitment to quality, innovation, and
                sustainability.
              </p>
              <p className="text-gray-300 mb-8">
                Our team works closely with clients to understand their vision
                and transform it into reality. From conceptual design to final
                execution, we ensure every detail is perfected.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <motion.div
                      className="text-4xl font-bold gradient-text mb-2"
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    >
                      {stat.value}
                    </motion.div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Skills Section */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Our Expertise
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="px-6 py-3 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10"
                >
                  <span className="text-gray-200 font-medium">{skill}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
