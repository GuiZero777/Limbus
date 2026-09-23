const express = require('express');
const cors = require('cors');
const path = require('path');
const { supabase, getDbConnection } = require('./database');
const crypto = require('crypto');
const {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    getLocalUsers,
    saveLocalUsers
} = require('./auth');

const app = express();

app.use(cors());
app.use(express.json());

// Serve o frontend estático a partir da raiz do projeto
app.use(express.static(path.join(__dirname, '..')));

const generateId = () => crypto.randomUUID();

// =============================================================
// VALIDAÇÃO
// =============================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UF_REGEX   = /^[A-Z]{2}$/;
const CNPJ_REGEX = /^\d{14}$/;

const TIPOS_HISTORICO_VALIDOS    = ['ENTREGA', 'DEVOLUCAO', 'DEVOLUCAO_COMPLETA', 'ALOCACAO_MANUAL'];
const STATUS_EQUIPAMENTO_VALIDOS = ['DISPONIVEL', 'EM_USO'];

const str = (val, campo, { max = 255, min = 1 } = {}) => {
    if (val === null || val === undefined || typeof val !== 'string') {
        throw new ValidationError(`Campo obrigatório ausente: ${campo}`);
    }
    const trimmed = val.trim();
    if (trimmed.length < min) throw new ValidationError(`${campo} não pode ser vazio`);
    if (trimmed.length > max) throw new ValidationError(`${campo} excede o limite de ${max} caracteres`);
    return trimmed;
};

const uuid = (val, campo) => {
    const v = str(val, campo);
    if (!UUID_REGEX.test(v)) throw new ValidationError(`${campo} deve ser um UUID válido`);
    return v;
};

const oneOf = (val, campo, allowed) => {
    const v = str(val, campo);
    if (!allowed.includes(v)) throw new ValidationError(`${campo} inválido. Permitidos: ${allowed.join(', ')}`);
    return v;
};

const date = (val, campo) => {
    const v = str(val, campo);
    if (!DATE_REGEX.test(v)) throw new ValidationError(`${campo} deve estar no formato YYYY-MM-DD`);
    const d = new Date(v);
    if (isNaN(d.getTime())) throw new ValidationError(`${campo} não é uma data válida`);
    return v;
};

const cnpj = (val) => {
    if (val === null || val === undefined || typeof val !== 'string') {
        throw new ValidationError('cnpj é obrigatório e deve ser uma string');
    }
    const digits = val.replace(/\D/g, '');
    if (!CNPJ_REGEX.test(digits)) throw new ValidationError('cnpj deve conter exatamente 14 dígitos numéricos');
    return digits;
};

const uf = (val) => {
    const v = str(val, 'uf', { max: 2, min: 2 }).toUpperCase();
    if (!UF_REGEX.test(v)) throw new ValidationError('uf deve ser uma sigla com 2 letras (ex: SC)');
    return v;
};

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

const handle = (fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({ error: err.message });
        }
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// =============================================================
// EMPRESAS
// =============================================================

app.get('/api/empresas', handle(async (req, res) => {
    const { data, error } = await supabase.from('empresas').select('*');
    if (error) throw error;
    res.json(data || []);
}));

app.post('/api/empresas', handle(async (req, res) => {
    const nome   = str(req.body.nome,   'nome',   { max: 150 });
    const cnpjV  = cnpj(req.body.cnpj);
    const cidade = str(req.body.cidade, 'cidade', { max: 100 });
    const ufV    = uf(req.body.uf);

    const id = generateId();
    const { error } = await supabase.from('empresas').insert([{
        id, nome, cnpj: cnpjV, cidade, uf: ufV
    }]);

    if (error) {
        if (error.code === '23505') throw new ValidationError('Já existe uma empresa cadastrada com este CNPJ');
        throw error;
    }

    res.status(201).json({ id, nome, cnpj: cnpjV, cidade, uf: ufV });
}));

app.delete('/api/empresas/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const { error } = await supabase.from('empresas').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
}));

// =============================================================
// FUNCIONÁRIOS
// =============================================================

app.get('/api/funcionarios', handle(async (req, res) => {
    const { data, error } = await supabase.from('funcionarios').select('*');
    if (error) throw error;
    const parsed = (data || []).map(f => ({
        ...f,
        insumos: Array.isArray(f.insumos) ? f.insumos : (typeof f.insumos === 'string' ? JSON.parse(f.insumos || '[]') : [])
    }));
    res.json(parsed);
}));

