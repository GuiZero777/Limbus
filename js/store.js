// js/store.js

const STORAGE_KEYS = {
    EMPRESAS: 'gt_empresas',
    EQUIPAMENTOS: 'gt_equipamentos',
    FUNCIONARIOS: 'gt_funcionarios',
    HISTORICO: 'gt_historico'
};

// --- Funções Auxiliares ---
const generateId = () => crypto.randomUUID();

const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// --- Inicialização com dados de exemplo (se vazio) ---
const initializeStore = () => {
    if (!localStorage.getItem(STORAGE_KEYS.EMPRESAS)) {
        setData(STORAGE_KEYS.EMPRESAS, [
            { id: generateId(), nome: 'Empresa Exemplo LTDA', cnpj: '00.000.000/0001-00', cidade: 'Palhoça', uf: 'SC' }
        ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EQUIPAMENTOS)) {
        setData(STORAGE_KEYS.EQUIPAMENTOS, [
            { id: generateId(), descricao: 'Notebook', modeloMarca: 'Dell Inspiron 15', status: 'DISPONIVEL', funcionarioId: null },
            { id: generateId(), descricao: 'Mouse sem fio', modeloMarca: 'Logitech M280', status: 'DISPONIVEL', funcionarioId: null },
            { id: generateId(), descricao: 'Headset', modeloMarca: 'JBL Quantum 100', status: 'DISPONIVEL', funcionarioId: null }
        ]);
    } else {
        // Migrate old equipment data that doesn't have status/funcionarioId
        const eqps = getData(STORAGE_KEYS.EQUIPAMENTOS);
        let migrated = false;
        const updatedEqps = eqps.map(e => {
            if (e.status === undefined) {
                migrated = true;
                return { ...e, status: 'DISPONIVEL', funcionarioId: null };
            }
            return e;
        });
        if (migrated) setData(STORAGE_KEYS.EQUIPAMENTOS, updatedEqps);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FUNCIONARIOS)) {
        setData(STORAGE_KEYS.FUNCIONARIOS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.HISTORICO)) {
        setData(STORAGE_KEYS.HISTORICO, []);
    }
};

// --- Operações CRUD Genéricas ---
const createItem = (key, item) => {
    const data = getData(key);
    const newItem = { ...item, id: generateId() };
    data.push(newItem);
    setData(key, data);
    return newItem;
};

const updateItem = (key, id, updatedFields) => {
    const data = getData(key);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
        data[index] = { ...data[index], ...updatedFields };
        setData(key, data);
        return data[index];
    }
    return null;
};

const deleteItem = (key, id) => {
    const data = getData(key);
    const filtered = data.filter(item => item.id !== id);
    setData(key, filtered);
};

// --- Empresas ---
const getEmpresas = () => getData(STORAGE_KEYS.EMPRESAS);
const getEmpresaById = (id) => getEmpresas().find(e => e.id === id);
const addEmpresa = (empresa) => createItem(STORAGE_KEYS.EMPRESAS, empresa);
const editEmpresa = (id, empresa) => updateItem(STORAGE_KEYS.EMPRESAS, id, empresa);
const removeEmpresa = (id) => deleteItem(STORAGE_KEYS.EMPRESAS, id);

// --- Equipamentos ---
const getEquipamentos = () => getData(STORAGE_KEYS.EQUIPAMENTOS);
const getEquipamentoById = (id) => getEquipamentos().find(e => e.id === id);
const addEquipamento = (equipamento) => createItem(STORAGE_KEYS.EQUIPAMENTOS, { ...equipamento, status: 'DISPONIVEL', funcionarioId: null });
const editEquipamento = (id, equipamento) => updateItem(STORAGE_KEYS.EQUIPAMENTOS, id, equipamento);
const removeEquipamento = (id) => deleteItem(STORAGE_KEYS.EQUIPAMENTOS, id);

// --- Funcionários ---
const getFuncionarios = () => getData(STORAGE_KEYS.FUNCIONARIOS);
const getFuncionarioById = (id) => getFuncionarios().find(f => f.id === id);
const addFuncionario = (funcionario) => createItem(STORAGE_KEYS.FUNCIONARIOS, funcionario);
const editFuncionario = (id, funcionario) => updateItem(STORAGE_KEYS.FUNCIONARIOS, id, funcionario);
const removeFuncionario = (id) => deleteItem(STORAGE_KEYS.FUNCIONARIOS, id);

// --- Histórico ---
const getHistorico = () => getData(STORAGE_KEYS.HISTORICO);
const addHistorico = (historicoData) => {
    // historicoData should have: tipo (ENTREGA, DEVOLUCAO, ALOCACAO_MANUAL), funcionarioId, equipamentoId, data (ISO string)
    return createItem(STORAGE_KEYS.HISTORICO, {
        ...historicoData,
        timestamp: new Date().toISOString()
    });
};
const clearHistorico = () => {
    setData(STORAGE_KEYS.HISTORICO, []);
};
