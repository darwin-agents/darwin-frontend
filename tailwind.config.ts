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
          bg:       '#f3eee2',
          surface:  '#e9e2cf',
          'bg-2':   '#e9e2cf',
          'bg-3':   '#ddd4bd',
          ink:      '#0a0a0a',
          'ink-soft': '#3d3a32',
          muted:    '#8a857a',
          'muted-2': '#b5b0a3',
          border:   'rgba(10,10,10,0.12)',
          'border-soft': 'rgba(10,10,10,0.06)',
          accent:   '#ff5b1f',
          'accent-deep': '#c93f0a',
        },
        active:      '#ff5b1f',
        hibernating: '#8a857a',
        terminated:  '#7f1d1d',
        'model-opus':      { DEFAULT: '#185FA5', light: '#E6F1FB' },
        'model-sonnet':    { DEFAULT: '#534AB7', light: '#EEEDFE' },
        'model-haiku':     { DEFAULT: '#3B6D11', light: '#EAF3DE' },
        'model-gpt4o':     { DEFAULT: '#0F6E56', light: '#E1F5EE' },
        'model-gpt4omini': { DEFAULT: '#854F0B', light: '#FAEEDA' },
      },
      fontFamily: {
        sans: ['Inter Tight', 'system-ui', 'sans-serif'],
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
          '0%, 100%': { filter: 'drop-shadow(0 0 4px #ff5b1f)' },
          '50%':       { filter: 'drop-shadow(0 0 12px #ff5b1f)' },
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
