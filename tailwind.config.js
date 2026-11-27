/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Be Vietnam Pro', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        obsidian: {
          canvas: '#0A0B0E',
          surface: '#111318',
          'surface-2': '#171A21',
          'surface-3': '#1E222C',
          border: 'rgba(255, 255, 255, 0.07)',
          'border-hover': 'rgba(255, 255, 255, 0.14)',
        },
        jade: {
          DEFAULT: '#10B981',
          hover: '#059669',
          active: '#047857',
          soft: 'rgba(16, 185, 129, 0.12)',
        },
        gold: {
          DEFAULT: '#E5A93C',
          hover: '#D4962A',
          soft: 'rgba(229, 169, 60, 0.12)',
        },
        crimson: {
          DEFAULT: '#E5484D',
          hover: '#D13438',
          soft: 'rgba(229, 72, 77, 0.12)',
        },
        cobalt: {
          DEFAULT: '#3B82F6',
          soft: 'rgba(59, 130, 246, 0.12)',
        },
      },
      boxShadow: {
        obsidian: '0 12px 32px -8px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'obsidian-sm': '0 6px 16px -4px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'obsidian-lg': '0 20px 48px -12px rgba(0, 0, 0, 0.78), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
}
