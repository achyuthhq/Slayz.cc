import { useEffect, useState } from 'react';

type GradientCircle = {
  id: number;
  gradient: string;
  size: number;
  top: string;
  left: string;
  rotation: number;
  speed: number;
  opacity: number;
  blur: number;
  scale: number;
  zIndex: number;
};

// Enhanced vibrant gradients for different sections
const gradients = [
  // Hero section gradients
  'bg-gradient-to-br from-[#FF385C]/60 via-[#FF8F71]/50 to-[#FFB4A2]/40',
  'bg-gradient-to-br from-[#0099FF]/60 via-[#33CCFF]/50 to-[#66FFCC]/40',
  'bg-gradient-to-br from-[#8B5CF6]/60 via-[#D946EF]/50 to-[#EC4899]/40',

  // Features section gradients
  'bg-gradient-to-br from-[#7928CA]/60 via-[#FF0080]/50 to-[#FF0080]/40',
  'bg-gradient-to-br from-[#00D1FF]/60 via-[#00FF85]/50 to-[#00D1FF]/40',
  'bg-gradient-to-br from-[#FF6B6B]/60 via-[#FFE66D]/50 to-[#4ECDC4]/40',

  // Reviews section gradients
  'bg-gradient-to-br from-[#FF0080]/60 via-[#7645D9]/50 to-[#FF0080]/40',
  'bg-gradient-to-br from-[#4158D0]/60 via-[#48B3FF]/50 to-[#C850C0]/40',
  'bg-gradient-to-br from-[#FF4D4D]/60 via-[#F9CB28]/50 to-[#FF8F71]/40',
];

export function GradientCircles() {
  const [circles, setCircles] = useState<GradientCircle[]>([]);

  useEffect(() => {
    const generateCircles = () => {
      const numCircles = Math.floor(Math.random() * 4) + 8; 
      const newCircles: GradientCircle[] = [];

      for (let i = 0; i < numCircles; i++) {
        const sectionIndex = Math.floor(i / 3); 
        const baseOffset = sectionIndex * 80; 

        newCircles.push({
          id: i,
          gradient: gradients[Math.floor(Math.random() * gradients.length)],
          size: Math.random() * 1000 + 800, 
          top: `${Math.random() * 120 + baseOffset - 60}%`, 
          left: `${Math.random() * 140 - 20}%`,
          rotation: Math.random() * 360,
          speed: Math.random() * 60 + 40, 
          opacity: Math.random() * 0.3 + 0.4, // Increased opacity
          blur: Math.random() * 40 + 160, // Increased blur
          scale: Math.random() * 0.7 + 1, 
          zIndex: -2, // Ensures circles are behind content
        });
      }

      setCircles(newCircles);
    };

    generateCircles();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        generateCircles();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"> {/* z-index adjusted */}
      {circles.map((circle) => (
        <div
          key={circle.id}
          className={`absolute rounded-full ${circle.gradient} ${
            circle.id % 3 === 0 ? 'animate-float-rotate' :
            circle.id % 3 === 1 ? 'animate-pulse-scale' : 'animate-drift'
          }`}
          style={{
            width: circle.size,
            height: circle.size,
            top: circle.top,
            left: circle.left,
            opacity: circle.opacity,
            filter: `blur(${circle.blur}px)`,
            transform: `rotate(${circle.rotation}deg) scale(${circle.scale})`,
            '--duration': `${circle.speed}s`,
            '--drift-x': `${Math.random() * 40 - 20}px`,
            '--drift-y': `${Math.random() * 40 - 20}px`,
            '--base-opacity': circle.opacity,
            willChange: 'transform',
            zIndex: circle.zIndex,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}