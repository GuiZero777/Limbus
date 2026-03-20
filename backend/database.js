const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Em ambiente de teste usa banco em memória isolado, nunca o arquivo real
const dbPath = process.env.NODE_ENV === 'test'
    ? ':memory:'
    : path.resolve(__dirname, 'database.sqlite');

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

// Usado nos testes para resetar o banco entre suítes
async function resetDb() {
    if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
    }
}

async function initializeTables(db) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS empresas (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            cnpj TEXT NOT NULL,
            cidade TEXT NOT NULL,
            uf TEXT NOT NULL
        )
    `);

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

    await db.exec(`
        CREATE TABLE IF NOT EXISTS funcionarios (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            funcao TEXT NOT NULL,
            dataAdmissao TEXT NOT NULL
        )
    `);

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

    // Tabela: Licença — sempre 1 registro (a instalação atual)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS licenca (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            chave TEXT NOT NULL,
            documentoHash TEXT NOT NULL,
            plano TEXT NOT NULL,
            ativadaEm TEXT NOT NULL,
            expiresAt TEXT
        )
    `);
}

module.exports = { getDbConnection, resetDb };
