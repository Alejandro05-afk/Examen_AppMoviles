/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        accent: '#FF6584',
        background: '#FFFFFF',
        backgroundHover: '#F8FAFC',
        color: '#1A1A1A',
        colorMuted: '#64748B',
        borderColor: '#E2E8F0',
      },
    },
  },
  plugins: [],
}

