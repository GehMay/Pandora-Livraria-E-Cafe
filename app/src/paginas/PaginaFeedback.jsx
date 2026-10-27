import { useEffect } from 'react';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import Breadcrumb from '../componentes/Breadcrumb.jsx';
import FormularioFeedback from '../componentes/FormularioFeedback.jsx';
import { lerSessao } from '../sessao.js';

export default function PaginaFeedback() {
  const usuario = lerSessao();

  useEffect(() => {
    document.title = 'Feedback - Pandora Livraria & Café';
  }, []);

  return (
    <>
      <Cabecalho subtitulo="Sua opinião nos ajuda a melhorar" usuario={usuario} />
      <Breadcrumb itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Feedback' }]} />
      <main className="container">
        <FormularioFeedback usuario={usuario} />
      </main>
      <Rodape />
    </>
  );
}
