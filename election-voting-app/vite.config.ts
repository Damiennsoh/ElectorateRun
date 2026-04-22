import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    allowedHosts: ['sb-6rfei6bcb9ey.vercel.run', 'localhost'],
  },
})
