// ╔═══════════════════════════════════════════════════════════════╗
// ║  SERVIDOR HTTP PROFISSIONAL                                   ║
// ║  Com login, cadastro e dois tipos de usuários (admin/cliente) ║
// ╚═══════════════════════════════════════════════════════════════╝

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2'); // Mantemos caso queira voltar no futuro, mas não vamos usar agora

const ARQUIVO_BANCO = path.join(__dirname, 'dados', 'banco.json');

// Função para ler o nosso novo "Banco de Dados" em JSON
function lerBanco() {
  try {
    const dados = fs.readFileSync(ARQUIVO_BANCO, 'utf-8');
    return JSON.parse(dados);
  } catch (erro) {
    console.error('Erro ao ler banco.json:', erro.message);
    return { livros: [], promocoes: [] };
  }
}

console.log('✅ Servidor configurado para usar banco.json (Modo Deploy Simples)');

// ═══════════════════════════════════════════════════════════════
// 1. CONFIGURAÇÕES INICIAIS
// ═══════════════════════════════════════════════════════════════

const PORTA = process.env.PORT || 5500;
const PASTA_PROJETO = __dirname;
const PASTA_DADOS = path.join(PASTA_PROJETO, 'dados');
const ARQUIVO_USUARIOS = path.join(PASTA_DADOS, 'usuarios.json');
const ARQUIVO_LANCAMENTOS = path.join(PASTA_DADOS, 'lancamentos.json');

// Criar pasta 'dados' se não existir
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
// 4. FUNÇÕES DE BANCO DE DADOS
// ═══════════════════════════════════════════════════════════════

/**
 * Lê todos os usuários do arquivo JSON
 */
function lerUsuarios() {
  try {
    if (!fs.existsSync(ARQUIVO_USUARIOS)) {
      return [];
    }
    const dados = fs.readFileSync(ARQUIVO_USUARIOS, 'utf-8');
    return JSON.parse(dados);
  } catch (erro) {
    console.error('Erro ao ler usuários:', erro.message);
    return [];
  }
}

/**
 * Salva usuários no arquivo JSON
 */
function salvarUsuarios(usuarios) {
  try {
    fs.writeFileSync(ARQUIVO_USUARIOS, JSON.stringify(usuarios, null, 2), 'utf-8');
  } catch (erro) {
    console.error('Erro ao salvar usuários:', erro.message);
  }
}

/**
 * Contas de teste fixas (demonstração): um cliente e um funcionário/admin.
 * Como o disco do Render gratuito é apagado a cada reinício, elas são recriadas
 * toda vez que o servidor liga, então sempre existem para quem quiser testar.
 */
const CONTAS_FIXAS = [
  { id: 'conta-teste-cliente', nome: 'Cliente Teste', email: 'cliente@pandora.com', senha: 'cliente123', tipo: 'cliente' },
  { id: 'conta-teste-admin', nome: 'Admin Teste', email: 'admin@pandora.com', senha: 'admin123', tipo: 'admin' }
];

function garantirContasFixas() {
  const emailsFixos = CONTAS_FIXAS.map(c => c.email);
  const usuarios = lerUsuarios().filter(u => !emailsFixos.includes(u.email));

  CONTAS_FIXAS.forEach(conta => {
    usuarios.push({
      id: conta.id,
      nome: conta.nome,
      email: conta.email,
      senha: criarHashSenha(conta.senha),
      tipo: conta.tipo,
      criadoEm: new Date().toISOString()
    });
  });

  salvarUsuarios(usuarios);
}

garantirContasFixas();

/**
 * Lê todos os lançamentos do arquivo JSON
 */
function lerLancamentos() {
  try {
    if (!fs.existsSync(ARQUIVO_LANCAMENTOS)) {
      return [];
    }
    const dados = fs.readFileSync(ARQUIVO_LANCAMENTOS, 'utf-8');
    return JSON.parse(dados);
  } catch (erro) {
    console.error('Erro ao ler lançamentos:', erro.message);
    return [];
  }
}

