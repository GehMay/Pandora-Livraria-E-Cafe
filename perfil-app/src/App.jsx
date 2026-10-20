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

// Chamadas do painel da equipe que criam/editam/removem dados. O servidor
// confere no header 'x-usuario-email' se quem está logado é funcionário/admin.
async function enviarAdmin(url, metodo, emailUsuario, corpo) {
  const resposta = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', 'x-usuario-email': emailUsuario },
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Algo deu errado. Tente de novo.');
  }
  return dados;
}

function PaginaPerfil() {
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

function AbaPromocoes({ emailUsuario }) {
  const [promocoes, setPromocoes] = useState(null);
  const [emEdicao, setEmEdicao] = useState(null);
  const [form, setForm] = useState({ titulo: '', descricao: '', desconto: '' });
  const [mensagem, setMensagem] = useState(null);

  function carregar() {
    fetch('/api/admin/promocoes').then((r) => r.json()).then(setPromocoes).catch(() => setPromocoes([]));
  }

  useEffect(() => { carregar(); }, []);

  function iniciarEdicao(promocao) {
    setEmEdicao(promocao.id_promocao);
    setForm({ titulo: promocao.titulo, descricao: promocao.descricao, desconto: promocao.desconto });
  }

  function cancelarEdicao() {
    setEmEdicao(null);
    setForm({ titulo: '', descricao: '', desconto: '' });
  }

  async function salvar(evento) {
    evento.preventDefault();
    setMensagem(null);
    try {
      if (emEdicao) {
        await enviarAdmin(`/api/admin/promocoes/${emEdicao}`, 'PUT', emailUsuario, form);
        setMensagem({ texto: 'Promoção atualizada!', tipo: 'ok' });
      } else {
        await enviarAdmin('/api/admin/promocoes', 'POST', emailUsuario, form);
        setMensagem({ texto: 'Promoção criada!', tipo: 'ok' });
      }
      cancelarEdicao();
      carregar();
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  async function remover(id) {
    setMensagem(null);
    try {
      await enviarAdmin(`/api/admin/promocoes/${id}`, 'DELETE', emailUsuario);
      carregar();
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  return (
    <div className="admin-secao">
      <div className="admin-tabela-wrap">
        <table className="tabela-admin">
          <thead>
            <tr><th>Título</th><th>Desconto</th><th>Descrição</th><th></th></tr>
          </thead>
          <tbody>
            {promocoes === null && <tr><td colSpan="4">Carregando...</td></tr>}
            {promocoes?.length === 0 && <tr><td colSpan="4">Nenhuma promoção cadastrada.</td></tr>}
            {promocoes?.map((promocao) => (
              <tr key={promocao.id_promocao}>
                <td>{promocao.titulo}</td>
                <td><span className="badge badge-desconto">{promocao.desconto}</span></td>
                <td>{promocao.descricao}</td>
                <td className="admin-acoes">
                  <button type="button" className="btn-admin" onClick={() => iniciarEdicao(promocao)}>Editar</button>
                  <button type="button" className="btn-admin btn-admin-perigo" onClick={() => remover(promocao.id_promocao)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="admin-form" onSubmit={salvar}>
        <h3>{emEdicao ? 'Editar promoção' : 'Nova promoção'}</h3>
        <div className="form-grupo">
          <label htmlFor="promo-titulo">Título</label>
          <input id="promo-titulo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="promo-desconto">Desconto</label>
          <input id="promo-desconto" value={form.desconto} onChange={(e) => setForm({ ...form, desconto: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="promo-descricao">Descrição</label>
          <input id="promo-descricao" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
        </div>
        {mensagem && <p className={`form-mensagem form-mensagem-${mensagem.tipo}`}>{mensagem.texto}</p>}
        <div className="admin-acoes-form">
          <button type="submit" className="btn-submit">{emEdicao ? 'Salvar alterações' : 'Criar promoção'}</button>
          {emEdicao && <button type="button" className="btn-admin" onClick={cancelarEdicao}>Cancelar</button>}
        </div>
      </form>
    </div>
  );
}

function AbaLivros({ emailUsuario }) {
  const [livros, setLivros] = useState(null);
  const [emEdicao, setEmEdicao] = useState(null);
  const [form, setForm] = useState({ titulo: '', autor: '', categoria: '', preco: '', estoque: '' });
  const [mensagem, setMensagem] = useState(null);

  function carregar() {
    fetch('/api/admin/livros').then((r) => r.json()).then(setLivros).catch(() => setLivros([]));
  }

  useEffect(() => { carregar(); }, []);

  function iniciarEdicao(livro) {
    setEmEdicao(livro.id_livro);
    setForm({ titulo: livro.titulo, autor: livro.autor, categoria: livro.categoria, preco: livro.preco, estoque: livro.estoque });
  }

  function cancelarEdicao() {
    setEmEdicao(null);
    setForm({ titulo: '', autor: '', categoria: '', preco: '', estoque: '' });
  }

  async function salvar(evento) {
    evento.preventDefault();
    setMensagem(null);
    const dados = { ...form, preco: Number(form.preco), estoque: Number(form.estoque) };
    try {
      if (emEdicao) {
        await enviarAdmin(`/api/admin/livros/${emEdicao}`, 'PUT', emailUsuario, dados);
        setMensagem({ texto: 'Livro atualizado!', tipo: 'ok' });
      } else {
        await enviarAdmin('/api/admin/livros', 'POST', emailUsuario, dados);
        setMensagem({ texto: 'Livro cadastrado!', tipo: 'ok' });
      }
      cancelarEdicao();
      carregar();
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  async function remover(id) {
    setMensagem(null);
    try {
      await enviarAdmin(`/api/admin/livros/${id}`, 'DELETE', emailUsuario);
      carregar();
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  return (
    <div className="admin-secao">
      <div className="admin-tabela-wrap">
        <table className="tabela-admin">
          <thead>
            <tr><th>Título</th><th>Autor</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th></th></tr>
          </thead>
          <tbody>
            {livros === null && <tr><td colSpan="6">Carregando...</td></tr>}
            {livros?.length === 0 && <tr><td colSpan="6">Nenhum livro cadastrado.</td></tr>}
            {livros?.map((livro) => (
              <tr key={livro.id_livro}>
                <td>{livro.titulo}</td>
                <td>{livro.autor}</td>
                <td>{livro.categoria}</td>
                <td>R$ {Number(livro.preco).toFixed(2)}</td>
                <td>{livro.estoque ?? 0}</td>
                <td className="admin-acoes">
                  <button type="button" className="btn-admin" onClick={() => iniciarEdicao(livro)}>Editar</button>
                  <button type="button" className="btn-admin btn-admin-perigo" onClick={() => remover(livro.id_livro)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="admin-form" onSubmit={salvar}>
        <h3>{emEdicao ? 'Editar livro' : 'Adicionar livro'}</h3>
        <div className="form-grupo">
          <label htmlFor="livro-titulo">Título</label>
          <input id="livro-titulo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="livro-autor">Autor</label>
          <input id="livro-autor" value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="livro-categoria">Categoria</label>
          <input id="livro-categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="livro-preco">Preço (R$)</label>
          <input id="livro-preco" type="number" step="0.01" min="0" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="livro-estoque">Estoque</label>
          <input id="livro-estoque" type="number" step="1" min="0" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: e.target.value })} required />
        </div>
        {mensagem && <p className={`form-mensagem form-mensagem-${mensagem.tipo}`}>{mensagem.texto}</p>}
        <div className="admin-acoes-form">
          <button type="submit" className="btn-submit">{emEdicao ? 'Salvar alterações' : 'Cadastrar livro'}</button>
          {emEdicao && <button type="button" className="btn-admin" onClick={cancelarEdicao}>Cancelar</button>}
        </div>
      </form>
    </div>
  );
}

function AbaEmprestimos({ emailUsuario }) {
  const [emprestimos, setEmprestimos] = useState(null);
  const [livrosDisponiveis, setLivrosDisponiveis] = useState([]);
  const [form, setForm] = useState({ id_livro: '', nome_cliente: '', contato_cliente: '', data_prevista_devolucao: '' });
  const [mensagem, setMensagem] = useState(null);

  function carregar() {
    fetch('/api/admin/emprestimos').then((r) => r.json()).then(setEmprestimos).catch(() => setEmprestimos([]));
    fetch('/api/admin/livros')
      .then((r) => r.json())
      .then((livros) => setLivrosDisponiveis(livros.filter((l) => (l.estoque ?? 0) > 0)))
      .catch(() => setLivrosDisponiveis([]));
  }

  useEffect(() => { carregar(); }, []);

  async function registrar(evento) {
    evento.preventDefault();
    setMensagem(null);
    try {
      await enviarAdmin('/api/admin/emprestimos', 'POST', emailUsuario, { ...form, id_livro: Number(form.id_livro) });
      setMensagem({ texto: 'Empréstimo registrado!', tipo: 'ok' });
      setForm({ id_livro: '', nome_cliente: '', contato_cliente: '', data_prevista_devolucao: '' });
      carregar();
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  async function devolver(id) {
    setMensagem(null);
    try {
      await enviarAdmin(`/api/admin/emprestimos/${id}/devolver`, 'POST', emailUsuario);
      carregar();
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  return (
    <div className="admin-secao">
      <div className="admin-tabela-wrap">
        <table className="tabela-admin">
          <thead>
            <tr><th>Livro</th><th>Cliente</th><th>Empréstimo</th><th>Devolução prevista</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {emprestimos === null && <tr><td colSpan="6">Carregando...</td></tr>}
            {emprestimos?.length === 0 && <tr><td colSpan="6">Nenhum empréstimo registrado.</td></tr>}
            {emprestimos?.map((emprestimo) => (
              <tr key={emprestimo.id_emprestimo}>
                <td>{emprestimo.titulo_livro}</td>
                <td>{emprestimo.nome_cliente}{emprestimo.contato_cliente ? ` (${emprestimo.contato_cliente})` : ''}</td>
                <td>{emprestimo.data_emprestimo}</td>
                <td>{emprestimo.data_prevista_devolucao}</td>
                <td><span className={`badge badge-${emprestimo.status}`}>{emprestimo.status}</span></td>
                <td className="admin-acoes">
                  {emprestimo.status !== 'devolvido' && (
                    <button type="button" className="btn-admin" onClick={() => devolver(emprestimo.id_emprestimo)}>Marcar devolvido</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="admin-form" onSubmit={registrar}>
        <h3>Novo empréstimo</h3>
        <div className="form-grupo">
          <label htmlFor="emp-livro">Livro</label>
          <select id="emp-livro" value={form.id_livro} onChange={(e) => setForm({ ...form, id_livro: e.target.value })} required>
            <option value="" disabled>Selecione um livro com estoque</option>
            {livrosDisponiveis.map((livro) => (
              <option key={livro.id_livro} value={livro.id_livro}>{livro.titulo} (estoque: {livro.estoque})</option>
            ))}
          </select>
        </div>
        <div className="form-grupo">
          <label htmlFor="emp-nome">Nome do cliente</label>
          <input id="emp-nome" value={form.nome_cliente} onChange={(e) => setForm({ ...form, nome_cliente: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="emp-contato">Contato (e-mail ou telefone)</label>
          <input id="emp-contato" value={form.contato_cliente} onChange={(e) => setForm({ ...form, contato_cliente: e.target.value })} />
        </div>
        <div className="form-grupo">
          <label htmlFor="emp-data">Devolução prevista</label>
          <input id="emp-data" type="date" value={form.data_prevista_devolucao} onChange={(e) => setForm({ ...form, data_prevista_devolucao: e.target.value })} required />
        </div>
        {mensagem && <p className={`form-mensagem form-mensagem-${mensagem.tipo}`}>{mensagem.texto}</p>}
        <button type="submit" className="btn-submit">Registrar empréstimo</button>
      </form>
    </div>
  );
}

const ABAS_PAINEL = [
  { id: 'promocoes', rotulo: 'Promoções' },
  { id: 'livros', rotulo: 'Biblioteca' },
  { id: 'emprestimos', rotulo: 'Empréstimos' }
];

function PaginaPainelEquipe() {
  const [usuario, setUsuario] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('promocoes');

  useEffect(() => {
    const sessao = lerSessao();
    if (!sessao || !['funcionario', 'admin'].includes(sessao.tipo)) {
      window.location.href = '/login.html';
      return;
    }

    setUsuario(sessao);
  }, []);

  if (!usuario) return null;

  const primeiroNome = String(usuario.nome || '').split(' ')[0];

  return (
    <>
      <header className="cabecalho">
        <a href="/index.html" className="cabecalho_logo" aria-label="Página inicial">
          <img src="/imagens/logo.svg" alt="Logo Pandora Livraria & Café" />
        </a>
        <a href="/index.html" className="link-home">
          <p>Pandora Livraria & Café</p>
        </a>
        <nav className="cabecalho_nav">
          <p>Painel da equipe</p>
        </nav>
        <div className="cabecalho_acoes">
          <span className="cabecalho_saudacao">Olá, {primeiroNome} · Equipe</span>
          <button type="button" className="btn-login" onClick={sair}>Sair</button>
        </div>
      </header>

      <main className="container">
        <div className="admin-painel">
          <h2>Painel da Equipe</h2>

          <nav className="admin-tabs">
            {ABAS_PAINEL.map((aba) => (
              <button
                key={aba.id}
                type="button"
                className={`admin-tab${abaAtiva === aba.id ? ' admin-tab-ativa' : ''}`}
                onClick={() => setAbaAtiva(aba.id)}
              >
                {aba.rotulo}
              </button>
            ))}
          </nav>

          {abaAtiva === 'promocoes' && <AbaPromocoes emailUsuario={usuario.email} />}
          {abaAtiva === 'livros' && <AbaLivros emailUsuario={usuario.email} />}
          {abaAtiva === 'emprestimos' && <AbaEmprestimos emailUsuario={usuario.email} />}
        </div>
      </main>

      <footer className="rodape">
        <p>&copy; 2024 Pandora Livraria & Café - Todos os direitos reservados.</p>
      </footer>
    </>
  );
}

function PaginaTeste({ script, corFundo, canvas = false }) {
  useEffect(() => {
    const estilosAnteriores = {
      backgroundColor: document.body.style.backgroundColor,
      margin: document.body.style.margin,
      overflow: document.body.style.overflow
    };

    document.body.style.backgroundColor = corFundo;
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    if (!window.pandoraScriptTeste) {
      const elementoScript = document.createElement('script');
      elementoScript.src = script;
      window.pandoraScriptTeste = elementoScript;
      document.body.appendChild(elementoScript);
    }

    return () => {
      Object.assign(document.body.style, estilosAnteriores);
    };
  }, [script, corFundo]);

  return canvas ? <canvas id="meuCanvas" style={{ display: 'block' }} /> : null;
}

export default function App() {
  const caminho = window.location.pathname;

  useEffect(() => {
    if (caminho === '/painel-funcionario.html') {
      document.title = 'Painel da Equipe - Pandora Livraria & Café';
    } else if (caminho === '/testes.html') {
      document.title = 'Teste Mágico';
    } else if (caminho === '/teste-canvas.html') {
      document.title = 'Canvas Mágico';
    }
  }, [caminho]);

  if (caminho === '/painel-funcionario.html') return <PaginaPainelEquipe />;
  if (caminho === '/testes.html') {
    return <PaginaTeste script="/JS/magica.js" corFundo="#2f5225" />;
  }
  if (caminho === '/teste-canvas.html') {
    return <PaginaTeste script="/JS/canvas.js" corFundo="#0a0a1a" canvas />;
  }

  return <PaginaPerfil />;
}
