import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, PanInfo } from 'framer-motion'

interface SpiralItem {
  id: number
  label: string
  component: string
}

interface InfiniteSpiralProps {
  items: SpiralItem[]
  onItemClick: (item: SpiralItem) => void
}

export function InfiniteSpiral({ items, onItemClick }: InfiniteSpiralProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  
  // Drag state
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Spring physics for smooth movement
  const springX = useSpring(x, { damping: 50, stiffness: 400 })
  const springY = useSpring(y, { damping: 50, stiffness: 400 })
  
  // Calculate spiral positions
  const getSpiralPosition = (index: number, total: number, radius: number = 200) => {
    const angle = (index / total) * Math.PI * 2
    const distance = radius + (index * 80)
    const cx = dimensions.width / 2
    const cy = dimensions.height / 2
    
    return {
      x: cx + Math.cos(angle) * distance - 40,
      y: cy + Math.sin(angle) * distance - 40,
      angle: (angle * 180) / Math.PI + 90
    }
  }
  
  // Measure container dimensions
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => resizeObserver.disconnect()
  }, [])
  
  // Handle drag
  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    x.set(info.offset.x)
    y.set(info.offset.y)
  }
  
  // Handle drag end
  const handleDragEnd = () => {
    // Spring back to center
    x.set(0)
    y.set(0)
  }
  
  // Item click handler
  const handleItemClick = (item: SpiralItem) => {
    onItemClick(item)
  }
  
  // Center circle
  const centerSize = 120
  
  return (
    <motion.div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing"
      style={{ x: springX, y: springY }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      {/* Center - TM Logo */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-lg border border-white/20 flex items-center justify-center shadow-lg shadow-white/10">
          <span className="text-white text-2xl font-bold">TM</span>
        </div>
      </motion.div>
      
      {/* Spiral Items */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <>
          {items.map((item, index) => {
            const pos = getSpiralPosition(index, items.length, 180)
            
            return (
              <motion.div
                key={item.id}
                className="absolute z-10"
                style={{
                  x: pos.x,
                  y: pos.y,
                  originX: 0.5,
                  originY: 0.5
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.15, 
                  zIndex: 30,
                  boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)'
                }}
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                onClick={() => handleItemClick(item)}
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-lg border border-white/20 flex items-center justify-center cursor-pointer transition-all duration-300"
                  style={{
                    transform: `rotate(${pos.angle}deg)`
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  }}
                >
                  {/* Inner content that stays upright */}
                  <motion.div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      transform: `rotate(${-pos.angle}deg)`
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs text-white/60 mb-1">Project</div>
                      <div className="text-sm font-semibold text-white">{item.id}</div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )
          })}
        </>
      )}
      
      {/* Connecting lines (optional) */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <svg className="absolute inset-0 w-full h-full z-0" pointerEvents="none">
          {items.map((item, index) => {
            const pos = getSpiralPosition(index, items.length, 180)
            const centerX = dimensions.width / 2
            const centerY = dimensions.height / 2
            
            return (
              <line
                key={`line-${item.id}`}
                x1={centerX}
                y1={centerY}
                x2={pos.x + 20}
                y2={pos.y + 20}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            )
          })}
        </svg>
      )}
    </motion.div>
  )
}
