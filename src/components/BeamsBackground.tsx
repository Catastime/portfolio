import { useEffect, useRef } from 'react'
import { motion, useAnimation, useMotionValue } from 'framer-motion'

export function BeamsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    
    if (!canvas || !container) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Beam configuration
    const beams: { x: number; y: number; length: number; angle: number; speed: number; opacity: number }[] = []
    const beamCount = 15
    
    for (let i = 0; i < beamCount; i++) {
      beams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 100 + Math.random() * 400,
        angle: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.05,
        opacity: 0.03 + Math.random() * 0.07
      })
    }
    
    // Animation loop
    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      beams.forEach(beam => {
        // Update position
        beam.x += Math.cos(beam.angle) * beam.speed * 10
        beam.y += Math.sin(beam.angle) * beam.speed * 10
        
        // Wrap around edges
        if (beam.x < 0) beam.x = canvas.width
        if (beam.x > canvas.width) beam.x = 0
        if (beam.y < 0) beam.y = canvas.height
        if (beam.y > canvas.height) beam.y = 0
        
        // Draw beam
        ctx.beginPath()
        ctx.moveTo(beam.x, beam.y)
        const endX = beam.x + Math.cos(beam.angle) * beam.length
        const endY = beam.y + Math.sin(beam.angle) * beam.length
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = `rgba(255, 255, 255, ${beam.opacity})`
        ctx.lineWidth = 1
        ctx.stroke()
        
        // Draw glow effect
        const gradient = ctx.createRadialGradient(
          beam.x, beam.y, 0,
          beam.x, beam.y, beam.length / 2
        )
        gradient.addColorStop(0, `rgba(255, 255, 255, ${beam.opacity * 0.5})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.beginPath()
        ctx.arc(beam.x, beam.y, beam.length / 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 -z-10"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Additional CSS-based beams for fallback */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 1px, transparent 50px)',
          backgroundSize: '100px 100px',
          animation: 'beams 20s linear infinite'
        }} />
        <div className="absolute inset-0" style={{
          background: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 1px, transparent 50px)',
          backgroundSize: '150px 150px',
          animation: 'beams2 25s linear infinite reverse'
        }} />
      </div>
    </div>
  )
}
