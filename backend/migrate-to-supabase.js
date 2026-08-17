require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('SUPABASE_URL ou SUPABASE_KEY ausente em .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Conectando ao banco SQLite local...');
    const dbPath = path.resolve(__dirname, 'database.sqlite');
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    console.log('Buscando dados antigos...');
    const empresas       = await db.all('SELECT * FROM empresas');
    const funcionarios   = await db.all('SELECT * FROM funcionarios');
    const equipamentos   = await db.all('SELECT * FROM equipamentos');
    const historico      = await db.all('SELECT * FROM historico');
    console.log(`Lidos: ${empresas.length} empresas, ${funcionarios.length} funcionarios, ${equipamentos.length} equipamentos, ${historico.length} historicos.`);
    console.log('Iniciando upload para o Supabase...');

    if (empresas.length > 0) {
        const { error } = await supabase.from('empresas').insert(empresas);
        if (error) console.error('Erro migrando empresas:', error.message);
        else console.log('Empresas migradas.');
    }

    if (funcionarios.length > 0) {
        const { error } = await supabase.from('funcionarios').insert(funcionarios);
        if (error) console.error('Erro migrando funcionarios:', error.message);
        else console.log('Funcionários migrados.');
    }

    if (equipamentos.length > 0) {
        const eqMapped = equipamentos.map(e => ({
            id: e.id, descricao: e.descricao, modeloMarca: e.modeloMarca, status: e.status, 'funcionarioId': e.funcionarioId
        }));
        const { error } = await supabase.from('equipamentos').insert(eqMapped);
        if (error) console.error('Erro migrando equipamentos:', error.message);
        else console.log('Equipamentos migrados.');
    }

    if (historico.length > 0) {
        const histMapped = historico.map(h => ({
            id: h.id, tipo: h.tipo, 'funcionarioId': h.funcionarioId, 'equipamentoId': h.equipamentoId, 'equipamentosIds': h.equipamentosIds, data: h.data, timestamp: h.timestamp
        }));
        const { error } = await supabase.from('historico').insert(histMapped);
        if (error) console.error('Erro migrando historico:', error.message);
        else console.log('Histórico migrado.');
    }

    console.log('Migração concluída com sucesso!');
    process.exit(0);
}

run().catch(console.error);
