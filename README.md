<p align="center">
  <img src="imagens/logo.svg" alt="Logo da Pandora Livraria & Café" width="220">
</p>

<h1 align="center">📚☕ Pandora Livraria & Café</h1>

<p align="center">
  <em>Tome seu café enquanto lê seus livros favoritos, no coração do Beco Diagonal.</em>
</p>

<p align="center">
  <a href="https://pandora-livraria-e-cafe.onrender.com">
    <img src="https://img.shields.io/badge/Acessar_o_site-Online-1a472a?style=for-the-badge&logo=render&logoColor=white" alt="Acessar o site online">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Node.js_sem_frameworks-2a623d?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js sem frameworks">
  <img src="https://img.shields.io/badge/Front--end-React_%2B_Vite-2a623d?style=flat-square&logo=react&logoColor=white" alt="React + Vite">
  <img src="https://img.shields.io/badge/Banco-PostgreSQL_(Supabase)-2a623d?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL via Supabase">
  <img src="https://img.shields.io/badge/Hospedagem-Render-2a623d?style=flat-square&logo=render&logoColor=white" alt="Hospedado no Render">
  <img src="https://img.shields.io/badge/Licen%C3%A7a-CC%20BY--SA%204.0-c4a02c?style=flat-square" alt="Licença CC BY-SA 4.0">
  <img src="https://img.shields.io/badge/Status-Finalizado-c4a02c?style=flat-square" alt="Projeto finalizado">
</p>

<p align="center">
  <a href="https://pandora-livraria-e-cafe.onrender.com">
    <img src="imagens/preview.png" alt="Prévia do site Pandora Livraria & Café" width="800">
  </a>
</p>

<p align="center">
  <sub>⏳ Hospedado no plano gratuito do Render: se o site ficar um tempo sem acessos, o primeiro carregamento pode levar cerca de 50 segundos para "acordar" o servidor.</sub>
</p>

---

Um projeto de estudo Full-Stack **finalizado**, um sistema web completo para uma livraria mágica fictícia do universo de **Harry Potter**, localizada no **Beco Diagonal**.

Começou do zero, **sem frameworks**, com o objetivo de aprender e consolidar os fundamentos da web (manipulação do DOM, requisições HTTP, modelagem de banco de dados e estilização). Com os fundamentos consolidados, o front-end inteiro foi migrado para **React + React Router** — uma SPA de verdade, com rotas reais em vez de arquivos `.html` soltos — pra deixar mais rápido criar cada página nova (ex.: a página de um livro específico, uma campanha/anúncio). O back-end continua em Node.js puro (`http`, `fs`, `crypto`, sem Express), por escolha, pra aprofundamento técnico.

## 🎯 Objetivo do Projeto (Produto Final)
Os clientes navegam pelo acervo de grimórios e livros mágicos, veem os lançamentos, descobrem promoções (de livros e do café) e fazem login para solicitar empréstimo de obras e retirar na loja física. O painel administrativo cobre a gestão interna: estoque, cardápio do café, promoções, empréstimos e contas de clientes.

