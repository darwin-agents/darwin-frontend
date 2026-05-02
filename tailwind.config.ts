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
          bg: '#090c12',
          surface: '#111827',
          border: '#1f2937',
          muted: '#374151',
        },
        active: '#8b5cf6',
        hibernating: '#475569',
        terminated: '#7f1d1d',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px #8b5cf6)' },
          '50%': { filter: 'drop-shadow(0 0 12px #8b5cf6)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
