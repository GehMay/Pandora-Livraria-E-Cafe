# 📚 GUIA: SERVIDOR PROFISSIONAL COM LOGIN E CADASTRO

## ✨ Principais Melhorias

### 1️⃣ **Streaming de Arquivos**

**Antes (seu código):**
```javascript
fs.readFile(caminhoArquivo, (erro, dados) => {
  resposta.end(dados);  // Carrega tudo na memória primeiro
});
```

**Depois (novo código):**
```javascript
fs.createReadStream(caminhoArquivo).pipe(res);  // Lê aos poucos
```

**Por quê?** 
- Arquivo de 500 MB carrega na memória instantaneamente
- Com stream, lê 64KB por vez, mais eficiente

---

### 2️⃣ **Criptografia de Senhas**

**Antes:** Não armazenava senhas

**Depois:**
```javascript
function criarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');  // Valor aleatório único
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;  // salt:hash
}
```

**Exemplo prático:**
```
Arquivo usuarios.json:

INSEGURO (não faça!):
{ "senha": "123456" }

SEGURO (o que fazemos):
{ "senha": "abc123def456...:xyz789abc123..." }

Se alguém roubar o arquivo, NÃO consegue descobrir a senha!
```

**`crypto.scryptSync()`** = algoritmo muito mais seguro que MD5/SHA1

---

### 3️⃣ **APIs para Login e Cadastro**

**Novo:** `/api/cadastro` e `/api/login`

**Como usar pelo navegador:**
```javascript
// Cadastro
const resposta = await fetch('/api/cadastro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'João Silva',
    email: 'joao@email.com',
    senha: '123456'
  })
});

// Login
const resposta = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'joao@email.com',
    senha: '123456'
  })
});
```

---

### 4️⃣ **Dois Tipos de Usuários**

**No arquivo `usuarios.json`:**
```json
[
  {
    "id": "uuid-único-123",
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "salt:hash",
    "tipo": "cliente",  ← Cliente normal
    "criadoEm": "2026-08-31T14:30:00.000Z"
  },
  {
    "id": "uuid-único-456",
    "nome": "Admin User",
    "email": "admin@email.com",
    "senha": "salt:hash",
    "tipo": "admin",  ← Admin (futuro: painel de controle)
    "criadoEm": "2026-08-31T14:35:00.000Z"
  }
]
```

**Diferença:**
- `cliente`: Pode fazer reservas, ver perfil
- `admin`: Pode adicionar/editar/remover livros (futuro)

---

### 5️⃣ **Melhor Organização de Código**

**Separado em seções:**
1. Configurações iniciais
2. Tipos MIME
3. Funções de criptografia
4. Funções de banco de dados (ler/salvar)
5. Funções de validação
6. APIs
7. Servidor HTTP

**Benefício:** Fácil encontrar onde mexer, código mais profissional

---

## 🧪 TESTANDO AS APIs

### 1. Acesse o arquivo de teste:
```
http://localhost:5500/teste-api.html
```

### 2. Teste o Cadastro:
- Clique em "Não tem conta? Cadastre-se aqui"
- Preencha: Nome, Email, Senha (mínimo 6 caracteres)
- Clique "Cadastrar"
- Resposta esperada:
```json
{
  "mensagem": "Cadastro realizado com sucesso!",
  "usuario": {
    "id": "uuid-único",
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipo": "cliente",
    "criadoEm": "2026-08-31T14:30:00.000Z"
  }
}
```

### 3. Teste o Login:
- Volte pra "Faça login aqui"
- Preencha com o email e senha que cadastrou
- Clique "Fazer Login"
- Resposta esperada:
```json
{
  "mensagem": "Login realizado com sucesso!",
  "usuario": {
    "id": "uuid-único",
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipo": "cliente"
  }
}
```

### 4. Veja os dados salvos:
- Abra o arquivo: `dados/usuarios.json`
- Veja os usuários cadastrados (com senhas criptografadas!)

---

## 📝 ESTRUTURA DO BANCO DE DADOS (usuarios.json)

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "a1b2c3d4e5f6...:x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4",
    "tipo": "cliente",
    "criadoEm": "2026-08-31T14:30:00.000Z"
  }
]
```

**Campos:**
- `id`: Identificador único (UUID v4)
- `nome`: Nome do usuário
- `email`: Email único
- `senha`: SALT:HASH (nunca a senha em texto puro!)
- `tipo`: "cliente" ou "admin"
- `criadoEm`: Data de criação

---

## 🔐 COMO FUNCIONA A SEGURANÇA

### Criptografia de Senhas

**Quando cadastra:**
```
1. Usuário digita: "123456"
   ↓
2. Servidor gera salt aleatório: "abc123def456..."
   ↓
3. Servidor faz hash: scryptSync("123456", salt, 64)
   ↓
4. Resultado: "abc123def456...:xyz789abc123..."
   ↓
5. Salva no arquivo (NUNCA a senha original!)
```

**Quando faz login:**
```
1. Usuário digita: "123456"
   ↓
2. Servidor extrai salt do hash armazenado: "abc123def456..."
   ↓
