import { useCallback } from "react";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-tsparticles";
import type { ISourceOptions } from "tsparticles-engine";

interface ParticleProps {
  className?: string;
  quantity?: number;
  speed?: number;
  size?: number;
  color?: string;
}

/**
 * Creates a simple configuration for gentle falling particles with no connections
 * These particles simply fall from the top of the screen
 */
const getFallingParticlesConfig = (
  quantity: number,
  speed: number = 1,
  size: number = 3,
  color: string = "#ffffff"
): ISourceOptions => {
  return {
    fullScreen: false,
    fpsLimit: 30, // Lower FPS for smoother appearance
    particles: {
      number: {
        value: quantity,
        density: {
          enable: true,
          area: 1000
        }
      },
      color: {
        value: color
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: {
          min: 0.1,
          max: 0.5
        },
        animation: {
          enable: true,
          speed: 0.2,
          minimumValue: 0.1,
          sync: false
        }
      },
      size: {
        value: { 
          min: size * 0.5, 
          max: size 
        },
        animation: {
          enable: true,
          speed: 0.2,
          minimumValue: 0.1,
          sync: false
        }
      },
      move: {
        enable: true,
        direction: "bottom",
        straight: false,
        speed: speed * 0.5, // Slower for more gentle movement
        outModes: {
          default: "out",
          bottom: "out",
          top: "none"
        },
        random: false,
        trail: {
          enable: false
        },
        drift: {
          min: -0.2,
          max: 0.2
        }
      },
      links: {
        enable: false // Explicitly disable links
      },
      collisions: {
        enable: false
      },
      wobble: {
        enable: true,
        distance: 5,
        speed: 1
      }
    },
    detectRetina: true,
    background: {
      color: "transparent"
    }
  };
};

export function ParticlesComponent({
  className = "",
  quantity = 50,
  speed = 1,
  size = 3,
  color = "#ffffff"
}: ParticleProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (_container: Container | undefined) => {
    // Optional: Add any initialization after particles are loaded
  }, []);

  return (
    <Particles
      className={`${className} absolute inset-0 pointer-events-none`}
      init={particlesInit}
      loaded={particlesLoaded}
      options={getFallingParticlesConfig(quantity, speed, size, color)}
    />
  );
}