/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './theme.config.tsx'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
        secondary: '#722ed1',
        // Material Design 3 风格的设计令牌
        surface: '#ffffff',
        'surface-container-low': '#f5f5f5',
        'surface-container-highest': '#e0e0e0',
        'primary-container': '#dbeafe',
        'on-primary': '#ffffff',
        'on-surface': '#1f2937',
        'outline-variant': '#d1d5db',
      }
    }
  },
  plugins: []
}
