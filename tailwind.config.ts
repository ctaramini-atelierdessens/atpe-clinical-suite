import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7ff',
          100: '#e8efff',
          200: '#d2ddff',
          300: '#b0c4ff',
          400: '#8aa2ff',
          500: '#657efc',
          600: '#4f61f0',
          700: '#414bd6',
          800: '#3640ad',
          900: '#303b89',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}

export default config