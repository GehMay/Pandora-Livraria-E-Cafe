// Tema (claro/escuro) e efeitos mágicos (ligado/desligado): preferências do
// navegador, sem relação com a conta. Mesmo padrão de sessao.js — guardadas
// no localStorage, aplicadas como atributo na tag <html> pra o CSS reagir
// via seletor (`:root[data-theme="light"]`, `[data-efeitos="off"]`).
// A aplicação inicial (antes do React montar) acontece num script inline em
// app/index.html, pra não piscar o tema errado no primeiro quadro.
export const CHAVE_TEMA = 'pandoraTema';
export const CHAVE_EFEITOS = 'pandoraEfeitos';

export function lerTema() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function salvarTema(tema) {
  document.documentElement.dataset.theme = tema;
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    // sem armazenamento, só vale pra essa visita
  }
}

export function lerEfeitos() {
  return document.documentElement.dataset.efeitos === 'off' ? 'off' : 'on';
}

export function salvarEfeitos(valor) {
  document.documentElement.dataset.efeitos = valor;
  try {
    localStorage.setItem(CHAVE_EFEITOS, valor);
  } catch {
    // sem armazenamento, só vale pra essa visita
  }
}
