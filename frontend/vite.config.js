import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        // On proxifie les appels API vers le backend en développement pour éviter les problèmes CORS
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
