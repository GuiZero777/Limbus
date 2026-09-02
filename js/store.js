// js/store.js
// ---------------------------------------------------------
// NOVA VERSÃO: Integrando com o Backend Node.js
// ---------------------------------------------------------

const API_URL = 'http://localhost:3000/api';

// --- Estado Global na Memória ---
// Usamos uma cache local para manter as buscas rápidas, mas sempre sincronizadas com a API
const StoreState = {
    empresas: [],
    equipamentos: [],
    funcionarios: [],
    historico: [],
    setores: [],
    insumos: []
};

// --- Auxiliar de Resposta ---
const checkResponse = async (res, defaultMsg = 'Erro na requisição') => {
    if (!res.ok) {
        let errMsg = defaultMsg;
        try {
            const errData = await res.json();
            errMsg = errData.error || defaultMsg;
        } catch (e) {}
        throw new Error(errMsg);
    }
};

// --- Inicialização ---
const initializeStore = async () => {
    try {
        const [empRes, equipRes, funcRes, histRes, setRes, insRes] = await Promise.all([
            fetch(`${API_URL}/empresas`),
            fetch(`${API_URL}/equipamentos`),
            fetch(`${API_URL}/funcionarios`),
            fetch(`${API_URL}/historico`),
            fetch(`${API_URL}/setores`),
            fetch(`${API_URL}/insumos`)
        ]);

        StoreState.empresas = await empRes.json();
        StoreState.equipamentos = await equipRes.json();
        StoreState.funcionarios = await funcRes.json();
        StoreState.historico = await histRes.json();
        StoreState.setores = await setRes.json();
        StoreState.insumos = await insRes.json();

        console.log('Dados carregados com sucesso do Backend.');
    } catch (err) {
        console.error('Falha ao inicializar o banco de dados do Backend. Verifique se o servidor Node.js está rodando na porta 3000.', err);
        alert('O servidor de banco de dados não está respondendo. Verifique se o backend está rodando!');
    }
};

// --- Empresas ---
const getEmpresas = () => StoreState.empresas;
const getEmpresaById = (id) => StoreState.empresas.find(e => e.id === id);

const addEmpresa = async (empresa) => {
    const res = await fetch(`${API_URL}/empresas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa)
    });
    await checkResponse(res, 'Falha ao adicionar empresa');
    const saved = await res.json();
    StoreState.empresas.push(saved);
    return saved;
};

const removeEmpresa = async (id) => {
    const res = await fetch(`${API_URL}/empresas/${id}`, { method: 'DELETE' });
    await checkResponse(res, 'Falha ao remover empresa');
    StoreState.empresas = StoreState.empresas.filter(e => e.id !== id);
};

// --- Equipamentos ---
const getEquipamentos = () => StoreState.equipamentos;
const getEquipamentoById = (id) => StoreState.equipamentos.find(e => e.id === id);

const addEquipamento = async (equipamento) => {
    const res = await fetch(`${API_URL}/equipamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipamento)
    });
    await checkResponse(res, 'Falha ao adicionar equipamento');
    const saved = await res.json();
    StoreState.equipamentos.push(saved);
    return saved;
};

const editEquipamento = async (id, equipamentoUpdateData) => {
    const res = await fetch(`${API_URL}/equipamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipamentoUpdateData)
    });
    await checkResponse(res, 'Falha ao atualizar equipamento');
    const saved = await res.json();
    // Update Local Cache
    const idx = StoreState.equipamentos.findIndex(e => e.id === id);
    if (idx !== -1) {
        StoreState.equipamentos[idx] = { ...StoreState.equipamentos[idx], ...saved };
    }
};

const removeEquipamento = async (id) => {
    const res = await fetch(`${API_URL}/equipamentos/${id}`, { method: 'DELETE' });
    await checkResponse(res, 'Falha ao remover equipamento');
    StoreState.equipamentos = StoreState.equipamentos.filter(e => e.id !== id);
};

// --- Funcionários ---
const getFuncionarios = () => StoreState.funcionarios;
const getFuncionarioById = (id) => StoreState.funcionarios.find(f => f.id === id);

const addFuncionario = async (funcionario) => {
    const res = await fetch(`${API_URL}/funcionarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(funcionario)
    });
    await checkResponse(res, 'Falha ao adicionar funcionário');
    const saved = await res.json();
    StoreState.funcionarios.push(saved);
    return saved;
};

const removeFuncionario = async (id) => {
    const res = await fetch(`${API_URL}/funcionarios/${id}`, { method: 'DELETE' });
    await checkResponse(res, 'Falha ao remover funcionário');
    StoreState.funcionarios = StoreState.funcionarios.filter(f => f.id !== id);
    
    // Em um banco puramente SQL haveria ON DELETE CASCADE nas tabelas filhas (que fizemos), 
    // Mas a cache do histórico também precisa ser limpa aqui no frontend se quisermos consistência sem reload
    StoreState.historico = StoreState.historico.filter(h => h.funcionarioId !== id);
    
    // Também desvincular equipamentos que estavam na mão dele localmente
    StoreState.equipamentos.forEach(eq => {
        if(eq.funcionarioId === id) {
            eq.status = 'DISPONIVEL';
            eq.funcionarioId = null;
        }
    });
};

