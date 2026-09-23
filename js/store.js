// js/store.js
// ---------------------------------------------------------
// NOVA VERSÃO: Integrando com o Backend Node.js
// ---------------------------------------------------------

const API_URL = '/api';

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

// --- Auxiliar de Headers com Autenticação ---
const getAuthHeaders = (extra = {}) => {
    const token = typeof Auth !== 'undefined' ? Auth.getToken() : localStorage.getItem('limbus_auth_token');
    const headers = { ...extra };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// --- Auxiliar de Resposta ---
const checkResponse = async (res, defaultMsg = 'Erro na requisição') => {
    if (res.status === 401) {
        if (typeof Auth !== 'undefined') Auth.logout();
        throw new Error('Sessão expirada. Faça login novamente.');
    }
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
        const headers = getAuthHeaders();
        const [empRes, equipRes, funcRes, histRes, setRes, insRes] = await Promise.all([
            fetch(`${API_URL}/empresas`, { headers }),
            fetch(`${API_URL}/equipamentos`, { headers }),
            fetch(`${API_URL}/funcionarios`, { headers }),
            fetch(`${API_URL}/historico`, { headers }),
            fetch(`${API_URL}/setores`, { headers }),
            fetch(`${API_URL}/insumos`, { headers })
        ]);

        StoreState.empresas = await empRes.json();
        StoreState.equipamentos = await equipRes.json();
        StoreState.funcionarios = await funcRes.json();
        StoreState.historico = await histRes.json();
        StoreState.setores = await setRes.json();
        StoreState.insumos = await insRes.json();

        console.log('Dados carregados com sucesso do Backend.');
    } catch (err) {
        console.error('Falha ao inicializar o banco de dados do Backend.', err);
    }
};

// --- Empresas ---
const getEmpresas = () => StoreState.empresas;
const getEmpresaById = (id) => StoreState.empresas.find(e => e.id === id);

const addEmpresa = async (empresa) => {
    const res = await fetch(`${API_URL}/empresas`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(empresa)
    });
    await checkResponse(res, 'Falha ao adicionar empresa');
    const saved = await res.json();
    StoreState.empresas.push(saved);
    return saved;
};

const removeEmpresa = async (id) => {
    const res = await fetch(`${API_URL}/empresas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    await checkResponse(res, 'Falha ao remover empresa');
    StoreState.empresas = StoreState.empresas.filter(e => e.id !== id);
};

// --- Equipamentos ---
const getEquipamentos = () => StoreState.equipamentos;
const getEquipamentoById = (id) => StoreState.equipamentos.find(e => e.id === id);

const addEquipamento = async (equipamento) => {
    const res = await fetch(`${API_URL}/equipamentos`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(equipamentoUpdateData)
    });
    await checkResponse(res, 'Falha ao atualizar equipamento');
    const saved = await res.json();
    const idx = StoreState.equipamentos.findIndex(e => e.id === id);
    if (idx !== -1) {
        StoreState.equipamentos[idx] = { ...StoreState.equipamentos[idx], ...saved };
    }
};

const removeEquipamento = async (id) => {
    const res = await fetch(`${API_URL}/equipamentos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    await checkResponse(res, 'Falha ao remover equipamento');
    StoreState.equipamentos = StoreState.equipamentos.filter(e => e.id !== id);
};

// --- Funcionários ---
const getFuncionarios = () => StoreState.funcionarios;
const getFuncionarioById = (id) => StoreState.funcionarios.find(f => f.id === id);

const addFuncionario = async (funcionario) => {
    const res = await fetch(`${API_URL}/funcionarios`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(funcionario)
    });
    await checkResponse(res, 'Falha ao adicionar funcionário');
    const saved = await res.json();
    StoreState.funcionarios.push(saved);
    return saved;
};

const removeFuncionario = async (id, motivo = 'Desligamento') => {
    const targetFunc = StoreState.funcionarios.find(f => f.id === id);
    const res = await fetch(`${API_URL}/funcionarios/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ motivo })
    });
    await checkResponse(res, 'Falha ao remover funcionário');

    // Desvincular equipamentos que estavam na mão dele localmente
    StoreState.equipamentos.forEach(eq => {
        if (eq.funcionarioId === id) {
            eq.status = 'DISPONIVEL';
            eq.funcionarioId = null;
        }
    });

    // Manter o histórico do funcionário e enriquecer o snapshot com o motivo do desligamento
    StoreState.historico.forEach(h => {
        if (h.funcionarioId === id) {
            let snap = h.funcionarioSnapshot;
            if (typeof snap === 'string') {
                try { snap = JSON.parse(snap); } catch(e) { snap = {}; }
            }
            snap = snap || {};
            h.funcionarioSnapshot = {
                id: id,
                nome: targetFunc?.nome || snap.nome || 'Colaborador Desligado',
                funcao: targetFunc?.funcao || snap.funcao || 'Não Informado',
                setor: targetFunc?.setor || snap.setor || null,
                ...snap,
                desligado: true,
                motivoExclusao: motivo
            };
        }
    });

    StoreState.funcionarios = StoreState.funcionarios.filter(f => f.id !== id);
};

const bulkAddFuncionarios = async (funcionariosArray) => {
    const res = await fetch(`${API_URL}/funcionarios/bulk`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(historicoData)
    });
    await checkResponse(res, 'Falha ao adicionar histórico');
    const saved = await res.json();
    
    if(typeof saved.equipamentosIds === 'string' && saved.equipamentosIds) {
         saved.equipamentosIds = JSON.parse(saved.equipamentosIds);
    }

    StoreState.historico.push(saved);
    return saved;
};

const removeHistoricoEntry = async (id) => {
    const res = await fetch(`${API_URL}/historico/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    await checkResponse(res, 'Falha ao remover entrada do histórico');
    StoreState.historico = StoreState.historico.filter(h => h.id !== id);
};

const clearHistorico = async () => {
    const res = await fetch(`${API_URL}/historico`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
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
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ newName })
    });
    await checkResponse(res, 'Falha ao editar setor');
    
    if (StoreState.setores) {
        StoreState.setores.forEach(s => {
            if (s.nome === oldName) {
                s.nome = newName;
            }
        });
    }

    StoreState.funcionarios.forEach(f => {
        if (f.setor === oldName) {
            f.setor = newName;
        }
    });
};

const removeSetor = async (name) => {
    const res = await fetch(`${API_URL}/setores/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    await checkResponse(res, 'Falha ao remover setor');
    
    if (StoreState.setores) {
        StoreState.setores = StoreState.setores.filter(s => s.nome !== name);
    }

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
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
    const res = await fetch(`${API_URL}/insumos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    await checkResponse(res, 'Falha ao remover insumo');
    StoreState.insumos = (StoreState.insumos || []).filter(i => i.id !== id);
};
