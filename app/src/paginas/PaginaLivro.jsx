import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import { lerSessao } from '../sessao.js';
import { enviarAdmin } from '../api.js';
import { ICONES_POR_CATEGORIA, ICONE_LIVRO_PADRAO } from '../icones.js';

export default function PaginaLivro() {
  const usuario = lerSessao();
  const { id } = useParams();
  const [livro, setLivro] = useState(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [dataPrevista, setDataPrevista] = useState('');
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    fetch(`/api/livros/${id}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error('não encontrado');
        return resposta.json();
      })
      .then(setLivro)
      .catch(() => setNaoEncontrado(true));
  }, [id]);

  useEffect(() => {
    document.title = livro ? `${livro.titulo} - Pandora Livraria & Café` : 'Livro - Pandora Livraria & Café';
  }, [livro]);

  async function solicitar(evento) {
    evento.preventDefault();
    setMensagem(null);
    try {
      await enviarAdmin('/api/emprestimos/solicitar', 'POST', usuario.email, {
        id_livro: Number(id),
        data_prevista_devolucao: dataPrevista
      });
      setMensagem({ texto: 'Empréstimo solicitado! Acompanhe em "Meus Empréstimos", no seu perfil.', tipo: 'ok' });
      setDataPrevista('');
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    }
  }

  return (
    <>
      <Cabecalho subtitulo="Detalhes do livro" usuario={usuario} />

      <main className="container">
        {naoEncontrado && (
          <>
            <h1 className="titulo-pagina">Livro não encontrado</h1>
            <p><Link to="/catalogo">Voltar ao catálogo</Link></p>
          </>
        )}

        {!naoEncontrado && livro === null && <p className="titulo-pagina">Carregando...</p>}

        {livro && (
          <div className="secao-vitrine">
            <div className="card card-padding livro-detalhe">
              <div
                className="card-banner livro-detalhe-banner"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONES_POR_CATEGORIA[livro.categoria] || ICONE_LIVRO_PADRAO }}
              />
              <div>
                <h1 className="titulo-pagina" style={{ marginBottom: '0.5rem' }}>{livro.titulo}</h1>
                <span className="badge">{livro.categoria}</span>
                <p className="card-descricao">
                  Autor: {livro.autor} <br />
                  Preço: R$ {Number(livro.preco).toFixed(2)} <br />
                  Avaliação: {Number(livro.avaliacao).toFixed(1)} / 5 <br />
                  Estoque: {livro.estoque > 0 ? `${livro.estoque} disponível(is)` : 'Sem estoque'}
                </p>

                {usuario?.tipo === 'cliente' && livro.estoque > 0 && (
                  <form className="admin-form" onSubmit={solicitar} style={{ marginTop: '1.5rem', maxWidth: '360px' }}>
                    <h3>Solicitar empréstimo</h3>
                    <div className="form-grupo">
                      <label htmlFor="livro-data-devolucao">Devolução prevista</label>
                      <input
                        id="livro-data-devolucao"
                        type="date"
                        value={dataPrevista}
                        onChange={(e) => setDataPrevista(e.target.value)}
                        required
                      />
                    </div>
                    {mensagem && <p className={`form-mensagem form-mensagem-${mensagem.tipo}`}>{mensagem.texto}</p>}
                    <button type="submit" className="btn-submit">Solicitar</button>
                  </form>
                )}

                {usuario?.tipo === 'cliente' && livro.estoque <= 0 && (
                  <p className="form-mensagem form-mensagem-erro">Esse livro está sem estoque no momento.</p>
                )}

                {!usuario && (
                  <p style={{ marginTop: '1.5rem' }}>
                    <Link to="/login">Entre na sua conta</Link> para solicitar um empréstimo.
                  </p>
                )}

                {usuario && usuario.tipo !== 'cliente' && (
                  <p style={{ marginTop: '1.5rem' }}>Contas da equipe não solicitam empréstimo por aqui.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Rodape />
    </>
  );
}
