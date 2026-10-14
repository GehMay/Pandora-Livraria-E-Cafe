-- Função de manutenção mensal do banco no Supabase.
-- Chamada automaticamente pelo workflow .github/workflows/supabase-manutencao.yml
-- (via POST /rest/v1/rpc/limpeza_mensal), todo dia 1 de cada mês.
--
-- Ajuste o DELETE abaixo quando o schema real do projeto estiver definido.
-- Por enquanto só registra que rodou, sem apagar nada.
create or replace function limpeza_mensal()
returns void
language plpgsql
security definer
as $$
begin
  -- Exemplo de regra (ajuste tabela/coluna/prazo quando decidir o critério real):
  -- delete from usuarios where criado_em < now() - interval '90 days' and temporario = true;

  raise notice 'limpeza_mensal executada em %', now();
end;
$$;
