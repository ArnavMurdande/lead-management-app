import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

const MagicBento = ({ 
  children, 
  className = '', 
  enableSpotlight = true, 
  spotlightColor = 'rgba(255, 255, 255, 0.15)',
  enableBorderGlow = true,
  glowColor = '0, 243, 255',
  style = {}, // NEW: Accept style prop
  ...props    // NEW: Accept other props (onClick, id, etc.)
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (enableSpotlight) {
        gsap.set(card, {
          '--mouse-x': `${x}px`,
          '--mouse-y': `${y}px`
        });
      }
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enableSpotlight]);

  return (
    <div 
      ref={cardRef}
      className={`magic-bento-card ${className}`}
      // SPREAD THE STYLE AND PROPS HERE
      style={{
        '--glow-color': glowColor,
        '--spotlight-color': spotlightColor,
        ...style 
      }}
      {...props} 
    >
      <div className="magic-bento-content">
        {children}
      </div>
      
      {/* Border Glow Effect */}
      {enableBorderGlow && (
        <div 
          className="magic-bento-border"
          style={{ opacity: isHovered ? 1 : 0 }} 
        />
      )}
      
      {/* Spotlight Effect */}
      {enableSpotlight && (
        <div 
          className="magic-bento-spotlight"
          style={{ opacity: isHovered ? 1 : 0 }}
        />
      )}
    </div>
  );
};

export default MagicBento;