import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import EditarConta from '../componentes/EditarConta.jsx';
import Breadcrumb from '../componentes/Breadcrumb.jsx';
import { lerSessao } from '../sessao.js';
import { enviarAdmin } from '../api.js';
import { ICONES_POR_CATEGORIA, ICONE_LIVRO_PADRAO } from '../icones.js';

// A sessão/tipo de conta já foi conferida pela <RotaProtegida> que envolve
// essa rota, então aqui é seguro assumir que existe um cliente logado.
export default function PaginaPerfil() {
  const usuario = lerSessao();
  const [destaques, setDestaques] = useState(null);
  const [meusEmprestimos, setMeusEmprestimos] = useState(null);
  const [mensagemEmprestimo, setMensagemEmprestimo] = useState(null);

  useEffect(() => {
    document.title = 'Minha Conta - Pandora Livraria & Café';
  }, []);

  useEffect(() => {
    fetch('/api/destaques')
      .then((resposta) => resposta.json())
      .then((dados) => setDestaques(dados.maisAvaliados))
      .catch(() => setDestaques([]));
  }, []);

  function carregarMeusEmprestimos() {
    fetch('/api/meus-emprestimos', { headers: { 'Authorization': `Bearer ${usuario.token}` } })
      .then((resposta) => resposta.json())
      .then(setMeusEmprestimos)
      .catch(() => setMeusEmprestimos([]));
  }

  useEffect(() => { carregarMeusEmprestimos(); }, [usuario.token]);

  async function cancelar(id) {
    setMensagemEmprestimo(null);
    try {
      await enviarAdmin(`/api/emprestimos/${id}/cancelar`, 'POST', usuario.token);
      carregarMeusEmprestimos();
    } catch (erro) {
      setMensagemEmprestimo(erro.message);
    }
  }

  const primeiroNome = String(usuario.nome || '').split(' ')[0];

  return (
    <>
      <Cabecalho subtitulo="Sua conta mágica" usuario={usuario} />
      <Breadcrumb itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Minha Conta' }]} />

      <main className="container">
        <h1 className="titulo-pagina">Olá, {primeiroNome}!</h1>
        <p style={{ marginBottom: '1.5rem' }}>
          <Link to="/catalogo">Ver catálogo completo</Link>
        </p>

        <div className="secao-vitrine">
          <div className="card card-padding">
            <h3 className="secao-titulo">Meus Empréstimos</h3>
            {mensagemEmprestimo && <p className="form-mensagem form-mensagem-erro">{mensagemEmprestimo}</p>}
            <div className="admin-tabela-wrap">
              <table className="tabela-admin">
                <thead>
                  <tr><th>Livro</th><th>Devolução prevista</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {meusEmprestimos === null && <tr><td colSpan="4">Carregando...</td></tr>}
                  {meusEmprestimos?.length === 0 && <tr><td colSpan="4">Você ainda não solicitou nenhum empréstimo.</td></tr>}
                  {meusEmprestimos?.map((emprestimo) => (
                    <tr key={emprestimo.id_emprestimo}>
                      <td>{emprestimo.titulo_livro}</td>
                      <td>{emprestimo.data_prevista_devolucao}</td>
                      <td><span className={`badge badge-${emprestimo.status}`}>{emprestimo.status}</span></td>
                      <td className="admin-acoes">
                        {emprestimo.status === 'solicitado' && (
                          <button type="button" className="btn-admin btn-admin-perigo" onClick={() => cancelar(emprestimo.id_emprestimo)}>Cancelar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="secao-vitrine">
          <div className="card card-padding">
            <h3 className="secao-titulo">Meus Dados</h3>
            <EditarConta usuario={usuario} />
          </div>
        </div>

        <div className="secao-vitrine">
          <div className="card card-padding">
            <h3 className="secao-titulo">Destaques para Você</h3>
            <div className="cards-grid cards-grid-interno">
              {destaques === null && <p>Carregando destaques...</p>}
              {destaques?.slice(0, 3).map((livro) => (
                <article className="card-interno" data-categoria={livro.categoria} key={livro.id_livro}>
                  <div
                    className="card-banner"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: ICONES_POR_CATEGORIA[livro.categoria] || ICONE_LIVRO_PADRAO }}
                  />
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

      <Rodape />
    </>
  );
}