app.post('/api/funcionarios', handle(async (req, res) => {
    const nome         = str(req.body.nome,         'nome',   { max: 150 });
    const funcao       = str(req.body.funcao,        'funcao', { max: 100 });
    const dataAdmissao = date(req.body.dataAdmissao, 'dataAdmissao');
    const setor        = req.body.setor ? str(req.body.setor, 'setor', { max: 100 }) : null;
    const insumos      = Array.isArray(req.body.insumos) ? req.body.insumos : [];

    const id = generateId();
    const { error } = await supabase.from('funcionarios').insert([{
        id, nome, funcao, dataAdmissao, setor, insumos
    }]);

    if (error) throw error;
    res.status(201).json({ id, nome, funcao, dataAdmissao, setor, insumos });
}));

app.post('/api/funcionarios/bulk', handle(async (req, res) => {
    const { funcionarios } = req.body;
    if (!Array.isArray(funcionarios) || funcionarios.length === 0) {
        throw new ValidationError('Array de funcionários vazio ou inválido');
    }
    if (funcionarios.length > 1000) {
        throw new ValidationError('Máximo de 1000 funcionários por importação');
    }

    const toInsert = [];
    for (const func of funcionarios) {
        if (!func.nome || !String(func.nome).trim()) continue;
        const nome         = str(func.nome,                      'nome',   { max: 150 });
        const funcao       = str(func.funcao || 'Não Informado', 'funcao', { max: 100 });
        const dataAdmissao = date(func.dataAdmissao,             'dataAdmissao');
        const setor        = func.setor ? str(func.setor, 'setor', { max: 100 }) : null;
        const id = generateId();
        toInsert.push({ id, nome, funcao, dataAdmissao, setor, insumos: [] });
    }

    if (toInsert.length > 0) {
        const { error } = await supabase.from('funcionarios').insert(toInsert);
        if (error) throw error;
    }

    res.status(201).json({ inserted: toInsert, count: toInsert.length });
}));

app.put('/api/funcionarios/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const updatePayload = {};
    if (req.body.nome !== undefined) updatePayload.nome = str(req.body.nome, 'nome', { max: 150 });
    if (req.body.funcao !== undefined) updatePayload.funcao = str(req.body.funcao, 'funcao', { max: 100 });
    if (req.body.dataAdmissao !== undefined) updatePayload.dataAdmissao = date(req.body.dataAdmissao, 'dataAdmissao');
    if (req.body.setor !== undefined) updatePayload.setor = req.body.setor ? str(req.body.setor, 'setor', { max: 100 }) : null;
    if (req.body.insumos !== undefined) {
        updatePayload.insumos = Array.isArray(req.body.insumos) ? req.body.insumos : [];
    }

    const { data, error } = await supabase.from('funcionarios')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new ValidationError('Funcionário não encontrado');

    res.json(data);
}));

app.delete('/api/funcionarios/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const motivo = req.body?.motivo || req.query?.motivo || 'Desligamento';
    
    // Obter dados do funcionário para garantir snapshot histórico imutável
    const { data: func } = await supabase.from('funcionarios').select('*').eq('id', id).maybeSingle();
    if (func) {
        // Desvincular equipamentos que estavam em posse dele e disponibilizá-los
        await supabase.from('equipamentos')
            .update({ status: 'DISPONIVEL', funcionarioId: null })
            .eq('funcionarioId', id);

        const { data: histList } = await supabase.from('historico').select('*').eq('funcionarioId', id);
        if (histList && histList.length > 0) {
            for (const h of histList) {
                let snapObj = h.funcionarioSnapshot;
                if (typeof snapObj === 'string') {
                    try { snapObj = JSON.parse(snapObj); } catch(e) { snapObj = {}; }
                }
                snapObj = snapObj || {};

                const updatedSnap = {
                    id: func.id,
                    nome: func.nome,
                    funcao: func.funcao || 'Não Informado',
                    setor: func.setor || null,
                    ...snapObj,
                    desligado: true,
                    motivoExclusao: motivo
                };
                await supabase.from('historico').update({ funcionarioSnapshot: updatedSnap }).eq('id', h.id);
            }
        }
    }

    const { error } = await supabase.from('funcionarios').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
}));

// =============================================================
// SETORES
// =============================================================

