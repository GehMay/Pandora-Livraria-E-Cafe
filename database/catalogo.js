// ═══════════════════════════════════════════════════════════════
// REPOSITÓRIO DO CATÁLOGO (livros e promoções)
//
// Mesma ideia do database/usuarios.js: se o MySQL estiver configurado,
// consulta as tabelas Livro e Promocao; senão, lê dados/banco.json.
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { pool, MYSQL_ATIVO } = require('./conexao');

const ARQUIVO_BANCO = path.join(__dirname, '..', 'dados', 'banco.json');

function lerBancoJson() {
  try {
    const dados = fs.readFileSync(ARQUIVO_BANCO, 'utf-8');
    return JSON.parse(dados);
  } catch (erro) {
    console.error('Erro ao ler banco.json:', erro.message);
    return { livros: [], promocoes: [] };
  }
}

async function listarLivros() {
  if (!MYSQL_ATIVO) return lerBancoJson().livros;
  const [linhas] = await pool.query('SELECT * FROM Livro ORDER BY id_livro');
  return linhas;
}

async function listarPromocoes() {
  if (!MYSQL_ATIVO) return lerBancoJson().promocoes;
  const [linhas] = await pool.query('SELECT * FROM Promocao WHERE ativo = TRUE');
  return linhas;
}

async function obterDestaques() {
  if (!MYSQL_ATIVO) {
    const livros = lerBancoJson().livros;
    const maisAvaliados = [...livros].sort((a, b) => b.avaliacao - a.avaliacao).slice(0, 4);
    const maisVendidos = [...livros].sort((a, b) => b.total_vendas - a.total_vendas).slice(0, 4);
    return { maisAvaliados, maisVendidos };
  }

  const [maisAvaliados] = await pool.query('SELECT * FROM Livro ORDER BY avaliacao DESC LIMIT 4');
  const [maisVendidos] = await pool.query('SELECT * FROM Livro ORDER BY total_vendas DESC LIMIT 4');
  return { maisAvaliados, maisVendidos };
}

/**
 * Cadastra um livro novo. Só funciona com o MySQL ativo — no modo
 * JSON, quem chamar isso deve tratar o erro e avisar que a rota
 * está desativada (veja /api/lancamentos em servidor-estatico.js).
 */
async function criarLivro({ titulo, autor, categoria, preco, estoque, sinopse, capa }) {
  if (!MYSQL_ATIVO) {
    throw new Error('Cadastro de livros requer o MySQL ativo (veja database/MYSQL.md)');
  }

  const [resultado] = await pool.query(
    'INSERT INTO Livro (titulo, autor, categoria, preco, estoque, sinopse, capa) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [titulo, autor, categoria || null, preco, estoque || 0, sinopse || null, capa || null]
  );

  const [linhas] = await pool.query('SELECT * FROM Livro WHERE id_livro = ?', [resultado.insertId]);
  return linhas[0];
}

module.exports = { listarLivros, listarPromocoes, obterDestaques, criarLivro, MYSQL_ATIVO };
