import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface KeyframeStep {
  opacity: number;
  filter: string;
  transform: string;
}

const buildKeyframes = (
  direction: 'up' | 'down' = 'up',
  distance: number = 10
): KeyframeStep[] => {
  return [
    {
      opacity: 0,
      filter: 'blur(10px)',
      transform: `translateY(${direction === 'up' ? distance : -distance}px)`,
    },
    {
      opacity: 1,
      filter: 'blur(0px)',
      transform: 'translateY(0px)',
    },
  ];
};

interface BlurTextProps {
  text: string;
  delay?: number;
  staggerChildren?: number;
  direction?: 'up' | 'down';
  ease?: string;
  className?: string;
}

const BlurText = ({
  text,
  delay = 0,
  staggerChildren = 0.03,
  direction = 'up',
  ease = 'easeOut',
  className = '',
}: BlurTextProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const words = text.split(' ');

  return (
    <span ref={ref} className={`text-[1.15em] font-bold md:text-[1em] md:font-normal ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={
            isVisible
              ? {
                  opacity: 1,
                  filter: 'blur(0px)',
                  transform: 'translateY(0px)',
                }
              : {}
          }
          transition={{
            duration: 0.5,
            delay: delay / 1000 + i * staggerChildren,
            ease: ease as any,
          }}
          style={{
            display: 'inline-block',
            opacity: 0,
            filter: 'blur(10px)',
            transform: `translateY(${direction === 'up' ? '10px' : '-10px'})`,
            marginRight: '0.25em',
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

export default BlurText; 