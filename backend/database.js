const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

let dbInstance = null;

async function getDbConnection() {
    if (dbInstance) return dbInstance;

    dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await initializeTables(dbInstance);

    return dbInstance;
}

async function initializeTables(db) {
    // Tabela: Empresas
    await db.exec(`
        CREATE TABLE IF NOT EXISTS empresas (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            cnpj TEXT NOT NULL,
            cidade TEXT NOT NULL,
            uf TEXT NOT NULL
        )
    `);

    // Tabela: Equipamentos
    await db.exec(`
        CREATE TABLE IF NOT EXISTS equipamentos (
            id TEXT PRIMARY KEY,
            descricao TEXT NOT NULL,
            modeloMarca TEXT NOT NULL,
            status TEXT DEFAULT 'DISPONIVEL',
            funcionarioId TEXT,
            FOREIGN KEY (funcionarioId) REFERENCES funcionarios(id) ON DELETE SET NULL
        )
    `);

    // Tabela: Funcionários
    await db.exec(`
        CREATE TABLE IF NOT EXISTS funcionarios (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            funcao TEXT NOT NULL,
            dataAdmissao TEXT NOT NULL
        )
    `);

    // Tabela: Histórico
    await db.exec(`
        CREATE TABLE IF NOT EXISTS historico (
            id TEXT PRIMARY KEY,
            tipo TEXT NOT NULL,
            funcionarioId TEXT NOT NULL,
            equipamentoId TEXT,
            equipamentosIds TEXT,
            data TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (funcionarioId) REFERENCES funcionarios(id) ON DELETE CASCADE
        )
    `);
}

module.exports = { getDbConnection };
