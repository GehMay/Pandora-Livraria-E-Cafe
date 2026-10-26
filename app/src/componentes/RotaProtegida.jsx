import { Navigate } from 'react-router-dom';
import { lerSessao } from '../sessao.js';

// Guarda de rota: só deixa passar quem tem sessão e o tipo de conta certo.
// `redirecionarTipoErrado` é pra onde manda quem está logado mas com o tipo
// errado (ex.: cliente tentando abrir o painel da equipe); sem sessão
// nenhuma, sempre volta pro login.
export default function RotaProtegida({ tipos, redirecionarTipoErrado = '/login', children }) {
  const sessao = lerSessao();

  if (!sessao) {
    return <Navigate to="/login" replace />;
  }

  if (!tipos.includes(sessao.tipo)) {
    return <Navigate to={redirecionarTipoErrado} replace />;
  }

  return children;
}
