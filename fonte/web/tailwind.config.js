import { colors } from './src/theme/colors'

/** @type {import('tailwindcss').Config} */
export default {
  // darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        actor: 'Actor, sans-serif',
        anton: 'Anton, sans-serif',
        antic: 'Antic, sans-serif',
        barlow: 'Barlow, sans-serif',
        'anek-bangla': "'Anek Bangla', sans-serif",
        'dm-sans': "'DM Sans', sans-serif",
        acme: 'Acme, sans-serif',
      },
      keyframes: {
        slideDown: {
          from: { height: '0px' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0px' },
        },
        contentShow: {
          from: {
            opacity: '0',
            transform: 'translate(-50%, -48%) scale(0.96)',
          },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideDown: 'slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideUp: 'slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [
    function ({ addUtilities, e, theme, variants }) {
      const colors = theme('colors')
      const textFillColors = Object.keys(colors).map((color) => {
        const value = colors[color]
        return {
          [`.${e(`text-fill-${color}`)}`]: {
            '-webkit-text-fill-color': value,
          },
        }
      })

      addUtilities(textFillColors, variants('textFillColor'))
    },
  ],
}
