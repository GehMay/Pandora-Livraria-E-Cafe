# MySQL: persistência real de dados

Hoje o site funciona em dois modos, escolhidos automaticamente pelo servidor:

| Modo | Quando é usado | Onde os dados ficam |
|---|---|---|
| **JSON (padrão)** | Nenhuma variável de ambiente de MySQL configurada | `dados/usuarios.json` e `dados/banco.json` — apagados a cada novo deploy no plano gratuito do Render |
| **MySQL** | `MYSQL_HOST` (ou `DATABASE_URL`) configurado | Banco MySQL real, definido em `database/setup.sql` — sobrevive a reinícios e deploys |

Não é preciso mudar nenhum código para alternar entre os dois: o servidor detecta
as variáveis de ambiente ao iniciar (veja `database/conexao.js`) e escolhe o modo
certo sozinho.

## Como ativar o MySQL

1. **Crie um banco MySQL.** Pode ser local (`mysql.server start` na sua máquina)
   ou um serviço gerenciado (Railway, PlanetScale, Render, etc.).
2. **Rode o script de criação das tabelas:**
   ```bash
   mysql -h <host> -u <usuario> -p < database/setup.sql
   ```
   Isso cria o banco `pandora_livraria` e as tabelas `Usuario`, `Livro`,
   `Promocao`, `Reserva` e `Reserva_Livro`, já com alguns dados de exemplo.
3. **Configure as variáveis de ambiente** onde o servidor roda (no Render:
   **Environment** → **Add Environment Variable**; localmente, num arquivo
   `.env` na raiz do projeto — o servidor carrega ele automaticamente se o
   pacote `dotenv` estiver instalado, mas isso é opcional):

   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=sua-senha
   MYSQL_DATABASE=pandora_livraria
   ```

   Ou, se o seu provedor de banco já fornece uma URL de conexão única, basta:
   ```env
   DATABASE_URL=mysql://usuario:senha@host:3306/pandora_livraria
   ```
4. **Reinicie o servidor** (`npm start`). O log vai mostrar:
   ```
   ✅ MySQL configurado: usuários, livros e promoções vêm do banco.
   ```

## O que passa a usar o MySQL

- **Usuários** (cadastro, login, contas de teste) — `database/usuarios.js`
- **Livros e promoções** (lançamentos, vitrine, destaques) — `database/catalogo.js`
- **Cadastro de novos livros** (`POST /api/lancamentos`) — só funciona com o
  MySQL ativo e exige estar logado como `funcionario` ou `admin`

## O que continua em memória (de propósito)

As **sessões de login** (veja `database/sessoes.js`) não vão para o MySQL —
ficam num `Map` em memória, no próprio processo do servidor. Isso é intencional:
sessão é algo passageiro, então reiniciar o servidor simplesmente desloga todo
mundo (pede login de novo), sem precisar de mais uma tabela só para isso.

## Migrando dados já existentes

Se você já tem usuários cadastrados em `dados/usuarios.json` e quer levá-los
para o MySQL, basta inserir cada linha na tabela `Usuario` com o mesmo valor
de `senha` (o hash `salt:hash` continua válido, não precisa recriar a senha).
