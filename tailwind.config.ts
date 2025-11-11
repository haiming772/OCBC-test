import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocbc: {
          red: '#D4000F',
          dark: '#A3000B'
        },
        gray: {
          950: '#111111'
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Work Sans"', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl: '1.25rem'
      },
      boxShadow: {
        card: '0 20px 45px rgba(17, 17, 17, 0.05)'
      }
    }
  },
  plugins: []
};

export default config;
