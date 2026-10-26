import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Esse app cuida do site inteiro (início, login, cadastro, perfil, painel da
// equipe). O servidor-estatico.js serve essa build pra qualquer rota que não
// seja uma API nem um arquivo estático real (CSS/JS/imagens).
//
// 'base: /dist/' faz os assets (JS com hash) serem referenciados como
// /dist/assets/..., batendo com o caminho real do arquivo no disco
// (dist/assets/...). O HTML em si (dist/index.html) não é acessado por essa
// URL — o servidor lê o arquivo direto e devolve pra qualquer rota de página.
export default defineConfig({
  plugins: [react()],
  base: '/dist/',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    // No modo dev (npm run dev no app/), essas rotas são repassadas pro
    // servidor Node, pra conseguir usar a API e os arquivos do site (CSS, imagens).
    proxy: {
      '/api': 'http://localhost:5500',
      '/CSS': 'http://localhost:5500',
      '/JS': 'http://localhost:5500',
      '/imagens': 'http://localhost:5500'
    }
  }
});
