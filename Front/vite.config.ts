import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/vitest.setup.ts',
    css: true,
    watch: false,
  },
  optimizeDeps: {
    include: ['react-pdf', 'react-pdftotext']
  },
  build: {
    commonjsOptions: {
      include: [/react-pdf/, /node_modules/, /react-pdftotext/]
    }
  }
})


  /*server: {
    proxy: {
        '/api': {
            target: 'https://duckduckgo.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
        },
    },
  },*/
  /*server: {
    host: true, // Allows access from outside the container
    port: 5173, // Change this if needed
  },*/