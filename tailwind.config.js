/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#100F0C',
        abyss: '#15120E',
        panel: '#1B1813',
        panel2: '#221E17',
        edge: 'rgba(201, 169, 97, 0.10)',
        edgec: 'rgba(201, 169, 97, 0.18)',
        synapse: '#C9A961',
        neural: '#B5653A',
        goldspark: '#C98A2C',
        mint: '#7D8B5A',
        ink: '#EDE3D0',
        mute: '#A09381',
        dim: '#6E6557',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['"Newsreader"', 'serif'],
      },
      boxShadow: {
        glowcyan: '0 0 22px rgba(201,169,97,0.32), 0 0 60px rgba(201,169,97,0.12)',
        glowmagenta: '0 0 22px rgba(181,101,58,0.38), 0 0 60px rgba(181,101,58,0.14)',
        panel: '0 18px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        pulsedot: {
          '0%,100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(125,139,90,0.6)' },
          '50%': { opacity: '0.55', boxShadow: '0 0 0 6px rgba(125,139,90,0)' },
        },
        flicker: {
          '0%,100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.4' },
          '94%': { opacity: '1' },
          '97%': { opacity: '0.6' },
          '98%': { opacity: '1' },
        },
        bootbar: {
          '0%': { width: '4%' },
          '35%': { width: '42%' },
          '70%': { width: '78%' },
          '100%': { width: '100%' },
        },
        risein: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dashspin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        scanline: 'scanline 9s linear infinite',
        pulsedot: 'pulsedot 2.2s ease-in-out infinite',
        flicker: 'flicker 7s linear infinite',
        bootbar: 'bootbar 1.6s cubic-bezier(0.22,1,0.36,1) forwards',
        risein: 'risein 0.7s cubic-bezier(0.22,1,0.36,1) both',
        dashspin: 'dashspin 14s linear infinite',
      },
    },
  },
  plugins: [],
}
