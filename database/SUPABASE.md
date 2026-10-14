# Supabase: manter o projeto ativo e limpeza mensal

Preparação para quando o projeto migrar (ou passar a usar, em paralelo) um banco Supabase.
Hoje o site ainda lê/grava em `dados/*.json` (veja `servidor-estatico.js`); nada aqui está
conectado a dados reais ainda — é só a automação pronta para quando o projeto Supabase existir.

## Por que isso existe

No plano gratuito, um projeto Supabase **pausa depois de ~7 dias sem atividade**. Depois de
pausado, só volta com um clique manual no painel (nenhuma chamada de API acorda ele de volta).
Como este é um projeto público com uso imprevisível, a estratégia é **nunca deixar pausar**:
um ping leve a cada 3 dias, via GitHub Actions.

## O que foi criado

- `.github/workflows/supabase-manutencao.yml` — roda dois jobs agendados:
  - `manter-ativo`: a cada 3 dias, faz uma chamada simples à API do Supabase (`GET /rest/v1/`).
  - `limpeza-mensal`: todo dia 1 do mês, chama a função `limpeza_mensal()` do banco via RPC.
- `database/supabase-limpeza-mensal.sql` — a função `limpeza_mensal()`. Hoje ela só registra
  que rodou; o `DELETE` de exemplo está comentado porque o critério de limpeza (quais tabelas,
  qual prazo) ainda não foi decidido.

## Como ativar

1. Criar o projeto em [supabase.com](https://supabase.com) e copiar, em
   **Project Settings → API**: a **Project URL**, a **anon key** e a **service_role key**.
2. No GitHub: **Settings → Secrets and variables → Actions → New repository secret** e criar:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca colocar essa chave em código ou commit, só em secret)
3. No **SQL Editor** do Supabase, rodar o conteúdo de `database/supabase-limpeza-mensal.sql`
   para criar a função `limpeza_mensal()`.
4. Testar manualmente antes de esperar o agendamento: na aba **Actions** do GitHub, abrir
   "Manutenção do Supabase" → **Run workflow**. Isso roda os dois jobs na hora.
5. Quando o critério de limpeza for decidido, editar o `DELETE` comentado em
   `supabase-limpeza-mensal.sql` e rodar de novo no SQL Editor do Supabase (o arquivo no
   repositório é só a referência; a função que vale é a que está salva no banco).
