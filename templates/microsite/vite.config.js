import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths so microsites work when proxied
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true
  }
})
