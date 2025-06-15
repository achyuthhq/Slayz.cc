import React, { ReactNode } from 'react';
import './star-border.css';

interface StarBorderProps {
  children: ReactNode;
  className?: string;
  color?: string;
  speed?: string;
  showAnimation?: boolean;
}

export const StarBorder: React.FC<StarBorderProps> = ({ 
  children, 
  className = '', 
  color = '#FFD700',
  speed = '10s',
  showAnimation = true
}) => {
  return (
    <div className={`star-border-container ${className}`}>
      {showAnimation && (
        <>
          <div
            className="border-gradient-bottom"
            style={{
              background: `radial-gradient(circle, ${color}, transparent 15%)`,
              animationDuration: speed,
            }}
          ></div>
          <div
            className="border-gradient-top"
            style={{
              background: `radial-gradient(circle, ${color}, transparent 15%)`,
              animationDuration: speed,
            }}
          ></div>
        </>
      )}
      <div className="inner-content">
        {children}
      </div>
    </div>
  );
}; 