import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 53017,
        proxy: {
            '/api': {
                target: 'http://localhost:5169',
                changeOrigin: true
            }
        }
    }
})