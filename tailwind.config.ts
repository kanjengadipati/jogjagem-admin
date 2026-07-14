import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5E3C',
          light: '#A06E4A',
          dark: '#734E30',
        },
        secondary: {
          DEFAULT: '#B68D40',
          light: '#C8A254',
          dark: '#9A752F',
        },
        bg: '#F8F7F4',
        card: '#FFFFFF',
        border: '#ECECEC',
        text: '#222222',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'button': '12px',
      },
      boxShadow: {
        'soft': '0 8px 30px rgb(0, 0, 0, 0.04)',
        'premium': '0 12px 40px rgb(139, 94, 60, 0.05)',
        'apple': '0 4px 20px rgb(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
} satisfies Config;
