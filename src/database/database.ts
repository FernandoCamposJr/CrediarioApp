import * as SQLite from 'expo-sqlite';

// 1. Cria a conexão com o banco
const db = SQLite.openDatabaseSync('crediario.db');

// 2. Exporta a função de inicializar (Cria tabelas)
export const inicializarBanco = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT,
        telefone TEXT,
        endereco TEXT,
        valor_divida REAL,
        data_compra TEXT,
        pago INTEGER DEFAULT 0
      );
    `);
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.log('Erro ao iniciar banco:', error);
  }
};

// 3. Exporta a função de usar (IMPORTANTE: É isso que estava faltando)
export const usarBanco = () => db;