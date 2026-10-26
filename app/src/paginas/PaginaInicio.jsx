import { useEffect } from 'react';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import VitrineLivros from '../componentes/VitrineLivros.jsx';
import VitrinePromocoes from '../componentes/VitrinePromocoes.jsx';
import VitrineDestaques from '../componentes/VitrineDestaques.jsx';
import { lerSessao } from '../sessao.js';

export default function PaginaInicio() {
  const usuario = lerSessao();

  useEffect(() => {
    document.title = 'Pandora Livraria & Café';
  }, []);

  return (
    <>
      <Cabecalho subtitulo="Tome seu café enquanto lê seus livros favoritos" usuario={usuario} />

      <main className="container">
        <h1 className="titulo-pagina">Saiba Mais</h1>
        <p className="subtitulo-pagina">
          Loja localizada em: <br /> Beco Diagonal, Nº 42, Londres Mágica (Ao lado da Floreios e Borrões)
        </p>

        <div className="secao-vitrine">
          <div className="card card-padding">
            <h3 className="secao-titulo">Lançamentos de Livros</h3>
            <VitrineLivros />
          </div>
        </div>

        <div className="secao-vitrine">
          <div className="card card-padding">
            <h3 className="secao-titulo">Promoções Mágicas</h3>
            <VitrinePromocoes />
          </div>
        </div>

        <div className="secao-vitrine">
          <div className="card card-padding">
            <h3 className="secao-titulo">Destaques da Loja</h3>
            <VitrineDestaques />
          </div>
        </div>

        <div className="secao-sobre">
          <div className="card card-padding">
            <h3 className="sobre-livraria-titulo">Sobre a Livraria</h3>
            <p className="sobre-livraria">
              A Pandora Livraria Mágica & Café é um refúgio para bruxos e bruxas que buscam conhecimento, aventura e
              magia em cada página. Com uma vasta coleção de livros raros e eventos literários, oferecemos uma
              experiência única para todos os amantes da magia.
            </p>
          </div>
        </div>

        <div className="cards-grid">
          <article className="card" data-categoria="Produtos e Serviços">
            <div className="card-banner" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8h12l-1 12H7L6 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
            </div>
            <div className="card-body">
              <h3 className="card-title">Produtos e Serviços</h3>
              <p className="card-descricao">
                Catálogo com mais de 3.000 grimórios antigos, pergaminhos e manuais de poções<br />
                Seção de Sebo Mágico (livros com azarações fracas com 50% de desconto)<br />
                Cerveja Amanteigada, Suco de Abóbora e Sapos de Chocolate no nosso Café<br />
                Eventos mensais: Clube de Duelos Literários e Sessões de Autógrafos com autores Puro-Sangue
              </p>
            </div>
          </article>

          <article className="card" data-categoria="Principais Categorias">
            <div className="card-banner" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
                <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
                <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
                <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div className="card-body">
              <h3 className="card-title">Principais Categorias</h3>
              <span className="badge">Seções da nossa Biblioteca</span>
              <ul className="lista-info">
                <li>Poções e Alquimia Avançada</li>
                <li>Artes das Trevas (Seção Restrita)</li>
                <li>História da Magia Antiga</li>
                <li>Magizoologia e Criaturas</li>
                <li>Biografias de Sangues-Puros</li>
              </ul>
            </div>
          </article>
        </div>

        <div className="cards-grid">
          <article className="card" data-categoria="Dados da Loja">
            <div className="card-banner" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <div className="card-body">
              <h3 className="card-title">Dados da Loja</h3>
              <ul className="lista-info">
                <li><strong>Nome:</strong> Pandora Livraria Mágica &amp; Café</li>
                <li><strong>Endereço:</strong> Beco Diagonal, Nº 42, Londres Mágica</li>
                <li><strong>Contato Mágico:</strong> Envio por Coruja (Respostas em até 1 dia útil)</li>
                <li><strong>Rede de Flu:</strong> Lareira "Pandora, Beco Diagonal"</li>
                <li><strong>E-mail (para Trouxas):</strong> contato@pandoramagica.com</li>
                <li><strong>Instagram:</strong> @pandora.magica</li>
              </ul>
              <span className="badge">Nossa história</span>
              <p className="card-descricao">
                Fundada por dois bruxos de uma antiga e nobre linhagem da Sonserina, a Pandora nasceu da ambição de
                reunir os grimórios mais raros e poderosos da magia. O que era uma coleção particular tornou-se a
                livraria mais exclusiva do Beco Diagonal! Com poltronas de couro de dragão, iluminação esmeralda e
                Cerveja Amanteigada, criamos o ambiente perfeito para mentes astutas passarem horas folheando.
              </p>
              <span className="badge">Horário de Funcionamento</span>
              <ul className="lista-info">
                <li><strong>Segunda a sexta:</strong> 9h às 20h (Fuso de Londres)</li>
                <li><strong>Sábado:</strong> 9h às 18h (Dias de lua cheia fechamos às 17h)</li>
                <li><strong>Domingo:</strong> 10h às 16h</li>
              </ul>
            </div>
          </article>
        </div>
      </main>

      <Rodape />
    </>
  );
}
