-- Migração pro banco já em produção (Supabase): adiciona o status 'cancelado',
-- usado quando o próprio cliente desiste de um pedido de empréstimo ainda não
-- aprovado. `supabase-schema.sql` já reflete esse schema pra quem instalar o
-- projeto do zero; este arquivo é só pra atualizar um banco que já existia
-- antes dessa mudança (mesmo padrão de `migracao-solicitacao-emprestimo.sql`).

alter table emprestimos drop constraint if exists emprestimos_status_check;

alter table emprestimos
  add constraint emprestimos_status_check check (status in ('solicitado', 'ativo', 'devolvido', 'rejeitado', 'cancelado'));
