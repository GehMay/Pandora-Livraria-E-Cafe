import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ICONES_POR_CATEGORIA, ICONE_LIVRO_PADRAO } from '../icones.js';

// Busca e mostra o acervo (/api/lancamentos) em cards — mesma lógica que
// antes vivia em JS/lancamento.js, agora reaproveitável em qualquer página.
export default function VitrineLivros() {
  const [livros, setLivros] = useState(null);

  useEffect(() => {
    fetch('/api/lancamentos')
      .then((resposta) => resposta.json())
      .then(setLivros)
      .catch(() => setLivros([]));
  }, []);

  if (livros === null) return <p>Carregando lançamentos...</p>;
  if (livros.length === 0) return <p>Nenhum lançamento no momento.</p>;

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
                Preço: R$ {livro.preco}
              </p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
