import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import { lerSessao } from '../sessao.js';
import { ICONE_PROMOCAO } from '../icones.js';

export default function PaginaPromocao() {
  const usuario = lerSessao();
  const { id } = useParams();
  const [promocao, setPromocao] = useState(null);
  const [naoEncontrada, setNaoEncontrada] = useState(false);

  useEffect(() => {
    fetch(`/api/promocoes/${id}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error('não encontrada');
        return resposta.json();
      })
      .then(setPromocao)
      .catch(() => setNaoEncontrada(true));
  }, [id]);

  useEffect(() => {
    document.title = promocao ? `${promocao.titulo} - Pandora Livraria & Café` : 'Promoção - Pandora Livraria & Café';
  }, [promocao]);

  return (
    <>
      <Cabecalho subtitulo="Detalhes da promoção" usuario={usuario} />

      <main className="container">
        {naoEncontrada && (
          <>
            <h1 className="titulo-pagina">Promoção não encontrada</h1>
            <p><Link to="/">Voltar ao início</Link></p>
          </>
        )}

        {!naoEncontrada && promocao === null && <p className="titulo-pagina">Carregando...</p>}

        {promocao && (
          <div className="secao-vitrine">
            <div className="card card-padding livro-detalhe">
              <div
                className="card-banner livro-detalhe-banner banner-promocao"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONE_PROMOCAO }}
              />
              <div>
                <h1 className="titulo-pagina" style={{ marginBottom: '0.5rem' }}>{promocao.titulo}</h1>
                <span className="badge badge-desconto">{promocao.desconto}</span>
                <p className="card-descricao">{promocao.descricao}</p>
                <p style={{ marginTop: '1.5rem' }}>
                  Promoção válida na loja física — apresente esta página no balcão.
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  <Link to="/">Voltar ao início</Link>
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