app.get('/api/setores', handle(async (req, res) => {
    const { data, error } = await supabase.from('setores').select('*');
    if (error) throw error;
    res.json(data || []);
}));

app.post('/api/setores', handle(async (req, res) => {
    const nome = str(req.body.nome, 'nome', { max: 100 });

    // Verificar se já existe um setor com o mesmo nome (case-insensitive)
    const { data: existingList } = await supabase.from('setores').select('*');
    const duplicate = (existingList || []).find(s => s.nome.toLowerCase() === nome.toLowerCase());
    if (duplicate) {
        throw new ValidationError('Já existe um setor cadastrado com este nome');
    }

    const id = generateId();
    const { error } = await supabase.from('setores').insert([{ id, nome }]);
    if (error) throw error;

    res.status(201).json({ id, nome });
}));

app.put('/api/setores/:oldName', handle(async (req, res) => {
    const oldName = req.params.oldName;
    const newName = str(req.body.newName, 'newName', { max: 100 });

    // Atualiza na tabela de setores
    await supabase.from('setores')
        .update({ nome: newName })
        .eq('nome', oldName);

    // Atualiza todos os funcionários com oldName para newName
    const { error } = await supabase.from('funcionarios')
        .update({ setor: newName })
        .eq('setor', oldName);

    if (error) throw error;
    res.json({ oldName, newName });
}));

app.delete('/api/setores/:name', handle(async (req, res) => {
    const name = req.params.name;

    // Remove da tabela de setores
    await supabase.from('setores')
        .delete()
        .eq('nome', name);

    // Remove o setor dos funcionários associados
    const { error } = await supabase.from('funcionarios')
        .update({ setor: null })
        .eq('setor', name);

    if (error) throw error;
    res.status(204).send();
}));

// =============================================================
// INSUMOS (PERIFÉRICOS & CONSUMÍVEIS SEM PATRIMÔNIO)
// =============================================================

app.get('/api/insumos', handle(async (req, res) => {
    const { data, error } = await supabase.from('insumos').select('*');
    if (error) throw error;
    res.json(data || []);
}));

app.post('/api/insumos', handle(async (req, res) => {
    const nome       = str(req.body.nome, 'nome', { max: 150 });
    const marca      = req.body.marca ? str(req.body.marca, 'marca', { max: 100 }) : '';
    const quantidade = Math.max(0, parseInt(req.body.quantidade, 10) || 0);

    const id = generateId();
    const { error } = await supabase.from('insumos').insert([{
        id, nome, marca, quantidade
    }]);

    if (error) throw error;
    res.status(201).json({ id, nome, marca, quantidade });
}));

app.put('/api/insumos/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const updatePayload = {};
    if (req.body.nome !== undefined) updatePayload.nome = str(req.body.nome, 'nome', { max: 150 });
    if (req.body.marca !== undefined) updatePayload.marca = req.body.marca ? str(req.body.marca, 'marca', { max: 100 }) : '';
    if (req.body.quantidade !== undefined) updatePayload.quantidade = Math.max(0, parseInt(req.body.quantidade, 10) || 0);

    const { data, error } = await supabase.from('insumos')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new ValidationError('Insumo não encontrado');

    res.json(data);
}));

app.delete('/api/insumos/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const { error } = await supabase.from('insumos').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
}));

// =============================================================
// EQUIPAMENTOS
// =============================================================

app.get('/api/equipamentos', handle(async (req, res) => {
    const { data, error } = await supabase.from('equipamentos').select('*');
    if (error) throw error;
    res.json(data || []);
}));

app.post('/api/equipamentos', handle(async (req, res) => {
    const descricao    = str(req.body.descricao,   'descricao',   { max: 150 });
    const modeloMarca  = str(req.body.modeloMarca, 'modeloMarca', { max: 100 });
    const patrimonio   = req.body.patrimonio ? str(req.body.patrimonio, 'patrimonio', { max: 50 }) : null;
    const serialNumber = req.body.serialNumber ? str(req.body.serialNumber, 'serialNumber', { max: 100 }) : null;
    const observacoes  = req.body.observacoes ? str(req.body.observacoes, 'observacoes', { max: 1000 }) : null;

    const id = generateId();
    const { error } = await supabase.from('equipamentos').insert([{
        id, descricao, modeloMarca, status: 'DISPONIVEL', 'funcionarioId': null, patrimonio, serialNumber, observacoes
    }]);

    if (error) throw error;
    res.status(201).json({ id, descricao, modeloMarca, status: 'DISPONIVEL', funcionarioId: null, patrimonio, serialNumber, observacoes });
}));

