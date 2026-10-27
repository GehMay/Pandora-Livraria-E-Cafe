import { useState } from 'react';
import { enviarAdmin } from '../api.js';
import { salvarSessao } from '../sessao.js';

// Editar nome/e-mail e trocar senha da própria conta — reaproveitado tanto
// pelo cliente (/perfil) quanto pela equipe (painel), já que a lógica é a
// mesma pra qualquer tipo de conta (rotas /api/conta e /api/conta/senha).
export default function EditarConta({ usuario }) {
  const [form, setForm] = useState({ nome: usuario.nome, email: usuario.email });
  const [mensagemPerfil, setMensagemPerfil] = useState(null);
  const [senhas, setSenhas] = useState({ senhaAtual: '', novaSenha: '' });
  const [mensagemSenha, setMensagemSenha] = useState(null);

  async function salvarPerfil(evento) {
    evento.preventDefault();
    setMensagemPerfil(null);
    try {
      const resultado = await enviarAdmin('/api/conta', 'PUT', usuario.token, form);
      salvarSessao({ ...resultado.usuario, token: usuario.token });
      setMensagemPerfil({ texto: 'Perfil atualizado! Atualizando a página...', tipo: 'ok' });
      setTimeout(() => window.location.reload(), 800);
    } catch (erro) {
      setMensagemPerfil({ texto: erro.message, tipo: 'erro' });
    }
  }

  async function trocarSenha(evento) {
    evento.preventDefault();
    setMensagemSenha(null);
    try {
      await enviarAdmin('/api/conta/senha', 'PUT', usuario.token, senhas);
      setMensagemSenha({ texto: 'Senha atualizada!', tipo: 'ok' });
      setSenhas({ senhaAtual: '', novaSenha: '' });
    } catch (erro) {
      setMensagemSenha({ texto: erro.message, tipo: 'erro' });
    }
  }

  return (
    <div className="admin-secao">
      <form className="admin-form" onSubmit={salvarPerfil}>
        <h3>Meus dados</h3>
        <div className="form-grupo">
          <label htmlFor="conta-nome">Nome</label>
          <input id="conta-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="conta-email">E-mail</label>
          <input id="conta-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        {mensagemPerfil && <p className={`form-mensagem form-mensagem-${mensagemPerfil.tipo}`}>{mensagemPerfil.texto}</p>}
        <button type="submit" className="btn-submit">
          <span className="material-symbols-outlined" aria-hidden="true">save</span>Salvar dados
        </button>
      </form>

      <form className="admin-form" onSubmit={trocarSenha}>
        <h3>Trocar senha</h3>
        <div className="form-grupo">
          <label htmlFor="conta-senha-atual">Senha atual</label>
          <input
            id="conta-senha-atual"
            type="password"
            value={senhas.senhaAtual}
            onChange={(e) => setSenhas({ ...senhas, senhaAtual: e.target.value })}
            required
          />
        </div>
        <div className="form-grupo">
          <label htmlFor="conta-senha-nova">Nova senha</label>
          <input
            id="conta-senha-nova"
            type="password"
            value={senhas.novaSenha}
            onChange={(e) => setSenhas({ ...senhas, novaSenha: e.target.value })}
            required
          />
        </div>
        {mensagemSenha && <p className={`form-mensagem form-mensagem-${mensagemSenha.tipo}`}>{mensagemSenha.texto}</p>}
        <button type="submit" className="btn-submit">
          <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>Trocar senha
        </button>
      </form>
    </div>
  );
}