## 🛠️ Tecnologias Utilizadas
* **Front-end:** SPA em **React + Vite** (`app/`), com **React Router** cuidando de todas as rotas (`/`, `/login`, `/cadastro`, `/catalogo`, `/livro/:id`, `/cardapio`, `/produto/:id`, `/promocao/:id`, `/perfil`, `/painel-funcionario`). `JS/canvas.js`, `JS/particulas.js` e `JS/magica.js` continuam como scripts soltos (efeitos visuais, sem estado de aplicação).
* **Back-end:** Node.js (utilizando apenas os módulos nativos como `http`, `fs` e `crypto`, sem frameworks como Express, para aprofundamento técnico). Serve a build do React como "SPA shell": qualquer URL que não seja API nem arquivo estático real cai no `dist/index.html`, e o React Router decide o que mostrar.
* **Armazenamento de dados:** PostgreSQL hospedado no [Supabase](https://supabase.com) (schema em `database/supabase-schema.sql`), acessado via `pg` (driver nativo, sem ORM).
* **Segurança:** Senhas protegidas com hash `scrypt` e *salt* aleatório (módulo nativo `crypto`).
* **Hospedagem:** [Render](https://render.com) (plano gratuito), com deploy automático a cada `git push` na branch `master`.
* **Design:** Logo e favicon em SVG, criados exclusivamente para o projeto.

## 🚀 Funcionalidades do Sistema

### Pra quem visita o site
- **Catálogo de livros** (`/catalogo`), com filtro por categoria e página de detalhe pra cada um (`/livro/:id`).
- **Cardápio do café** (`/cardapio`), com filtro por categoria e página de detalhe (`/produto/:id`).
- **Promoções**, cada uma com página própria (`/promocao/:id`).
- **Destaques** na home: livros mais vendidos e mais bem avaliados.
- **Cadastro livre e login** — não precisa de e-mail real, só um formato válido (veja "Criando sua conta" abaixo).
- **Modo claro/escuro** e **botão pra desligar efeitos visuais** (brilho do cursor, fagulhas), no cabeçalho.
- **Trilha de navegação** em todas as páginas.
- **Layout responsivo**, adaptado pra computador, tablet e celular.

### Pra quem tem conta
- **Editar perfil e trocar senha**, em "Meus Dados".
- **Cliente:** solicita empréstimo de um livro direto na página dele, acompanha e cancela pedidos em "Meus Empréstimos".
- **Equipe (funcionário/admin):** painel próprio (`/painel-funcionario`) com resumo de números-chave e gestão completa de **biblioteca**, **cardápio**, **promoções**, **empréstimos** (aprovar, rejeitar, marcar devolução) e **contas de clientes**.

### Segurança e dados
- Senhas protegidas com hash (`scrypt` + *salt*), nunca guardadas em texto puro.
- Sessão por token assinado, validado em toda ação restrita.
- Dados persistidos no Postgres (Supabase), com automação que mantém o banco ativo e faz limpeza mensal (veja `database/SUPABASE.md`).

### 🟡 Possíveis Expansões Futuras
- [ ] **Sistema de Reservas:** retirada presencial de livros já reservados pelo site.
- [ ] **Notificação de Empréstimo:** avisar o cliente quando um pedido for aprovado/rejeitado.
- [ ] **Compra de verdade:** carrinho e checkout pro cardápio do café (hoje é só vitrine/detalhe).
- [ ] **Confirmação Real de E-mail:** hoje só o formato é validado, não se o e-mail existe de fato.

## 🔑 Criando sua conta

Não existem mais contas fixas de demonstração — qualquer pessoa cria a própria conta em
[`/cadastro`](https://pandora-livraria-e-cafe.onrender.com/cadastro). Não precisa ser um e-mail
real nem receber confirmação nenhuma: o servidor só confere se o **formato** é válido (tem que
parecer um e-mail de verdade — algo como `nome@dominio.com` — mas ninguém verifica se esse
endereço existe). Por exemplo, `visitante@teste.com` já é aceito.

> O tipo da conta é definido pelo domínio do e-mail no cadastro: quem usa
> `@pandoralivraria.com.br` vira funcionário/admin (acesso ao painel da equipe), qualquer outro
> domínio (Gmail, Outlook, `.com` genérico, etc.) vira cliente.

> Qualquer domínio (Gmail, Outlook, etc.) vira cliente.

> ⚠️ São contas públicas de demonstração, então nunca use nelas uma senha real. Diferente de antes (quando o site usava JSON), contas criadas pelo formulário de cadastro agora ficam salvas no Postgres e sobrevivem a reinícios/deploys do Render.

## 📂 Estrutura do Projeto

Abaixo está o mapa para você se encontrar dentro dos arquivos do projeto:

```text
📁 Raiz
 ├── 📁 CSS
 │    └── 📄 style.css              # Estilos visuais (tema "Serpentine Parchment & Brass")
 ├── 📁 JS                          # Scripts soltos: só efeitos visuais, sem estado de aplicação
 │    ├── 📄 canvas.js              # Lógica da varinha mágica luminosa (Canvas 2D)
 │    ├── 📄 magica.js              # Lógica das partículas e estrelas interativas (rota /testes)
 │    └── 📄 particulas.js          # Fagulhas mágicas flutuando pela tela (decorativo)
 ├── 📁 database
 │    ├── 📄 supabase-schema.sql                     # Schema Postgres (tabelas + acervo inicial), roda no SQL Editor do Supabase
 │    ├── 📄 migracao-solicitacao-emprestimo.sql     # ALTER TABLE pra bancos já existentes (fluxo de empréstimo solicitado)
 │    ├── 📄 migracao-cancelamento-emprestimo.sql    # ALTER TABLE pra bancos já existentes (status 'cancelado')
 │    ├── 📄 migracao-produtos.sql                   # CREATE TABLE pra bancos já existentes (cardápio do café)
 │    ├── 📄 supabase-limpeza-mensal.sql             # Função de limpeza mensal do banco
 │    └── 📄 SUPABASE.md                             # Como conectar o servidor ao Supabase e ativar a automação
 ├── 📁 imagens
 │    ├── 📄 logo.svg               # Logo do projeto (cabeçalho, favicon e README)
 │    └── 📄 preview.png            # Print do site usado no README
 ├── 📁 app                         # Código-fonte React (Vite) do site inteiro
 │    ├── 📁 src
 │    │    ├── 📄 main.jsx                  # Ponto de entrada (monta o <BrowserRouter>)
 │    │    ├── 📄 App.jsx                   # Define as rotas (React Router)
 │    │    ├── 📄 sessao.js                 # Ler/salvar sessão, sair, decidir página por tipo de conta
 │    │    ├── 📄 preferencias.js           # Ler/salvar tema (claro/escuro) e efeitos mágicos (on/off)
 │    │    ├── 📄 icones.js                 # Ícones SVG por categoria (livro e produto do café)
 │    │    ├── 📄 api.js                    # Chamadas fetch compartilhadas (login/cadastro, admin)
 │    │    ├── 📁 componentes
 │    │    │    ├── 📄 Cabecalho.jsx        # Cabeçalho único de todo o site (inclui botões de tema/efeitos)
 │    │    │    ├── 📄 Breadcrumb.jsx       # Trilha de navegação abaixo do cabeçalho
 │    │    │    ├── 📄 Rodape.jsx
 │    │    │    ├── 📄 VitrineLivros.jsx    # Grid de livros (/api/lancamentos)
 │    │    │    ├── 📄 VitrinePromocoes.jsx # Grid de promoções (/api/promocoes)
 │    │    │    ├── 📄 VitrineDestaques.jsx # Mais vendidos/avaliados (/api/destaques)
 │    │    │    ├── 📄 VitrineProdutos.jsx  # Grid de produtos do café (/api/produtos)
 │    │    │    ├── 📄 FormularioAuth.jsx   # Formulário de login/cadastro
 │    │    │    ├── 📄 EditarConta.jsx      # Editar perfil + trocar senha (cliente e equipe)
 │    │    │    └── 📄 RotaProtegida.jsx    # Guarda de rota por tipo de conta
 │    │    └── 📁 paginas                   # Uma por rota: Inicio, Login, Cadastro, Catalogo, Livro,
 │    │                                     # CatalogoProdutos, Produto, Promocao, Perfil,
 │    │                                     # PainelEquipe, Teste, NaoEncontrada
 │    ├── 📄 index.html              # HTML base usado pelo Vite (carrega canvas.js/particulas.js)
 │    ├── 📄 vite.config.js          # Configuração de build (gera a pasta /dist)
 │    └── 📄 package.json            # Dependências do app React (react, react-router-dom, vite)
 ├── 📁 dist                        # Build gerada do app/ (gerado por `npm run build`, servida como SPA)
 ├── 📄 servidor-estatico.js        # Backend (Servidor Node.js, conexão Postgres, rotas de API e SPA shell)
 ├── 📄 package.json                # Dependências e scripts (npm start, npm run dev, npm run build)
 ├── 📄 package-lock.json           # Versões exatas das dependências
 ├── 📄 .env.example                # Modelo da variável DATABASE_URL (copiar para .env)
 ├── 📄 .gitignore                  # Arquivos ignorados pelo Git (node_modules, .env)
 ├── 📄 GUIA-SERVIDOR.md            # Documentação técnica de como o Node funciona
 └── 📄 README.md                   # Esta documentação
```

## 💻 Como Rodar o Projeto Localmente

O servidor precisa de um banco Postgres (Supabase) pra rodar — veja [`database/SUPABASE.md`](database/SUPABASE.md) pra criar o projeto e as tabelas antes do passo 4. Também é necessário ter o [Node.js](https://nodejs.org) instalado.

1. **Clone o repositório** e entre na pasta:
   ```bash
   git clone https://github.com/GehMay/Pandora-Livraria-E-Cafe.git
   cd Pandora-Livraria-E-Cafe
   ```
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3. **Configure as variáveis de ambiente:** copie `.env.example` para `.env` e preencha `DATABASE_URL`
   com a *connection string* do Supabase (detalhes em `database/SUPABASE.md`) e gere um `SESSION_SECRET`
   (usado pra assinar os tokens de login — o próprio `.env.example` mostra o comando pra gerar um).
4. **Inicie o servidor** (usa `npm run dev` em vez de `npm start` pra carregar o `.env`):
   ```bash
   npm run dev
   ```
5. Abra seu navegador e acesse: [http://localhost:5500](http://localhost:5500)

> 💡 A porta padrão é a `5500`. Se a variável de ambiente `PORT` estiver definida (como acontece no Render), o servidor usa o valor dela. No Render, `DATABASE_URL` e `SESSION_SECRET` são configuradas direto no painel (Environment), então lá o comando usado é o `npm start` normal.

### ⚛️ Mexendo no site em React (`app/`)

O site inteiro é gerado na pasta `/dist`. Rodar `npm run dev` na raiz (passo 4 acima) sozinho já é suficiente pra navegar em tudo. Altere o `app/` para editar qualquer página — veja a tabela de rotas abaixo pra saber onde mexer:

| Rota | Arquivo |
|---|---|
| `/` | `app/src/paginas/PaginaInicio.jsx` |
| `/login` | `app/src/paginas/PaginaLogin.jsx` |
| `/cadastro` | `app/src/paginas/PaginaCadastro.jsx` |
| `/catalogo` | `app/src/paginas/PaginaCatalogo.jsx` |
| `/livro/:id` | `app/src/paginas/PaginaLivro.jsx` |
| `/cardapio` | `app/src/paginas/PaginaCatalogoProdutos.jsx` |
| `/produto/:id` | `app/src/paginas/PaginaProduto.jsx` |
| `/promocao/:id` | `app/src/paginas/PaginaPromocao.jsx` |
| `/perfil` | `app/src/paginas/PaginaPerfil.jsx` |
| `/painel-funcionario` | `app/src/paginas/PaginaPainelEquipe.jsx` |

**Pra criar uma página nova** (ex.: a página de um livro específico): crie o componente em `app/src/paginas/`, adicione uma `<Route>` em `app/src/App.jsx` — nada no servidor precisa mudar, o `servidor-estatico.js` já serve qualquer rota nova através da SPA.

1. **Modo desenvolvimento** (com hot reload, mas ainda precisa do servidor Node rodando em outro terminal pra API/CSS/imagens funcionarem):
   ```bash
   cd app
   npm install
   npm run dev
   ```
2. **Gerar o build de novo** depois de editar o React (o servidor Node serve o site a partir da pasta `/dist`, então esse passo é obrigatório antes de commitar):
   ```bash
   npm run build
   ```

---

## 👩‍💻 Autoria

Desenvolvido com dedicação por **Geovanna** como projeto prático de aprimoramento em Desenvolvimento Web Full-Stack.

Assistentes de IA (Claude Code) foram usados como ferramenta de apoio — só em tarefas repetitivas
(ex.: replicar o mesmo padrão de CRUD em várias abas do painel) ou em mudanças muito grandes pra
fazer manualmente em tempo hábil (ex.: a reforma visual completa do tema). As decisões de produto,
arquitetura e design continuam sendo da autora.

---

## 📜 Licença

Este projeto está licenciado sob a **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**.

Isso significa que você **pode**:
- ✅ Compartilhar — copiar e redistribuir o material em qualquer formato.
- ✅ Adaptar — remixar, transformar e criar a partir do material para qualquer finalidade.

Desde que você **respeite as seguintes condições**:
- 📌 **Atribuição:** Você deve dar o crédito apropriado à autora original (Geovanna), indicar se foram feitas alterações e fornecer um link para a licença.
- 📌 **CompartilhaIgual:** Se você remixar ou transformar este projeto, deve distribuir suas contribuições sob a **mesma licença** que o original.

Licença completa disponível em: https://creativecommons.org/licenses/by-sa/4.0/deed.pt
