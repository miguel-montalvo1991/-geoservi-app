import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // plugin de Tailwind

export default defineConfig({
  // Mantén tus plugins actuales y agrega tailwindcss()
  plugins: [react(), tailwindcss()],
})