const bulkAddFuncionarios = async (funcionariosArray) => {
    const res = await fetch(`${API_URL}/funcionarios/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funcionarios: funcionariosArray })
    });
    await checkResponse(res, 'Falha ao importar funcionários em lote');
    const data = await res.json();
    if (data.inserted) {
        StoreState.funcionarios.push(...data.inserted);
    }
    return data;
};

const editFuncionario = async (id, updateData) => {
    const res = await fetch(`${API_URL}/funcionarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    });
    await checkResponse(res, 'Falha ao editar funcionário');
    const saved = await res.json();
    const idx = StoreState.funcionarios.findIndex(f => f.id === id);
    if (idx !== -1) {
        StoreState.funcionarios[idx] = { ...StoreState.funcionarios[idx], ...saved };
    }
    return saved;
};

// --- Histórico ---
const getHistorico = () => StoreState.historico;

const addHistorico = async (historicoData) => {
    const res = await fetch(`${API_URL}/historico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historicoData)
    });
    await checkResponse(res, 'Falha ao adicionar histórico');
    const saved = await res.json();
    
    // Parse the returned array if it exists as our server returns untouched JSON on POST bodies typically
    if(typeof saved.equipamentosIds === 'string' && saved.equipamentosIds) {
         saved.equipamentosIds = JSON.parse(saved.equipamentosIds);
    }

    StoreState.historico.push(saved);
    return saved;
};

const removeHistoricoEntry = async (id) => {
    const res = await fetch(`${API_URL}/historico/${id}`, { method: 'DELETE' });
    await checkResponse(res, 'Falha ao remover entrada do histórico');
    StoreState.historico = StoreState.historico.filter(h => h.id !== id);
};

const clearHistorico = async () => {
    const res = await fetch(`${API_URL}/historico`, { method: 'DELETE' });
    await checkResponse(res, 'Falha ao limpar histórico');
    StoreState.historico = [];
};

// --- Setores ---
const getSetores = () => {
    const fromSetoresTable = (StoreState.setores || []).map(s => typeof s === 'string' ? s : s.nome).filter(Boolean);
    const fromFuncionarios = (StoreState.funcionarios || []).map(f => f.setor).filter(Boolean);
    return [...new Set([...fromSetoresTable, ...fromFuncionarios])].sort();
};

const addSetor = async (nome) => {
    const res = await fetch(`${API_URL}/setores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
    });
    await checkResponse(res, 'Falha ao adicionar setor');
    const saved = await res.json();
    if (!StoreState.setores) StoreState.setores = [];
    StoreState.setores.push(saved);
    return saved;
};

const editSetor = async (oldName, newName) => {
    const res = await fetch(`${API_URL}/setores/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName })
    });
    await checkResponse(res, 'Falha ao editar setor');
    
    // Atualizar na lista de setores
    if (StoreState.setores) {
        StoreState.setores.forEach(s => {
            if (s.nome === oldName) {
                s.nome = newName;
            }
        });
    }

    // Atualizar localmente os funcionários associados
    StoreState.funcionarios.forEach(f => {
        if (f.setor === oldName) {
            f.setor = newName;
        }
    });
};

const removeSetor = async (name) => {
    const res = await fetch(`${API_URL}/setores/${encodeURIComponent(name)}`, {
        method: 'DELETE'
    });
    await checkResponse(res, 'Falha ao remover setor');
    
    // Remover da lista de setores
    if (StoreState.setores) {
        StoreState.setores = StoreState.setores.filter(s => s.nome !== name);
    }

    // Remover localmente o setor dos funcionários
    StoreState.funcionarios.forEach(f => {
        if (f.setor === name) {
            f.setor = null;
        }
    });
};

// --- Insumos ---
const getInsumos = () => {
    const funcionarios = StoreState.funcionarios || [];
    return (StoreState.insumos || []).map(insumo => {
        const emUso = funcionarios.reduce((acc, f) => {
            const match = (f.insumos || []).find(i => i.insumoId === insumo.id || i.id === insumo.id);
            return acc + (match ? (parseInt(match.quantidade, 10) || 1) : 0);
        }, 0);
        const quantidadeTotal = parseInt(insumo.quantidade, 10) || 0;
        const disponivel = Math.max(0, quantidadeTotal - emUso);
        return {
            ...insumo,
            quantidade: quantidadeTotal,
            emUso,
            disponivel
        };
    });
};

const getInsumoById = (id) => getInsumos().find(i => i.id === id);

const addInsumo = async (insumoData) => {
    const res = await fetch(`${API_URL}/insumos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insumoData)
    });
    await checkResponse(res, 'Falha ao adicionar insumo');
    const saved = await res.json();
    if (!StoreState.insumos) StoreState.insumos = [];
    StoreState.insumos.push(saved);
    return saved;
};

const editInsumo = async (id, insumoData) => {
    const res = await fetch(`${API_URL}/insumos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insumoData)
    });
    await checkResponse(res, 'Falha ao editar insumo');
    const saved = await res.json();
    const idx = (StoreState.insumos || []).findIndex(i => i.id === id);
    if (idx !== -1) {
        StoreState.insumos[idx] = { ...StoreState.insumos[idx], ...saved };
    }
    return saved;
};

const removeInsumo = async (id) => {
    const res = await fetch(`${API_URL}/insumos/${id}`, { method: 'DELETE' });
    await checkResponse(res, 'Falha ao remover insumo');
    StoreState.insumos = (StoreState.insumos || []).filter(i => i.id !== id);
};

