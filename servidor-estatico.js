// ╔═══════════════════════════════════════════════════════════════╗
// ║  SERVIDOR HTTP PROFISSIONAL                                   ║
// ║  Com login, cadastro, sessão segura (cookie) e MySQL opcional ║
// ╚═══════════════════════════════════════════════════════════════╝

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Carrega um arquivo .env local, se existir (opcional; não é erro não ter).
try { require('dotenv').config(); } catch { /* dotenv não instalado, segue sem ele */ }

const usuariosRepo = require('./database/usuarios');
const catalogoRepo = require('./database/catalogo');
const { criarSessao, obterUsuarioIdDaSessao, destruirSessao, DURACAO_SESSAO_MS } = require('./database/sessoes');

// ═══════════════════════════════════════════════════════════════
// 1. CONFIGURAÇÕES INICIAIS
// ═══════════════════════════════════════════════════════════════

const PORTA = process.env.PORT || 5500;
const PASTA_PROJETO = __dirname;
const PASTA_DADOS = path.join(PASTA_PROJETO, 'dados');

// Quem se cadastra com um e-mail desse domínio é da equipe (funcionário/admin).
// Qualquer outro e-mail (Gmail, Outlook, etc.) vira conta de cliente.
const DOMINIO_LOJA = 'pandoralivraria.com.br';

function ehEmailDaLoja(email) {
  return email.endsWith('@' + DOMINIO_LOJA);
}

// Criar pasta 'dados' se não existir (usada no modo sem MySQL)
if (!fs.existsSync(PASTA_DADOS)) {
  fs.mkdirSync(PASTA_DADOS, { recursive: true });
  console.log(`✅ Pasta 'dados' criada`);
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
// 4. SESSÃO DE LOGIN (cookie HttpOnly)
//
// Em vez do navegador guardar "quem ele diz que é" no localStorage
// (fácil de forjar, já que é só um JSON acessível por qualquer
// script da página), o servidor agora é quem decide: gera um token
// aleatório no login, guarda numa sessão (database/sessoes.js) e
// manda esse token num cookie HttpOnly — JavaScript da página não
// consegue ler nem adulterar esse cookie.
// ═══════════════════════════════════════════════════════════════

const NOME_COOKIE_SESSAO = 'pandora_sessao';

function lerCookies(req) {
  const cabecalho = req.headers.cookie || '';
  const cookies = {};

  cabecalho.split(';').forEach((parte) => {
    const separador = parte.indexOf('=');
    if (separador === -1) return;
    const chave = parte.slice(0, separador).trim();
    const valor = parte.slice(separador + 1).trim();
    if (chave) cookies[chave] = decodeURIComponent(valor);
  });

  return cookies;
}

function obterTokenSessao(req) {
  return lerCookies(req)[NOME_COOKIE_SESSAO] || null;
}

// Em produção (Render fica atrás de um proxy HTTPS), marca o cookie como
// "Secure" pra garantir que só viaje criptografado.
function ehRequisicaoHttps(req) {
  return req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
}

function construirCookieSessao(token, req) {
  const partes = [
    `${NOME_COOKIE_SESSAO}=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${Math.floor(DURACAO_SESSAO_MS / 1000)}`
  ];
  if (ehRequisicaoHttps(req)) partes.push('Secure');
  return partes.join('; ');
}

function construirCookieLogout(req) {
  const partes = [`${NOME_COOKIE_SESSAO}=`, 'HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];
  if (ehRequisicaoHttps(req)) partes.push('Secure');
  return partes.join('; ');
}

/**
 * Descobre, a partir do cookie da requisição, qual usuário está logado.
 * Retorna null se não houver sessão válida (expirada, inexistente, etc.).
 */
async function obterUsuarioAutenticado(req) {
  const token = obterTokenSessao(req);
  const usuarioId = obterUsuarioIdDaSessao(token);
  if (!usuarioId) return null;
  return usuariosRepo.buscarUsuarioPorId(usuarioId);
}

function ehEquipe(usuario) {
  return Boolean(usuario) && (usuario.tipo === 'funcionario' || usuario.tipo === 'admin');
}

/**
 * Contas de teste fixas (demonstração): um cliente e um funcionário/admin.
 * Sem MySQL, o disco do Render gratuito é apagado a cada reinício, então
 * elas são recriadas toda vez que o servidor liga, pra sempre existirem
 * pra quem quiser testar. Com MySQL, isso só garante que continuam com
 * a senha/tipo esperados (não duplica).
 */
const CONTAS_FIXAS = [
  { id: 'conta-teste-cliente', nome: 'Cliente Teste', email: 'cliente@gmail.com', senha: 'cliente123', tipo: 'cliente' },
  { id: 'conta-teste-funcionario', nome: 'Funcionário Teste', email: `funcionario@${DOMINIO_LOJA}`, senha: 'equipe123', tipo: 'funcionario' }
];

(async () => {
  try {
    const contasComHash = CONTAS_FIXAS.map((c) => ({ ...c, senhaHash: criarHashSenha(c.senha) }));
    await usuariosRepo.garantirContasFixas(contasComHash);
    console.log('✅ Contas de teste garantidas');
  } catch (erro) {
    console.error('Erro ao garantir contas fixas:', erro.message);
  }
})();

// ═══════════════════════════════════════════════════════════════
// 5. FUNÇÕES DE VALIDAÇÃO
// ═══════════════════════════════════════════════════════════════

function emailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    criadoEm: usuario.criadoEm
  };
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

function responderJson(res, statusCode, dados, cabecalhosExtras) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...cabecalhosExtras
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

    const existente = await usuariosRepo.buscarUsuarioPorEmail(email);
    if (existente) {
      responderJson(res, 409, { erro: 'Este email já está cadastrado' });
      return;
    }

    const novoUsuario = await usuariosRepo.criarUsuario({
      nome,
      email,
      senhaHash: criarHashSenha(senha),
      tipo: ehEmailDaLoja(email) ? 'funcionario' : 'cliente'
    });

    responderJson(res, 201, {
      mensagem: 'Cadastro realizado com sucesso!',
      usuario: usuarioPublico(novoUsuario)
    });

  } catch (erro) {
    console.error('Erro no cadastro:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar cadastro' });
  }
}

