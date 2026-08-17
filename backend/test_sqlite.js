const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function test() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    const empresas = await db.all('SELECT * FROM empresas');
    const funcionarios = await db.all('SELECT * FROM funcionarios');
    const equipamentos = await db.all('SELECT * FROM equipamentos');

    console.log(`Empresas: ${empresas.length}`);
    console.log(`Funcionarios: ${funcionarios.length}`);
    console.log(`Equipamentos: ${equipamentos.length}`);

    if (funcionarios.length > 0) {
        console.log('Sample funcionario:', funcionarios[0]);
    }
}
test().catch(console.error);
