import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Dos páginas: la web pública y el panel del administrador
      input: {
        principal: 'index.html',
        admin: 'admin.html',
      },
    },
  },
})
