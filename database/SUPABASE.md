# Supabase: banco de dados, manter ativo e limpeza mensal

O `servidor-estatico.js` guarda usuários, livros, promoções e empréstimos direto no Postgres
do Supabase (via `DATABASE_URL`) — não usa mais arquivos `.json` em disco.

## Conectar o servidor ao banco (`DATABASE_URL`)

1. No Supabase, clique em **Connect** (topo do painel) → aba **Connection string** →
   selecione **Session pooler** (⚠️ não "Direct connection": essa é IPv6-only e não funciona
   no Render nem em redes sem suporte a IPv6 — veja `database/supabase-schema.sql` pra criar
   as tabelas antes de usar isso).
2. Copie a connection string e troque `[YOUR-PASSWORD]` pela senha do banco que você definiu
   na criação do projeto.
3. **Local:** copie `.env.example` para `.env` (arquivo já ignorado pelo Git) e cole a
   connection string em `DATABASE_URL=`. Rode com `npm run dev` (em vez de `npm start`) pra
   carregar esse `.env` automaticamente.
4. **Render:** no painel do serviço → **Environment** → adicione a variável `DATABASE_URL`
   com a mesma connection string. O `npm start` lê `process.env.DATABASE_URL` normalmente,
   sem precisar de arquivo.
5. Antes de rodar o servidor pela primeira vez, execute `database/supabase-schema.sql` no
   **SQL Editor** do Supabase — ele cria as tabelas (`usuarios`, `livros`, `promocoes`,
   `emprestimos`) e popula `livros`/`promocoes` com o acervo original. Pode rodar esse arquivo
   de novo sem medo: ele só insere o acervo inicial se as tabelas ainda estiverem vazias.

## Manter o projeto ativo e limpeza mensal

No plano gratuito, um projeto Supabase **pausa depois de ~7 dias sem atividade**. Depois de
pausado, só volta com um clique manual no painel (nenhuma chamada de API acorda ele de volta).
Como este é um projeto público com uso imprevisível, a estratégia é **nunca deixar pausar**:
um ping leve **todo dia**, via GitHub Actions (antes era a cada 3 dias; aumentamos a frequência
depois de uma falha pontual do runner do GitHub — veja "Sobre falhas no ping" abaixo).

- `.github/workflows/supabase-manutencao.yml` — roda dois jobs agendados:
  - `manter-ativo`: todo dia, faz uma chamada simples à API do Supabase (`GET /rest/v1/`).
  - `limpeza-mensal`: todo dia 1 do mês, chama a função `limpeza_mensal()` do banco via RPC.
- `database/supabase-limpeza-mensal.sql` — a função `limpeza_mensal()`. Hoje ela só registra
  que rodou; o `DELETE` de exemplo está comentado porque o critério de limpeza (quais tabelas,
  qual prazo) ainda não foi decidido.

## Sobre falhas no ping

Um `manter-ativo` pode falhar de vez em quando por instabilidade passageira do próprio runner
do GitHub Actions (ex.: erro de DNS "couldn't resolve host" que desaparece ao rodar de novo) —
isso não significa que o `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` estão errados. Rodando todo
dia (em vez de a cada 3 dias), uma falha isolada tem bem mais margem antes de chegar nos ~7 dias
de inatividade que pausam o projeto.

Se o projeto **já pausou**, nenhuma quantidade de pings resolve: é preciso entrar no painel do
Supabase e clicar em **"Restore project"** manualmente. Depois de restaurado, o workflow volta a
mantê-lo ativo normalmente.

> ⚠️ **Sobre as chaves novas do Supabase** (`sb_publishable_...` / `sb_secret_...`, que
> substituíram as antigas `anon`/`service_role` em JWT): o endpoint `GET /rest/v1/` (usado
> pra "pingar" e manter o projeto ativo) só aceita a **secret key** — a publishable key dá
> `401 Secret API key required` nele, porque esse endpoint introspecciona o schema inteiro.
> Por isso o job `manter-ativo` usa `SUPABASE_SERVICE_ROLE_KEY`, não a `anon`. A chave
> publishable (`SUPABASE_ANON_KEY`) fica guardada como secret, sem uso pelo workflow — não é
> ela que o `servidor-estatico.js` usa pra falar com o banco (ele usa `DATABASE_URL`, a
> conexão Postgres direta, não a API REST do Supabase).

### Como ativar a automação do GitHub Actions

1. No GitHub: **Settings → Secrets and variables → Actions → New repository secret** e criar:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` → valor da **Publishable key**
   - `SUPABASE_SERVICE_ROLE_KEY` → valor da **Secret key** (⚠️ nunca colocar em código ou commit, só em secret)
2. No **SQL Editor** do Supabase, rodar o conteúdo de `database/supabase-limpeza-mensal.sql`
   para criar a função `limpeza_mensal()`.
3. Testar manualmente antes de esperar o agendamento: na aba **Actions** do GitHub, abrir
   "Manutenção do Supabase" → **Run workflow**. Isso roda os dois jobs na hora.
4. Quando o critério de limpeza for decidido, editar o `DELETE` comentado em
   `supabase-limpeza-mensal.sql` e rodar de novo no SQL Editor do Supabase (o arquivo no
   repositório é só a referência; a função que vale é a que está salva no banco).
