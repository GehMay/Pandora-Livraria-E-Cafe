// ═══════════════════════════════════════════════════════════════
// SESSÕES DE LOGIN (servidor)
//
// Em vez de confiar no que o navegador diz que é (como era antes,
// guardando o usuário inteiro no localStorage), o servidor agora
// gera um token aleatório no login e guarda, só pra ele, quem é o
// dono daquele token. O navegador só recebe o token, dentro de um
// cookie HttpOnly (JavaScript da página não consegue ler esse cookie,
// o que bloqueia um ataque comum de roubo de sessão via XSS).
//
// As sessões ficam em memória (um Map), não em arquivo ou MySQL:
// são passageiras por natureza, então reiniciar o servidor apenas
// desloga todo mundo — ninguém "vira admin" só editando um arquivo.
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');

const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

const sessoes = new Map(); // token -> { usuarioId, expiraEm }

function criarSessao(usuarioId) {
  const token = crypto.randomBytes(32).toString('hex');
  sessoes.set(token, { usuarioId, expiraEm: Date.now() + DURACAO_SESSAO_MS });
  return token;
}

function obterUsuarioIdDaSessao(token) {
  if (!token) return null;

  const sessao = sessoes.get(token);
  if (!sessao) return null;

  if (Date.now() > sessao.expiraEm) {
    sessoes.delete(token);
    return null;
  }

  return sessao.usuarioId;
}

function destruirSessao(token) {
  sessoes.delete(token);
}

module.exports = { criarSessao, obterUsuarioIdDaSessao, destruirSessao, DURACAO_SESSAO_MS };
