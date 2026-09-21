import { useEffect, useState } from 'react';

// Mesma chave e mesmo formato de sessão que o JS/auth.js usa no resto do site,
// assim as duas partes (HTML puro e React) continuam enxergando o mesmo login.
const CHAVE_SESSAO = 'pandoraUsuario';

function lerSessao() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
  } catch {
    return null;
  }
}

function sair() {
  try {
    localStorage.removeItem(CHAVE_SESSAO);
  } catch {
    // sem armazenamento, nada a limpar
  }
  window.location.href = '/index.html';
}

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const sessao = lerSessao();

    if (!sessao) {
      window.location.href = '/login.html';
      return;
    }

    // Funcionário/admin não usa essa página, e sim o painel da equipe.
    if (sessao.tipo === 'funcionario' || sessao.tipo === 'admin') {
      window.location.href = '/painel-funcionario.html';
      return;
    }

    setUsuario(sessao);
  }, []);

  if (!usuario) {
    return null; // Ainda checando a sessão ou redirecionando
  }

  const primeiroNome = String(usuario.nome || '').split(' ')[0];

  return (
    <>
      <header className="cabecalho">
        <a href="/index.html" className="cabecalho_logo" aria-label="Página inicial">
          <img src="/imagens/logo.svg" alt="Logo Pandora Livraria & Café" />
        </a>
        <a className="cabecalho_titulo">
          <p>Pandora Livraria & Café</p>
        </a>
        <nav className="cabecalho_nav">
          <p>Sua conta mágica</p>
        </nav>
        <div className="cabecalho_acoes">
          <button type="button" className="btn-login" onClick={sair}>Sair</button>
        </div>
      </header>

      <main className="container">
        <div className="form-container">
          <h2>Olá, {primeiroNome}!</h2>

          <div className="form-grupo">
            <label>Nome completo</label>
            <p>{usuario.nome}</p>
          </div>
          <div className="form-grupo">
            <label>E-mail</label>
            <p>{usuario.email}</p>
          </div>
          <div className="form-grupo">
            <label>Membro desde</label>
            <p>{formatarData(usuario.criadoEm)}</p>
          </div>

          <a href="/index.html" className="form-link">Voltar</a>
        </div>
      </main>

      <footer className="rodape">
        <p>&copy; 2024 Pandora Livraria & Café - Todos os direitos reservados.</p>
      </footer>
    </>
  );
}
