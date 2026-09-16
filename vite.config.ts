import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/100-days-of-react-001-pomodoro/',
  plugins: [react()],
})
