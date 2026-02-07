import type { Config } from 'tailwindcss';

export default {
  content: [
    './entrypoints/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          '000': '#000000',
          '050': '#0a0a0a',
          '100': '#111111',
          '150': '#171717',
          '200': '#1a1a1a',
        },
        border: {
          DEFAULT: '#262626',
          hover: '#333333',
          focus: '#ededed',
        },
        text: {
          primary: '#ededed',
          secondary: '#a1a1a1',
          tertiary: '#666666',
          inverted: '#000000',
        },
        accent: '#0070f3',
        success: '#00c853',
        warning: '#f5a623',
        danger: '#ee0000',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      },
      transitionDuration: {
        'DEFAULT': '150ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
