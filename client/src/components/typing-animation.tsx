"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

interface TypingAnimationProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
  startOnView?: boolean;
}

export function TypingAnimation({
  children,
  className,
  duration = 100,
  delay = 0,
  as: Component = "div",
  startOnView = false,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!startOnView) {
      const startTimeout = setTimeout(() => {
        setStarted(true);
      }, delay);
      return () => clearTimeout(startTimeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setStarted(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, startOnView]);

  useEffect(() => {
    if (!started) return;

    let i = isDeleting ? displayedText.length : 0;
    const interval = setInterval(() => {
      if (isDeleting) {
        if (i > 0) {
          setDisplayedText(children.substring(0, i - 1));
          i--;
        } else {
          setIsDeleting(false);
          i = 0;
        }
      } else {
        if (i < children.length) {
          setDisplayedText(children.substring(0, i + 1));
          i++;
        } else {
          setTimeout(() => {
            setIsDeleting(true);
          }, 800); // Reduced wait time before deletion
        }
      }
    }, duration * 1.5); // Slowed down to ensure single letter typing

    return () => {
      clearInterval(interval);
    };
  }, [children, duration, started, isDeleting]);

  return (
    <Component
      ref={elementRef}
      className={cn(
        "typing-animation",
        className,
      )}
    >
      {displayedText}
    </Component>
  );
}