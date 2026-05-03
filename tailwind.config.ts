import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        darwin: {
          bg:      '#090c12',
          surface: '#111827',
          border:  '#1f2937',
          muted:   '#374151',
        },
        active:      '#8b5cf6',
        hibernating: '#475569',
        terminated:  '#7f1d1d',
        'model-opus':      { DEFAULT: '#185FA5', light: '#E6F1FB' },
        'model-sonnet':    { DEFAULT: '#534AB7', light: '#EEEDFE' },
        'model-haiku':     { DEFAULT: '#3B6D11', light: '#EAF3DE' },
        'model-gpt4o':     { DEFAULT: '#0F6E56', light: '#E1F5EE' },
        'model-gpt4omini': { DEFAULT: '#854F0B', light: '#FAEEDA' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow':  'pulse-glow 2s ease-in-out infinite',
        'slide-right': 'slide-right 0.2s ease-out',
        'slide-up':    'slide-up 0.3s ease-out',
        'fade-in':     'fade-in 0.4s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px #8b5cf6)' },
          '50%':       { filter: 'drop-shadow(0 0 12px #8b5cf6)' },
        },
        'slide-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
