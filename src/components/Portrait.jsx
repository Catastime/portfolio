import { useRef, useEffect, useState } from 'react';
import './Portrait.css';

const Portrait = ({ 
  src = '/media/portrait/portrait.jpg',
  alt = 'Portrait',
  width = 400,
  height = 500,
  frameColor = 'rgba(255, 255, 255, 0.3)',
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;
    
    const handleLoad = () => setImageLoaded(true);
    const handleError = () => {
      img.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face';
    };
    
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    
    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  return (
    <div 
      className={`portrait-container ${className}`}
      style={{
        '--portrait-width': `${width}px`,
        '--portrait-height': `${height}px`,
        '--frame-color': frameColor
      }}
    >
      <div className="portrait-wrapper">
        <div className="portrait-image-wrapper">
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className={`portrait-image ${imageLoaded ? 'loaded' : ''}`}
            width={width}
            height={height}
            loading="eager"
            draggable={false}
          />
          
          {/* Blobby mask overlay - creates transparency pattern */}
          <div className="portrait-blob-mask" />
        </div>
        
        {/* Minimal 1px rounded frame */}
        <div className="portrait-frame" />
      </div>
    </div>
  );
};

export default Portrait;
