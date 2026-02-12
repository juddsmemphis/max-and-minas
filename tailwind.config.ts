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
        psychedelic: {
          purple: '#9B59B6',
          pink: '#FF69B4',
          lime: '#BFFF00',
          orange: '#FF8C42',
          blue: '#00CED1',
          yellow: '#FFD700',
        },
        cream: '#FFF8DC',
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
        'tie-dye': 'radial-gradient(circle at 20% 50%, rgba(155, 89, 182, 0.6) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 105, 180, 0.6) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(191, 255, 0, 0.4) 0%, transparent 50%)',
        'rainbow': 'linear-gradient(90deg, #9B59B6, #FF69B4, #BFFF00, #FF8C42, #00CED1)',
        'rainbow-soft': 'linear-gradient(135deg, rgba(155, 89, 182, 0.3), rgba(255, 105, 180, 0.3), rgba(191, 255, 0, 0.2), rgba(255, 140, 66, 0.3), rgba(0, 206, 209, 0.3))',
        'groovy-gradient': 'linear-gradient(135deg, #9B59B6 0%, #FF69B4 50%, #FF8C42 100%)',
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
