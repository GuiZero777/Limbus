const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDbConnection } = require('./database');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve o frontend estático a partir da raiz do projeto
app.use(express.static(path.join(__dirname, '..')));

const generateId = () => crypto.randomUUID();

// =============================================================
// VALIDAÇÃO — funções puras, zero dependências externas
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
    const v = str(val, 'cnpj', { max: 14 });
    const digits = v.replace(/\D/g, '');
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
    const db = await getDbConnection();
    res.json(await db.all('SELECT * FROM empresas'));
}));

app.post('/api/empresas', handle(async (req, res) => {
    const nome   = str(req.body.nome,   'nome',   { max: 150 });
    const cnpjV  = cnpj(req.body.cnpj);
    const cidade = str(req.body.cidade, 'cidade', { max: 100 });
    const ufV    = uf(req.body.uf);

    const db = await getDbConnection();
    const existing = await db.get('SELECT id FROM empresas WHERE cnpj = ?', [cnpjV]);
    if (existing) throw new ValidationError('Já existe uma empresa cadastrada com este CNPJ');

    const id = generateId();
    await db.run(
        'INSERT INTO empresas (id, nome, cnpj, cidade, uf) VALUES (?, ?, ?, ?, ?)',
        [id, nome, cnpjV, cidade, ufV]
    );
    res.status(201).json({ id, nome, cnpj: cnpjV, cidade, uf: ufV });
}));

app.delete('/api/empresas/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const db = await getDbConnection();
    await db.run('DELETE FROM empresas WHERE id = ?', [id]);
    res.status(204).send();
}));

// =============================================================
// FUNCIONÁRIOS
// =============================================================

app.get('/api/funcionarios', handle(async (req, res) => {
    const db = await getDbConnection();
    res.json(await db.all('SELECT * FROM funcionarios'));
}));

app.post('/api/funcionarios', handle(async (req, res) => {
    const nome         = str(req.body.nome,         'nome',   { max: 150 });
    const funcao       = str(req.body.funcao,        'funcao', { max: 100 });
    const dataAdmissao = date(req.body.dataAdmissao, 'dataAdmissao');

    const db = await getDbConnection();
    const id = generateId();
    await db.run(
        'INSERT INTO funcionarios (id, nome, funcao, dataAdmissao) VALUES (?, ?, ?, ?)',
        [id, nome, funcao, dataAdmissao]
    );
    res.status(201).json({ id, nome, funcao, dataAdmissao });
}));

app.post('/api/funcionarios/bulk', handle(async (req, res) => {
    const { funcionarios } = req.body;
    if (!Array.isArray(funcionarios) || funcionarios.length === 0) {
        throw new ValidationError('Array de funcionários vazio ou inválido');
    }
    if (funcionarios.length > 1000) {
        throw new ValidationError('Máximo de 1000 funcionários por importação');
    }

    const db = await getDbConnection();
    const inserted = [];

    await db.run('BEGIN TRANSACTION');
    try {
        for (const func of funcionarios) {
            if (!func.nome || !String(func.nome).trim()) continue;
            const nome         = str(func.nome,                      'nome',   { max: 150 });
            const funcao       = str(func.funcao || 'Não Informado', 'funcao', { max: 100 });
            const dataAdmissao = date(func.dataAdmissao,             'dataAdmissao');
            const id = generateId();
            await db.run(
                'INSERT INTO funcionarios (id, nome, funcao, dataAdmissao) VALUES (?, ?, ?, ?)',
                [id, nome, funcao, dataAdmissao]
            );
            inserted.push({ id, nome, funcao, dataAdmissao });
        }
        await db.run('COMMIT');
    } catch (txErr) {
        await db.run('ROLLBACK');
        throw txErr;
    }

    res.status(201).json({ inserted, count: inserted.length });
}));

app.put('/api/funcionarios/:id', handle(async (req, res) => {
    const id           = uuid(req.params.id,          'id');
    const nome         = str(req.body.nome,            'nome',   { max: 150 });
    const funcao       = str(req.body.funcao,           'funcao', { max: 100 });
    const dataAdmissao = date(req.body.dataAdmissao,   'dataAdmissao');

    const db = await getDbConnection();
    const existing = await db.get('SELECT id FROM funcionarios WHERE id = ?', [id]);
    if (!existing) throw new ValidationError('Funcionário não encontrado');

    await db.run(
        'UPDATE funcionarios SET nome = ?, funcao = ?, dataAdmissao = ? WHERE id = ?',
        [nome, funcao, dataAdmissao, id]
    );
    res.json({ id, nome, funcao, dataAdmissao });
}));

app.delete('/api/funcionarios/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const db = await getDbConnection();
    await db.run('DELETE FROM funcionarios WHERE id = ?', [id]);
    res.status(204).send();
}));

// =============================================================
// EQUIPAMENTOS
// =============================================================

