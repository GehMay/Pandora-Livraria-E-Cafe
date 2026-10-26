import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import { lerSessao } from '../sessao.js';

export default function PaginaNaoEncontrada() {
  const usuario = lerSessao();

  useEffect(() => {
    document.title = 'Página não encontrada - Pandora Livraria & Café';
  }, []);

  return (
    <>
      <Cabecalho subtitulo="Essa página se perdeu no Beco Diagonal" usuario={usuario} />
      <main className="container">
        <div className="form-container">
          <h2>404</h2>
          <p>Não encontramos essa página por aqui.</p>
          <Link to="/" className="form-link">Voltar para o início</Link>
        </div>
      </main>
      <Rodape />
    </>
  );
}