app.put('/api/equipamentos/:id', handle(async (req, res) => {
    const id            = uuid(req.params.id,    'id');
    const status        = req.body.status ? oneOf(req.body.status, 'status', STATUS_EQUIPAMENTO_VALIDOS) : undefined;
    let funcionarioId = req.body.funcionarioId;
    if (funcionarioId !== undefined && funcionarioId !== null) {
        funcionarioId = uuid(funcionarioId, 'funcionarioId');
    }

    const updateObj = {};
    if (status !== undefined) updateObj.status = status;
    if (funcionarioId !== undefined) updateObj.funcionarioId = funcionarioId;
    if (req.body.descricao !== undefined) updateObj.descricao = str(req.body.descricao, 'descricao', { max: 150 });
    if (req.body.modeloMarca !== undefined) updateObj.modeloMarca = str(req.body.modeloMarca, 'modeloMarca', { max: 100 });
    if (req.body.patrimonio !== undefined) updateObj.patrimonio = req.body.patrimonio ? str(req.body.patrimonio, 'patrimonio', { max: 50 }) : null;
    if (req.body.serialNumber !== undefined) updateObj.serialNumber = req.body.serialNumber ? str(req.body.serialNumber, 'serialNumber', { max: 100 }) : null;
    if (req.body.observacoes !== undefined) updateObj.observacoes = req.body.observacoes ? str(req.body.observacoes, 'observacoes', { max: 1000 }) : null;

    const { data, error } = await supabase.from('equipamentos')
        .update(updateObj)
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) {
        if (error.code === '23503') throw new ValidationError('funcionarioId não corresponde a um funcionário existente');
        throw error;
    }
    if (!data) throw new ValidationError('Equipamento não encontrado');

    data.funcionarioId = data.funcionarioId || null;
    res.json(data);
}));

app.delete('/api/equipamentos/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const { error } = await supabase.from('equipamentos').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
}));

// =============================================================
// HISTÓRICO
// =============================================================

app.get('/api/historico', handle(async (req, res) => {
    const { data, error } = await supabase.from('historico').select('*');
    if (error) throw error;

    const parsed = (data || []).map(item => {
        const h = { ...item };
        if (typeof h.equipamentosIds === 'string') {
            try {
                h.equipamentosIds = JSON.parse(h.equipamentosIds);
            } catch (err) {
                h.equipamentosIds = [];
            }
        }
        if (!Array.isArray(h.equipamentosIds)) {
            h.equipamentosIds = [];
        }

        if (typeof h.equipamentosSnapshots === 'string') {
            try { h.equipamentosSnapshots = JSON.parse(h.equipamentosSnapshots); } catch(e) {}
        }
        if (typeof h.equipamentoSnapshot === 'string') {
            try { h.equipamentoSnapshot = JSON.parse(h.equipamentoSnapshot); } catch(e) {}
        }
        if (typeof h.funcionarioSnapshot === 'string') {
            try { h.funcionarioSnapshot = JSON.parse(h.funcionarioSnapshot); } catch(e) {}
        }
        return h;
    });
    res.json(parsed);
}));

