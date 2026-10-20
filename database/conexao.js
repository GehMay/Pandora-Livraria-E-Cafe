// ═══════════════════════════════════════════════════════════════
// CONEXÃO COM O MYSQL (opcional)
//
// Se as variáveis de ambiente do MySQL estiverem configuradas, o site
// passa a ler/gravar usuários, livros e promoções direto no banco.
// Sem elas, tudo continua funcionando como antes, usando os arquivos
// em dados/*.json (Modo Deploy Simples). Veja database/MYSQL.md.
// ═══════════════════════════════════════════════════════════════

const mysql = require('mysql2/promise');

const MYSQL_ATIVO = Boolean(process.env.DATABASE_URL || process.env.MYSQL_HOST);

let pool = null;

if (MYSQL_ATIVO) {
  pool = process.env.DATABASE_URL
    ? mysql.createPool(process.env.DATABASE_URL)
    : mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'pandora_livraria',
        waitForConnections: true,
        connectionLimit: 5
      });

  console.log('✅ MySQL configurado: usuários, livros e promoções vêm do banco.');
} else {
  console.log('ℹ️  MySQL não configurado: usando dados/*.json (veja database/MYSQL.md para ativar).');
}

module.exports = { pool, MYSQL_ATIVO };