// ═══════════════════════════════════════════════════════════════
// 9. API: LOGIN / SESSÃO / LOGOUT
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

    const usuario = await usuariosRepo.buscarUsuarioPorEmail(email);

    if (!usuario || !verificarSenha(senha, usuario.senha)) {
      responderJson(res, 401, { erro: 'Email ou senha inválidos' });
      return;
    }

    const token = criarSessao(usuario.id);

    responderJson(
      res,
      200,
      { mensagem: 'Login realizado com sucesso!', usuario: usuarioPublico(usuario) },
      { 'Set-Cookie': construirCookieSessao(token, req) }
    );

  } catch (erro) {
    console.error('Erro no login:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar login' });
  }
}

async function apiSessao(req, res) {
  const usuario = await obterUsuarioAutenticado(req);

  if (!usuario) {
    responderJson(res, 401, { erro: 'Não autenticado' });
    return;
  }

  responderJson(res, 200, { usuario: usuarioPublico(usuario) });
}

function apiLogout(req, res) {
  const token = obterTokenSessao(req);
  if (token) destruirSessao(token);

  responderJson(
    res,
    200,
    { mensagem: 'Sessão encerrada.' },
    { 'Set-Cookie': construirCookieLogout(req) }
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. MAPEAR URL PARA ARQUIVO
// ═══════════════════════════════════════════════════════════════

function mapearUrlParaArquivo(urlPath) {
  const caminhoUrl = decodeURIComponent(urlPath.split('?')[0]);
  // Pasta (termina em "/", como "/" ou "/perfil/") serve o index.html dela
  let caminhoRelativo = caminhoUrl.endsWith('/') ? caminhoUrl + 'index.html' : caminhoUrl;
  const caminhoCompleto = path.resolve(PASTA_PROJETO, `.${caminhoRelativo}`);

  // Arquivos internos não podem ser baixados pelo navegador (senhas, código do servidor, etc.)
  const relativo = '/' + path.relative(PASTA_PROJETO, caminhoCompleto).split(path.sep).join('/');
  const ARQUIVOS_PRIVADOS = ['/servidor-estatico.js', '/package.json', '/package-lock.json', '/.env'];
  const PASTAS_PRIVADAS = ['/dados', '/database', '/node_modules', '/.git'];
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

function redirecionarParaLogin(res) {
  res.writeHead(302, { Location: '/login.html' });
  res.end();
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

  if (req.method === 'GET' && req.url === '/api/sessao') {
    await apiSessao(req, res);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/logout') {
    apiLogout(req, res);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/lancamentos') {
    responderJson(res, 200, await catalogoRepo.listarLivros());
    return;
  }

  if (req.method === 'POST' && req.url === '/api/lancamentos') {
    // Só a equipe (funcionário/admin) pode cadastrar livros, e só com o MySQL ativo.
    const usuarioSessao = await obterUsuarioAutenticado(req);
    if (!ehEquipe(usuarioSessao)) {
      responderJson(res, 403, { erro: 'Apenas a equipe pode cadastrar lançamentos.' });
      return;
    }
    if (!catalogoRepo.MYSQL_ATIVO) {
      responderJson(res, 501, { erro: 'Cadastro de livros requer o MySQL ativo (veja database/MYSQL.md).' });
      return;
    }
    try {
      const corpo = await lerCorpoRequisicao(req);
      const livro = await catalogoRepo.criarLivro(corpo);
      responderJson(res, 201, { mensagem: 'Livro cadastrado!', livro });
    } catch (erro) {
      responderJson(res, 400, { erro: 'Erro ao cadastrar livro: ' + erro.message });
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/api/promocoes') {
    responderJson(res, 200, await catalogoRepo.listarPromocoes());
    return;
  }

  if (req.method === 'GET' && req.url === '/api/destaques') {
    responderJson(res, 200, await catalogoRepo.obterDestaques());
    return;
  }

  // Arquivos estáticos
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Allow': 'GET, HEAD, POST' });
    res.end('Método não permitido');
    return;
  }

  const caminhoUrl = decodeURIComponent(req.url.split('?')[0]);

  // Guarda de página: o painel da equipe e a área "Minha Conta" só abrem
  // pra quem tem sessão válida — checado aqui no servidor, não só na tela,
  // então nem o HTML/JS dessas páginas chega a ser entregue sem login.
  const ehPainelEquipe = caminhoUrl === '/painel-funcionario.html';
  const ehAreaPerfil = caminhoUrl === '/perfil' || caminhoUrl.startsWith('/perfil/');

  if (ehPainelEquipe || ehAreaPerfil) {
    const usuarioSessao = await obterUsuarioAutenticado(req);

    if (ehPainelEquipe && !ehEquipe(usuarioSessao)) {
      redirecionarParaLogin(res);
      return;
    }
    if (ehAreaPerfil && !usuarioSessao) {
      redirecionarParaLogin(res);
      return;
    }
  }

  const rotasReact = ['/painel-funcionario.html', '/testes.html', '/teste-canvas.html'];
  const caminhoArquivo = rotasReact.includes(caminhoUrl)
    ? path.join(PASTA_PROJETO, 'perfil', 'index.html')
    : mapearUrlParaArquivo(req.url);

  if (!caminhoArquivo) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acesso negado');
    return;
  }

  if (req.method === 'HEAD') {
    fs.stat(caminhoArquivo, (erro, info) => {
      if (erro || !info.isFile()) {
        res.writeHead(404);
      } else {
        const extensao = path.extname(caminhoArquivo).toLowerCase();
        const tipoMime = TIPOS_MIME[extensao] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': tipoMime });
      }
      res.end();
    });
    return;
  }

  servirArquivo(caminhoArquivo, res);
});

// ═══════════════════════════════════════════════════════════════
// 13. INICIAR SERVIDOR
// ═══════════════════════════════════════════════════════════════

servidor.listen(PORTA, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║    SERVIDOR INICIADO COM SUCESSO!                      ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║   URL: http://localhost:${PORTA}                           ║
║   Pasta: ${PASTA_PROJETO.substring(0, 40)}...   ║
║   Banco: ${(usuariosRepo.MYSQL_ATIVO ? 'MySQL' : 'dados/*.json').padEnd(40)}...   ║
║                                                        ║
║  Rotas disponíveis:                                    ║
║  • GET  /              → index.html                    ║
║  • GET  /css/style.css → Arquivos estáticos            ║
║  • POST /api/cadastro  → Cadastrar novo usuário        ║
║  • POST /api/login     → Login do usuário (cria sessão)║
║  • GET  /api/sessao    → Quem está logado agora        ║
║  • POST /api/logout    → Encerrar a sessão             ║
║                                                        ║
║  Pressione CTRL+C para parar o servidor                ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});
