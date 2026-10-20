-- Cria o banco do zero
CREATE DATABASE IF NOT EXISTS pandora_livraria;
USE pandora_livraria;

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, -- formato "salt:hash" (scrypt), nunca texto puro
    tipo ENUM('cliente', 'funcionario', 'admin') NOT NULL DEFAULT 'cliente',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Livros
CREATE TABLE IF NOT EXISTS Livro (
    id_livro INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    estoque INT NOT NULL DEFAULT 0,
    preco DECIMAL(10, 2) NOT NULL,
    sinopse TEXT,
    capa VARCHAR(255),
    avaliacao DECIMAL(2,1) DEFAULT 0,
    total_vendas INT DEFAULT 0
);

-- 3. Tabela de Reservas 
CREATE TABLE IF NOT EXISTS Reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    data_reserva_inicio DATE NOT NULL,
    data_reserva_final DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Ativa',
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- 4. Tabela Intermediária Reserva_Livro
CREATE TABLE IF NOT EXISTS Reserva_Livro (
    id_reserva INT,
    id_livro INT,
    quantidade INT DEFAULT 1,
    PRIMARY KEY (id_reserva, id_livro),
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva),
    FOREIGN KEY (id_livro) REFERENCES Livro(id_livro)
);

-- 5. Nova Tabela de Promoções
CREATE TABLE IF NOT EXISTS Promocao (
    id_promocao INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    desconto VARCHAR(50),
    tipo ENUM('cafe', 'livraria', 'mista') NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

-- 6. DADOS DE TESTE INICIAIS
INSERT INTO Livro (titulo, autor, categoria, preco, estoque, avaliacao, total_vendas) 
VALUES ('O Hobbit', 'J.R.R. Tolkien', 'Fantasia', 49.90, 5, 4.8, 120);

INSERT INTO Promocao (titulo, descricao, desconto, tipo, data_inicio, data_fim) VALUES
('Café + Livro', 'Compre qualquer livro e ganhe um café expresso', 'Brinde', 'mista', '2026-09-01', '2026-09-30'),
('Happy Hour Literário', 'Todos os cafés com 30% OFF das 17h às 19h', '30% OFF', 'cafe', '2026-09-01', '2026-09-30'),
('Semana do Romance', 'Todos os livros de romance com 20% OFF', '20% OFF', 'livraria', '2026-09-01', '2026-09-15');
