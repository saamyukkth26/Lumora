import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:     '#080c0a',
        surface:        '#0c1210',
        'surface-2':    '#111a17',
        'surface-3':    '#172320',
        border:         'rgba(16,185,129,0.08)',
        'border-strong':'rgba(16,185,129,0.18)',
        primary: {
          DEFAULT:    '#10b981',  // emerald
          hover:      '#059669',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT:    '#06b6d4',  // cyan
          hover:      '#0891b2',
          foreground: '#ffffff',
        },
        teal:        '#14b8a6',
        foreground:  '#e2e8f0',
        muted:       '#64748b',
        'muted-foreground': '#475569',
        success:     '#10b981',
        warning:     '#f59e0b',
        destructive: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-accent':  'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
        'gradient-warm':    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'glass': 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.08)',
        'glow-accent':  '0 0 30px rgba(6,182,212,0.3)',
        'glow-sm':      '0 0 12px rgba(16,185,129,0.2)',
        'card':         '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(16,185,129,0.05)',
        'card-hover':   '0 10px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(16,185,129,0.1)',
        'inner-glow':   'inset 0 1px 0 rgba(16,185,129,0.08)',
      },
      animation: {
        shimmer:      'shimmer 2s infinite linear',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        float:        'float 4s ease-in-out infinite',
        'cursor-blink':'cursor-blink 0.85s step-end infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 12px rgba(16,185,129,0.3)' },
          '50%':      { opacity: '0.7', boxShadow: '0 0 28px rgba(16,185,129,0.55)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-8px) rotate(1deg)' },
          '66%':      { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
    },
  },
}

export default config
