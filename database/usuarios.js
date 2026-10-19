// ═══════════════════════════════════════════════════════════════
// REPOSITÓRIO DE USUÁRIOS
//
// Centraliza a leitura/gravação de usuários. Se o MySQL estiver
// configurado (database/conexao.js), usa a tabela Usuario; senão,
// cai de volta pro arquivo dados/usuarios.json, exatamente como o
// site já funcionava. O resto do servidor não precisa saber qual
// dos dois está em uso.
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pool, MYSQL_ATIVO } = require('./conexao');

const ARQUIVO_USUARIOS = path.join(__dirname, '..', 'dados', 'usuarios.json');

// ── Fallback em JSON ────────────────────────────────────────────

function lerUsuariosJson() {
  try {
    if (!fs.existsSync(ARQUIVO_USUARIOS)) return [];
    return JSON.parse(fs.readFileSync(ARQUIVO_USUARIOS, 'utf-8'));
  } catch (erro) {
    console.error('Erro ao ler usuários:', erro.message);
    return [];
  }
}

function salvarUsuariosJson(usuarios) {
  try {
    const pasta = path.dirname(ARQUIVO_USUARIOS);
    if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
    fs.writeFileSync(ARQUIVO_USUARIOS, JSON.stringify(usuarios, null, 2), 'utf-8');
  } catch (erro) {
    console.error('Erro ao salvar usuários:', erro.message);
  }
}

// ── Formato comum (MySQL e JSON devolvem o mesmo formato) ───────

function usuarioDaLinhaMysql(linha) {
  return {
    id: String(linha.id_usuario),
    nome: linha.nome,
    email: linha.email,
    senha: linha.senha,
    tipo: linha.tipo,
    criadoEm: linha.criado_em instanceof Date ? linha.criado_em.toISOString() : linha.criado_em
  };
}

// ── API do repositório ───────────────────────────────────────────

async function listarUsuarios() {
  if (!MYSQL_ATIVO) return lerUsuariosJson();
  const [linhas] = await pool.query('SELECT * FROM Usuario');
  return linhas.map(usuarioDaLinhaMysql);
}

async function buscarUsuarioPorEmail(email) {
  if (!MYSQL_ATIVO) return lerUsuariosJson().find((u) => u.email === email) || null;
  const [linhas] = await pool.query('SELECT * FROM Usuario WHERE email = ? LIMIT 1', [email]);
  return linhas[0] ? usuarioDaLinhaMysql(linhas[0]) : null;
}

async function buscarUsuarioPorId(id) {
  if (!MYSQL_ATIVO) return lerUsuariosJson().find((u) => u.id === id) || null;
  const [linhas] = await pool.query('SELECT * FROM Usuario WHERE id_usuario = ? LIMIT 1', [id]);
  return linhas[0] ? usuarioDaLinhaMysql(linhas[0]) : null;
}

/**
 * Cria um usuário novo. `senhaHash` já deve vir no formato "salt:hash"
 * (veja criarHashSenha em servidor-estatico.js).
 */
async function criarUsuario({ nome, email, senhaHash, tipo }) {
  if (!MYSQL_ATIVO) {
    const usuarios = lerUsuariosJson();
    const novo = {
      id: crypto.randomUUID(),
      nome,
      email,
      senha: senhaHash,
      tipo,
      criadoEm: new Date().toISOString()
    };
    usuarios.push(novo);
    salvarUsuariosJson(usuarios);
    return novo;
  }

  const [resultado] = await pool.query(
    'INSERT INTO Usuario (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
    [nome, email, senhaHash, tipo]
  );
  return buscarUsuarioPorId(String(resultado.insertId));
}

/**
 * Garante que as contas fixas de demonstração existem e estão com a
 * senha/tipo esperados. Recebe a lista já com `senhaHash` calculado
 * (quem sabe fazer o hash é o servidor-estatico.js).
 */
async function garantirContasFixas(contas) {
  if (!MYSQL_ATIVO) {
    const emails = contas.map((c) => c.email);
    const usuarios = lerUsuariosJson().filter((u) => !emails.includes(u.email));
    contas.forEach((c) => {
      usuarios.push({
        id: c.id,
        nome: c.nome,
        email: c.email,
        senha: c.senhaHash,
        tipo: c.tipo,
        criadoEm: new Date().toISOString()
      });
    });
    salvarUsuariosJson(usuarios);
    return;
  }

  for (const c of contas) {
    await pool.query(
      `INSERT INTO Usuario (nome, email, senha, tipo) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nome = VALUES(nome), senha = VALUES(senha), tipo = VALUES(tipo)`,
      [c.nome, c.email, c.senhaHash, c.tipo]
    );
  }
}

module.exports = {
  listarUsuarios,
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  criarUsuario,
  garantirContasFixas,
  MYSQL_ATIVO
};
