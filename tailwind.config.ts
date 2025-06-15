import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      dropShadow: {
        'glow-yellow': '0 0 3px rgba(250, 204, 21, 0.7)',
        'glow-slate': '0 0 3px rgba(203, 213, 225, 0.7)',
        'glow-amber': '0 0 3px rgba(217, 119, 6, 0.7)',
        'glow-blue': '0 0 3px rgba(166, 49, 214, 0.7)',
      },
      boxShadow: {
        'glow-sm': '0 0 4px',
        'glow-md': '0 0 8px',
        'glow-lg': '0 0 12px',
        'glass': 'rgba(0, 0, 0, 0.4) 0px 20px 60px, rgba(255, 255, 255, 0.15) 0px 1px inset',
        'glass-hover': 'rgba(0, 0, 0, 0.5) 0px 25px 65px, rgba(255, 255, 255, 0.2) 0px 1px inset',
      },
      backdropBlur: {
        'glass': '60px',
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.03)',
        'glass-hover': 'rgba(255, 255, 255, 0.08)',
        'dark': '#0f0f0f',
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			loading: {
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			},
  			flip: {
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			},
  			rotate: {
  				to: {
  					transform: 'rotate(90deg)'
  				}
  			},
  			orbit: {
  				'0%': {
  					transform: 'rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg))'
  				},
  				'100%': {
  					transform: 'rotate(calc(var(--angle) * 1deg + 360deg)) translateY(calc(var(--radius) * 1px)) rotate(calc((var(--angle) * -1deg) - 360deg))'
  				}
  			},
  			ripple: {
  				'0%, 100%': {
  					transform: 'translate(-50%, -50%) scale(1)'
  				},
  				'50%': {
  					transform: 'translate(-50%, -50%) scale(0.9)'
  				}
  			},
  			blob: {
  				'0%': {
  					transform: 'translate(-50%, -50%) rotate(0deg) scale(1)'
  				},
  				'33%': {
  					transform: 'translate(-50%, -50%) rotate(120deg) scale(1.1)'
  				},
  				'66%': {
  					transform: 'translate(-50%, -50%) rotate(240deg) scale(0.9)'
  				},
  				'100%': {
  					transform: 'translate(-50%, -50%) rotate(360deg) scale(1)'
  				}
  			},
  			'image-glow': {
  				'0%': {
  					opacity: '0',
  					animationTimingFunction: 'cubic-bezier(.74, .25, .76, 1)'
  				},
  				'10%': {
  					opacity: '0.5',
  					animationTimingFunction: 'cubic-bezier(.12, .01, .08, .99)'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			marquee: {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - var(--gap)))'
  				}
  			},
  			'marquee-vertical': {
  				from: {
  					transform: 'translateY(0)'
  				},
  				to: {
  					transform: 'translateY(calc(-100% - var(--gap)))'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			loading: 'loading 0.6s linear infinite',
  			flip: 'flip 6s infinite steps(2, end)',
  			rotate: 'rotate 3s linear infinite both',
  			orbit: 'orbit calc(var(--duration)*1s) linear infinite',
  			ripple: 'ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite',
  			blob: 'blob 7s infinite',
  			'image-glow': 'image-glow 6s ease-out 0.6s forwards',
  			marquee: 'marquee var(--duration) infinite linear',
  			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite'
  		},
  		spacing: {
  			'1/8': '12.5%'
  		},
  		fontFamily: {
  			sans: [
  				'DM Sans',
  				'sans-serif'
  			],
  			display: [
  				'Unbounded',
  				'sans-serif'
  			],
			unbounded: ["Unbounded", "cursive"], // 'cursive' is fallback
  			heading: [
  				'var(--font-heading)'
  			],
  			subheading: [
  				'var(--font-subheading)'
  			],
  			base: [
  				'var(--font-base)'
  			]
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
