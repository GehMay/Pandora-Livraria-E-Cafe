import { useEffect } from 'react';

// Troca a cor de fundo da página enquanto o teste estiver aberto, e desfaz
// ao sair (mesmo comportamento que já existia antes da migração).
function usarFundoTeste(cor) {
  useEffect(() => {
    const anterior = {
      backgroundColor: document.body.style.backgroundColor,
      margin: document.body.style.margin,
      overflow: document.body.style.overflow
    };

    document.body.style.backgroundColor = cor;
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      Object.assign(document.body.style, anterior);
    };
  }, [cor]);
}

export function PaginaTesteMagica() {
  usarFundoTeste('#2f5225');

  useEffect(() => {
    document.title = 'Teste Mágico';
    if (window.pandoraScriptMagica) return;
    const script = document.createElement('script');
    script.src = '/JS/magica.js';
    window.pandoraScriptMagica = script;
    document.body.appendChild(script);
  }, []);

  return null;
}

// O brilho do cursor (JS/canvas.js) já roda em toda a página desde o
// index.html do app, então essa rota só precisa do fundo escuro pra exibi-lo.
export function PaginaTesteCanvas() {
  usarFundoTeste('#0a0a1a');

  useEffect(() => {
    document.title = 'Canvas Mágico';
  }, []);

  return null;
}
