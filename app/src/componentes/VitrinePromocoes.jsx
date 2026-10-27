import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ICONE_PROMOCAO } from '../icones.js';

// Busca e mostra as promoções ativas (/api/promocoes) — mesma lógica que
// antes vivia em JS/promocoes.js.
export default function VitrinePromocoes() {
  const [promocoes, setPromocoes] = useState(null);

  useEffect(() => {
    fetch('/api/promocoes')
      .then((resposta) => resposta.json())
      .then(setPromocoes)
      .catch(() => setPromocoes([]));
  }, []);

  if (promocoes === null) return <p>Carregando promoções...</p>;
  if (promocoes.length === 0) return <p>Nenhuma promoção ativa no momento.</p>;

  return (
    <div className="cards-grid cards-grid-interno">
      {promocoes.map((promocao) => (
        <Link to={`/promocao/${promocao.id_promocao}`} className="card-interno-link" key={promocao.id_promocao}>
          <article className="card-interno">
            <div
              className="card-banner banner-promocao"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONE_PROMOCAO }}
            />
            <div className="card-body">
              <h6 className="book-title">{promocao.titulo}</h6>
              <span className="badge badge-desconto">{promocao.desconto}</span>
              <p className="card-descricao">{promocao.descricao}</p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
