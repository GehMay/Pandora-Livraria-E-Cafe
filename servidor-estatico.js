// ╔═══════════════════════════════════════════════════════════════╗
// ║  SERVIDOR HTTP PROFISSIONAL                                   ║
// ║  Com login, cadastro e dois tipos de usuários (admin/cliente) ║
// ╚═══════════════════════════════════════════════════════════════╝

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool, types } = require('pg');

// A coluna DATE do Postgres vira objeto Date em JS por padrão; mantemos como
// string 'YYYY-MM-DD' (oid 1082), que é o formato que o front-end já espera.
types.setTypeParser(1082, (valor) => valor);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase exige TLS
  max: 5
});
pool.on('error', (erro) => console.error('Erro inesperado no pool do Postgres:', erro.message));

// ═══════════════════════════════════════════════════════════════
// 1. CONFIGURAÇÕES INICIAIS
// ═══════════════════════════════════════════════════════════════

const PORTA = process.env.PORT || 5500;
const PASTA_PROJETO = __dirname;

// Quem se cadastra com um e-mail desse domínio é da equipe (funcionário/admin).
// Qualquer outro e-mail (Gmail, Outlook, etc.) vira conta de cliente.
const DOMINIO_LOJA = 'pandoralivraria.com.br';

function ehEmailDaLoja(email) {
  return email.endsWith('@' + DOMINIO_LOJA);
}

// ═══════════════════════════════════════════════════════════════
// 2. TIPOS MIME (para servir arquivos com tipo correto)
// ═══════════════════════════════════════════════════════════════

const TIPOS_MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// ═══════════════════════════════════════════════════════════════
// 3. FUNÇÕES DE CRIPTOGRAFIA (SEGURANÇA)
// ═══════════════════════════════════════════════════════════════

/**
 * Cria um hash da senha com salt aleatório
 */
function criarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifica se a senha está correta
 */
function verificarSenha(senha, senhaArmazenada) {
  const [salt, hashSalvo] = senhaArmazenada.split(':');
  const hashRecebido = crypto.scryptSync(senha, salt, 64).toString('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hashSalvo, 'hex'),
      Buffer.from(hashRecebido, 'hex')
    );
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// 3.5 SESSÃO: TOKEN ASSINADO (substitui o header x-usuario-email, que
// qualquer visitante podia forjar pra se passar por outra conta)
// ═══════════════════════════════════════════════════════════════

if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET não definida no .env — usando um valor fixo só pra desenvolvimento. Configure uma variável forte em produção (veja .env.example).');
}
const SESSION_SECRET = process.env.SESSION_SECRET || 'chave-apenas-para-desenvolvimento-local';
const DURACAO_TOKEN_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

/**
 * Token = base64url(payload) + '.' + assinatura HMAC-SHA256 do payload.
 * Carrega só o id do usuário e a validade — o tipo/e-mail são sempre
 * confirmados de novo no banco (buscarUsuarioPorId), então uma mudança de
 * tipo de conta já vale na próxima requisição, sem precisar de logout.
 */
