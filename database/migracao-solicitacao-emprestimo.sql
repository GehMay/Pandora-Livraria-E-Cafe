-- Migração pro banco já em produção (Supabase): adiciona o fluxo de empréstimo
-- solicitado pelo próprio cliente. `supabase-schema.sql` já reflete esse schema
-- pra quem instalar o projeto do zero; este arquivo é só pra atualizar um banco
-- que já existia antes dessa mudança.

alter table emprestimos
  add column if not exists id_usuario uuid references usuarios (id) on delete set null;

alter table emprestimos drop constraint if exists emprestimos_status_check;

alter table emprestimos
  add constraint emprestimos_status_check check (status in ('solicitado', 'ativo', 'devolvido', 'rejeitado'));
