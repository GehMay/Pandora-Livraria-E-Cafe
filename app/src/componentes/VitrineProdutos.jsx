import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ICONES_POR_CATEGORIA_PRODUTO, ICONE_PRODUTO_PADRAO } from '../icones.js';

// Busca e mostra o cardápio do café (/api/produtos) — mesmo padrão de VitrineLivros.
export default function VitrineProdutos() {
  const [produtos, setProdutos] = useState(null);

  useEffect(() => {
    fetch('/api/produtos')
      .then((resposta) => resposta.json())
      .then(setProdutos)
      .catch(() => setProdutos([]));
  }, []);

  if (produtos === null) return <p>Carregando cardápio...</p>;
  if (produtos.length === 0) return <p>Nenhum item no cardápio no momento.</p>;

  return (
    <div className="cards-grid cards-grid-interno">
      {produtos.map((produto) => (
        <Link to={`/produto/${produto.id_produto}`} className="card-interno-link" key={produto.id_produto}>
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
  );
}
