import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  // En GitHub Pages (y al revisar la versión final con npm run preview) la web vive en
  // /mexican-club-kitchen/; mientras programas con npm run dev, en la raíz
  base: command === 'build' || isPreview ? '/mexican-club-kitchen/' : '/',
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
