import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b0f1a',
        paper: '#f7f4ef',
        copper: '#c46b3c',
        teal: '#0f766e',
        sun: '#f4b860'
      }
    }
  },
  plugins: []
}

export default config
