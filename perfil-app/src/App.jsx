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

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [destaques, setDestaques] = useState(null); // null = ainda carregando

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

  useEffect(() => {
    if (!usuario) return; // só busca depois de confirmar a sessão

    fetch('/api/destaques')
      .then((resposta) => resposta.json())
      .then((dados) => setDestaques(dados.maisAvaliados))
      .catch(() => setDestaques([]));
  }, [usuario]);

  if (!usuario) {
    return null; // Ainda checando a sessão ou redirecionando
  }

  const primeiroNome = String(usuario.nome || '').split(' ')[0];

  return (
    <>
      <header className="cabecalho">
        <div className="cabecalho_logo">
          <img src="/imagens/logo.svg" alt="Logo Pandora Livraria & Café" />
        </div>
        <p>Pandora Livraria & Café</p>
        <nav className="cabecalho_nav">
          <p>Sua conta mágica</p>
        </nav>
        <div className="cabecalho_acoes">
          <button type="button" className="btn-login" onClick={sair}>Sair</button>
        </div>
      </header>

      <main className="container">
        <h1 className="titulo-pagina">Olá, {primeiroNome}!</h1>

        <div className="secao-vitrine">
          <div className="card card-padding">
            <h3 className="secao-titulo">Destaques para Você</h3>
            <div className="cards-grid cards-grid-interno">
              {destaques === null && <p>Carregando destaques...</p>}
              {destaques?.slice(0, 3).map((livro) => (
                <article className="card-interno" key={livro.id_livro}>
                  <div className="card-banner" aria-hidden="true">📚</div>
                  <div className="card-body">
                    <h6 className="book-title">{livro.titulo}</h6>
                    <span className="badge">{livro.categoria}</span>
                    <p className="card-descricao">
                      Autor: {livro.autor} <br />
                      Preço: R$ {livro.preco}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="rodape">
        <p>&copy; 2024 Pandora Livraria & Café - Todos os direitos reservados.</p>
      </footer>
    </>
  );
}
