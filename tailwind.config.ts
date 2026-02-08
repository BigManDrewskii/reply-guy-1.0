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
        // Core colors
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',

        // Interactive surfaces
        border: 'hsl(var(--color-border))',
        input: 'hsl(var(--color-input))',
        ring: 'hsl(var(--color-ring))',

        // Semantic color variants
        card: {
          DEFAULT: 'hsl(var(--color-card))',
          hover: 'hsl(var(--color-card-hover))',
          foreground: 'hsl(var(--color-card-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--color-muted))',
          hover: 'hsl(var(--color-muted-hover))',
          foreground: 'hsl(var(--color-muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--color-popover))',
          foreground: 'hsl(var(--color-popover-foreground))',
        },

        // Button variants
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))',
          hover: 'hsl(var(--color-primary-hover))',
          active: 'hsl(var(--color-primary-active))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          foreground: 'hsl(var(--color-secondary-foreground))',
          hover: 'hsl(var(--color-secondary-hover))',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          foreground: 'hsl(var(--color-accent-foreground))',
          hover: 'hsl(var(--color-accent-hover))',
        },

        // CTA (inverted)
        cta: {
          DEFAULT: 'hsl(var(--color-cta-background))',
          foreground: 'hsl(var(--color-cta-foreground))',
          hover: 'hsl(var(--color-cta-hover))',
          active: 'hsl(var(--color-cta-active))',
        },

        // Semantic colors
        destructive: {
          DEFAULT: 'hsl(var(--color-destructive))',
          foreground: 'hsl(var(--color-destructive-foreground))',
          hover: 'hsl(var(--color-destructive-hover))',
          subtle: 'hsl(var(--color-destructive-subtle))',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          foreground: 'hsl(var(--color-success-foreground))',
          hover: 'hsl(var(--color-success-hover))',
          subtle: 'hsl(var(--color-success-subtle))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          foreground: 'hsl(var(--color-warning-foreground))',
          hover: 'hsl(var(--color-warning-hover))',
          subtle: 'hsl(var(--color-warning-subtle))',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info))',
          foreground: 'hsl(var(--color-info-foreground))',
          hover: 'hsl(var(--color-info-hover))',
          subtle: 'hsl(var(--color-info-subtle))',
        },

        // Sidebar
        sidebar: {
          DEFAULT: 'hsl(var(--color-sidebar))',
          foreground: 'hsl(var(--color-sidebar-foreground))',
          primary: 'hsl(var(--color-sidebar-primary))',
          'primary-foreground': 'hsl(var(--color-sidebar-primary-foreground))',
          accent: 'hsl(var(--color-sidebar-accent))',
          'accent-foreground': 'hsl(var(--color-sidebar-accent-foreground))',
          border: 'hsl(var(--color-sidebar-border))',
          ring: 'hsl(var(--color-sidebar-ring))',
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

      // Keyframes (keep existing)
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
      },

      // Animations
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.15s ease-in forwards',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-in',
        shimmer: 'shimmer 1.5s infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