app.post('/api/historico', handle(async (req, res) => {
    const tipo          = oneOf(req.body.tipo,         'tipo',         TIPOS_HISTORICO_VALIDOS);
    const funcionarioId = uuid(req.body.funcionarioId, 'funcionarioId');
    const dataVal       = date(req.body.data,           'data');

    let equipamentoId   = req.body.equipamentoId  ?? null;
    let equipamentosIds = req.body.equipamentosIds ?? null;
    let equipamentoSnapshot = req.body.equipamentoSnapshot ?? null;
    let equipamentosSnapshots = req.body.equipamentosSnapshots ?? null;
    let funcionarioSnapshot = req.body.funcionarioSnapshot ?? null;

    if (equipamentoId !== null) {
        equipamentoId = uuid(equipamentoId, 'equipamentoId');
    }
    if (equipamentosIds !== null) {
        if (!Array.isArray(equipamentosIds)) throw new ValidationError('equipamentosIds deve ser um array');
        if (equipamentosIds.length > 100)    throw new ValidationError('equipamentosIds excede o limite de 100 itens');
        equipamentosIds = equipamentosIds.map((eid, i) => uuid(eid, `equipamentosIds[${i}]`));
    }

    // Auto-preenchimento do snapshot do funcionário se não fornecido
    if (!funcionarioSnapshot) {
        const { data: funcData } = await supabase.from('funcionarios').select('*').eq('id', funcionarioId).maybeSingle();
        if (funcData) {
            funcionarioSnapshot = {
                id: funcData.id,
                nome: funcData.nome,
                funcao: funcData.funcao || 'Não Informado',
                setor: funcData.setor || null
            };
        }
    }

    const stringifiedIds = equipamentosIds ? JSON.stringify(equipamentosIds) : null;
    const stringifiedSnapshots = equipamentosSnapshots ? JSON.stringify(equipamentosSnapshots) : null;
    const stringifiedSnapshot = equipamentoSnapshot ? JSON.stringify(equipamentoSnapshot) : null;
    const stringifiedFuncSnapshot = funcionarioSnapshot ? JSON.stringify(funcionarioSnapshot) : null;

    const id = generateId();
    const timestamp = new Date().toISOString();

    const { error } = await supabase.from('historico').insert([{
        id, tipo, 'funcionarioId': funcionarioId, 'funcionarioSnapshot': stringifiedFuncSnapshot,
        'equipamentoId': equipamentoId, 'equipamentosIds': stringifiedIds, data: dataVal, timestamp,
        'equipamentoSnapshot': stringifiedSnapshot, 'equipamentosSnapshots': stringifiedSnapshots
    }]);

    if (error) {
        if (error.code === '23503') throw new ValidationError('funcionarioId não corresponde a um funcionário existente');
        throw error;
    }

    res.status(201).json({
        id, tipo, funcionarioId, funcionarioSnapshot, equipamentoId, equipamentosIds, data: dataVal, timestamp,
        equipamentoSnapshot, equipamentosSnapshots
    });
}));

app.delete('/api/historico/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const { error } = await supabase.from('historico').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
}));

app.delete('/api/historico', handle(async (req, res) => {
    const { error } = await supabase.from('historico').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // hacky way to delete all in supabase JS
    if (error) throw error;
    res.status(204).send();
}));

// =============================================================
// AUTENTICAÇÃO E USUÁRIOS
// =============================================================

async function getAllUsers() {
    try {
        const { data, error } = await supabase.from('usuarios').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
            return { users: data, source: 'supabase' };
        }
    } catch (e) {}
    return { users: getLocalUsers(), source: 'local' };
}

async function findUserByLogin(login) {
    try {
        const { data, error } = await supabase.from('usuarios').select('*').ilike('usuario', login).limit(1);
        if (!error && Array.isArray(data) && data.length > 0) {
            return { user: data[0], source: 'supabase' };
        }
    } catch (e) {}
    const local = getLocalUsers();
    const found = local.find(u => u.usuario && u.usuario.toLowerCase() === (login || '').toLowerCase());
    return { user: found || null, source: 'local' };
}

async function saveUser(userObj, source) {
    if (source === 'supabase') {
        try {
            const { error } = await supabase.from('usuarios').upsert([userObj]);
            if (!error) return;
        } catch (e) {}
    }
    const local = getLocalUsers();
    const idx = local.findIndex(u => u.id === userObj.id);
    if (idx >= 0) {
        local[idx] = userObj;
    } else {
        local.push(userObj);
    }
    saveLocalUsers(local);
}

const authMiddleware = (requiredRole = null) => (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({ error: 'Sessão expirada ou não autenticada' });
    }
    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Sessão expirada (> 24h). Por favor, faça login novamente.' });
    }
    if (requiredRole && payload.perfil !== requiredRole && payload.perfil !== 'admin') {
        return res.status(403).json({ error: 'Permissão insuficiente' });
    }
    req.user = payload;
    next();
};

app.post('/api/auth/login', handle(async (req, res) => {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const { user, source } = await findUserByLogin(usuario.trim());
    if (!user || !verifyPassword(senha, user.senha_hash)) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    if (user.ativo === false) {
        return res.status(403).json({ error: 'Acesso desativado pelo administrador' });
    }

    user.ultimo_login = new Date().toISOString();
    await saveUser(user, source);

    const token = generateToken(user);
    res.json({
        token,
        user: {
            id: user.id,
            nome: user.nome,
            usuario: user.usuario,
            cargo: user.cargo || 'TI',
            perfil: user.perfil || 'operador'
        }
    });
}));

