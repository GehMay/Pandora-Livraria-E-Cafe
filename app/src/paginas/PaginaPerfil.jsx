import { useEffect, useState } from 'react';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import { lerSessao } from '../sessao.js';
import { ICONES_POR_CATEGORIA, ICONE_LIVRO_PADRAO } from '../icones.js';

// A sessão/tipo de conta já foi conferida pela <RotaProtegida> que envolve
// essa rota, então aqui é seguro assumir que existe um cliente logado.
export default function PaginaPerfil() {
  const usuario = lerSessao();
  const [destaques, setDestaques] = useState(null);

  useEffect(() => {
    document.title = 'Minha Conta - Pandora Livraria & Café';
  }, []);

  useEffect(() => {
    fetch('/api/destaques')
      .then((resposta) => resposta.json())
      .then((dados) => setDestaques(dados.maisAvaliados))
      .catch(() => setDestaques([]));
  }, []);

  const primeiroNome = String(usuario.nome || '').split(' ')[0];

  return (
    <>
      <Cabecalho subtitulo="Sua conta mágica" usuario={usuario} />

      <main className="container">
        <h1 className="titulo-pagina">Olá, {primeiroNome}!</h1>

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
