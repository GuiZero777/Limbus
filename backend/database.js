// database.js
const path = require('path');
require('dotenv').config && require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const mockClient = require('./supabaseMock');

let supabase;

if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY && process.env.NODE_ENV !== 'test') {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log('[Database] Conectado diretamente ao Supabase na Nuvem:', process.env.SUPABASE_URL);
} else {
    supabase = mockClient.createClient();
    console.log('[Database] Usando persistência local mock');
}

async function getDbConnection() {
    return supabase;
}

async function resetDb() {
    if (mockClient.resetMockDb) mockClient.resetMockDb();
}

module.exports = { getDbConnection, resetDb, supabase };