app.get('/api/auth/me', authMiddleware(), handle(async (req, res) => {
    res.json({ user: req.user });
}));

app.post('/api/auth/alterar-senha', authMiddleware(), handle(async (req, res) => {
    const { senha_atual, nova_senha } = req.body;
    if (!senha_atual || !nova_senha) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }
    if (nova_senha.length < 4) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 4 caracteres' });
    }

    const { user, source } = await findUserByLogin(req.user.usuario);
    if (!user || !verifyPassword(senha_atual, user.senha_hash)) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    user.senha_hash = hashPassword(nova_senha);
    await saveUser(user, source);

    res.json({ success: true, message: 'Senha alterada com sucesso' });
}));

app.get('/api/usuarios', authMiddleware('admin'), handle(async (req, res) => {
    const { users } = await getAllUsers();
    const safeUsers = users.map(u => ({
        id: u.id,
        nome: u.nome,
        usuario: u.usuario,
        cargo: u.cargo || 'TI',
        perfil: u.perfil || 'operador',
        ativo: u.ativo !== false,
        ultimo_login: u.ultimo_login || null,
        created_at: u.created_at || null
    }));
    res.json(safeUsers);
}));

app.post('/api/usuarios', authMiddleware('admin'), handle(async (req, res) => {
    const { nome, usuario, senha, cargo, perfil } = req.body;
    if (!nome || !usuario || !senha) {
        return res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios' });
    }

    const { user: existing } = await findUserByLogin(usuario.trim());
    if (existing) {
        return res.status(400).json({ error: 'Já existe um usuário cadastrado com esse login' });
    }

    const newUser = {
        id: generateId(),
        nome: nome.trim(),
        usuario: usuario.trim().toLowerCase(),
        senha_hash: hashPassword(senha),
        cargo: (cargo || 'Operador de TI').trim(),
        perfil: perfil === 'admin' ? 'admin' : 'operador',
        ativo: true,
        created_at: new Date().toISOString()
    };

    const { source } = await getAllUsers();
    await saveUser(newUser, source);

    res.status(201).json({
        id: newUser.id,
        nome: newUser.nome,
        usuario: newUser.usuario,
        cargo: newUser.cargo,
        perfil: newUser.perfil,
        ativo: newUser.ativo,
        created_at: newUser.created_at
    });
}));

app.put('/api/usuarios/:id', authMiddleware('admin'), handle(async (req, res) => {
    const id = req.params.id;
    const { nome, cargo, perfil, ativo, nova_senha } = req.body;

    const { users, source } = await getAllUsers();
    const target = users.find(u => u.id === id);
    if (!target) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (nome) target.nome = nome.trim();
    if (cargo) target.cargo = cargo.trim();
    if (perfil) target.perfil = perfil === 'admin' ? 'admin' : 'operador';
    if (ativo !== undefined) target.ativo = Boolean(ativo);
    if (nova_senha && nova_senha.trim().length >= 4) {
        target.senha_hash = hashPassword(nova_senha.trim());
    }

    await saveUser(target, source);

    res.json({
        id: target.id,
        nome: target.nome,
        usuario: target.usuario,
        cargo: target.cargo,
        perfil: target.perfil,
        ativo: target.ativo,
        ultimo_login: target.ultimo_login
    });
}));

app.delete('/api/usuarios/:id', authMiddleware('admin'), handle(async (req, res) => {
    const id = req.params.id;
    const { users, source } = await getAllUsers();
    const target = users.find(u => u.id === id);
    if (!target) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (target.usuario === 'admin' && users.filter(u => u.perfil === 'admin' && u.ativo).length <= 1) {
        return res.status(400).json({ error: 'Não é possível excluir o único administrador ativo' });
    }

    if (source === 'supabase') {
        try {
            await supabase.from('usuarios').delete().eq('id', id);
        } catch (e) {}
    }
    const updated = users.filter(u => u.id !== id);
    saveLocalUsers(updated);

    res.status(204).send();
}));

// =============================================================
// EXPORT
// =============================================================

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    // getDbConnection síncrono para garantir que existe o cliente
    getDbConnection().then(() => {
        app.listen(PORT, () => {
            console.log(`Limbus rodando em http://localhost:${PORT}`);
        });
    }).catch(err => {
        console.error('Falha ao inicializar o banco de dados:', err);
        process.exit(1);
    });
}
