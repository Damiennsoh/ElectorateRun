import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Allow hosted preview/proxy hosts (Vercel preview IPs/hosts)
    // Use 'all' in CI/preview environments so Vercel's preview host isn't rejected.
    // See: https://vitejs.dev/config/server-options.html#server-allowedhosts
    allowedHosts: 'all',
  },
})
