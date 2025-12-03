import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-static-files',
      closeBundle() {
        // Copy sw.js to dist root after build
        try {
          const distDir = join(__dirname, 'dist')
          if (!existsSync(distDir)) {
            console.warn('Dist directory does not exist')
            return
          }
          
          copyFileSync(
            join(__dirname, 'src/sw.js'),
            join(distDir, 'sw.js')
          )
          console.log('Copied sw.js to dist directory')
        } catch (error) {
          console.warn('Failed to copy sw.js:', error.message)
        }
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    global: 'globalThis'
  }
})