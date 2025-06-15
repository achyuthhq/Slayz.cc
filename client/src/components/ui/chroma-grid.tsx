import { useRef, useEffect, useState } from "react";
import "./chroma-grid.css";

export interface ChromaGridItem {
  icon?: React.ReactNode;
  title: string;
  description: string;
  borderColor: string;
  gradient: string;
  url?: string;
}

// Fallback animation implementation without GSAP
const createFallbackAnimator = () => {
  return {
    quickSetter: (el: HTMLElement, prop: string, unit: string) => {
      return (value: number) => {
        el.style.setProperty(prop, `${value}${unit}`);
      };
    },
    to: (target: any, config: any) => {
      // Simple animation fallback
      if (config.onUpdate) {
        const startValues = { ...target };
        const startTime = Date.now();
        const duration = (config.duration || 0.3) * 1000;
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Simple linear interpolation
          Object.keys(config).forEach(key => {
            if (key !== 'duration' && key !== 'onUpdate' && key !== 'ease' && key !== 'overwrite') {
              target[key] = startValues[key] + (config[key] - startValues[key]) * progress;
            }
          });
          
          config.onUpdate();
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      } else if (target instanceof HTMLElement) {
        // Direct DOM animation
        if (config.opacity !== undefined) {
          target.style.opacity = config.opacity;
          target.style.transition = `opacity ${config.duration || 0.3}s`;
        }
      }
      
      // Return empty object to mimic GSAP's return
      return {};
    }
  };
};

export const ChromaGrid = ({
  items,
  className = "",
  radius = 300,
  columns = 2,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
}: {
  items: ChromaGridItem[];
  className?: string;
  radius?: number;
  columns?: number;
  rows?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<any>(null);
  const setY = useRef<any>(null);
  const pos = useRef({ x: 0, y: 0 });
  const animatorRef = useRef(createFallbackAnimator());

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    
    setX.current = animatorRef.current.quickSetter(el, "--x", "px");
    setY.current = animatorRef.current.quickSetter(el, "--y", "px");
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    animatorRef.current.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (!r) return;
    moveTo(e.clientX - r.left, e.clientY - r.top);
    if (fadeRef.current) {
      animatorRef.current.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
    }
  };

  const handleLeave = () => {
    if (fadeRef.current) {
      animatorRef.current.to(fadeRef.current, {
        opacity: 1,
        duration: fadeOut,
        overwrite: true,
      });
    }
  };

  const handleCardClick = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCardMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={
        {
          "--r": `${radius}px`,
          "--cols": columns,
          "--rows": rows,
        } as React.CSSProperties
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {items.map((item, i) => (
        <article
          key={i}
          className="chroma-card"
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(item.url)}
          style={
            {
              "--card-border": item.borderColor || "transparent",
              "--card-gradient": item.gradient,
              cursor: item.url ? "pointer" : "default",
            } as React.CSSProperties
          }
        >
          <div className="chroma-img-wrapper">
            <div className="chroma-icon-container">
              {item.icon}
            </div>
          </div>
          <footer className="chroma-info">
            <h3 className="name">{item.title}</h3>
            <p className="role">{item.description}</p>
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
};

export default ChromaGrid; 