3. Servidor faz hash novamente: scryptSync("123456", "abc123def456...", 64)
   ↓
4. Compara os dois hashes usando timingSafeEqual (impede ataques)
   ↓
5. Se forem iguais: Login bem-sucedido ✅
   Se forem diferentes: Login falhou ❌
```

**Por que `crypto.timingSafeEqual()`?**
- Compara de forma "segura" contra timing attacks
- Ataque: medir quanto tempo leva pra responder 401
- Com `timingSafeEqual()`: tempo sempre igual (seguro!)

---

## 📊 VALIDAÇÕES IMPLEMENTADAS

### Cadastro:
- ✅ Nome obrigatório
- ✅ Email obrigatório e com formato válido
- ✅ Senha obrigatória (mínimo 6 caracteres)
- ✅ Email não pode estar duplicado
- ✅ Corpo da requisição limitado a 10 MB
- ✅ JSON válido

### Login:
- ✅ Email obrigatório
- ✅ Senha obrigatória
- ✅ Verifica se email existe
- ✅ Verifica se senha está correta (usando hash seguro)

### Arquivo Estático:
- ✅ Bloqueia acesso a `../../etc/passwd` (path traversal)
- ✅ Retorna 404 se arquivo não existe
- ✅ Tipos MIME corretos
- ✅ Streaming pra não sobrecarregar memória

---

## ✅ ATUALIZAÇÃO: SESSÃO SEGURA E MYSQL

As duas melhorias "futuras" que este guia sugeria (token em vez de enviar o
usuário inteiro, e banco de dados real) já foram implementadas:

### Sessão por cookie (em vez de confiar no navegador)

Antes, o navegador guardava o usuário inteiro no `localStorage` — qualquer
script da página podia ler (ou forjar!) aquele JSON e "virar admin" sem
precisar de senha nenhuma. Agora:

- O login gera um **token aleatório** (`crypto.randomBytes`) e guarda, só no
  servidor, qual usuário é o dono dele (`database/sessoes.js`).
- O token vai para o navegador dentro de um **cookie `HttpOnly`** — JavaScript
  da página não consegue ler nem alterar esse cookie, o que bloqueia o roubo
  de sessão por XSS.
- Toda página restrita (`/painel-funcionario.html`, `/perfil/`) é checada
  **no servidor**, antes mesmo de entregar o HTML — ver a seção "Guarda de
  página" em `servidor-estatico.js`. O cliente (`JS/auth.js`) só confirma de
  novo por cima, como segunda camada.
- `GET /api/sessao` devolve quem está logado; `POST /api/logout` apaga a
  sessão e limpa o cookie.

### Banco de dados real (MySQL, com fallback em JSON)

```javascript
// database/conexao.js detecta MYSQL_HOST / DATABASE_URL no ambiente.
// Se existir, database/usuarios.js e database/catalogo.js passam a
// consultar as tabelas Usuario/Livro/Promocao (database/setup.sql).
// Se não existir, continuam lendo dados/*.json, como sempre.
```

Veja **[`database/MYSQL.md`](database/MYSQL.md)** para o passo a passo de
como ativar.

### O que ainda fica para depois

1. **Email de confirmação**
   ```javascript
   // Enviar email ao cadastrar
   ```

2. **Recuperação de senha**
   ```javascript
   // Gerar token temporário, enviar email com link
   ```

3. **Painel da equipe completo**
   ```javascript
   // A rota POST /api/lancamentos já existe e já exige tipo
   // 'funcionario'/'admin' — falta só a tela de verdade no painel
   // (hoje é um placeholder) para usar essa rota.
   ```

---

## 💡 RESUMO DAS MUDANÇAS

| Recurso | Antes | Depois |
|---------|-------|--------|
| Leitura de arquivos | `fs.readFile()` | `fs.createReadStream().pipe()` |
| Senhas | Não tinha | Criptografia scrypt |
| APIs | Não tinha | `/api/cadastro`, `/api/login` |
| Tipos de usuários | Não tinha | "cliente" e "admin" |
| Banco de dados | Não tinha | `dados/usuarios.json` |
| Validações | Básicas | Robustas |
| Organização | Simples | Profissional |

---

## 📞 DÚVIDAS COMUNS

**P: Por que o arquivo é JSON e não um banco de dados?**
R: JSON é simples pra aprender. Quando precisar escalar, mude pra MySQL/PostgreSQL.

**P: E se alguém tiver acesso ao arquivo `usuarios.json`?**
R: Senha está criptografada, não consegue descobrir a original. Mas ainda é inseguro! Use banco de dados real.

**P: Como os dados persistem?**
R: Salvam no arquivo `dados/usuarios.json`. Quando reinicia o servidor, dados continuam.

**P: Posso ter vários usuários admin?**
R: Sim! Só mude o `tipo` pra "admin" no arquivo `usuarios.json`.

---

## 📖 LEITURA RECOMENDADA

- Node.js `crypto`: https://nodejs.org/api/crypto.html
- HTTP Status Codes: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
- Segurança de senhas: https://owasp.org/www-community/attacks/Password_Spraying_Attack
