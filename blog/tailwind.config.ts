import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0b0d28",
        "secondary": "#080A20",
      },
      screens: {
        "mobile-sm": "320px",
        "mobile-md": "375px",
        "mobile-lg": "425px",
        "mobile-xl": "475px",
      },
      keyframes: {
        skew: {
          '0% 100%': {
            transform: "skewX(0deg)",
          },
          '50%': {
            transform: "skewX(6deg)",
          }
        },
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-8px)",
          },
          "50%": {
            opacity: "0.5",
            transform: "translateY(4px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "bell-ringer": {
          "0%": {
            transform: "translateX(0px)",
          },
          "50%": {
            transform: "translateX(10px)",
          },
          "100%": {
            transform: "translateX(0px)",
          },
        },
        "slide-in-right": {
          "0%": {
            transform: "translateX(70%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        "slide-in-right-slow": {
          "0%": {
            transform: "translateX(0%)",
          },
          "25%": {
            transform: "translateX(10%)",
          },
          "50%": {
            transform: "translateX(-10%)",
          },
          "100%": {
            transform: "translateX(0%)",
          },
        },
        "shimmer": {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "loader": {
          to: {
            opacity: "0.1",
            transform: 'translate3d(0, -1rem, 0)'
          }
        },
        "text-slide": {
          "0%": {
            transform: 'translateX(-100%)',
          },
          "25%": {
            transform: 'translateX(0)'
          },
          "75%": {
            transform: 'translateX(100%)'
          },
          "100%": {
            transform: 'translateX(0)'
          }
        },
        "text-slide-slow": {
          from: {
            transform: 'translateX(-100%)',
          },
          to: {
            transform: 'translateX(10%)'
          }
        },
        "fade-down": {
          from: {
            transform: 'scale(0)',
          },
          to: {
            transform: 'scale(1)'
          }
        },
        "drop": {
          from: {
            top: '-5vh',
          },
          to: {
            top: '100vh'
          }
        },
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "skew": 'skew 2s linear infinite',
        "fade-in-down": "fade-in-down 0.5s ease-out infinite",
        "bell-ringer": "bell-ringer 0.5s ease-out infinite",
        "slide-in-right": "slide-in-right 1s ease-out infinite",
        "slide-in-right-slow": "slide-in-right-slow 3.5s ease-out infinite",
        "shimmer": "shimmer 1s infinite",
        "loader": 'loader 0.6s infinite alternate',
        "text-slide": 'text-slide 10s ease-out infinite alternate',
        "text-slide-slow": 'text-slide-slow 10s ease-out infinite alternate',
        "fade-down": "fade-down 0.5s ease-in forwards",
        "drop": "drop 1.7s cubic-bezier(0.7, 0, 0.84, 0) forwards",
      },
    },
  },
  plugins: [],
}
export default config
