import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(),tailwindcss()],

    server: {
        port: 5173,
        open: true,
        host: true,        // Expose to network
        allowedHosts: true,
        proxy: {
            '/api': {
                target: 'http://localhost:5001',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:5001',
                ws: true,
                changeOrigin: true,
            }
        }
    }
})