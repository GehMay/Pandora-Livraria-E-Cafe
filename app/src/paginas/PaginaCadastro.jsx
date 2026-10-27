import { useEffect } from 'react';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import Breadcrumb from '../componentes/Breadcrumb.jsx';
import FormularioAuth from '../componentes/FormularioAuth.jsx';

export default function PaginaCadastro() {
  useEffect(() => {
    document.title = 'Criar Conta - Pandora Livraria & Café';
  }, []);

  return (
    <>
      <Cabecalho subtitulo="Junte-se à nossa comunidade mágica" mostrarAcoesPublicas={false} />
      <Breadcrumb itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Criar Conta' }]} />
      <main className="container">
        <FormularioAuth tipo="cadastro" />
      </main>
      <Rodape />
    </>
  );
}
