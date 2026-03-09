const express = require('express');
const cors = require('cors');
const { getDbConnection } = require('./database');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper to generate IDs like crypto.randomUUID()
const generateId = () => crypto.randomUUID();

// --- EMPRESAS ---
app.get('/api/empresas', async (req, res) => {
    try {
        const db = await getDbConnection();
        const empresas = await db.all('SELECT * FROM empresas');
        res.json(empresas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/empresas', async (req, res) => {
    try {
        const db = await getDbConnection();
        const { nome, cnpj, cidade, uf } = req.body;
        const id = generateId();
        await db.run('INSERT INTO empresas (id, nome, cnpj, cidade, uf) VALUES (?, ?, ?, ?, ?)', [id, nome, cnpj, cidade, uf]);
        res.status(201).json({ id, nome, cnpj, cidade, uf });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/empresas/:id', async (req, res) => {
    try {
        const db = await getDbConnection();
        await db.run('DELETE FROM empresas WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- FUNCIONÁRIOS ---
app.get('/api/funcionarios', async (req, res) => {
    try {
        const db = await getDbConnection();
        const funcionarios = await db.all('SELECT * FROM funcionarios');
        res.json(funcionarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/funcionarios', async (req, res) => {
    try {
        const db = await getDbConnection();
        const { nome, funcao, dataAdmissao } = req.body;
        const id = generateId();
        await db.run('INSERT INTO funcionarios (id, nome, funcao, dataAdmissao) VALUES (?, ?, ?, ?)', [id, nome, funcao, dataAdmissao]);
        res.status(201).json({ id, nome, funcao, dataAdmissao });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/funcionarios/bulk', async (req, res) => {
    try {
        const db = await getDbConnection();
        const { funcionarios } = req.body;

        if (!Array.isArray(funcionarios) || funcionarios.length === 0) {
            return res.status(400).json({ error: 'Array de funcionários vazio ou inválido.' });
        }

        const inserted = [];

        await db.run('BEGIN TRANSACTION');
        try {
            for (const func of funcionarios) {
                const id = generateId();
                const { nome, funcao, dataAdmissao } = func;
                if (!nome || !funcao || !dataAdmissao) continue; // Pular linhas incompletas
                await db.run(
                    'INSERT INTO funcionarios (id, nome, funcao, dataAdmissao) VALUES (?, ?, ?, ?)',
                    [id, nome.trim(), funcao.trim(), dataAdmissao]
                );
                inserted.push({ id, nome: nome.trim(), funcao: funcao.trim(), dataAdmissao });
            }
            await db.run('COMMIT');
        } catch (txErr) {
            await db.run('ROLLBACK');
            throw txErr;
        }

        res.status(201).json({ inserted, count: inserted.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/funcionarios/:id', async (req, res) => {
    try {
        const db = await getDbConnection();
        const { nome, funcao, dataAdmissao } = req.body;
        await db.run('UPDATE funcionarios SET nome = ?, funcao = ?, dataAdmissao = ? WHERE id = ?', [nome, funcao, dataAdmissao, req.params.id]);
        res.json({ id: req.params.id, nome, funcao, dataAdmissao });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/funcionarios/:id', async (req, res) => {
    try {
        const db = await getDbConnection();
        await db.run('DELETE FROM funcionarios WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- EQUIPAMENTOS ---
app.get('/api/equipamentos', async (req, res) => {
    try {
        const db = await getDbConnection();
        const equipamentos = await db.all('SELECT * FROM equipamentos');
        res.json(equipamentos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/equipamentos', async (req, res) => {
    try {
        const db = await getDbConnection();
        const { descricao, modeloMarca } = req.body;
        const id = generateId();
        const status = 'DISPONIVEL';
        const funcionarioId = null;
        await db.run('INSERT INTO equipamentos (id, descricao, modeloMarca, status, funcionarioId) VALUES (?, ?, ?, ?, ?)', [id, descricao, modeloMarca, status, funcionarioId]);
        res.status(201).json({ id, descricao, modeloMarca, status, funcionarioId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/equipamentos/:id', async (req, res) => {
    try {
        const db = await getDbConnection();
        const { status, funcionarioId } = req.body;
        // Permite atualizar apenas status e funcionarioId (Ex: Alocação/Devolução)
        await db.run('UPDATE equipamentos SET status = ?, funcionarioId = ? WHERE id = ?', [status, funcionarioId, req.params.id]);
        res.json({ id: req.params.id, status, funcionarioId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/equipamentos/:id', async (req, res) => {
    try {
        const db = await getDbConnection();
        await db.run('DELETE FROM equipamentos WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- HISTÓRICO ---
app.get('/api/historico', async (req, res) => {
    try {
        const db = await getDbConnection();
        let historico = await db.all('SELECT * FROM historico');
        
        // SQLite doesn't have a strict JSON array type used easily via quick inserts, 
        // so we parse equipamentosIds stringified payload if it exists
        historico = historico.map(h => {
            if (h.equipamentosIds) {
                h.equipamentosIds = JSON.parse(h.equipamentosIds);
            }
            return h;
        });

        res.json(historico);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/historico', async (req, res) => {
    try {
        const db = await getDbConnection();
        const { tipo, funcionarioId, equipamentoId, equipamentosIds, data } = req.body;
        const id = generateId();
        const timestamp = new Date().toISOString();
        
        const stringifiedIds = equipamentosIds ? JSON.stringify(equipamentosIds) : null;

        await db.run(`INSERT INTO historico (id, tipo, funcionarioId, equipamentoId, equipamentosIds, data, timestamp) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                      [id, tipo, funcionarioId, equipamentoId || null, stringifiedIds, data, timestamp]);
                      
        res.status(201).json({ id, tipo, funcionarioId, equipamentoId, equipamentosIds, data, timestamp });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/historico/:id', async (req, res) => {
    // Apagar uma entrada específica do histórico
    try {
        const db = await getDbConnection();
        await db.run('DELETE FROM historico WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/historico', async (req, res) => {
    // Apagar todo o histórico
    try {
        const db = await getDbConnection();
        await db.run('DELETE FROM historico');
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start checking DB and initialize server
getDbConnection().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}).catch(err => {
    console.error("Falha ao inicializar o banco de dados:", err);
});