app.get('/api/equipamentos', handle(async (req, res) => {
    const db = await getDbConnection();
    res.json(await db.all('SELECT * FROM equipamentos'));
}));

app.post('/api/equipamentos', handle(async (req, res) => {
    const descricao   = str(req.body.descricao,   'descricao',   { max: 150 });
    const modeloMarca = str(req.body.modeloMarca, 'modeloMarca', { max: 100 });

    const db = await getDbConnection();
    const id = generateId();
    await db.run(
        'INSERT INTO equipamentos (id, descricao, modeloMarca, status, funcionarioId) VALUES (?, ?, ?, ?, ?)',
        [id, descricao, modeloMarca, 'DISPONIVEL', null]
    );
    res.status(201).json({ id, descricao, modeloMarca, status: 'DISPONIVEL', funcionarioId: null });
}));

app.put('/api/equipamentos/:id', handle(async (req, res) => {
    const id     = uuid(req.params.id,    'id');
    const status = oneOf(req.body.status, 'status', STATUS_EQUIPAMENTO_VALIDOS);

    let funcionarioId = req.body.funcionarioId ?? null;
    if (funcionarioId !== null) {
        funcionarioId = uuid(funcionarioId, 'funcionarioId');
        const db = await getDbConnection();
        const func = await db.get('SELECT id FROM funcionarios WHERE id = ?', [funcionarioId]);
        if (!func) throw new ValidationError('funcionarioId não corresponde a um funcionário existente');
    }

    const db = await getDbConnection();
    const existing = await db.get('SELECT id FROM equipamentos WHERE id = ?', [id]);
    if (!existing) throw new ValidationError('Equipamento não encontrado');

    await db.run(
        'UPDATE equipamentos SET status = ?, funcionarioId = ? WHERE id = ?',
        [status, funcionarioId, id]
    );
    res.json({ id, status, funcionarioId });
}));

app.delete('/api/equipamentos/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const db = await getDbConnection();
    await db.run('DELETE FROM equipamentos WHERE id = ?', [id]);
    res.status(204).send();
}));

// =============================================================
// HISTÓRICO
// =============================================================

app.get('/api/historico', handle(async (req, res) => {
    const db = await getDbConnection();
    let historico = await db.all('SELECT * FROM historico');
    historico = historico.map(h => {
        if (h.equipamentosIds) {
            try { h.equipamentosIds = JSON.parse(h.equipamentosIds); }
            catch { h.equipamentosIds = []; }
        }
        return h;
    });
    res.json(historico);
}));

app.post('/api/historico', handle(async (req, res) => {
    const tipo          = oneOf(req.body.tipo,         'tipo',         TIPOS_HISTORICO_VALIDOS);
    const funcionarioId = uuid(req.body.funcionarioId, 'funcionarioId');
    const dataVal       = date(req.body.data,           'data');

    let equipamentoId   = req.body.equipamentoId  ?? null;
    let equipamentosIds = req.body.equipamentosIds ?? null;

    if (equipamentoId !== null) {
        equipamentoId = uuid(equipamentoId, 'equipamentoId');
    }
    if (equipamentosIds !== null) {
        if (!Array.isArray(equipamentosIds)) throw new ValidationError('equipamentosIds deve ser um array');
        if (equipamentosIds.length > 100)    throw new ValidationError('equipamentosIds excede o limite de 100 itens');
        equipamentosIds = equipamentosIds.map((eid, i) => uuid(eid, `equipamentosIds[${i}]`));
    }

    const db = await getDbConnection();
    const func = await db.get('SELECT id FROM funcionarios WHERE id = ?', [funcionarioId]);
    if (!func) throw new ValidationError('funcionarioId não corresponde a um funcionário existente');

    const id             = generateId();
    const timestamp      = new Date().toISOString();
    const stringifiedIds = equipamentosIds ? JSON.stringify(equipamentosIds) : null;

    await db.run(
        `INSERT INTO historico (id, tipo, funcionarioId, equipamentoId, equipamentosIds, data, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, tipo, funcionarioId, equipamentoId, stringifiedIds, dataVal, timestamp]
    );
    res.status(201).json({ id, tipo, funcionarioId, equipamentoId, equipamentosIds, data: dataVal, timestamp });
}));

app.delete('/api/historico/:id', handle(async (req, res) => {
    const id = uuid(req.params.id, 'id');
    const db = await getDbConnection();
    await db.run('DELETE FROM historico WHERE id = ?', [id]);
    res.status(204).send();
}));

app.delete('/api/historico', handle(async (req, res) => {
    const db = await getDbConnection();
    await db.run('DELETE FROM historico');
    res.status(204).send();
}));

// =============================================================
// START
// =============================================================

getDbConnection().then(() => {
    app.listen(PORT, () => {
        console.log(`Limbus rodando em http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Falha ao inicializar o banco de dados:', err);
    process.exit(1);
});
