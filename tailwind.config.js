/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sa: {
          // Backgrounds — deep, atmospheric
          bg: '#131316',
          'bg-deep': '#0D0D0F',
          'bg-warm': '#1A1A1E',
          'bg-lift': '#222226',
          'bg-card': '#1E1E22',
          'bg-hover': '#28282D',

          // Text hierarchy
          cream: '#F2EDE4',
          'cream-soft': '#D8D2C7',
          'cream-muted': '#A69F93',
          'cream-faint': '#6B665D',

          // Accent — blue (primary brand)
          gold: '#5A98FF',
          'gold-light': '#7BB3FF',
          'gold-deep': '#4080E0',
          'gold-soft': 'rgba(90, 152, 255, 0.06)',
          'gold-glow': 'rgba(90, 152, 255, 0.08)',
          'gold-border': 'rgba(90, 152, 255, 0.20)',

          // Semantic — success
          green: '#6ECB8B',
          'green-soft': 'rgba(110, 203, 139, 0.10)',
          'green-border': 'rgba(110, 203, 139, 0.25)',

          // Semantic — warning / attention
          rose: '#E07070',
          'rose-soft': 'rgba(230, 100, 100, 0.12)',
          'rose-border': 'rgba(230, 100, 100, 0.25)',

          // Semantic — info / neutral accent
          blue: '#6DB5F5',
          'blue-soft': 'rgba(109, 181, 245, 0.14)',
          'blue-border': 'rgba(109, 181, 245, 0.30)',

          // Phase 2 — Purple
          purple: '#9B7BF5',
          'purple-soft': 'rgba(155, 123, 245, 0.10)',
          'purple-border': 'rgba(155, 123, 245, 0.25)',

          // Borders and dividers
          border: 'rgba(90, 152, 255, 0.08)',
          'border-light': 'rgba(90, 152, 255, 0.12)',
          'border-active': 'rgba(90, 152, 255, 0.30)',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.5' }],
        'sm': ['0.9375rem', { lineHeight: '1.6' }],
        'base': ['1.0625rem', { lineHeight: '1.7' }],
        'lg': ['1.1875rem', { lineHeight: '1.6' }],
        'xl': ['1.375rem', { lineHeight: '1.4' }],
        '2xl': ['1.75rem', { lineHeight: '1.3' }],
        '3xl': ['2.125rem', { lineHeight: '1.2' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'sa': '8px',
        'sa-sm': '6px',
        'sa-lg': '12px',
      },
      boxShadow: {
        'sa': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'sa-lg': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        'sa-glow': '0 0 20px rgba(201, 169, 110, 0.08)',
      },
      animation: {
        'rise': 'rise 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
      },
    },
  },
  plugins: [],
};
