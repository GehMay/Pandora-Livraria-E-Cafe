// Guarda no navegador quem entrou (inclui o token assinado emitido no
// login/cadastro, usado em toda chamada autenticada — ver api.js). O
// <RotaProtegida> só cuida da navegação; quem realmente valida a identidade
// é o servidor, conferindo a assinatura do token a cada requisição.
export const CHAVE_SESSAO = 'pandoraUsuario';

export function lerSessao() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
  } catch {
    return null;
  }
}

export function salvarSessao(usuario) {
  try {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
  } catch {
    // sem armazenamento, segue sem guardar a sessão
  }
}

export function sair() {
  try {
    localStorage.removeItem(CHAVE_SESSAO);
  } catch {
    // sem armazenamento, nada a limpar
  }
  window.location.href = '/';
}

// Cliente e equipe (funcionário/admin) caem em páginas diferentes depois de entrar.
export function paginaDaConta(usuario) {
  return ['funcionario', 'admin'].includes(usuario.tipo) ? '/painel-funcionario' : '/perfil';
}
