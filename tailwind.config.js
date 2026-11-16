/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#091211',
        abyss: '#0D1917',
        panel: '#122422',
        panel2: '#182E2B',
        edge: 'rgba(20, 184, 166, 0.15)',
        edgec: 'rgba(20, 184, 166, 0.35)',
        synapse: '#14B8A6',
        neural: '#0F766E',
        teal: '#14B8A6',
        tealDark: '#0D5F59',
        amber: '#D97706',
        crimson: '#E11D48',
        veinBlue: '#2563EB',
        ink: '#F6F3E9',
        mute: '#A3B1AF',
        dim: '#526E69',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['"Newsreader"', 'serif'],
      },
      boxShadow: {
        glowteal: '0 0 25px rgba(20,184,166,0.35), 0 0 60px rgba(20,184,166,0.15)',
        glowamber: '0 0 25px rgba(217,119,6,0.4), 0 0 60px rgba(217,119,6,0.15)',
        panel: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.08)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.14)' },
          '70%': { transform: 'scale(1)' },
        },
        pulsedot: {
          '0%,100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(20,184,166,0.6)' },
          '50%': { opacity: '0.55', boxShadow: '0 0 0 8px rgba(20,184,166,0)' },
        },
      },
      animation: {
        heartbeat: 'heartbeat 1.1s ease-in-out infinite',
        pulsedot: 'pulsedot 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
