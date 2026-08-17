// backend/import-excel-db.js
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();
const todayStr = new Date().toISOString().split('T')[0];
const timestampStr = new Date().toISOString();

const excelPath = path.join(__dirname, '..', 'Relatorio de patrimonio.xlsx');
console.log('Lendo planilha em:', excelPath);

if (!fs.existsSync(excelPath)) {
    console.error('Planilha não encontrada! Verifique o nome do arquivo.');
    process.exit(1);
}

const workbook = XLSX.readFile(excelPath);

// --- 1. Importar Funcionários ---
console.log('Processando Funcionários...');
const funcSheet = workbook.Sheets['Funcionários'];
const funcRaw = XLSX.utils.sheet_to_json(funcSheet);

const funcionarios = [];
const nameMap = new Map(); // Para mapear nomes e IDs para a alocação de equipamentos

funcRaw.forEach((row) => {
    // A primeira linha pode conter cabeçalho extra se convertida incorretamente
    const nome = row['__EMPTY_1'] ? String(row['__EMPTY_1']).trim() : '';
    const setor = row['__EMPTY_2'] ? String(row['__EMPTY_2']).trim() : '';

    if (!nome || nome === 'Funcionários' || nome === 'Nome') return;

    const id = generateId();
    const funcObj = {
        id,
        nome,
        funcao: 'Não Informado',
        dataAdmissao: '2024-01-01',
        setor: setor || 'Geral'
    };

    funcionarios.push(funcObj);
    nameMap.set(nome.toUpperCase(), id);
});

console.log(`> ${funcionarios.length} funcionários processados.`);

// --- 2. Importar Equipamentos & Gerar Histórico de Alocação ---
console.log('Processando Equipamentos...');
const equipSheet = workbook.Sheets['Equipamentos'];
const equipRaw = XLSX.utils.sheet_to_json(equipSheet);

const equipamentos = [];
const historico = [];

equipRaw.forEach((row) => {
    const tipo = row['__EMPTY'] ? String(row['__EMPTY']).trim() : '';
    const marca = row['__EMPTY_1'] ? String(row['__EMPTY_1']).trim() : '';
    const modelo = row['__EMPTY_2'] ? String(row['__EMPTY_2']).trim() : '';
    const serial = row['__EMPTY_3'] ? String(row['__EMPTY_3']).trim() : '';
    const responsavel = row['__EMPTY_4'] ? String(row['__EMPTY_4']).trim() : '';
    const patrimonioRaw = row['__EMPTY_6'] !== undefined ? String(row['__EMPTY_6']).trim() : '';
    const observacoes = row['__EMPTY_7'] ? String(row['__EMPTY_7']).trim() : '';

    if (!tipo || tipo === 'Tipo do Item') return;

    const patrimonio = patrimonioRaw;
    const modeloMarca = `${marca} ${modelo}`.trim();
    const id = generateId();

    let status = 'DISPONIVEL';
    let funcionarioId = null;

    if (responsavel && responsavel !== 'Estoque' && responsavel !== 'ESTOQUE') {
        const foundId = nameMap.get(responsavel.toUpperCase());
        if (foundId) {
            funcionarioId = foundId;
            status = 'EM_USO';

            // Criar registro de histórico de alocação inicial
            historico.push({
                id: generateId(),
                tipo: 'ALOCACAO_MANUAL',
                funcionarioId,
                equipamentoId: id,
                equipamentosIds: null,
                data: todayStr,
                timestamp: timestampStr,
                equipamentoSnapshot: { id, descricao: tipo, modeloMarca, patrimonio, serialNumber: serial },
                equipamentosSnapshots: null
            });
        }
    }

    equipamentos.push({
        id,
        descricao: tipo,
        modeloMarca,
        status,
        funcionarioId,
        patrimonio: patrimonio || null,
        serialNumber: serial || null,
        observacoes: observacoes || null
    });
});

console.log(`> ${equipamentos.length} equipamentos processados.`);
console.log(`> ${historico.length} movimentações de alocação inicial criadas.`);

// --- 3. Salvar nos arquivos backup do Backend ---
console.log('Gravando arquivos de backup JSON no banco mockado...');
fs.writeFileSync(path.join(__dirname, 'backup_funcionarios.json'), JSON.stringify(funcionarios, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'backup_equipamentos.json'), JSON.stringify(equipamentos, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'backup_historico.json'), JSON.stringify(historico, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'backup_empresas.json'), JSON.stringify([], null, 2), 'utf8'); // Limpar empresas antigas se necessário

console.log('=== IMPORTAÇÃO EXECUTADA COM SUCESSO! ===');
