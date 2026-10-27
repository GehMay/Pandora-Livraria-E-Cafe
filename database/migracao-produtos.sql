-- Migração pro banco já em produção (Supabase): cria a tabela de produtos do
-- café (vitrine `/cardapio` + `/produto/:id` + aba "Cardápio" do painel).
-- `supabase-schema.sql` já reflete esse schema pra quem instalar o projeto do
-- zero; este arquivo é só pra atualizar um banco que já existia antes dessa
-- mudança (mesmo padrão das migrações anteriores).

create table if not exists produtos (
  id_produto serial primary key,
  nome text not null,
  categoria text not null,
  preco numeric(10, 2) not null,
  descricao text not null
);

insert into produtos (nome, categoria, preco, descricao)
select * from (values
  ('Cerveja Amanteigada', 'Bebidas', 12.50, 'Clássica bebida quente e cremosa, com espuma dourada. Serve bem num dia frio no Beco Diagonal.'),
  ('Suco de Abóbora', 'Bebidas', 9.00, 'Suco gelado e docinho, tradicional das Três Vassouras.'),
  ('Sapo de Chocolate', 'Doces', 7.50, 'Chocolate ao leite em formato de sapo saltitante — vem com um card colecionável.'),
  ('Torta de Melaço', 'Doces', 15.00, 'Fatia generosa da torta preferida dos bruxos, com calda de melaço.')
) as seed (nome, categoria, preco, descricao)
where not exists (select 1 from produtos);
