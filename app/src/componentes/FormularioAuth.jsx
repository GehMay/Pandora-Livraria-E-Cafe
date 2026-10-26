import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { enviarParaApi } from '../api.js';
import { salvarSessao, paginaDaConta } from '../sessao.js';

// Formulário de login/cadastro — reaproveitado pelas duas páginas, já que a
// única diferença real é o endpoint e os campos extras do cadastro.
export default function FormularioAuth({ tipo }) {
  const ehCadastro = tipo === 'cadastro';
  const navigate = useNavigate();
  const [campos, setCampos] = useState(
    ehCadastro ? { nome: '', email: '', senha: '' } : { email: '', senha: '' }
  );
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function atualizarCampo(nome, valor) {
    setCampos((anterior) => ({ ...anterior, [nome]: valor }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setMensagem(null);

    try {
      let resultado = await enviarParaApi(ehCadastro ? '/api/cadastro' : '/api/login', campos);

      // Depois de criar a conta, já entra direto.
      if (ehCadastro) {
        resultado = await enviarParaApi('/api/login', { email: campos.email, senha: campos.senha });
      }

      salvarSessao(resultado.usuario);
      setMensagem({ texto: 'Tudo certo! Entrando...', tipo: 'ok' });
      setTimeout(() => navigate(paginaDaConta(resultado.usuario)), 700);
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
      setEnviando(false);
    }
  }

  return (
    <div className="form-container">
      <h2>{ehCadastro ? 'Criar Conta' : 'Entrar'}</h2>
      <form onSubmit={enviar}>
        {ehCadastro && (
          <div className="form-grupo">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              required
              placeholder="Seu nome bruxo"
              value={campos.nome}
              onChange={(e) => atualizarCampo('nome', e.target.value)}
            />
          </div>
        )}
        <div className="form-grupo">
          <label htmlFor="email">E-mail Bruxo</label>
          <input
            type="email"
            id="email"
            required
            placeholder="bruxo@hogwarts.com"
            value={campos.email}
            onChange={(e) => atualizarCampo('email', e.target.value)}
          />
        </div>
        <div className="form-grupo">
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            required
            placeholder={ehCadastro ? 'Crie uma senha forte' : 'Sua senha secreta'}
            value={campos.senha}
            onChange={(e) => atualizarCampo('senha', e.target.value)}
          />
        </div>
        {mensagem && <p className={`form-mensagem form-mensagem-${mensagem.tipo}`}>{mensagem.texto}</p>}
        <button type="submit" className="btn-submit" disabled={enviando}>
          {enviando ? 'Aguarde...' : ehCadastro ? 'Criar Conta Mágica' : 'Acessar Cofre'}
        </button>
      </form>
      {ehCadastro ? (
        <Link to="/login" className="form-link">Já tem uma conta? Entre aqui!</Link>
      ) : (
        <Link to="/cadastro" className="form-link">Ainda não tem conta? Crie uma agora!</Link>
      )}
    </div>
  );
}
