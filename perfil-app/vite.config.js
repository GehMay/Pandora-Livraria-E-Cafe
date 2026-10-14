import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O app React cuida das páginas fora da entrada, login e cadastro.
// O servidor-estatico.js direciona as rotas da aplicação para este build.
export default defineConfig({
  plugins: [react()],
  base: '/perfil/',
  build: {
    outDir: '../perfil',
    emptyOutDir: true
  },
  server: {
    // No modo dev (npm run dev), essas rotas são repassadas pro servidor
    // Node, pra conseguir usar a API de login e os arquivos do site (CSS, imagens).
    proxy: {
      '/api': 'http://localhost:5500',
      '/CSS': 'http://localhost:5500',
      '/imagens': 'http://localhost:5500'
    }
  }
});
