import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Eu uso caminhos relativos para o site funcionar tanto no domínio
  // raiz quanto no GitHub Pages (github.io/mo-cursos/).
  base: './',
  plugins: [react()],
})
