// database.js
require('dotenv').config && require('dotenv').config();
const mockClient = require('./supabaseMock');

// Inicializa o cliente do Supabase MOCKADO
const supabase = mockClient.createClient();

async function getDbConnection() {
    return supabase;
}

async function resetDb() {
    mockClient.resetMockDb();
}

module.exports = { getDbConnection, resetDb, supabase };
