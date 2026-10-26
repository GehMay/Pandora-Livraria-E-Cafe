import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import { lerSessao } from '../sessao.js';
import { ICONES_POR_CATEGORIA, ICONE_LIVRO_PADRAO } from '../icones.js';

export default function PaginaCatalogo() {
  const usuario = lerSessao();
  const [livros, setLivros] = useState(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');

  useEffect(() => {
    document.title = 'Catálogo - Pandora Livraria & Café';
  }, []);

  useEffect(() => {
    fetch('/api/lancamentos')
      .then((resposta) => resposta.json())
      .then(setLivros)
      .catch(() => setLivros([]));
  }, []);

  const categorias = ['todas', ...new Set((livros || []).map((livro) => livro.categoria))];
  const livrosFiltrados = categoriaAtiva === 'todas'
    ? livros
    : livros?.filter((livro) => livro.categoria === categoriaAtiva);

  return (
    <>
      <Cabecalho subtitulo="Catálogo completo" usuario={usuario} />

      <main className="container">
        <h1 className="titulo-pagina">Catálogo</h1>

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
            {livros === null && <p>Carregando catálogo...</p>}
            {livros?.length > 0 && livrosFiltrados?.length === 0 && <p>Nenhum livro nessa categoria.</p>}
            {livrosFiltrados?.map((livro) => (
              <Link
                to={`/livro/${livro.id_livro}`}
                className="card-interno-link"
                key={livro.id_livro}
              >
                <article className="card-interno" data-categoria={livro.categoria}>
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
                      Preço: R$ {Number(livro.preco).toFixed(2)}
                    </p>
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
