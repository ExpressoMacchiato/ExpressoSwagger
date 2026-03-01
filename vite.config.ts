import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    base: './', // FONDAMENTALE: rende i percorsi degli asset relativi (es. ./assets/ invece di /assets/)
    build: {
        outDir: 'dist/ui', // Cartella per la UI compilata
        emptyOutDir: true,
    },
    server: {
        port: 3000,
        open: true
    }
});
