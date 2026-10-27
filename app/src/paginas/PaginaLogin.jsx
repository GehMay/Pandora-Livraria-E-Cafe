import { useEffect } from 'react';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import Breadcrumb from '../componentes/Breadcrumb.jsx';
import FormularioAuth from '../componentes/FormularioAuth.jsx';

export default function PaginaLogin() {
  useEffect(() => {
    document.title = 'Entrar - Pandora Livraria & Café';
  }, []);

  return (
    <>
      <Cabecalho subtitulo="Acesse sua conta mágica" mostrarAcoesPublicas={false} />
      <Breadcrumb itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Entrar' }]} />
      <main className="container">
        <FormularioAuth tipo="login" />
      </main>
      <Rodape />
    </>
  );
}
