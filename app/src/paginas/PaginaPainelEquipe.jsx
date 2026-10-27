import { useEffect, useState } from 'react';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import EditarConta from '../componentes/EditarConta.jsx';
import Breadcrumb from '../componentes/Breadcrumb.jsx';
import { lerSessao } from '../sessao.js';
import { enviarAdmin } from '../api.js';

function AbaPromocoes({ token }) {
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
        await enviarAdmin(`/api/admin/promocoes/${emEdicao}`, 'PUT', token, form);
        setMensagem({ texto: 'Promoção atualizada!', tipo: 'ok' });
      } else {
        await enviarAdmin('/api/admin/promocoes', 'POST', token, form);
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
      await enviarAdmin(`/api/admin/promocoes/${id}`, 'DELETE', token);
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
                  <button type="button" className="btn-admin" onClick={() => iniciarEdicao(promocao)}>
                    <span className="material-symbols-outlined" aria-hidden="true">edit</span>Editar
                  </button>
                  <button type="button" className="btn-admin btn-admin-perigo" onClick={() => remover(promocao.id_promocao)}>
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>Remover
                  </button>
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
          <button type="submit" className="btn-submit">
            <span className="material-symbols-outlined" aria-hidden="true">save</span>
            {emEdicao ? 'Salvar alterações' : 'Criar promoção'}
          </button>
          {emEdicao && (
            <button type="button" className="btn-admin" onClick={cancelarEdicao}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function AbaLivros({ token }) {
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
        await enviarAdmin(`/api/admin/livros/${emEdicao}`, 'PUT', token, dados);
        setMensagem({ texto: 'Livro atualizado!', tipo: 'ok' });
      } else {
        await enviarAdmin('/api/admin/livros', 'POST', token, dados);
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
      await enviarAdmin(`/api/admin/livros/${id}`, 'DELETE', token);
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
                  <button type="button" className="btn-admin" onClick={() => iniciarEdicao(livro)}>
                    <span className="material-symbols-outlined" aria-hidden="true">edit</span>Editar
                  </button>
                  <button type="button" className="btn-admin btn-admin-perigo" onClick={() => remover(livro.id_livro)}>
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>Remover
                  </button>
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
          <button type="submit" className="btn-submit">
            <span className="material-symbols-outlined" aria-hidden="true">save</span>
            {emEdicao ? 'Salvar alterações' : 'Cadastrar livro'}
          </button>
          {emEdicao && (
            <button type="button" className="btn-admin" onClick={cancelarEdicao}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function AbaProdutos({ token }) {
  const [produtos, setProdutos] = useState(null);
  const [emEdicao, setEmEdicao] = useState(null);
  const [form, setForm] = useState({ nome: '', categoria: '', preco: '', descricao: '' });
  const [mensagem, setMensagem] = useState(null);

  function carregar() {
    fetch('/api/admin/produtos').then((r) => r.json()).then(setProdutos).catch(() => setProdutos([]));
  }

  useEffect(() => { carregar(); }, []);

  function iniciarEdicao(produto) {
    setEmEdicao(produto.id_produto);
    setForm({ nome: produto.nome, categoria: produto.categoria, preco: produto.preco, descricao: produto.descricao });
  }

  function cancelarEdicao() {
    setEmEdicao(null);
    setForm({ nome: '', categoria: '', preco: '', descricao: '' });
  }

  async function salvar(evento) {
    evento.preventDefault();
    setMensagem(null);
    const dados = { ...form, preco: Number(form.preco) };
    try {
      if (emEdicao) {
        await enviarAdmin(`/api/admin/produtos/${emEdicao}`, 'PUT', token, dados);
        setMensagem({ texto: 'Produto atualizado!', tipo: 'ok' });
      } else {
        await enviarAdmin('/api/admin/produtos', 'POST', token, dados);
        setMensagem({ texto: 'Produto cadastrado!', tipo: 'ok' });
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
      await enviarAdmin(`/api/admin/produtos/${id}`, 'DELETE', token);
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
            <tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Descrição</th><th></th></tr>
          </thead>
          <tbody>
            {produtos === null && <tr><td colSpan="5">Carregando...</td></tr>}
            {produtos?.length === 0 && <tr><td colSpan="5">Nenhum produto cadastrado.</td></tr>}
            {produtos?.map((produto) => (
              <tr key={produto.id_produto}>
                <td>{produto.nome}</td>
                <td>{produto.categoria}</td>
                <td>R$ {Number(produto.preco).toFixed(2)}</td>
                <td>{produto.descricao}</td>
                <td className="admin-acoes">
                  <button type="button" className="btn-admin" onClick={() => iniciarEdicao(produto)}>
                    <span className="material-symbols-outlined" aria-hidden="true">edit</span>Editar
                  </button>
                  <button type="button" className="btn-admin btn-admin-perigo" onClick={() => remover(produto.id_produto)}>
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="admin-form" onSubmit={salvar}>
        <h3>{emEdicao ? 'Editar produto' : 'Adicionar produto'}</h3>
        <div className="form-grupo">
          <label htmlFor="produto-nome">Nome</label>
          <input id="produto-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="produto-categoria">Categoria</label>
          <input id="produto-categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="produto-preco">Preço (R$)</label>
          <input id="produto-preco" type="number" step="0.01" min="0" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} required />
        </div>
        <div className="form-grupo">
          <label htmlFor="produto-descricao">Descrição</label>
          <input id="produto-descricao" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
        </div>
        {mensagem && <p className={`form-mensagem form-mensagem-${mensagem.tipo}`}>{mensagem.texto}</p>}
        <div className="admin-acoes-form">
          <button type="submit" className="btn-submit">
            <span className="material-symbols-outlined" aria-hidden="true">save</span>
            {emEdicao ? 'Salvar alterações' : 'Cadastrar produto'}
          </button>
          {emEdicao && (
            <button type="button" className="btn-admin" onClick={cancelarEdicao}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function AbaEmprestimos({ token }) {
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
      await enviarAdmin('/api/admin/emprestimos', 'POST', token, { ...form, id_livro: Number(form.id_livro) });
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
      await enviarAdmin(`/api/admin/emprestimos/${id}/devolver`, 'POST', token);
      carregar();
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  async function aprovar(id) {
    setMensagem(null);
    try {
      await enviarAdmin(`/api/admin/emprestimos/${id}/aprovar`, 'POST', token);
      carregar();
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  async function rejeitar(id) {
    setMensagem(null);
    try {
      await enviarAdmin(`/api/admin/emprestimos/${id}/rejeitar`, 'POST', token);
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
                <td>{emprestimo.status === 'solicitado' ? '—' : emprestimo.data_emprestimo}</td>
                <td>{emprestimo.data_prevista_devolucao}</td>
                <td><span className={`badge badge-${emprestimo.status}`}>{emprestimo.status}</span></td>
                <td className="admin-acoes">
                  {emprestimo.status === 'solicitado' && (
                    <>
                      <button type="button" className="btn-admin" onClick={() => aprovar(emprestimo.id_emprestimo)}>
                        <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>Aprovar
                      </button>
                      <button type="button" className="btn-admin btn-admin-perigo" onClick={() => rejeitar(emprestimo.id_emprestimo)}>
                        <span className="material-symbols-outlined" aria-hidden="true">cancel</span>Rejeitar
                      </button>
                    </>
                  )}
                  {(emprestimo.status === 'ativo' || emprestimo.status === 'atrasado') && (
                    <button type="button" className="btn-admin" onClick={() => devolver(emprestimo.id_emprestimo)}>
                      <span className="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>Marcar devolvido
                    </button>
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
        <button type="submit" className="btn-submit">
          <span className="material-symbols-outlined" aria-hidden="true">save</span>Registrar empréstimo
        </button>
      </form>
    </div>
  );
}

function AbaClientes({ token, idProprio }) {
  const [clientes, setClientes] = useState(null);
  const [busca, setBusca] = useState('');
  const [emEdicao, setEmEdicao] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', tipo: 'cliente' });
  const [mensagem, setMensagem] = useState(null);

  function carregar() {
    fetch('/api/admin/usuarios', { headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setClientes)
      .catch(() => setClientes([]));
  }

  useEffect(() => { carregar(); }, [token]);

  function iniciarEdicao(cliente) {
    setEmEdicao(cliente.id);
    setForm({ nome: cliente.nome, email: cliente.email, tipo: cliente.tipo });
  }

  function cancelarEdicao() {
    setEmEdicao(null);
    setForm({ nome: '', email: '', tipo: 'cliente' });
  }

  async function salvar(evento) {
    evento.preventDefault();
    setMensagem(null);
    try {
      await enviarAdmin(`/api/admin/usuarios/${emEdicao}`, 'PUT', token, form);
      setMensagem({ texto: 'Conta atualizada!', tipo: 'ok' });
      cancelarEdicao();
      carregar();
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  async function remover(id) {
    setMensagem(null);
    try {
      await enviarAdmin(`/api/admin/usuarios/${id}`, 'DELETE', token);
      carregar();
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  const buscaNormalizada = busca.trim().toLowerCase();
  const clientesFiltrados = clientes?.filter((cliente) =>
    !buscaNormalizada ||
    cliente.nome.toLowerCase().includes(buscaNormalizada) ||
    cliente.email.toLowerCase().includes(buscaNormalizada)
  );

  return (
    <div className="admin-secao">
      <div className="form-grupo" style={{ maxWidth: '360px' }}>
        <label htmlFor="busca-clientes">Buscar por nome ou e-mail</label>
        <input id="busca-clientes" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div className="admin-tabela-wrap">
        <table className="tabela-admin">
          <thead>
            <tr><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Cadastrado em</th><th></th></tr>
          </thead>
          <tbody>
            {clientes === null && <tr><td colSpan="5">Carregando...</td></tr>}
            {clientes?.length > 0 && clientesFiltrados?.length === 0 && <tr><td colSpan="5">Nenhuma conta encontrada.</td></tr>}
            {clientesFiltrados?.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.email}</td>
                <td>{cliente.tipo}</td>
                <td>{new Date(cliente.criado_em).toLocaleDateString('pt-BR')}</td>
                <td className="admin-acoes">
                  <button type="button" className="btn-admin" onClick={() => iniciarEdicao(cliente)}>
                    <span className="material-symbols-outlined" aria-hidden="true">edit</span>Editar
                  </button>
                  {cliente.id !== idProprio && (
                    <button type="button" className="btn-admin btn-admin-perigo" onClick={() => remover(cliente.id)}>
                      <span className="material-symbols-outlined" aria-hidden="true">delete</span>Remover
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {emEdicao && (
        <form className="admin-form" onSubmit={salvar}>
          <h3>Editar conta</h3>
          <div className="form-grupo">
            <label htmlFor="cliente-nome">Nome</label>
            <input id="cliente-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </div>
          <div className="form-grupo">
            <label htmlFor="cliente-email">E-mail</label>
            <input id="cliente-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-grupo">
            <label htmlFor="cliente-tipo">Tipo de conta</label>
            <select id="cliente-tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option value="cliente">Cliente</option>
              <option value="funcionario">Funcionário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {mensagem && <p className={`form-mensagem form-mensagem-${mensagem.tipo}`}>{mensagem.texto}</p>}
          <div className="admin-acoes-form">
            <button type="submit" className="btn-submit">
              <span className="material-symbols-outlined" aria-hidden="true">save</span>Salvar alterações
            </button>
            <button type="button" className="btn-admin" onClick={cancelarEdicao}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function AbaResumo() {
  const [livros, setLivros] = useState(null);
  const [promocoes, setPromocoes] = useState(null);
  const [emprestimos, setEmprestimos] = useState(null);
  const [produtos, setProdutos] = useState(null);

  useEffect(() => {
    fetch('/api/admin/livros').then((r) => r.json()).then(setLivros).catch(() => setLivros([]));
    fetch('/api/admin/promocoes').then((r) => r.json()).then(setPromocoes).catch(() => setPromocoes([]));
    fetch('/api/admin/emprestimos').then((r) => r.json()).then(setEmprestimos).catch(() => setEmprestimos([]));
    fetch('/api/admin/produtos').then((r) => r.json()).then(setProdutos).catch(() => setProdutos([]));
  }, []);

  if (livros === null || promocoes === null || emprestimos === null || produtos === null) {
    return <p>Carregando resumo...</p>;
  }

  const estoqueBaixo = livros.filter((livro) => (livro.estoque ?? 0) < 5).length;
  const ativos = emprestimos.filter((e) => e.status === 'ativo').length;
  const atrasados = emprestimos.filter((e) => e.status === 'atrasado').length;
  const pendentes = emprestimos.filter((e) => e.status === 'solicitado').length;

  return (
    <div className="admin-resumo">
      <div className="admin-resumo-cartao">
        <strong>{livros.length}</strong>
        <span>Livros no catálogo</span>
      </div>
      <div className={`admin-resumo-cartao${estoqueBaixo > 0 ? ' admin-resumo-alerta' : ''}`}>
        <strong>{estoqueBaixo}</strong>
        <span>{estoqueBaixo > 0 && <span className="material-symbols-outlined" aria-hidden="true">warning</span>}Com estoque baixo (&lt;5)</span>
      </div>
      <div className="admin-resumo-cartao">
        <strong>{promocoes.length}</strong>
        <span>Promoções ativas</span>
      </div>
      <div className="admin-resumo-cartao">
        <strong>{produtos.length}</strong>
        <span>Itens no cardápio</span>
      </div>
      <div className="admin-resumo-cartao">
        <strong>{ativos}</strong>
        <span>Empréstimos ativos</span>
      </div>
      <div className={`admin-resumo-cartao${atrasados > 0 ? ' admin-resumo-alerta' : ''}`}>
        <strong>{atrasados}</strong>
        <span>{atrasados > 0 && <span className="material-symbols-outlined" aria-hidden="true">warning</span>}Empréstimos atrasados</span>
      </div>
      <div className={`admin-resumo-cartao${pendentes > 0 ? ' admin-resumo-alerta' : ''}`}>
        <strong>{pendentes}</strong>
        <span>{pendentes > 0 && <span className="material-symbols-outlined" aria-hidden="true">hourglass_empty</span>}Pedidos aguardando aprovação</span>
      </div>
    </div>
  );
}

const ABAS_PAINEL = [
  { id: 'promocoes', rotulo: 'Promoções', icone: 'sell' },
  { id: 'livros', rotulo: 'Biblioteca', icone: 'menu_book' },
  { id: 'produtos', rotulo: 'Cardápio', icone: 'local_cafe' },
  { id: 'emprestimos', rotulo: 'Empréstimos', icone: 'import_contacts' },
  { id: 'clientes', rotulo: 'Clientes', icone: 'group' },
  { id: 'conta', rotulo: 'Minha Conta', icone: 'account_circle' }
];

// A sessão/tipo de conta já foi conferida pela <RotaProtegida> que envolve
// essa rota, então aqui é seguro assumir que existe funcionário/admin logado.
export default function PaginaPainelEquipe() {
  const usuario = lerSessao();
  const [abaAtiva, setAbaAtiva] = useState('promocoes');

  useEffect(() => {
    document.title = 'Painel da Equipe - Pandora Livraria & Café';
  }, []);

  return (
    <>
      <Cabecalho subtitulo="Painel da equipe" usuario={usuario} />
      <Breadcrumb itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Painel da Equipe' }]} />

      <main className="container">
        <div className="admin-painel">
          <h2>Painel da Equipe</h2>

          <AbaResumo />

          <nav className="admin-tabs">
            {ABAS_PAINEL.map((aba) => (
              <button
                key={aba.id}
                type="button"
                className={`admin-tab${abaAtiva === aba.id ? ' admin-tab-ativa' : ''}`}
                onClick={() => setAbaAtiva(aba.id)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">{aba.icone}</span>
                {aba.rotulo}
              </button>
            ))}
          </nav>

          {abaAtiva === 'promocoes' && <AbaPromocoes token={usuario.token} />}
          {abaAtiva === 'livros' && <AbaLivros token={usuario.token} />}
          {abaAtiva === 'produtos' && <AbaProdutos token={usuario.token} />}
          {abaAtiva === 'emprestimos' && <AbaEmprestimos token={usuario.token} />}
          {abaAtiva === 'clientes' && <AbaClientes token={usuario.token} idProprio={usuario.id} />}
          {abaAtiva === 'conta' && <EditarConta usuario={usuario} />}
        </div>
      </main>

      <Rodape />
    </>
  );
}
