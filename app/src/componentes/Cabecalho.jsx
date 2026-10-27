import { Link } from 'react-router-dom';
import { sair } from '../sessao.js';

// Cabeçalho único do site inteiro. `usuario` nulo = visitante (mostra
// Entrar/Criar Conta, a menos que `mostrarAcoesPublicas` seja false — usado
// nas próprias telas de login/cadastro, onde esses botões não fazem sentido).
export default function Cabecalho({ subtitulo, usuario = null, mostrarAcoesPublicas = true }) {
  const ehEquipe = usuario && ['funcionario', 'admin'].includes(usuario.tipo);
  const primeiroNome = usuario ? String(usuario.nome || '').split(' ')[0] : '';

  return (
    <header className="cabecalho">
      <Link to="/" className="cabecalho_logo" aria-label="Página inicial">
        <img src="/imagens/logo.svg" alt="Logo Pandora Livraria & Café" />
      </Link>
      <Link to="/" className="link-home">
        <p>Pandora</p>
        <p>Livraria e Café</p>
      </Link>
      <nav className="cabecalho_nav">
        <Link to="/catalogo" className="cabecalho_link-catalogo">
          <span className="material-symbols-outlined" aria-hidden="true">auto_stories</span>
          Catálogo
        </Link>
        <Link to="/cardapio" className="cabecalho_link-catalogo">
          <span className="material-symbols-outlined" aria-hidden="true">local_cafe</span>
          Cardápio
        </Link>
        <p>{subtitulo}</p>
      </nav>
      {(usuario || mostrarAcoesPublicas) && (
        <div className="cabecalho_acoes">
          {usuario ? (
            <>
              <span className="cabecalho_saudacao">
                Olá, <strong>{primeiroNome}</strong>{ehEquipe ? ' · Equipe' : ''}
              </span>
              <button type="button" className="btn-login" onClick={sair}>
                <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Entrar</Link>
              <Link to="/cadastro" className="btn-cadastro">Criar Conta</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
