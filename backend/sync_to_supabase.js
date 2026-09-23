const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://axlxclegbcqnjntexqta.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qENNwRQSpIkgXyuLiN3QkQ_u-bHga4X';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function readBackup(filename) {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) return [];
    let str = fs.readFileSync(filePath, 'utf8');
    str = str.replace(/^\uFEFF/, '');
    if (!str.trim()) return [];
    try {
        const parsed = JSON.parse(str);
        return parsed.value || parsed || [];
    } catch (e) {
        console.error(`Erro ao ler ${filename}:`, e);
        return [];
    }
}

async function chunkUpsert(table, records, chunkSize = 50) {
    if (!records || records.length === 0) {
        console.log(`[${table}] Nenhum registro para sincronizar.`);
        return;
    }
    console.log(`[${table}] Sincronizando ${records.length} registros...`);
    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'id' });
        if (error) {
            console.error(`Erro ao sincronizar chunk ${i}-${i + chunk.length} de ${table}:`, error);
            throw error;
        }
    }
    console.log(`[${table}] ✓ ${records.length} registros sincronizados com sucesso.`);
}

async function runSync() {
    console.log('=== INICIANDO SINCRONIZAÇÃO LOCAL -> SUPABASE ===');
    console.log('Supabase URL:', SUPABASE_URL);

    // 1. Empresas
    const empresas = readBackup('backup_empresas.json');
    await chunkUpsert('empresas', empresas);

    // 2. Setores
    const setores = readBackup('backup_setores.json');
    await chunkUpsert('setores', setores);

    // 3. Insumos
    const insumos = readBackup('backup_insumos.json');
    await chunkUpsert('insumos', insumos);

    // 4. Funcionarios
    const funcionarios = readBackup('backup_funcionarios.json').map(f => ({
        id: f.id,
        nome: f.nome,
        funcao: f.funcao,
        dataAdmissao: f.dataAdmissao,
        setor: f.setor || null,
        insumos: Array.isArray(f.insumos) ? f.insumos : []
    }));
    await chunkUpsert('funcionarios', funcionarios);

    // 5. Equipamentos
    const equipamentos = readBackup('backup_equipamentos.json').map(eq => ({
        id: eq.id,
        descricao: eq.descricao,
        modeloMarca: eq.modeloMarca,
        patrimonio: eq.patrimonio || null,
        serialNumber: eq.serialNumber || null,
        observacoes: eq.observacoes || null,
        status: eq.status || 'DISPONIVEL',
        funcionarioId: eq.funcionarioId || null
    }));
    await chunkUpsert('equipamentos', equipamentos);

    // 6. Historico
    const historico = readBackup('backup_historico.json').map(h => {
        let eqIdsStr = h.equipamentosIds;
        if (Array.isArray(eqIdsStr)) eqIdsStr = JSON.stringify(eqIdsStr);

        let eqSnapStr = h.equipamentoSnapshot;
        if (typeof eqSnapStr === 'object' && eqSnapStr !== null) eqSnapStr = JSON.stringify(eqSnapStr);

        let eqsSnapsStr = h.equipamentosSnapshots;
        if (typeof eqsSnapsStr === 'object' && eqsSnapsStr !== null) eqsSnapsStr = JSON.stringify(eqsSnapsStr);

        let funcSnapStr = h.funcionarioSnapshot;
        if (typeof funcSnapStr === 'object' && funcSnapStr !== null) funcSnapStr = JSON.stringify(funcSnapStr);

        return {
            id: h.id,
            tipo: h.tipo,
            funcionarioId: h.funcionarioId || '00000000-0000-0000-0000-000000000000',
            funcionarioSnapshot: funcSnapStr || null,
            equipamentoId: h.equipamentoId || null,
            equipamentosIds: eqIdsStr || null,
            data: h.data,
            timestamp: h.timestamp || new Date().toISOString(),
            equipamentoSnapshot: eqSnapStr || null,
            equipamentosSnapshots: eqsSnapsStr || null
        };
    });
    await chunkUpsert('historico', historico);

    console.log('\n=== SINCRONIZAÇÃO CONCLUÍDA COM 100% DE SUCESSO! ===\n');
}

runSync().catch(err => {
    console.error('Falha na sincronização:', err);
    process.exit(1);
});
