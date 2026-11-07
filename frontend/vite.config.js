import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // En GitHub Pages la web vive en /mexican-club-kitchen/; en tu computador, en la raíz
  base: command === 'build' ? '/mexican-club-kitchen/' : '/',
  build: {
    rollupOptions: {
      // Dos páginas: la web pública y el panel del administrador
      input: {
        principal: 'index.html',
        admin: 'admin.html',
      },
    },
  },
}))
