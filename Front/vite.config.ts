import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
})
