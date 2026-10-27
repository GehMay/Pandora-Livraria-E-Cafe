import { Routes, Route } from 'react-router-dom';
import RotaProtegida from './componentes/RotaProtegida.jsx';
import PaginaInicio from './paginas/PaginaInicio.jsx';
import PaginaLogin from './paginas/PaginaLogin.jsx';
import PaginaCadastro from './paginas/PaginaCadastro.jsx';
import PaginaPerfil from './paginas/PaginaPerfil.jsx';
import PaginaPainelEquipe from './paginas/PaginaPainelEquipe.jsx';
import PaginaCatalogo from './paginas/PaginaCatalogo.jsx';
import PaginaLivro from './paginas/PaginaLivro.jsx';
import PaginaCatalogoProdutos from './paginas/PaginaCatalogoProdutos.jsx';
import PaginaProduto from './paginas/PaginaProduto.jsx';
import PaginaPromocao from './paginas/PaginaPromocao.jsx';
import { PaginaTesteMagica, PaginaTesteCanvas } from './paginas/PaginaTeste.jsx';
import PaginaNaoEncontrada from './paginas/PaginaNaoEncontrada.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaInicio />} />
      <Route path="/login" element={<PaginaLogin />} />
      <Route path="/cadastro" element={<PaginaCadastro />} />
      <Route path="/catalogo" element={<PaginaCatalogo />} />
      <Route path="/livro/:id" element={<PaginaLivro />} />
      <Route path="/cardapio" element={<PaginaCatalogoProdutos />} />
      <Route path="/produto/:id" element={<PaginaProduto />} />
      <Route path="/promocao/:id" element={<PaginaPromocao />} />
      <Route
        path="/perfil"
        element={
          <RotaProtegida tipos={['cliente']} redirecionarTipoErrado="/painel-funcionario">
            <PaginaPerfil />
          </RotaProtegida>
        }
      />
      <Route
        path="/painel-funcionario"
        element={
          <RotaProtegida tipos={['funcionario', 'admin']}>
            <PaginaPainelEquipe />
          </RotaProtegida>
        }
      />
      <Route path="/testes" element={<PaginaTesteMagica />} />
      <Route path="/teste-canvas" element={<PaginaTesteCanvas />} />
      <Route path="*" element={<PaginaNaoEncontrada />} />
    </Routes>
  );
}
