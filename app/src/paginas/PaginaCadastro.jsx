import { useEffect } from 'react';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Rodape from '../componentes/Rodape.jsx';
import FormularioAuth from '../componentes/FormularioAuth.jsx';

export default function PaginaCadastro() {
  useEffect(() => {
    document.title = 'Criar Conta - Pandora Livraria & Café';
  }, []);

  return (
    <>
      <Cabecalho subtitulo="Junte-se à nossa comunidade mágica" mostrarAcoesPublicas={false} />
      <main className="container">
        <FormularioAuth tipo="cadastro" />
      </main>
      <Rodape />
    </>
  );
}
