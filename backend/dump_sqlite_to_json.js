const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

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

    fs.writeFileSync(path.join(__dirname, 'backup_empresas.json'), JSON.stringify(empresas, null, 2));
    fs.writeFileSync(path.join(__dirname, 'backup_funcionarios.json'), JSON.stringify(funcionarios, null, 2));
    fs.writeFileSync(path.join(__dirname, 'backup_equipamentos.json'), JSON.stringify(equipamentos, null, 2));
    fs.writeFileSync(path.join(__dirname, 'backup_historico.json'), JSON.stringify(historico, null, 2));

    console.log('Arquivos JSON atualizados com sucesso!');
    process.exit(0);
}

run().catch(console.error);
