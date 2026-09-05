import { useEffect, useRef, useState } from 'react';
import './Beams.css';

// Simple CSS-based animated beams background
// This doesn't require Three.js/R3F and will work reliably
const Beams = ({
  beamWidth = 2,
  beamHeight = 25,
  beamNumber = 25,
  lightColor = '#ffffff',
  beamColor = '#000000',
  backgroundColor = '#000000',
  speed = 2,
  noiseIntensity = 1.5,
  scale = 0.15,
  rotation = 30
}) => {
  const containerRef = useRef(null);
  const [beams, setBeams] = useState([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const newBeams = [];
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    for (let i = 0; i < beamNumber; i++) {
      const angle = (i / beamNumber) * Math.PI * 2 + (rotation * Math.PI / 180);
      const length = beamHeight * (0.8 + Math.random() * 0.4);
      const thickness = beamWidth * (0.8 + Math.random() * 0.4);
      const distanceFromCenter = Math.random() * Math.min(containerWidth, containerHeight) * 0.4;
      
      const x1 = Math.cos(angle) * distanceFromCenter;
      const y1 = Math.sin(angle) * distanceFromCenter;
      const x2 = Math.cos(angle) * (distanceFromCenter + length);
      const y2 = Math.sin(angle) * (distanceFromCenter + length);

      newBeams.push({
        id: i,
        x1: containerWidth / 2 + x1,
        y1: containerHeight / 2 + y1,
        x2: containerWidth / 2 + x2,
        y2: containerHeight / 2 + y2,
        thickness,
        opacity: 0.1 + Math.random() * 0.15
      });
    }

    setBeams(newBeams);

    const handleResize = () => {
      // Recalculate on resize if needed
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [beamNumber, beamWidth, beamHeight, rotation]);

  // Generate animated gradient background
  const gradientStyle = {
    background: `radial-gradient(circle at center, ${beamColor} 0%, ${backgroundColor} 70%)`,
    position: 'absolute',
    inset: 0,
    overflow: 'hidden'
  };

  // Animated lines using CSS
  const lineStyle = (beam, index) => ({
    position: 'absolute',
    left: `${beam.x1}px`,
    top: `${beam.y1}px`,
    width: `${Math.hypot(beam.x2 - beam.x1, beam.y2 - beam.y1)}px`,
    height: `${beam.thickness}px`,
    background: `linear-gradient(90deg, transparent, ${lightColor}, transparent)`,
    transform: `rotate(${Math.atan2(beam.y2 - beam.y1, beam.x2 - beam.x1)}rad)`,
    transformOrigin: '0 0',
    opacity: beam.opacity,
    animation: `beamFlow ${3 + Math.random() * 2}s linear infinite`,
    animationDelay: `${Math.random() * 2}s`
  });

  return (
    <div 
      ref={containerRef}
      className="beams-container"
      style={{...gradientStyle, background: backgroundColor}}
    >
      <style jsx>{`
        @keyframes beamFlow {
          0% { transform: translateX(-100%) rotate(var(--beam-angle)); }
          100% { transform: translateX(100%) rotate(var(--beam-angle)); }
        }
      `}</style>
      
      {beams.map((beam, index) => (
        <div 
          key={beam.id}
          style={{
            ...lineStyle(beam, index),
            '--beam-angle': `${Math.atan2(beam.y2 - beam.y1, beam.x2 - beam.x1)}rad`
          }}
        />
      ))}

      {/* Overlay for better blending */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default Beams;
