import React, { ReactNode } from "react";
import "./glow-counter.css";

interface GlowCounterProps {
  value: number;
  label: string;
  icon?: ReactNode;
  color?: string;
}

const GlowCounter: React.FC<GlowCounterProps> = ({
  value,
  label,
  icon,
  color = "#4f9cff"
}) => {
  return (
    <div className="glow-counter-container">
      <div 
        className="glow-counter-ring" 
        style={{ 
          boxShadow: `0 0 10px ${color}, 0 0 5px ${color}` 
        }}
      ></div>
      <div className="glow-counter-content">
        <div className="glow-counter-value-container">
          {icon && <span className="glow-counter-icon">{icon}</span>}
          <span 
            className="glow-counter-value" 
            style={{ 
              textShadow: `0 0 5px ${color}` 
            }}
          >
            {value.toLocaleString()}
          </span>
        </div>
        <div className="glow-counter-label">{label}</div>
      </div>
    </div>
  );
};

export default GlowCounter; 