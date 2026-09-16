import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  base: '/100-days-of-react-001-pomodoro/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
