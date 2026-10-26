import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ICONES_POR_CATEGORIA, ICONE_LIVRO_PADRAO } from '../icones.js';

function GradeLivros({ livros }) {
  return (
    <div className="cards-grid cards-grid-interno">
      {livros.map((livro) => (
        <Link to={`/livro/${livro.id_livro}`} className="card-interno-link" key={livro.id_livro}>
          <article className="card-interno" data-categoria={livro.categoria || 'Geral'}>
            <div
              className="card-banner"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONES_POR_CATEGORIA[livro.categoria] || ICONE_LIVRO_PADRAO }}
            />
            <div className="card-body">
              <h6 className="book-title">{livro.titulo}</h6>
              <span className="badge">{livro.categoria || 'Geral'}</span>
              <p className="card-descricao">
                Autor: {livro.autor} <br />
                Preço: R$ {Number(livro.preco).toFixed(2)}
              </p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

// Busca /api/destaques (mais vendidos e mais bem avaliados) — usado na home
// e reaproveitável em qualquer outra página que precise desse recorte.
export default function VitrineDestaques() {
  const [destaques, setDestaques] = useState(null);

  useEffect(() => {
    fetch('/api/destaques')
      .then((resposta) => resposta.json())
      .then(setDestaques)
      .catch(() => setDestaques({ maisAvaliados: [], maisVendidos: [] }));
  }, []);

  if (destaques === null) return <p>Carregando destaques...</p>;

  return (
    <div className="admin-secao">
      <div>
        <h4 className="secao-titulo" style={{ fontSize: '1rem' }}>Mais Vendidos</h4>
        {destaques.maisVendidos.length === 0
          ? <p>Nenhum destaque no momento.</p>
          : <GradeLivros livros={destaques.maisVendidos} />}
      </div>
      <div>
        <h4 className="secao-titulo" style={{ fontSize: '1rem' }}>Mais Bem Avaliados</h4>
        {destaques.maisAvaliados.length === 0
          ? <p>Nenhum destaque no momento.</p>
          : <GradeLivros livros={destaques.maisAvaliados} />}
      </div>
    </div>
  );
}
