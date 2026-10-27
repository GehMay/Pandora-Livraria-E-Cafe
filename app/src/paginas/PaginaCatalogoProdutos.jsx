import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import Breadcrumb from '../componentes/Breadcrumb.jsx';
import { lerSessao } from '../sessao.js';
import { ICONES_POR_CATEGORIA_PRODUTO, ICONE_PRODUTO_PADRAO } from '../icones.js';

export default function PaginaCatalogoProdutos() {
  const usuario = lerSessao();
  const [produtos, setProdutos] = useState(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');

  useEffect(() => {
    document.title = 'Cardápio - Pandora Livraria & Café';
  }, []);

  useEffect(() => {
    fetch('/api/produtos')
      .then((resposta) => resposta.json())
      .then(setProdutos)
      .catch(() => setProdutos([]));
  }, []);

  const categorias = ['todas', ...new Set((produtos || []).map((produto) => produto.categoria))];
  const produtosFiltrados = categoriaAtiva === 'todas'
    ? produtos
    : produtos?.filter((produto) => produto.categoria === categoriaAtiva);

  return (
    <>
      <Cabecalho subtitulo="Cardápio do café" usuario={usuario} />
      <Breadcrumb itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Cardápio' }]} />

      <main className="container">
        <h1 className="titulo-pagina">Cardápio</h1>

        <div className="secao-vitrine">
          <div className="catalogo-filtros">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                type="button"
                className={`catalogo-filtro${categoriaAtiva === categoria ? ' catalogo-filtro-ativo' : ''}`}
                onClick={() => setCategoriaAtiva(categoria)}
              >
                {categoria === 'todas' ? 'Todas' : categoria}
              </button>
            ))}
          </div>

          <div className="cards-grid cards-grid-interno">
            {produtos === null && <p>Carregando cardápio...</p>}
            {produtos?.length > 0 && produtosFiltrados?.length === 0 && <p>Nenhum item nessa categoria.</p>}
            {produtosFiltrados?.map((produto) => (
              <Link
                to={`/produto/${produto.id_produto}`}
                className="card-interno-link"
                key={produto.id_produto}
              >
                <article className="card-interno" data-categoria={produto.categoria}>
                  <div
                    className="card-banner"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: ICONES_POR_CATEGORIA_PRODUTO[produto.categoria] || ICONE_PRODUTO_PADRAO }}
                  />
                  <div className="card-body">
                    <h6 className="book-title">{produto.nome}</h6>
                    <span className="badge">{produto.categoria}</span>
                    <p className="card-descricao">Preço: R$ {Number(produto.preco).toFixed(2)}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Rodape />
    </>
  );
}
