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
    historico: []
};

// --- Inicialização ---
const initializeStore = async () => {
    try {
        const [empRes, equipRes, funcRes, histRes] = await Promise.all([
            fetch(`${API_URL}/empresas`),
            fetch(`${API_URL}/equipamentos`),
            fetch(`${API_URL}/funcionarios`),
            fetch(`${API_URL}/historico`)
        ]);

        StoreState.empresas = await empRes.json();
        StoreState.equipamentos = await equipRes.json();
        StoreState.funcionarios = await funcRes.json();
        StoreState.historico = await histRes.json();

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
    try {
        const res = await fetch(`${API_URL}/empresas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(empresa)
        });
        const saved = await res.json();
        StoreState.empresas.push(saved);
        return saved;
    } catch (err) {
        console.error('Falha ao adicionar empresa', err);
    }
};

const removeEmpresa = async (id) => {
    try {
        await fetch(`${API_URL}/empresas/${id}`, { method: 'DELETE' });
        StoreState.empresas = StoreState.empresas.filter(e => e.id !== id);
    } catch (err) {
        console.error('Falha ao remover empresa', err);
    }
};


// --- Equipamentos ---
const getEquipamentos = () => StoreState.equipamentos;
const getEquipamentoById = (id) => StoreState.equipamentos.find(e => e.id === id);

const addEquipamento = async (equipamento) => {
    try {
        const res = await fetch(`${API_URL}/equipamentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipamento)
        });
        const saved = await res.json();
        StoreState.equipamentos.push(saved);
        return saved;
    } catch (err) {
        console.error('Falha ao adicionar equipamento', err);
    }
};

const editEquipamento = async (id, equipamentoUpdateData) => {
    try {
        const res = await fetch(`${API_URL}/equipamentos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipamentoUpdateData)
        });
        const saved = await res.json();
        // Update Local Cache
        const idx = StoreState.equipamentos.findIndex(e => e.id === id);
        if (idx !== -1) {
            StoreState.equipamentos[idx] = { ...StoreState.equipamentos[idx], ...saved };
        }
    } catch (err) {
        console.error('Falha ao atualizar equipamento', err);
    }
};

const removeEquipamento = async (id) => {
    try {
        await fetch(`${API_URL}/equipamentos/${id}`, { method: 'DELETE' });
        StoreState.equipamentos = StoreState.equipamentos.filter(e => e.id !== id);
    } catch (err) {
        console.error('Falha ao remover equipamento', err);
    }
};


// --- Funcionários ---
const getFuncionarios = () => StoreState.funcionarios;
const getFuncionarioById = (id) => StoreState.funcionarios.find(f => f.id === id);

const addFuncionario = async (funcionario) => {
    try {
        const res = await fetch(`${API_URL}/funcionarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(funcionario)
        });
        const saved = await res.json();
        StoreState.funcionarios.push(saved);
        return saved;
    } catch (err) {
        console.error('Falha ao adicionar funcionário', err);
    }
};

const removeFuncionario = async (id) => {
    try {
        await fetch(`${API_URL}/funcionarios/${id}`, { method: 'DELETE' });
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

    } catch (err) {
        console.error('Falha ao remover funcionário', err);
    }
};

const bulkAddFuncionarios = async (funcionariosArray) => {
    try {
        const res = await fetch(`${API_URL}/funcionarios/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ funcionarios: funcionariosArray })
        });
        const data = await res.json();
        if (data.inserted) {
            StoreState.funcionarios.push(...data.inserted);
        }
        return data;
    } catch (err) {
        console.error('Falha ao importar funcionários em lote', err);
        return { inserted: [], count: 0 };
    }
};

const editFuncionario = async (id, updateData) => {
    try {
        const res = await fetch(`${API_URL}/funcionarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        const saved = await res.json();
        const idx = StoreState.funcionarios.findIndex(f => f.id === id);
        if (idx !== -1) {
            StoreState.funcionarios[idx] = { ...StoreState.funcionarios[idx], ...saved };
        }
        return saved;
    } catch (err) {
        console.error('Falha ao editar funcionário', err);
    }
};


// --- Histórico ---
const getHistorico = () => StoreState.historico;

const addHistorico = async (historicoData) => {
    try {
        const res = await fetch(`${API_URL}/historico`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(historicoData)
        });
        const saved = await res.json();
        
        // Parse the returned array if it exists as our server returns untouched JSON on POST bodies typically
        if(typeof saved.equipamentosIds === 'string' && saved.equipamentosIds) {
             saved.equipamentosIds = JSON.parse(saved.equipamentosIds);
        }

        StoreState.historico.push(saved);
        return saved;
    } catch (err) {
        console.error('Falha ao adicionar histórico', err);
    }
};

const removeHistoricoEntry = async (id) => {
    try {
        await fetch(`${API_URL}/historico/${id}`, { method: 'DELETE' });
        StoreState.historico = StoreState.historico.filter(h => h.id !== id);
    } catch (err) {
        console.error('Falha ao remover entrada do histórico', err);
    }
};

const clearHistorico = async () => {
    try {
        await fetch(`${API_URL}/historico`, { method: 'DELETE' });
        StoreState.historico = [];
    } catch (err) {
        console.error('Falha ao limpar histórico', err);
    }
};
