-- Migração pro banco já em produção (Supabase): cria a tabela de feedback
-- (formulário público em /feedback + aba "Feedback" do painel da equipe).
-- `supabase-schema.sql` já reflete esse schema pra quem instalar o projeto do
-- zero; este arquivo é só pra atualizar um banco que já existia antes dessa
-- mudança (mesmo padrão das migrações anteriores).

create table if not exists feedback (
  id serial primary key,
  nome text,
  email text,
  nota integer check (nota between 1 and 5),
  mensagem text not null,
  criado_em timestamptz not null default now()
);