function criarToken(idUsuario) {
  const payload = JSON.stringify({ id: idUsuario, exp: Date.now() + DURACAO_TOKEN_MS });
  const payloadBase64 = Buffer.from(payload).toString('base64url');
  const assinatura = crypto.createHmac('sha256', SESSION_SECRET).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${assinatura}`;
}

function verificarToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadBase64, assinatura] = token.split('.');
  const assinaturaEsperada = crypto.createHmac('sha256', SESSION_SECRET).update(payloadBase64).digest('base64url');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(assinatura), Buffer.from(assinaturaEsperada))) return null;
  } catch {
    return null; // tamanhos diferentes = token forjado/corrompido
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());
    if (!payload.id || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function lerTokenDoCabecalho(req) {
  const cabecalho = req.headers['authorization'] || '';
  return cabecalho.startsWith('Bearer ') ? cabecalho.slice('Bearer '.length) : null;
}

// ═══════════════════════════════════════════════════════════════
// 4. USUÁRIOS (Postgres)
// ═══════════════════════════════════════════════════════════════

async function buscarUsuarioPorEmail(email) {
  const { rows } = await pool.query('select * from usuarios where email = $1', [email]);
  return rows[0] || null;
}

async function buscarUsuarioPorId(id) {
  const { rows } = await pool.query('select * from usuarios where id = $1', [id]);
  return rows[0] || null;
}

/**
 * Confere o token do cabeçalho Authorization e devolve o usuário atual (já
 * reconfirmado no banco) ou null se o token não existir/expirou/for inválido.
 */
async function usuarioAutenticado(req) {
  const payload = verificarToken(lerTokenDoCabecalho(req));
  if (!payload) return null;
  return await buscarUsuarioPorId(payload.id);
}

// ═══════════════════════════════════════════════════════════════
// 5. FUNÇÕES DE VALIDAÇÃO
// ═══════════════════════════════════════════════════════════════

// Mais rigorosa que um simples "tem @ e um ponto": cada rótulo do domínio não
// pode começar/terminar com hífen nem ficar vazio (rejeita "a@.co", "a@b..c",
// "a@-b.com") e o TLD final precisa ter 2+ letras (rejeita "a@b.c"). Ainda
// aceita TLDs curtos de verdade como .co, .io etc.
function emailValido(email) {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return email.length <= 254 && regex.test(email);
}

function senhaValida(senha) {
  return senha.length >= 6;
}

function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    criadoEm: usuario.criado_em
  };
}

/**
 * Checagem pras rotas de administração: confere o token assinado (cabeçalho
 * 'Authorization: Bearer ...') e se a conta encontrada é funcionário/admin.
 * Diferente da versão anterior (que só confiava num header sem assinatura),
 * aqui ninguém consegue se passar por outra conta sem o token real emitido
 * no login/cadastro.
 */
async function exigirFuncionario(req, res) {
  const usuario = await usuarioAutenticado(req);
  if (!usuario || !['funcionario', 'admin'].includes(usuario.tipo)) {
    responderJson(res, 403, { erro: 'Acesso restrito à equipe' });
    return false;
  }
  return true;
}

/**
 * Mesma ideia de `exigirFuncionario`, mas pras rotas que só um cliente logado
 * pode chamar (solicitar empréstimo, ver os próprios empréstimos, cancelar
 * pedido). Devolve o usuário encontrado (pra reaproveitar o id sem buscar de
 * novo) ou null.
 */
async function exigirCliente(req, res) {
  const usuario = await usuarioAutenticado(req);
  if (!usuario || usuario.tipo !== 'cliente') {
    responderJson(res, 403, { erro: 'Acesso restrito a clientes logados' });
    return null;
  }
  return usuario;
}

/**
 * Qualquer conta logada (cliente, funcionário ou admin) — usado nas rotas de
 * "minha conta" (editar perfil, trocar senha), que não são específicas de um tipo.
 */
async function exigirUsuario(req, res) {
  const usuario = await usuarioAutenticado(req);
  if (!usuario) {
    responderJson(res, 401, { erro: 'Sessão inválida ou expirada, entre de novo' });
    return null;
  }
  return usuario;
}

// ═══════════════════════════════════════════════════════════════
// 6. LER CORPO DA REQUISIÇÃO
// ═══════════════════════════════════════════════════════════════

function lerCorpoRequisicao(req) {
  return new Promise((resolve, reject) => {
    let corpo = '';

    req.on('data', (chunk) => {
      corpo += chunk.toString();
      if (corpo.length > 10 * 1024 * 1024) {
        reject(new Error('Corpo muito grande'));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(corpo || '{}'));
      } catch (erro) {
        reject(new Error('JSON inválido'));
      }
    });

    req.on('error', reject);
  });
}

// ═══════════════════════════════════════════════════════════════
// 7. RESPONDER COM JSON
// ═══════════════════════════════════════════════════════════════

function responderJson(res, statusCode, dados) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(dados, null, 2));
}

// ═══════════════════════════════════════════════════════════════
// 8. API: CADASTRO
// ═══════════════════════════════════════════════════════════════

async function apiCadastro(req, res) {
  try {
    const corpo = await lerCorpoRequisicao(req);

    const nome = String(corpo.nome || '').trim();
    const email = String(corpo.email || '').trim().toLowerCase();
    const senha = String(corpo.senha || '').trim();

    if (!nome || !email || !senha) {
      responderJson(res, 400, { erro: 'Nome, email e senha são obrigatórios' });
      return;
    }

    if (!emailValido(email)) {
      responderJson(res, 400, { erro: 'Email inválido' });
      return;
    }

    if (!senhaValida(senha)) {
      responderJson(res, 400, { erro: 'Senha deve ter pelo menos 6 caracteres' });
      return;
    }

    const existente = await buscarUsuarioPorEmail(email);
    if (existente) {
      responderJson(res, 409, { erro: 'Este email já está cadastrado' });
      return;
    }

    const { rows } = await pool.query(
      `insert into usuarios (nome, email, senha, tipo)
       values ($1, $2, $3, $4)
       returning *`,
      [nome, email, criarHashSenha(senha), ehEmailDaLoja(email) ? 'funcionario' : 'cliente']
    );

    responderJson(res, 201, {
      mensagem: 'Cadastro realizado com sucesso!',
      usuario: usuarioPublico(rows[0])
    });

  } catch (erro) {
    console.error('Erro no cadastro:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar cadastro' });
  }
}

// ═══════════════════════════════════════════════════════════════
// 9. API: LOGIN
// ═══════════════════════════════════════════════════════════════

async function apiLogin(req, res) {
  try {
    const corpo = await lerCorpoRequisicao(req);

    const email = String(corpo.email || '').trim().toLowerCase();
    const senha = String(corpo.senha || '').trim();

    if (!email || !senha) {
      responderJson(res, 400, { erro: 'Email e senha são obrigatórios' });
      return;
    }

    const usuario = await buscarUsuarioPorEmail(email);

    if (!usuario || !verificarSenha(senha, usuario.senha)) {
      responderJson(res, 401, { erro: 'Email ou senha inválidos' });
      return;
    }

    responderJson(res, 200, {
      mensagem: 'Login realizado com sucesso!',
      usuario: usuarioPublico(usuario),
      token: criarToken(usuario.id)
    });

  } catch (erro) {
    console.error('Erro no login:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar login' });
  }
}

// ═══════════════════════════════════════════════════════════════
// 9.5 API: PAINEL DA EQUIPE (LIVROS, PROMOÇÕES E EMPRÉSTIMOS)
// ═══════════════════════════════════════════════════════════════

async function apiCriarLivro(req, res) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const titulo = String(corpo.titulo || '').trim();
    const autor = String(corpo.autor || '').trim();
    const categoria = String(corpo.categoria || '').trim();
    const preco = Number(corpo.preco);
    const estoque = Number(corpo.estoque);

    if (!titulo || !autor || !categoria || !Number.isFinite(preco) || preco < 0 || !Number.isFinite(estoque) || estoque < 0) {
      responderJson(res, 400, { erro: 'Título, autor, categoria, preço e estoque válidos são obrigatórios' });
      return;
    }

    const { rows } = await pool.query(
      `insert into livros (titulo, autor, categoria, preco, avaliacao, total_vendas, estoque)
       values ($1, $2, $3, $4, 0, 0, $5)
       returning *`,
      [titulo, autor, categoria, preco, estoque]
    );

    responderJson(res, 201, { mensagem: 'Livro cadastrado', livro: rows[0] });
  } catch (erro) {
    console.error('Erro ao criar livro:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar livro' });
  }
}

async function apiEditarLivro(req, res, id) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const { rows } = await pool.query('select * from livros where id_livro = $1', [id]);
    const livro = rows[0];
    if (!livro) {
      responderJson(res, 404, { erro: 'Livro não encontrado' });
      return;
    }

    const titulo = corpo.titulo !== undefined ? String(corpo.titulo).trim() : livro.titulo;
    const autor = corpo.autor !== undefined ? String(corpo.autor).trim() : livro.autor;
    const categoria = corpo.categoria !== undefined ? String(corpo.categoria).trim() : livro.categoria;
    const preco = corpo.preco !== undefined ? Number(corpo.preco) : livro.preco;
    const estoque = corpo.estoque !== undefined ? Number(corpo.estoque) : livro.estoque;
    const avaliacao = corpo.avaliacao !== undefined ? Number(corpo.avaliacao) : livro.avaliacao;

    const atualizado = await pool.query(
      `update livros set titulo = $1, autor = $2, categoria = $3, preco = $4, estoque = $5, avaliacao = $6
       where id_livro = $7
       returning *`,
      [titulo, autor, categoria, preco, estoque, avaliacao, id]
    );

    responderJson(res, 200, { mensagem: 'Livro atualizado', livro: atualizado.rows[0] });
  } catch (erro) {
    console.error('Erro ao editar livro:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar livro' });
  }
}

async function apiRemoverLivro(res, id) {
  try {
    const emprestimoAtivo = await pool.query(
      `select 1 from emprestimos where id_livro = $1 and status <> 'devolvido' limit 1`,
      [id]
    );
    if (emprestimoAtivo.rowCount > 0) {
      responderJson(res, 409, { erro: 'Esse livro tem empréstimo(s) não devolvidos e não pode ser removido' });
      return;
    }

    const resultado = await pool.query('delete from livros where id_livro = $1', [id]);
    if (resultado.rowCount === 0) {
      responderJson(res, 404, { erro: 'Livro não encontrado' });
      return;
    }

    responderJson(res, 200, { mensagem: 'Livro removido' });
  } catch (erro) {
    console.error('Erro ao remover livro:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar livro' });
  }
}

async function apiCriarPromocao(req, res) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const titulo = String(corpo.titulo || '').trim();
    const descricao = String(corpo.descricao || '').trim();
    const desconto = String(corpo.desconto || '').trim();

    if (!titulo || !descricao || !desconto) {
      responderJson(res, 400, { erro: 'Título, descrição e desconto são obrigatórios' });
      return;
    }

    const { rows } = await pool.query(
      `insert into promocoes (titulo, descricao, desconto) values ($1, $2, $3) returning *`,
      [titulo, descricao, desconto]
    );

    responderJson(res, 201, { mensagem: 'Promoção criada', promocao: rows[0] });
  } catch (erro) {
    console.error('Erro ao criar promoção:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar promoção' });
  }
}

async function apiEditarPromocao(req, res, id) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const { rows } = await pool.query('select * from promocoes where id_promocao = $1', [id]);
    const promocao = rows[0];
    if (!promocao) {
      responderJson(res, 404, { erro: 'Promoção não encontrada' });
      return;
    }

    const titulo = corpo.titulo !== undefined ? String(corpo.titulo).trim() : promocao.titulo;
    const descricao = corpo.descricao !== undefined ? String(corpo.descricao).trim() : promocao.descricao;
    const desconto = corpo.desconto !== undefined ? String(corpo.desconto).trim() : promocao.desconto;

    const atualizado = await pool.query(
      `update promocoes set titulo = $1, descricao = $2, desconto = $3 where id_promocao = $4 returning *`,
      [titulo, descricao, desconto, id]
    );

    responderJson(res, 200, { mensagem: 'Promoção atualizada', promocao: atualizado.rows[0] });
  } catch (erro) {
    console.error('Erro ao editar promoção:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar promoção' });
  }
}

async function apiRemoverPromocao(res, id) {
  try {
    const resultado = await pool.query('delete from promocoes where id_promocao = $1', [id]);
    if (resultado.rowCount === 0) {
      responderJson(res, 404, { erro: 'Promoção não encontrada' });
      return;
    }
    responderJson(res, 200, { mensagem: 'Promoção removida' });
  } catch (erro) {
    console.error('Erro ao remover promoção:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar promoção' });
  }
}

async function apiBuscarPromocao(res, id) {
  try {
    const { rows } = await pool.query('select * from promocoes where id_promocao = $1', [id]);
    if (!rows[0]) {
      responderJson(res, 404, { erro: 'Promoção não encontrada' });
      return;
    }
    responderJson(res, 200, rows[0]);
  } catch (erro) {
    console.error('Erro ao buscar promoção:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar promoção' });
  }
}

// ═══════════════════════════════════════════════════════════════
// 9.6 API: PRODUTOS DO CAFÉ (vitrine + CRUD do painel da equipe)
// ═══════════════════════════════════════════════════════════════

async function apiCriarProduto(req, res) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const nome = String(corpo.nome || '').trim();
    const categoria = String(corpo.categoria || '').trim();
    const preco = Number(corpo.preco);
    const descricao = String(corpo.descricao || '').trim();

    if (!nome || !categoria || !Number.isFinite(preco) || preco < 0 || !descricao) {
      responderJson(res, 400, { erro: 'Nome, categoria, preço e descrição válidos são obrigatórios' });
      return;
    }

    const { rows } = await pool.query(
      `insert into produtos (nome, categoria, preco, descricao) values ($1, $2, $3, $4) returning *`,
      [nome, categoria, preco, descricao]
    );

    responderJson(res, 201, { mensagem: 'Produto cadastrado', produto: rows[0] });
  } catch (erro) {
    console.error('Erro ao criar produto:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar produto' });
  }
}

async function apiEditarProduto(req, res, id) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const { rows } = await pool.query('select * from produtos where id_produto = $1', [id]);
    const produto = rows[0];
    if (!produto) {
      responderJson(res, 404, { erro: 'Produto não encontrado' });
      return;
    }

    const nome = corpo.nome !== undefined ? String(corpo.nome).trim() : produto.nome;
    const categoria = corpo.categoria !== undefined ? String(corpo.categoria).trim() : produto.categoria;
    const preco = corpo.preco !== undefined ? Number(corpo.preco) : produto.preco;
    const descricao = corpo.descricao !== undefined ? String(corpo.descricao).trim() : produto.descricao;

    const atualizado = await pool.query(
      `update produtos set nome = $1, categoria = $2, preco = $3, descricao = $4 where id_produto = $5 returning *`,
      [nome, categoria, preco, descricao, id]
    );

    responderJson(res, 200, { mensagem: 'Produto atualizado', produto: atualizado.rows[0] });
  } catch (erro) {
    console.error('Erro ao editar produto:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar produto' });
  }
}

async function apiRemoverProduto(res, id) {
  try {
    const resultado = await pool.query('delete from produtos where id_produto = $1', [id]);
    if (resultado.rowCount === 0) {
      responderJson(res, 404, { erro: 'Produto não encontrado' });
      return;
    }
    responderJson(res, 200, { mensagem: 'Produto removido' });
  } catch (erro) {
    console.error('Erro ao remover produto:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar produto' });
  }
}

async function apiBuscarProduto(res, id) {
  try {
    const { rows } = await pool.query('select * from produtos where id_produto = $1', [id]);
    if (!rows[0]) {
      responderJson(res, 404, { erro: 'Produto não encontrado' });
      return;
    }
    responderJson(res, 200, rows[0]);
  } catch (erro) {
    console.error('Erro ao buscar produto:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar produto' });
  }
}

async function apiListarEmprestimos(res) {
  try {
    const { rows } = await pool.query(`
      select
        e.*,
        coalesce(l.titulo, 'Livro removido') as titulo_livro,
        coalesce(l.autor, '') as autor_livro
      from emprestimos e
      left join livros l on l.id_livro = e.id_livro
      order by e.id_emprestimo
    `);

    const hoje = new Date().toISOString().slice(0, 10);
    const lista = rows.map((emprestimo) => ({
      ...emprestimo,
      status: emprestimo.status === 'ativo' && emprestimo.data_prevista_devolucao < hoje
        ? 'atrasado'
        : emprestimo.status
    }));

    responderJson(res, 200, lista);
  } catch (erro) {
    console.error('Erro ao listar empréstimos:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar empréstimos' });
  }
}

async function apiCriarEmprestimo(req, res) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const idLivro = Number(corpo.id_livro);
    const nomeCliente = String(corpo.nome_cliente || '').trim();
    const contatoCliente = String(corpo.contato_cliente || '').trim();
    const dataPrevistaDevolucao = String(corpo.data_prevista_devolucao || '').trim();

    if (!idLivro || !nomeCliente || !dataPrevistaDevolucao) {
      responderJson(res, 400, { erro: 'Livro, nome do cliente e data prevista de devolução são obrigatórios' });
      return;
    }

    const cliente = await pool.connect();
    try {
      await cliente.query('begin');

      // Trava a linha do livro até o fim da transação, pra dois empréstimos
      // simultâneos não conseguirem "vender" o mesmo último exemplar.
      const { rows } = await cliente.query('select estoque from livros where id_livro = $1 for update', [idLivro]);
      if (rows.length === 0) {
        await cliente.query('rollback');
        responderJson(res, 404, { erro: 'Livro não encontrado' });
        return;
      }
      if (rows[0].estoque <= 0) {
        await cliente.query('rollback');
        responderJson(res, 409, { erro: 'Livro sem estoque disponível para empréstimo' });
        return;
      }

      await cliente.query('update livros set estoque = estoque - 1 where id_livro = $1', [idLivro]);

      const inserido = await cliente.query(
        `insert into emprestimos (id_livro, nome_cliente, contato_cliente, data_prevista_devolucao)
         values ($1, $2, $3, $4)
         returning *`,
        [idLivro, nomeCliente, contatoCliente || null, dataPrevistaDevolucao]
      );

      await cliente.query('commit');
      responderJson(res, 201, { mensagem: 'Empréstimo registrado', emprestimo: inserido.rows[0] });
    } catch (erroTransacao) {
      await cliente.query('rollback').catch(() => {});
      throw erroTransacao;
    } finally {
      cliente.release();
    }
  } catch (erro) {
    console.error('Erro ao criar empréstimo:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar empréstimo' });
  }
}

async function apiDevolverEmprestimo(res, id) {
  const cliente = await pool.connect();
  try {
    await cliente.query('begin');

    const { rows } = await cliente.query('select * from emprestimos where id_emprestimo = $1 for update', [id]);
    const emprestimo = rows[0];
    if (!emprestimo) {
      await cliente.query('rollback');
      responderJson(res, 404, { erro: 'Empréstimo não encontrado' });
      return;
    }
    if (emprestimo.status === 'devolvido') {
      await cliente.query('rollback');
      responderJson(res, 409, { erro: 'Esse empréstimo já foi devolvido' });
      return;
    }

    const atualizado = await cliente.query(
      `update emprestimos set status = 'devolvido', data_devolucao = current_date
       where id_emprestimo = $1
       returning *`,
      [id]
    );
    await cliente.query('update livros set estoque = estoque + 1 where id_livro = $1', [emprestimo.id_livro]);
    await cliente.query('commit');

    responderJson(res, 200, { mensagem: 'Devolução registrada', emprestimo: atualizado.rows[0] });
  } catch (erro) {
    await cliente.query('rollback').catch(() => {});
    console.error('Erro ao devolver empréstimo:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar devolução' });
  } finally {
    cliente.release();
  }
}

async function apiBuscarLivro(res, id) {
  try {
    const { rows } = await pool.query('select * from livros where id_livro = $1', [id]);
    if (!rows[0]) {
      responderJson(res, 404, { erro: 'Livro não encontrado' });
      return;
    }
    responderJson(res, 200, rows[0]);
  } catch (erro) {
    console.error('Erro ao buscar livro:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar livro' });
  }
}

async function apiSolicitarEmprestimo(req, res, usuario) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const idLivro = Number(corpo.id_livro);
    const dataPrevistaDevolucao = String(corpo.data_prevista_devolucao || '').trim();

    if (!idLivro || !dataPrevistaDevolucao) {
      responderJson(res, 400, { erro: 'Livro e data prevista de devolução são obrigatórios' });
      return;
    }

    const { rows } = await pool.query('select estoque from livros where id_livro = $1', [idLivro]);
    if (!rows[0]) {
      responderJson(res, 404, { erro: 'Livro não encontrado' });
      return;
    }
    if (rows[0].estoque <= 0) {
      responderJson(res, 409, { erro: 'Livro sem estoque disponível para empréstimo' });
      return;
    }

    const inserido = await pool.query(
      `insert into emprestimos (id_livro, id_usuario, nome_cliente, contato_cliente, data_prevista_devolucao, status)
       values ($1, $2, $3, $4, $5, 'solicitado')
       returning *`,
      [idLivro, usuario.id, usuario.nome, usuario.email, dataPrevistaDevolucao]
    );

    responderJson(res, 201, { mensagem: 'Empréstimo solicitado! Aguarde a aprovação da equipe.', emprestimo: inserido.rows[0] });
  } catch (erro) {
    console.error('Erro ao solicitar empréstimo:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar solicitação' });
  }
}

async function apiMeusEmprestimos(res, usuario) {
  try {
    const { rows } = await pool.query(`
      select
        e.*,
        coalesce(l.titulo, 'Livro removido') as titulo_livro,
        coalesce(l.autor, '') as autor_livro
      from emprestimos e
      left join livros l on l.id_livro = e.id_livro
      where e.id_usuario = $1
      order by e.id_emprestimo desc
    `, [usuario.id]);

    const hoje = new Date().toISOString().slice(0, 10);
    const lista = rows.map((emprestimo) => ({
      ...emprestimo,
      status: emprestimo.status === 'ativo' && emprestimo.data_prevista_devolucao < hoje
        ? 'atrasado'
        : emprestimo.status
    }));

    responderJson(res, 200, lista);
  } catch (erro) {
    console.error('Erro ao listar meus empréstimos:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar empréstimos' });
  }
}

async function apiCancelarEmprestimo(res, id, usuario) {
  try {
    const { rows } = await pool.query('select * from emprestimos where id_emprestimo = $1', [id]);
    const emprestimo = rows[0];
    if (!emprestimo || emprestimo.id_usuario !== usuario.id) {
      responderJson(res, 404, { erro: 'Empréstimo não encontrado' });
      return;
    }
    if (emprestimo.status !== 'solicitado') {
      responderJson(res, 409, { erro: 'Esse pedido não está mais aguardando aprovação' });
      return;
    }

    const atualizado = await pool.query(
      `update emprestimos set status = 'cancelado' where id_emprestimo = $1 returning *`,
      [id]
    );
    responderJson(res, 200, { mensagem: 'Pedido cancelado', emprestimo: atualizado.rows[0] });
  } catch (erro) {
    console.error('Erro ao cancelar empréstimo:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar cancelamento' });
  }
}

async function apiAprovarEmprestimo(res, id) {
  const cliente = await pool.connect();
  try {
    await cliente.query('begin');

    const { rows } = await cliente.query('select * from emprestimos where id_emprestimo = $1 for update', [id]);
    const emprestimo = rows[0];
    if (!emprestimo) {
      await cliente.query('rollback');
      responderJson(res, 404, { erro: 'Empréstimo não encontrado' });
      return;
    }
    if (emprestimo.status !== 'solicitado') {
      await cliente.query('rollback');
      responderJson(res, 409, { erro: 'Esse empréstimo não está mais aguardando aprovação' });
      return;
    }

    const livro = await cliente.query('select estoque from livros where id_livro = $1 for update', [emprestimo.id_livro]);
    if (!livro.rows[0] || livro.rows[0].estoque <= 0) {
      await cliente.query('rollback');
      responderJson(res, 409, { erro: 'Livro sem estoque disponível para aprovar esse empréstimo' });
      return;
    }

    await cliente.query('update livros set estoque = estoque - 1 where id_livro = $1', [emprestimo.id_livro]);
    const atualizado = await cliente.query(
      `update emprestimos set status = 'ativo', data_emprestimo = current_date
       where id_emprestimo = $1
       returning *`,
      [id]
    );
    await cliente.query('commit');

    responderJson(res, 200, { mensagem: 'Empréstimo aprovado', emprestimo: atualizado.rows[0] });
  } catch (erro) {
    await cliente.query('rollback').catch(() => {});
    console.error('Erro ao aprovar empréstimo:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar aprovação' });
  } finally {
    cliente.release();
  }
}

async function apiRejeitarEmprestimo(res, id) {
  try {
    const { rows } = await pool.query('select * from emprestimos where id_emprestimo = $1', [id]);
    if (!rows[0]) {
      responderJson(res, 404, { erro: 'Empréstimo não encontrado' });
      return;
    }
    if (rows[0].status !== 'solicitado') {
      responderJson(res, 409, { erro: 'Esse empréstimo não está mais aguardando aprovação' });
      return;
    }

    const atualizado = await pool.query(
      `update emprestimos set status = 'rejeitado' where id_emprestimo = $1 returning *`,
      [id]
    );
    responderJson(res, 200, { mensagem: 'Empréstimo rejeitado', emprestimo: atualizado.rows[0] });
  } catch (erro) {
    console.error('Erro ao rejeitar empréstimo:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar rejeição' });
  }
}

async function apiListarUsuarios(res) {
  try {
    const { rows } = await pool.query('select id, nome, email, tipo, criado_em from usuarios order by criado_em desc');
    responderJson(res, 200, rows);
  } catch (erro) {
    console.error('Erro ao listar usuários:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar usuários' });
  }
}

// ═══════════════════════════════════════════════════════════════
// 9.7 API: MINHA CONTA (editar perfil e trocar senha, qualquer tipo de conta)
// ═══════════════════════════════════════════════════════════════

async function apiAtualizarConta(req, res, usuario) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const nome = String(corpo.nome || '').trim();
    const email = String(corpo.email || '').trim().toLowerCase();

    if (!nome || !email) {
      responderJson(res, 400, { erro: 'Nome e email são obrigatórios' });
      return;
    }
    if (!emailValido(email)) {
      responderJson(res, 400, { erro: 'Email inválido' });
      return;
    }

    if (email !== usuario.email) {
      const existente = await buscarUsuarioPorEmail(email);
      if (existente) {
        responderJson(res, 409, { erro: 'Este email já está em uso' });
        return;
      }
    }

    // O tipo da conta nunca muda por aqui (só o admin pode promover/rebaixar
    // alguém, pelo painel) — evita que trocar de email pra um domínio da loja
    // vire um jeito de a pessoa se autopromover a funcionário.
    const atualizado = await pool.query(
      `update usuarios set nome = $1, email = $2 where id = $3 returning *`,
      [nome, email, usuario.id]
    );

    responderJson(res, 200, { mensagem: 'Perfil atualizado', usuario: usuarioPublico(atualizado.rows[0]) });
  } catch (erro) {
    console.error('Erro ao atualizar conta:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar perfil' });
  }
}

async function apiAtualizarSenha(req, res, usuario) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const senhaAtual = String(corpo.senhaAtual || '').trim();
    const novaSenha = String(corpo.novaSenha || '').trim();

    if (!senhaAtual || !novaSenha) {
      responderJson(res, 400, { erro: 'Senha atual e nova senha são obrigatórias' });
      return;
    }
    if (!verificarSenha(senhaAtual, usuario.senha)) {
      responderJson(res, 401, { erro: 'Senha atual incorreta' });
      return;
    }
    if (!senhaValida(novaSenha)) {
      responderJson(res, 400, { erro: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }

    await pool.query('update usuarios set senha = $1 where id = $2', [criarHashSenha(novaSenha), usuario.id]);
    responderJson(res, 200, { mensagem: 'Senha atualizada' });
  } catch (erro) {
    console.error('Erro ao atualizar senha:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar senha' });
  }
}

// ═══════════════════════════════════════════════════════════════
// 9.8 API: GESTÃO DE CONTAS PELO ADMIN (editar tipo, remover)
// ═══════════════════════════════════════════════════════════════

async function apiEditarUsuarioAdmin(req, res, id) {
  try {
    const corpo = await lerCorpoRequisicao(req);
    const usuario = await buscarUsuarioPorId(id);
    if (!usuario) {
      responderJson(res, 404, { erro: 'Conta não encontrada' });
      return;
    }

    const nome = corpo.nome !== undefined ? String(corpo.nome).trim() : usuario.nome;
    const email = corpo.email !== undefined ? String(corpo.email).trim().toLowerCase() : usuario.email;
    const tipo = corpo.tipo !== undefined ? String(corpo.tipo).trim() : usuario.tipo;

    if (!nome || !emailValido(email) || !['cliente', 'funcionario', 'admin'].includes(tipo)) {
      responderJson(res, 400, { erro: 'Nome, email e tipo válidos são obrigatórios' });
      return;
    }

    if (email !== usuario.email) {
      const existente = await buscarUsuarioPorEmail(email);
      if (existente) {
        responderJson(res, 409, { erro: 'Este email já está em uso' });
        return;
      }
    }

    const atualizado = await pool.query(
      `update usuarios set nome = $1, email = $2, tipo = $3 where id = $4 returning *`,
      [nome, email, tipo, id]
    );

    responderJson(res, 200, { mensagem: 'Conta atualizada', usuario: usuarioPublico(atualizado.rows[0]) });
  } catch (erro) {
    console.error('Erro ao editar conta:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar conta' });
  }
}

async function apiRemoverUsuarioAdmin(res, id, usuarioLogado) {
  try {
    if (id === usuarioLogado.id) {
      responderJson(res, 409, { erro: 'Você não pode remover a própria conta por aqui' });
      return;
    }

    const resultado = await pool.query('delete from usuarios where id = $1', [id]);
    if (resultado.rowCount === 0) {
      responderJson(res, 404, { erro: 'Conta não encontrada' });
      return;
    }
    responderJson(res, 200, { mensagem: 'Conta removida' });
  } catch (erro) {
    console.error('Erro ao remover conta:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar remoção' });
  }
}

// ═══════════════════════════════════════════════════════════════
// 10. MAPEAR URL PARA ARQUIVO
// ═══════════════════════════════════════════════════════════════

// Pastas que só devem conter arquivos estáticos de verdade (CSS/JS/imagens/build do React).
// Pedido pra algo dentro delas que não existe é 404 de verdade, nunca cai no SPA.
const PREFIXOS_SO_ARQUIVO = ['/CSS/', '/JS/', '/imagens/', '/dist/'];

function mapearUrlParaArquivo(urlPath) {
  const caminhoUrl = decodeURIComponent(urlPath.split('?')[0]);
  const caminhoCompleto = path.resolve(PASTA_PROJETO, `.${caminhoUrl}`);

  // Arquivos internos não podem ser baixados pelo navegador (código do servidor, fonte do React, etc.)
  const relativo = '/' + path.relative(PASTA_PROJETO, caminhoCompleto).split(path.sep).join('/');
  const ARQUIVOS_PRIVADOS = ['/servidor-estatico.js', '/package.json', '/package-lock.json'];
  const PASTAS_PRIVADAS = ['/database', '/node_modules', '/.git', '/app'];
  if (ARQUIVOS_PRIVADOS.includes(relativo) ||
      PASTAS_PRIVADAS.some(p => relativo === p || relativo.startsWith(p + '/'))) {
    return null;
  }

  if (!caminhoCompleto.startsWith(PASTA_PROJETO + path.sep) &&
      caminhoCompleto !== PASTA_PROJETO) {
    return null;
  }

  return caminhoCompleto;
}

// ═══════════════════════════════════════════════════════════════
// 11. SERVIR ARQUIVO ESTÁTICO
// ═══════════════════════════════════════════════════════════════

function servirArquivo(caminhoArquivo, res) {
  fs.stat(caminhoArquivo, (erro, info) => {
    if (erro || !info.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 - Página não encontrada</h1>');
      return;
    }

    const extensao = path.extname(caminhoArquivo).toLowerCase();
    const tipoMime = TIPOS_MIME[extensao] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': tipoMime });
    fs.createReadStream(caminhoArquivo).pipe(res);
  });
}

// ═══════════════════════════════════════════════════════════════
// 12. CRIAR SERVIDOR HTTP
// ═══════════════════════════════════════════════════════════════

const servidor = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // APIs
  if (req.method === 'POST' && req.url === '/api/cadastro') {
    await apiCadastro(req, res);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/login') {
    await apiLogin(req, res);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/lancamentos') {
    const { rows } = await pool.query('select * from livros order by id_livro');
    responderJson(res, 200, rows);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/promocoes') {
    const { rows } = await pool.query('select * from promocoes order by id_promocao');
    responderJson(res, 200, rows);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/destaques') {
    const maisAvaliados = await pool.query('select * from livros order by avaliacao desc limit 4');
    const maisVendidos = await pool.query('select * from livros order by total_vendas desc limit 4');
    responderJson(res, 200, { maisAvaliados: maisAvaliados.rows, maisVendidos: maisVendidos.rows });
    return;
  }

  const idLivroPublicoRota = req.url.match(/^\/api\/livros\/(\d+)$/);
  if (req.method === 'GET' && idLivroPublicoRota) {
    await apiBuscarLivro(res, Number(idLivroPublicoRota[1]));
    return;
  }

  const idPromocaoPublicaRota = req.url.match(/^\/api\/promocoes\/(\d+)$/);
  if (req.method === 'GET' && idPromocaoPublicaRota) {
    await apiBuscarPromocao(res, Number(idPromocaoPublicaRota[1]));
    return;
  }

  if (req.method === 'GET' && req.url === '/api/produtos') {
    const { rows } = await pool.query('select * from produtos order by id_produto');
    responderJson(res, 200, rows);
    return;
  }

  const idProdutoPublicoRota = req.url.match(/^\/api\/produtos\/(\d+)$/);
  if (req.method === 'GET' && idProdutoPublicoRota) {
    await apiBuscarProduto(res, Number(idProdutoPublicoRota[1]));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/emprestimos/solicitar') {
    const usuario = await exigirCliente(req, res);
    if (!usuario) return;
    await apiSolicitarEmprestimo(req, res, usuario);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/meus-emprestimos') {
    const usuario = await exigirCliente(req, res);
    if (!usuario) return;
    await apiMeusEmprestimos(res, usuario);
    return;
  }

  const cancelamentoRota = req.url.match(/^\/api\/emprestimos\/(\d+)\/cancelar$/);
  if (req.method === 'POST' && cancelamentoRota) {
    const usuario = await exigirCliente(req, res);
    if (!usuario) return;
    await apiCancelarEmprestimo(res, Number(cancelamentoRota[1]), usuario);
    return;
  }

  // APIs do painel da equipe (livros, promoções, produtos e empréstimos)
  const idLivroRota = req.url.match(/^\/api\/admin\/livros\/(\d+)$/);
  const idPromocaoRota = req.url.match(/^\/api\/admin\/promocoes\/(\d+)$/);
  const idProdutoRota = req.url.match(/^\/api\/admin\/produtos\/(\d+)$/);
  const devolucaoRota = req.url.match(/^\/api\/admin\/emprestimos\/(\d+)\/devolver$/);
  const aprovacaoRota = req.url.match(/^\/api\/admin\/emprestimos\/(\d+)\/aprovar$/);
  const rejeicaoRota = req.url.match(/^\/api\/admin\/emprestimos\/(\d+)\/rejeitar$/);

  if (req.method === 'GET' && req.url === '/api/admin/livros') {
    const { rows } = await pool.query('select * from livros order by id_livro');
    responderJson(res, 200, rows);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/admin/livros') {
    if (!(await exigirFuncionario(req, res))) return;
    await apiCriarLivro(req, res);
    return;
  }

  if (req.method === 'PUT' && idLivroRota) {
    if (!(await exigirFuncionario(req, res))) return;
    await apiEditarLivro(req, res, Number(idLivroRota[1]));
    return;
  }

  if (req.method === 'DELETE' && idLivroRota) {
    if (!(await exigirFuncionario(req, res))) return;
    await apiRemoverLivro(res, Number(idLivroRota[1]));
    return;
  }

  if (req.method === 'GET' && req.url === '/api/admin/promocoes') {
    const { rows } = await pool.query('select * from promocoes order by id_promocao');
    responderJson(res, 200, rows);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/admin/promocoes') {
    if (!(await exigirFuncionario(req, res))) return;
    await apiCriarPromocao(req, res);
    return;
  }

  if (req.method === 'PUT' && idPromocaoRota) {
    if (!(await exigirFuncionario(req, res))) return;
    await apiEditarPromocao(req, res, Number(idPromocaoRota[1]));
    return;
  }

  if (req.method === 'DELETE' && idPromocaoRota) {
    if (!(await exigirFuncionario(req, res))) return;
    await apiRemoverPromocao(res, Number(idPromocaoRota[1]));
    return;
  }

  if (req.method === 'GET' && req.url === '/api/admin/produtos') {
    const { rows } = await pool.query('select * from produtos order by id_produto');
    responderJson(res, 200, rows);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/admin/produtos') {
    if (!(await exigirFuncionario(req, res))) return;
    await apiCriarProduto(req, res);
    return;
  }

  if (req.method === 'PUT' && idProdutoRota) {
    if (!(await exigirFuncionario(req, res))) return;
    await apiEditarProduto(req, res, Number(idProdutoRota[1]));
    return;
  }

  if (req.method === 'DELETE' && idProdutoRota) {
    if (!(await exigirFuncionario(req, res))) return;
    await apiRemoverProduto(res, Number(idProdutoRota[1]));
    return;
  }

  if (req.method === 'GET' && req.url === '/api/admin/emprestimos') {
    await apiListarEmprestimos(res);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/admin/emprestimos') {
    if (!(await exigirFuncionario(req, res))) return;
    await apiCriarEmprestimo(req, res);
    return;
  }

  if (req.method === 'POST' && devolucaoRota) {
    if (!(await exigirFuncionario(req, res))) return;
    await apiDevolverEmprestimo(res, Number(devolucaoRota[1]));
    return;
  }

  if (req.method === 'POST' && aprovacaoRota) {
    if (!(await exigirFuncionario(req, res))) return;
    await apiAprovarEmprestimo(res, Number(aprovacaoRota[1]));
    return;
  }

  if (req.method === 'POST' && rejeicaoRota) {
    if (!(await exigirFuncionario(req, res))) return;
    await apiRejeitarEmprestimo(res, Number(rejeicaoRota[1]));
    return;
  }

  if (req.method === 'GET' && req.url === '/api/admin/usuarios') {
    if (!(await exigirFuncionario(req, res))) return;
    await apiListarUsuarios(res);
    return;
  }

  // Contas (usuarios.id) são uuid, não serial — regex diferente da usada pra livros/promoções/produtos.
  const idUsuarioRota = req.url.match(/^\/api\/admin\/usuarios\/([0-9a-fA-F-]{36})$/);

  if (req.method === 'PUT' && idUsuarioRota) {
    if (!(await exigirFuncionario(req, res))) return;
    await apiEditarUsuarioAdmin(req, res, idUsuarioRota[1]);
    return;
  }

  if (req.method === 'DELETE' && idUsuarioRota) {
    const usuarioLogado = await usuarioAutenticado(req);
    if (!usuarioLogado || !['funcionario', 'admin'].includes(usuarioLogado.tipo)) {
      responderJson(res, 403, { erro: 'Acesso restrito à equipe' });
      return;
    }
    await apiRemoverUsuarioAdmin(res, idUsuarioRota[1], usuarioLogado);
    return;
  }

  if (req.method === 'PUT' && req.url === '/api/conta') {
    const usuario = await exigirUsuario(req, res);
    if (!usuario) return;
    await apiAtualizarConta(req, res, usuario);
    return;
  }

  if (req.method === 'PUT' && req.url === '/api/conta/senha') {
    const usuario = await exigirUsuario(req, res);
    if (!usuario) return;
    await apiAtualizarSenha(req, res, usuario);
    return;
  }

  // Arquivos estáticos + SPA (React Router decide o resto no navegador)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Allow': 'GET, HEAD, POST, PUT, DELETE' });
    res.end('Método não permitido');
    return;
  }

  const caminhoUrl = decodeURIComponent(req.url.split('?')[0]);
  const caminhoArquivo = mapearUrlParaArquivo(req.url);

  if (!caminhoArquivo) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acesso negado');
    return;
  }

  fs.stat(caminhoArquivo, (erro, info) => {
    const existe = !erro && info.isFile();

    // Existe de verdade (CSS, JS, imagem, asset do build): serve ele.
    if (existe) {
      if (req.method === 'HEAD') {
        const extensao = path.extname(caminhoArquivo).toLowerCase();
        res.writeHead(200, { 'Content-Type': TIPOS_MIME[extensao] || 'application/octet-stream' });
        res.end();
        return;
      }
      servirArquivo(caminhoArquivo, res);
      return;
    }

    // Pastas só-de-arquivo (CSS/JS/imagens/dist): se não existe, é 404 de verdade.
    const ehPastaSoArquivo = PREFIXOS_SO_ARQUIVO.some((prefixo) => caminhoUrl.startsWith(prefixo));
    if (ehPastaSoArquivo) {
      if (req.method === 'HEAD') {
        res.writeHead(404);
        res.end();
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Arquivo não encontrado</h1>');
      }
      return;
    }

    // Qualquer outra URL (/, /login, /perfil, /livro/123, etc.) é uma rota do React:
    // serve o HTML do app, que decide o que mostrar no navegador.
    const indexApp = path.join(PASTA_PROJETO, 'dist', 'index.html');
    if (req.method === 'HEAD') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end();
      return;
    }
    servirArquivo(indexApp, res);
  });
});

// ═══════════════════════════════════════════════════════════════
// 13. INICIAR SERVIDOR
// ═══════════════════════════════════════════════════════════════

async function iniciar() {
  try {
    await pool.query('select 1');
    console.log('✅ Conectado ao Postgres (Supabase)');
  } catch (erro) {
    console.error('❌ Não foi possível conectar ao Postgres. Confira a variável DATABASE_URL.');
    console.error(erro.message);
    process.exit(1);
  }

  servidor.listen(PORTA, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║    SERVIDOR INICIADO COM SUCESSO!                      ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║   URL: http://localhost:${PORTA}                           ║
║   Pasta: ${PASTA_PROJETO.substring(0, 40)}...   ║
║   Banco: Postgres (Supabase)                           ║
║                                                        ║
║  Rotas disponíveis:                                    ║
║  • GET  /*             → app React (dist/index.html)   ║
║  • GET  /CSS, /JS, /imagens, /dist → arquivos estáticos ║
║  • POST /api/cadastro  → Cadastrar novo usuário        ║
║  • POST /api/login     → Login do usuário              ║
║  • CRUD /api/admin/livros, /promocoes, /emprestimos    ║
║    (exige token de sessão, header Authorization: Bearer) ║
║                                                        ║
║  Pressione CTRL+C para parar o servidor                ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
  });
}

iniciar();
