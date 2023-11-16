import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        'like-green': {
          50: '#f2fdf9',
          100: '#d7ecec',
          200: '#aaf1e7',
          300: '#50e2c3',
          400: '#32cdb6',
          500: '#19b3a6',
          600: '#12918b',
          700: '#28646e',
          800: '#2a5360',
          900: '#274453',
          950: '#152937'
        }
      }
    }
  }
}
