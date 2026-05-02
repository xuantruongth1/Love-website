/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B9D',
          dark: '#FF3366',
        },
        bg: {
          light: '#FFF5F7',
          dark: '#1a0a0f',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#2d0f1a',
          'alt-light': '#FFE8EE',
          'alt-dark': '#3d1525',
        },
        text: {
          main: '#4A1028',
          sub: '#8B3A52',
          'main-dark': '#FFE4EE',
          'sub-dark': '#FFB3C6',
        },
        border: {
          light: '#FFB3C6',
          dark: '#5c1f33',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Nunito', 'sans-serif'],
        handwriting: ['"Dancing Script"', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-heart': 'pulseHeart 1.5s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'flip': 'flip 0.6s ease-in-out',
        'typewriter': 'typewriter 3s steps(40) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseHeart: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flip: {
          '0%': { transform: 'rotateY(0)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
      boxShadow: {
        'pink': '0 4px 20px rgba(255, 107, 157, 0.25)',
        'pink-lg': '0 8px 40px rgba(255, 107, 157, 0.35)',
        'pink-dark': '0 4px 20px rgba(255, 51, 102, 0.3)',
      },
    },
  },
  plugins: [],
}
