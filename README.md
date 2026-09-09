# 📚☕ Pandora Livraria & Café

Um projeto de estudo Full-Stack focado no desenvolvimento de um sistema web completo para uma livraria mágica fictícia do universo de **Harry Potter**, localizada no **Beco Diagonal**.

Este projeto foi construído do zero, **sem o uso de frameworks complexos**, com o objetivo principal de aprender e consolidar os fundamentos da web (Manipulação do DOM, requisições HTTP, modelagem de banco de dados e estilização estrutural).

## 🎯 Objetivo do Projeto (Produto Final)
O sistema final permitirá que os clientes naveguem pelo acervo de grimórios e livros mágicos, vejam os lançamentos, descubram promoções (de livros e do café) e façam login para reservar obras e retirar na loja física. Além disso, contará com um painel administrativo para controle interno do estoque e cadastro de novas campanhas.

## 🛠️ Tecnologias Utilizadas
* **Front-end:** HTML5, CSS3 puros (Grid e Flexbox) e Vanilla JavaScript.
* **Back-end:** Node.js (utilizando apenas os módulos nativos como `http` e `fs`, sem frameworks como Express, para aprofundamento técnico).
* **Banco de Dados:** MySQL (relacional).

## 🚀 Funcionalidades do Sistema

### 🟢 O que já está implementado (MVP)
- [x] **Vitrine Dinâmica de Lançamentos:** Renderização de livros alimentados diretamente pelo banco de dados JSON (`dados/banco.json`), usando a tag `<template>` do HTML e manipulação segura via JavaScript.
- [x] **Vitrine de Promoções Ativas:** Exibe apenas as promoções cadastradas, buscadas do arquivo de dados em tempo real.
- [x] **API Backend:** Servidor próprio capaz de hospedar arquivos estáticos e prover rotas RESTful de dados (`/api/lancamentos`, `/api/promocoes`, `/api/destaques`).
- [x] **Interface Gráfica Temática:** Design responsivo baseado em *Cards* com paleta de cores da casa **Sonserina** (verde esmeralda e prata).
- [x] **Efeitos Visuais Mágicos:** Uso avançado de JavaScript para criar uma varinha mágica luminosa interativa (HTML5 Canvas) e partículas estelares, que reagem aos elementos da página.
- [x] **Arquitetura Simplificada para Deploy:** Substituição do MySQL por leitura de arquivos `.json` para facilitar a hospedagem gratuita do MVP.

### 🟡 O que está no Roadmap (Próximos Passos)
- [ ] **Deploy (Colocar no Ar):** Hospedar o servidor Node.js na nuvem para acesso público de forma rápida usando o `banco.json`.
- [ ] **Migração Cloud:** Migrar o banco de dados temporário de JSON para um MySQL em nuvem quando houver necessidade de salvar dados complexos (Cadastros e Reservas).
- [ ] **Seção de Destaques:** Lógica de negócio para exibir livros baseados nas maiores avaliações e número de vendas.
- [ ] **Sistema de Login e Autenticação:** Cadastro de clientes e administradores com senhas protegidas e criptografadas.
- [ ] **Sistema de Reservas:** Interface para o usuário autenticado selecionar grimórios para retirada presencial.
- [ ] **Painel Administrativo (`painel-admin.html`):** Área restrita para funcionários gerenciarem o estoque e as promoções.

## 📂 Estrutura do Projeto

Abaixo está o mapa para você se encontrar dentro dos arquivos do projeto:

```text
📁 Raiz
 ├── 📁 CSS
 │    └── 📄 style.css              # Estilos visuais (tema Sonserina e UI)
 ├── 📁 JS
 │    ├── 📄 lancamento.js          # Busca e renderiza os lançamentos do BD
 │    ├── 📄 promocoes.js           # Busca e renderiza as promoções ativas do BD
 │    ├── 📄 canvas.js              # Lógica da varinha mágica luminosa (Canvas 2D)
 │    └── 📄 magica.js              # Lógica das partículas e estrelas interativas
 ├── 📁 dados
 │    ├── 📄 banco.json             # Banco de dados principal da livraria (MVPs)
 │    └── 📄 usuarios.json          # Banco de dados de contas (Temporário)
 ├── 📁 database
 │    └── 📄 setup.sql              # Script guardado para futura migração para MySQL
 ├── 📄 index.html                  # Página inicial da loja
 ├── 📄 servidor-estatico.js        # Backend (Servidor Node.js e rotas de API)
 ├── 📄 GUIA-SERVIDOR.md            # Documentação técnica de como o Node funciona
 └── 📄 README.md                   # Esta documentação
```

## 💻 Como Rodar o Projeto Localmente

Com a nova arquitetura em JSON, rodar o projeto ficou incrivelmente simples (não exige mais banco de dados externo):

1. **Abra o terminal** na pasta raiz do projeto.
2. Caso ainda não tenha feito, instale as dependências executando:
   `npm install`
3. **Inicie o servidor** executando:
   `node servidor-estatico.js`
4. Abra seu navegador e acesse: `http://localhost:5500`

---

## 👩‍💻 Autoria

Desenvolvido com dedicação por **Geovanna** como projeto prático de aprimoramento em Desenvolvimento Web Full-Stack.

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
