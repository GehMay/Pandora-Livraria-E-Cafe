import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import { lerSessao } from '../sessao.js';
import { ICONES_POR_CATEGORIA_PRODUTO, ICONE_PRODUTO_PADRAO } from '../icones.js';

export default function PaginaProduto() {
  const usuario = lerSessao();
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    fetch(`/api/produtos/${id}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error('não encontrado');
        return resposta.json();
      })
      .then(setProduto)
      .catch(() => setNaoEncontrado(true));
  }, [id]);

  useEffect(() => {
    document.title = produto ? `${produto.nome} - Pandora Livraria & Café` : 'Produto - Pandora Livraria & Café';
  }, [produto]);

  return (
    <>
      <Cabecalho subtitulo="Detalhes do produto" usuario={usuario} />

      <main className="container">
        {naoEncontrado && (
          <>
            <h1 className="titulo-pagina">Produto não encontrado</h1>
            <p><Link to="/cardapio">Voltar ao cardápio</Link></p>
          </>
        )}

        {!naoEncontrado && produto === null && <p className="titulo-pagina">Carregando...</p>}

        {produto && (
          <div className="secao-vitrine">
            <div className="card card-padding livro-detalhe">
              <div
                className="card-banner livro-detalhe-banner"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONES_POR_CATEGORIA_PRODUTO[produto.categoria] || ICONE_PRODUTO_PADRAO }}
              />
              <div>
                <h1 className="titulo-pagina" style={{ marginBottom: '0.5rem' }}>{produto.nome}</h1>
                <span className="badge">{produto.categoria}</span>
                <p className="card-descricao">
                  Preço: R$ {Number(produto.preco).toFixed(2)} <br />
                  {produto.descricao}
                </p>
                <p style={{ marginTop: '1.5rem' }}>
                  <Link to="/cardapio">Ver todo o cardápio</Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Rodape />
    </>
  );
}
