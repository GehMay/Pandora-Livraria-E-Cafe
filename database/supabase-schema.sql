-- Schema Postgres do Pandora Livraria & Café, pra rodar no SQL Editor do Supabase.
-- Substitui o antigo database/setup.sql (pensado pra MySQL, nunca chegou a ser usado).
-- Cria só as tabelas que o app usa hoje (sem reservas, ainda não implementado na UI).

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  senha text not null,
  tipo text not null check (tipo in ('cliente', 'funcionario', 'admin')),
  criado_em timestamptz not null default now()
);

create table if not exists livros (
  id_livro serial primary key,
  titulo text not null,
  autor text not null,
  categoria text not null,
  preco numeric(10, 2) not null,
  avaliacao numeric(2, 1) not null default 0,
  total_vendas integer not null default 0,
  estoque integer not null default 0
);

create table if not exists promocoes (
  id_promocao serial primary key,
  titulo text not null,
  descricao text not null,
  desconto text not null
);

create table if not exists emprestimos (
  id_emprestimo serial primary key,
  -- 'on delete set null' (e coluna sem not null): apagar o livro não pode apagar
  -- o histórico de empréstimos já devolvidos, só desvincula o id_livro.
  id_livro integer references livros (id_livro) on delete set null,
  nome_cliente text not null,
  contato_cliente text,
  data_emprestimo date not null default current_date,
  data_prevista_devolucao date not null,
  data_devolucao date,
  status text not null default 'ativo' check (status in ('ativo', 'devolvido'))
);

-- Seed: mesmo acervo que já existia em dados/banco.json.
-- Só insere se a tabela ainda estiver vazia, pra rodar este arquivo de novo não duplicar
-- nada (nem apagar livros/promoções que você já tiver criado pelo painel da equipe).
insert into livros (titulo, autor, categoria, preco, avaliacao, total_vendas, estoque)
select * from (values
  ('Poções Muito Malignas', 'Phineas Bourne', 'Poções', 120.50, 4.8, 150, 5),
  ('Magia Pura e Nobre', 'Draco Malfoy', 'Biografias', 55.50, 3.9, 45, 5),
  ('Guia Avançado de Transfiguração', 'Emeric Switch', 'Transfiguração', 85.00, 4.9, 300, 5),
  ('Segredos das Artes das Trevas', 'Salazar Sonserina', 'Artes das Trevas', 500.00, 5.0, 10, 5),
  ('O Segredos das Artes das Trevas', 'Voldemort', 'Artes das Trevas', 666.00, 4.5, 13, 5),
  ('Um Livro de Pronúncias Corretas', 'Hermione Granger', 'Feitiços', 45.00, 4.9, 100, 5)
) as seed (titulo, autor, categoria, preco, avaliacao, total_vendas, estoque)
where not exists (select 1 from livros);

insert into promocoes (titulo, descricao, desconto)
select * from (values
  ('Happy Hour na Masmorra', 'Todas as Cervejas Amanteigadas com desconto especial das 18h às 20h. Venha descansar após uma longa jornada mágica!', '50% OFF'),
  ('Combo do Caldeirão', 'Peça qualquer poção quente e ganhe um Sapo de Chocolate de brinde.', 'Brinde'),
  ('Semana das Trevas', 'Todos os grimórios da Seção Restrita com desconto especial. Apresente sua carteirinha na entrada.', '25% OFF'),
  ('Orgulho Sonserino', 'Mostre seu cachecol verde e prata e ganhe desconto em qualquer grimório de Poções + um Suco de Abóbora grátis!', '20% + Brinde')
) as seed (titulo, descricao, desconto)
where not exists (select 1 from promocoes);
