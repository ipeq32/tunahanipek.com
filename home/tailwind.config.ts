import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        skew: 'skew 2s linear infinite',
        fadeInDown: 'fade-in-down 1s ease-out infinite alternate',
      },
      keyframes: {
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
        skew: {
          '0% 100%': {
            transform: "skewX(0deg)",
          },
          '50%': {
            transform: "skewX(6deg)",
          }
        }
      },
      rotate: {
        'profil': '314deg'
      },
      opacity: {
        'profil': '.98',
        'tema': '.97'
      },
    },
  },
  plugins: [],
}
export default config
