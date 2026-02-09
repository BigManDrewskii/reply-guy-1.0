import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './entrypoints/**/*.{html,js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{css}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Core colors — using var() directly since design-tokens.css defines oklch values via @theme
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',

        // Interactive surfaces
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',

        // Semantic color variants
        card: {
          DEFAULT: 'var(--color-card)',
          hover: 'var(--color-card-hover)',
          foreground: 'var(--color-card-foreground)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          hover: 'var(--color-muted-hover)',
          foreground: 'var(--color-muted-foreground)',
        },
        popover: {
          DEFAULT: 'var(--color-popover)',
          foreground: 'var(--color-popover-foreground)',
        },

        // Button variants
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
          hover: 'var(--color-secondary-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
          hover: 'var(--color-accent-hover)',
        },

        // CTA (inverted)
        cta: {
          DEFAULT: 'var(--color-cta-background)',
          foreground: 'var(--color-cta-foreground)',
          hover: 'var(--color-cta-hover)',
          active: 'var(--color-cta-active)',
        },

        // Semantic colors
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          foreground: 'var(--color-destructive-foreground)',
          hover: 'var(--color-destructive-hover)',
          subtle: 'var(--color-destructive-subtle)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
          hover: 'var(--color-success-hover)',
          subtle: 'var(--color-success-subtle)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
          hover: 'var(--color-warning-hover)',
          subtle: 'var(--color-warning-subtle)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          foreground: 'var(--color-info-foreground)',
          hover: 'var(--color-info-hover)',
          subtle: 'var(--color-info-subtle)',
        },

        // Sidebar
        sidebar: {
          DEFAULT: 'var(--color-sidebar)',
          foreground: 'var(--color-sidebar-foreground)',
          primary: 'var(--color-sidebar-primary)',
          'primary-foreground': 'var(--color-sidebar-primary-foreground)',
          accent: 'var(--color-sidebar-accent)',
          'accent-foreground': 'var(--color-sidebar-accent-foreground)',
          border: 'var(--color-sidebar-border)',
          ring: 'var(--color-sidebar-ring)',
        },
      },

      // Typography
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
      },
      lineHeight: {
        tight: 'var(--leading-tight)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
      },
      fontWeight: {
        normal: 'var(--font-normal)',
        medium: 'var(--font-medium)',
        semibold: 'var(--font-semibold)',
        bold: 'var(--font-bold)',
      },

      // Spacing
      spacing: {
        '0': 'var(--spacing-0)',
        'px': 'var(--spacing-px)',
        '0.5': 'var(--spacing-0_5)',
        '1': 'var(--spacing-1)',
        '1.5': 'var(--spacing-1_5)',
        '2': 'var(--spacing-2)',
        '2.5': 'var(--spacing-2_5)',
        '3': 'var(--spacing-3)',
        '3.5': 'var(--spacing-3_5)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
      },

      // Border radius
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },

      // Shadows
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        inner: 'var(--shadow-inner)',
      },

      // Transition utilities
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },
      transitionTimingFunction: {
        linear: 'var(--ease-linear)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
      },

      // Font families
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      // Keyframes
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // Animations
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.15s ease-in forwards',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-in',
        shimmer: 'shimmer 1.5s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
        'slide-out-right': 'slide-out-right 0.25s ease-in',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
