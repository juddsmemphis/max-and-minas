import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Grateful Dead inspired palette matching logo red
        dead: {
          red: '#C84536',        // Steal Your Face red (matches logo!)
          orange: '#E8833A',     // Ripple orange
          gold: '#F4C430',       // Sunshine Daydream
          green: '#22C55E',      // Morning Dew green
          teal: '#14B8A6',       // Terrapin teal
          blue: '#3B82F6',       // Blue sky
          purple: '#8B5CF6',     // Sugar Magnolia purple
          pink: '#EC4899',       // Scarlet Begonias pink
        },
        // Keep psychedelic for backwards compatibility
        psychedelic: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          lime: '#84CC16',
          orange: '#E8833A',
          blue: '#3B82F6',
          yellow: '#F4C430',
        },
        cream: '#FDF6E3',         // Warmer vintage cream
        chocolate: '#4A2C2A',
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        groovy: ['"Pacifico"', 'cursive'],
        display: ['"Fredoka One"', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // Grateful Dead tie-dye - full spectrum rainbow
        'tie-dye': 'radial-gradient(circle at 20% 50%, rgba(200, 69, 54, 0.5) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(244, 196, 48, 0.5) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
        'rainbow': 'linear-gradient(90deg, #C84536, #E8833A, #F4C430, #22C55E, #3B82F6, #8B5CF6)',
        'rainbow-soft': 'linear-gradient(135deg, rgba(200, 69, 54, 0.3), rgba(244, 196, 48, 0.3), rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
        'groovy-gradient': 'linear-gradient(135deg, #C84536 0%, #E8833A 50%, #F4C430 100%)',
        'dead-gradient': 'linear-gradient(135deg, #C84536 0%, #8B5CF6 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'rainbow-shift': 'rainbow-shift 5s ease infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'melt': 'melt 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
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
      borderRadius: {
        'blob': '40% 60% 70% 30% / 40% 50% 60% 50%',
      },
      boxShadow: {
        'groovy': '0 4px 20px rgba(155, 89, 182, 0.3)',
        'groovy-lg': '0 8px 40px rgba(155, 89, 182, 0.4)',
        'neon-pink': '0 0 20px rgba(255, 105, 180, 0.5)',
        'neon-purple': '0 0 20px rgba(155, 89, 182, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
