import { Link } from 'react-router-dom';

// Trilha de navegação ("breadcrumb"), ex.: Início › Catálogo › Poções Muito Malignas.
// `itens`: [{ rotulo, href }], o último item não leva `href` (é a página atual).
// Padrão de acessibilidade comum pra isso: <nav><ol>, último item marcado com
// aria-current="page", separadores decorativos escondidos de leitor de tela.
export default function Breadcrumb({ itens }) {
  return (
    <nav className="breadcrumb" aria-label="Caminho de navegação">
      <ol>
        {itens.map((item, indice) => {
          const ultimo = indice === itens.length - 1;
          return (
            <li key={indice}>
              {!ultimo && item.href ? (
                <Link to={item.href}>{item.rotulo}</Link>
              ) : (
                <span aria-current={ultimo ? 'page' : undefined}>{item.rotulo}</span>
              )}
              {!ultimo && <span className="breadcrumb_separador" aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
