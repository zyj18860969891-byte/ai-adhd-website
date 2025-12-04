import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, readdirSync, mkdirSync } from 'fs'
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
          
          // Copy icons to dist root
          const iconsDir = join(__dirname, 'icons')
          if (existsSync(iconsDir)) {
            const icons = readdirSync(iconsDir)
            icons.forEach(icon => {
              copyFileSync(
                join(iconsDir, icon),
                join(distDir, icon)
              )
            })
            console.log(`Copied ${icons.length} icons to dist directory`)
          }
          
          // Copy manifest.json to dist root
          copyFileSync(
            join(__dirname, 'manifest.json'),
            join(distDir, 'manifest.json')
          )
          console.log('Copied manifest.json to dist directory')
        } catch (error) {
          console.warn('Failed to copy static files:', error.message)
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