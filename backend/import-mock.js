require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function readBOM(file) {
    if (!fs.existsSync(file)) return [];
    let str = fs.readFileSync(file, 'utf8');
    str = str.replace(/^\uFEFF/, '');
    if (!str.trim()) return [];
    try {
        const d = JSON.parse(str);
        return d.value || d || [];
    } catch(e) {
        console.error('Erro no parse JSON de', file, e);
        return [];
    }
}

async function run() {
    try {
        console.log('Iniciando importação...');
        const funcData = readBOM('backup_funcionarios.json');

        if (funcData.length > 0) {
            const { data: existingFuncs, error: funcErr } = await supabase.from('funcionarios').select('id');
            if (funcErr) console.error('Func err:', funcErr);
            const existingIds = new Set((existingFuncs || []).map(f => f.id));

            const toInsertFunc = funcData.filter(f => !existingIds.has(f.id));
            if (toInsertFunc.length > 0) {
                console.log(`Inserindo ${toInsertFunc.length} novos funcionários...`);
                await supabase.from('funcionarios').insert(toInsertFunc);
                console.log('Funcionários inseridos com sucesso.');
            } else {
                console.log('Nenhum funcionário novo para inserir.');
            }
        }

        const eqData = readBOM('backup_equipamentos.json');
        if (eqData.length > 0) {
            const { data: existingEq, error: eqErr } = await supabase.from('equipamentos').select('id');
            if (eqErr) console.error('Eq err:', eqErr);
            const eqIds = new Set((existingEq || []).map(f => f.id));

            const toInsertEq = eqData.filter(f => !eqIds.has(f.id));
            if (toInsertEq.length > 0) {
                console.log(`Inserindo ${toInsertEq.length} novos equipamentos...`);
                await supabase.from('equipamentos').insert(toInsertEq);
                console.log('Equipamentos inseridos com sucesso.');
            } else {
                console.log('Nenhum equipamento novo para inserir.');
            }
        }

        const histData = readBOM('backup_historico.json');
        if (histData.length > 0) {
            const { data: existingHist, error: histErr } = await supabase.from('historico').select('id');
            if (histErr) console.error('Hist err:', histErr);
            const histIds = new Set((existingHist || []).map(f => f.id));

            const toInsertHist = histData.filter(f => !histIds.has(f.id));
            if (toInsertHist.length > 0) {
                console.log(`Inserindo ${toInsertHist.length} novos registros de histórico...`);
                // Format equipamentosIds to string if needed
                const formattedHist = toInsertHist.map(h => ({
                    ...h,
                    equipamentosIds: h.equipamentosIds ? JSON.stringify(h.equipamentosIds) : null
                }));
                await supabase.from('historico').insert(formattedHist);
                console.log('Histórico inseridos com sucesso.');
            }
        }

        console.log('Importação concluída.');
    } catch (err) {
        console.error('Erro geral:', err);
    }
}
run();
