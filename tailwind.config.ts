import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /*
       * ============================================
       * MAX & MINA'S DESIGN SYSTEM
       * "Cereal Box Bold" - Playful + Premium
       * Inspired by Van Leeuwen's bold borders
       * with cereal nostalgia twist
       * ============================================
       */

      colors: {
        // PRIMARY PALETTE - Core brand colors
        mm: {
          black: '#1A1A1A',      // Bold borders, strong contrast
          cream: '#FFF8E7',      // Warm milk-like background
          red: '#E63946',        // Primary action (heritage red)

          // ACCENT COLORS - Cereal box vibrance
          yellow: '#FFD166',     // Sunny, cereal gold
          blue: '#118AB2',       // Playful, trustworthy
          mint: '#06D6A0',       // Fresh, available, success
          pink: '#F72585',       // Highlight, rare, special
          orange: '#FB8500',     // Warm accent, energy

          // NEUTRAL SCALE - For text and subtle elements
          gray: {
            50: '#FAFAF9',
            100: '#F5F5F4',
            200: '#E7E5E4',
            300: '#D6D3D1',
            400: '#A8A29E',
            500: '#78716C',
            600: '#57534E',
            700: '#44403C',
            800: '#292524',
            900: '#1C1917',
          },
        },

        // SEMANTIC COLORS - Functional meanings
        available: '#06D6A0',     // mm-mint
        soldout: '#E63946',       // mm-red
        rare: '#F72585',          // mm-pink
        legendary: '#FFD166',     // mm-yellow

        // LEGACY - Keep for backwards compatibility during migration
        dead: {
          red: '#C84536',
          orange: '#E8833A',
          gold: '#F4C430',
          green: '#22C55E',
          teal: '#14B8A6',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          pink: '#EC4899',
        },
        psychedelic: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          lime: '#84CC16',
          orange: '#E8833A',
          blue: '#3B82F6',
          yellow: '#F4C430',
        },
        cream: '#FFF8E7',
        chocolate: '#1A1A1A',
        background: "var(--background)",
        foreground: "var(--foreground)",
      },

      /*
       * TYPOGRAPHY SYSTEM
       * Heading: Space Grotesk - Bold, confident, geometric
       * Body: DM Sans - Friendly, readable, modern
       * Accent: Lilita One - Playful, cereal-box energy for special moments
       */
      fontFamily: {
        // Primary fonts (new)
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        accent: ['"Lilita One"', 'cursive'],

        // Legacy fonts (keep for migration)
        groovy: ['"Pacifico"', 'cursive'],
        display: ['"Fredoka One"', 'cursive'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },

      /*
       * SPACING SCALE
       * Based on 4px grid, with larger jumps for sections
       */
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '30': '7.5rem',   // 120px
      },

      /*
       * BORDER RADIUS SCALE
       * "Cereal Box Bold" uses more angular, confident shapes
       * Soft-but-not-too-soft approach
       */
      borderRadius: {
        'none': '0',
        'sm': '4px',       // Subtle rounding
        'DEFAULT': '8px',  // Standard cards/buttons
        'md': '12px',      // Cards, modals
        'lg': '16px',      // Large cards
        'xl': '20px',      // Feature sections
        '2xl': '24px',     // Hero elements
        'full': '9999px',  // Pills, avatars
        'blob': '40% 60% 70% 30% / 40% 50% 60% 50%',
      },

      /*
       * BOX SHADOWS
       * Bold, offset shadows (Van Leeuwen inspired)
       * Creates depth without softness
       */
      boxShadow: {
        // Bold offset shadows (signature look)
        'bold-sm': '3px 3px 0px 0px #1A1A1A',
        'bold': '4px 4px 0px 0px #1A1A1A',
        'bold-lg': '6px 6px 0px 0px #1A1A1A',
        'bold-xl': '8px 8px 0px 0px #1A1A1A',

        // Colored offset shadows for accents
        'bold-red': '4px 4px 0px 0px #E63946',
        'bold-blue': '4px 4px 0px 0px #118AB2',
        'bold-mint': '4px 4px 0px 0px #06D6A0',
        'bold-pink': '4px 4px 0px 0px #F72585',
        'bold-yellow': '4px 4px 0px 0px #FFD166',

        // Soft shadows for subtle depth
        'soft': '0 2px 8px rgba(26, 26, 26, 0.08)',
        'soft-md': '0 4px 16px rgba(26, 26, 26, 0.1)',
        'soft-lg': '0 8px 32px rgba(26, 26, 26, 0.12)',

        // Inner shadows
        'inner-soft': 'inset 0 2px 4px rgba(26, 26, 26, 0.06)',

        // Legacy
        'groovy': '0 4px 20px rgba(155, 89, 182, 0.3)',
        'groovy-lg': '0 8px 40px rgba(155, 89, 182, 0.4)',
        'neon-pink': '0 0 20px rgba(255, 105, 180, 0.5)',
        'neon-purple': '0 0 20px rgba(155, 89, 182, 0.5)',
      },

      /*
       * BORDER WIDTHS
       * Bold borders are signature to the design
       */
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
        '3': '3px',      // Standard bold border
        '4': '4px',      // Emphasis
        '5': '5px',      // Maximum impact
      },

      /*
       * BACKGROUND PATTERNS
       */
      backgroundImage: {
        // Subtle texture for depth
        'dots': 'radial-gradient(circle, #1A1A1A 1px, transparent 1px)',
        'grid': 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',

        // Gradients
        'gradient-warm': 'linear-gradient(135deg, #FFD166 0%, #FB8500 100%)',
        'gradient-cool': 'linear-gradient(135deg, #118AB2 0%, #06D6A0 100%)',
        'gradient-hot': 'linear-gradient(135deg, #E63946 0%, #F72585 100%)',
        'gradient-cream': 'linear-gradient(180deg, #FFF8E7 0%, #F5F5F4 100%)',

        // Legacy
        'tie-dye': 'radial-gradient(circle at 20% 50%, rgba(200, 69, 54, 0.5) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(244, 196, 48, 0.5) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
        'rainbow': 'linear-gradient(90deg, #C84536, #E8833A, #F4C430, #22C55E, #3B82F6, #8B5CF6)',
        'rainbow-soft': 'linear-gradient(135deg, rgba(200, 69, 54, 0.3), rgba(244, 196, 48, 0.3), rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
        'groovy-gradient': 'linear-gradient(135deg, #C84536 0%, #E8833A 50%, #F4C430 100%)',
        'dead-gradient': 'linear-gradient(135deg, #C84536 0%, #8B5CF6 100%)',
      },
      backgroundSize: {
        'dots-sm': '16px 16px',
        'dots-md': '24px 24px',
        'dots-lg': '32px 32px',
        'grid-sm': '16px 16px',
        'grid-md': '24px 24px',
      },

      /*
       * ANIMATIONS
       * Snappy, playful, confident
       */
      animation: {
        // Core interactions
        'press': 'press 0.15s ease-out',
        'pop': 'pop 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'wiggle': 'wiggle 0.3s ease-in-out',

        // Continuous
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',

        // Marquee
        'marquee': 'marquee 30s linear infinite',
        'marquee-fast': 'marquee 15s linear infinite',

        // Legacy
        'glow': 'glow 2s ease-in-out infinite alternate',
        'rainbow-shift': 'rainbow-shift 5s ease infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'melt': 'melt 2s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      },
      keyframes: {
        // Press effect for buttons
        press: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
        // Pop in effect
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '70%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Attention shake
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        // Playful wiggle
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        // Floating effect
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        // Soft pulse
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        // Subtle bounce
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        // Marquee scroll
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        // Legacy
        glow: {
          'from': { boxShadow: '0 0 5px #FF69B4, 0 0 10px #FF69B4, 0 0 15px #FF69B4' },
          'to': { boxShadow: '0 0 10px #9B59B6, 0 0 20px #9B59B6, 0 0 30px #9B59B6' },
        },
        'rainbow-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        melt: {
          '0%, 100%': { borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' },
          '50%': { borderRadius: '60% 40% 30% 70% / 50% 60% 50% 40%' },
        },
      },

      /*
       * TRANSITIONS
       * Snappy and confident timing
       */
      transitionDuration: {
        '0': '0ms',
        '100': '100ms',
        '150': '150ms',    // Micro-interactions
        '200': '200ms',    // Standard
        '300': '300ms',    // Emphasis
        '500': '500ms',    // Major transitions
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
