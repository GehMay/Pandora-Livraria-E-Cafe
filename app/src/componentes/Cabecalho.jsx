import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sair } from '../sessao.js';
import { lerTema, salvarTema, lerEfeitos, salvarEfeitos } from '../preferencias.js';

// Cabeçalho único do site inteiro. `usuario` nulo = visitante (mostra
// Entrar/Criar Conta, a menos que `mostrarAcoesPublicas` seja false — usado
// nas próprias telas de login/cadastro, onde esses botões não fazem sentido).
export default function Cabecalho({ subtitulo, usuario = null, mostrarAcoesPublicas = true }) {
  const ehEquipe = usuario && ['funcionario', 'admin'].includes(usuario.tipo);
  const primeiroNome = usuario ? String(usuario.nome || '').split(' ')[0] : '';
  const [tema, setTema] = useState(lerTema);
  const [efeitos, setEfeitos] = useState(lerEfeitos);

  function alternarTema() {
    const novoTema = tema === 'dark' ? 'light' : 'dark';
    salvarTema(novoTema);
    setTema(novoTema);
  }

  function alternarEfeitos() {
    const novoValor = efeitos === 'on' ? 'off' : 'on';
    salvarEfeitos(novoValor);
    setEfeitos(novoValor);
  }

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
      <div className="cabecalho_preferencias">
        <button
          type="button"
          className="btn-icone"
          onClick={alternarTema}
          title={tema === 'dark' ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'}
          aria-pressed={tema === 'light'}
        >
          <span className="material-symbols-outlined" aria-hidden="true">{tema === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button
          type="button"
          className={`btn-icone${efeitos === 'off' ? ' btn-icone-inativo' : ''}`}
          onClick={alternarEfeitos}
          title={efeitos === 'on' ? 'Desligar efeitos mágicos' : 'Ligar efeitos mágicos'}
          aria-pressed={efeitos === 'off'}
        >
          <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
        </button>
      </div>
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