/**
 * Salva lançamentos no arquivo JSON
 */
function salvarLancamentos(lancamentos) {
  try {
    fs.writeFileSync(ARQUIVO_LANCAMENTOS, JSON.stringify(lancamentos, null, 2), 'utf-8');
  } catch (erro) {
    console.error('Erro ao salvar lançamentos:', erro.message);
  }
}

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
    
    const usuarios = lerUsuarios();
    if (usuarios.some(u => u.email === email)) {
      responderJson(res, 409, { erro: 'Este email já está cadastrado' });
      return;
    }
    
    const novoUsuario = {
      id: crypto.randomUUID(),
      nome,
      email,
      senha: criarHashSenha(senha),
      tipo: 'cliente',
      criadoEm: new Date().toISOString()
    };
    
    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);
    
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
    
    const usuarios = lerUsuarios();
    const usuario = usuarios.find(u => u.email === email);
    
    if (!usuario || !verificarSenha(senha, usuario.senha)) {
      responderJson(res, 401, { erro: 'Email ou senha inválidos' });
      return;
    }
    
    responderJson(res, 200, {
      mensagem: 'Login realizado com sucesso!',
      usuario: usuarioPublico(usuario)
    });
    
  } catch (erro) {
    console.error('Erro no login:', erro.message);
    responderJson(res, 400, { erro: 'Erro ao processar login' });
  }
}

// ═══════════════════════════════════════════════════════════════
// 10. MAPEAR URL PARA ARQUIVO
// ═══════════════════════════════════════════════════════════════

function mapearUrlParaArquivo(urlPath) {
  const caminhoUrl = decodeURIComponent(urlPath.split('?')[0]);
  let caminhoRelativo = caminhoUrl === '/' ? '/index.html' : caminhoUrl;
  const caminhoCompleto = path.resolve(PASTA_PROJETO, `.${caminhoRelativo}`);

  // Arquivos internos não podem ser baixados pelo navegador (senhas, código do servidor, etc.)
  const relativo = '/' + path.relative(PASTA_PROJETO, caminhoCompleto).split(path.sep).join('/');
  const ARQUIVOS_PRIVADOS = ['/servidor-estatico.js', '/package.json', '/package-lock.json'];
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
    const banco = lerBanco();
    responderJson(res, 200, banco.livros);
    return;
  }
  
  if (req.method === 'POST' && req.url === '/api/lancamentos') {
    responderJson(res, 501, { erro: 'Cadastro desativado temporariamente no modo JSON.' });
    return;
  }

  if (req.method === 'GET' && req.url === '/api/promocoes') {
    const banco = lerBanco();
    responderJson(res, 200, banco.promocoes);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/destaques') {
    const banco = lerBanco();
    
    // Simula o ORDER BY do SQL usando .sort() do Javascript
    const maisAvaliados = [...banco.livros].sort((a, b) => b.avaliacao - a.avaliacao).slice(0, 4);
    const maisVendidos = [...banco.livros].sort((a, b) => b.total_vendas - a.total_vendas).slice(0, 4);
    
    responderJson(res, 200, { maisAvaliados, maisVendidos });
    return;
  }
  
  // Arquivos estáticos
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Allow': 'GET, HEAD, POST' });
    res.end('Método não permitido');
    return;
  }
  
  const caminhoArquivo = mapearUrlParaArquivo(req.url);
  
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
║   Dados: ${ARQUIVO_USUARIOS.substring(0, 40)}...   ║
║                                                        ║
║  Rotas disponíveis:                                    ║
║  • GET  /              → index.html                    ║
║  • GET  /css/style.css → Arquivos estáticos            ║
║  • POST /api/cadastro  → Cadastrar novo usuário        ║
║  • POST /api/login     → Login do usuário              ║
║                                                        ║
║  Pressione CTRL+C para parar o servidor                ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});