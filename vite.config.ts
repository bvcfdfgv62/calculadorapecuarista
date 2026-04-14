import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild',
    // Disable sourcemaps in production — prevents exposing original source code
    sourcemap: false,
    // Modern target = smaller, faster bundles
    target: 'es2020',
    // Warn if any chunk exceeds 500KB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('lucide-react') || id.includes('framer-motion')) return 'vendor-ui'
            if (id.includes('recharts')) return 'vendor-charts'
            return 'vendor'
          }
        },
      },
    },
  },
})

