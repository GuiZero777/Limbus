/**
 * Limbus — Testes da API
 * Roda com banco SQLite em memória, isolado por suite.
 * Comando: npm test (dentro de backend/)
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app     = require('../server');
const { resetDb } = require('../database');

// Reseta o banco antes de cada suite para garantir isolamento
beforeEach(async () => {
    await resetDb();
});

afterAll(async () => {
    await resetDb();
});

// =============================================================
// HELPERS — criam registros reutilizáveis nos testes
// =============================================================

const criarEmpresa = (overrides = {}) =>
    request(app).post('/api/empresas').send({
        nome:   'Empresa Teste Ltda',
        cnpj:   '12345678000195',
        cidade: 'Florianópolis',
        uf:     'SC',
        ...overrides
    });

const criarFuncionario = (overrides = {}) =>
    request(app).post('/api/funcionarios').send({
        nome:         'João da Silva',
        funcao:       'Analista',
        dataAdmissao: '2024-01-15',
        ...overrides
    });

const criarEquipamento = (overrides = {}) =>
    request(app).post('/api/equipamentos').send({
        descricao:   'Notebook',
        modeloMarca: 'Dell Inspiron 15',
        ...overrides
    });

// =============================================================
// EMPRESAS
// =============================================================

describe('Empresas', () => {

    describe('GET /api/empresas', () => {
        it('retorna lista vazia inicialmente', async () => {
            const res = await request(app).get('/api/empresas');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('retorna empresas cadastradas', async () => {
            await criarEmpresa();
            const res = await request(app).get('/api/empresas');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].nome).toBe('Empresa Teste Ltda');
        });
    });

    describe('POST /api/empresas', () => {
        it('cria empresa com dados válidos', async () => {
            const res = await criarEmpresa();
            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({
                nome:   'Empresa Teste Ltda',
                cnpj:   '12345678000195',
                cidade: 'Florianópolis',
                uf:     'SC'
            });
            expect(res.body.id).toBeDefined();
        });

        it('rejeita CNPJ com menos de 14 dígitos', async () => {
            const res = await criarEmpresa({ cnpj: '1234567' });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/cnpj/i);
        });

        it('rejeita CNPJ com letras', async () => {
            const res = await criarEmpresa({ cnpj: '1234567800019X' });
            expect(res.status).toBe(400);
        });

        it('rejeita CNPJ duplicado', async () => {
            await criarEmpresa();
            const res = await criarEmpresa();
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/CNPJ/i);
        });

        it('rejeita nome vazio', async () => {
            const res = await criarEmpresa({ nome: '' });
            expect(res.status).toBe(400);
        });

        it('rejeita nome ausente', async () => {
            const res = await criarEmpresa({ nome: undefined });
            expect(res.status).toBe(400);
        });

        it('rejeita UF inválida', async () => {
            const res = await criarEmpresa({ uf: 'SANTA' });
            expect(res.status).toBe(400);
        });

        it('rejeita nome com mais de 150 caracteres', async () => {
            const res = await criarEmpresa({ nome: 'A'.repeat(151) });
            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/empresas/:id', () => {
        it('remove empresa existente', async () => {
            const { body: empresa } = await criarEmpresa();
            const res = await request(app).delete(`/api/empresas/${empresa.id}`);
            expect(res.status).toBe(204);

            const lista = await request(app).get('/api/empresas');
            expect(lista.body).toHaveLength(0);
        });

        it('rejeita ID inválido (não UUID)', async () => {
            const res = await request(app).delete('/api/empresas/nao-e-um-uuid');
            expect(res.status).toBe(400);
        });
    });
});

// =============================================================
// FUNCIONÁRIOS
// =============================================================

describe('Funcionários', () => {

    describe('GET /api/funcionarios', () => {
        it('retorna lista vazia inicialmente', async () => {
            const res = await request(app).get('/api/funcionarios');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });
    });

    describe('POST /api/funcionarios', () => {
        it('cria funcionário com dados válidos', async () => {
            const res = await criarFuncionario();
            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({
                nome:         'João da Silva',
                funcao:       'Analista',
                dataAdmissao: '2024-01-15'
            });
            expect(res.body.id).toBeDefined();
        });

        it('rejeita data em formato inválido', async () => {
            const res = await criarFuncionario({ dataAdmissao: '15/01/2024' });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/dataAdmissao/i);
        });

        it('rejeita nome ausente', async () => {
            const res = await criarFuncionario({ nome: undefined });
            expect(res.status).toBe(400);
        });

        it('rejeita funcao vazia', async () => {
            const res = await criarFuncionario({ funcao: '   ' });
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/funcionarios/bulk', () => {
        it('importa múltiplos funcionários', async () => {
            const res = await request(app).post('/api/funcionarios/bulk').send({
                funcionarios: [
                    { nome: 'Ana Lima',    funcao: 'Dev',       dataAdmissao: '2023-03-01' },
                    { nome: 'Pedro Souza', funcao: 'Designer',  dataAdmissao: '2023-06-15' }
                ]
            });
            expect(res.status).toBe(201);
            expect(res.body.count).toBe(2);
            expect(res.body.inserted).toHaveLength(2);
        });

        it('rejeita array vazio', async () => {
            const res = await request(app).post('/api/funcionarios/bulk').send({ funcionarios: [] });
            expect(res.status).toBe(400);
        });

        it('rejeita mais de 1000 registros', async () => {
            const muitos = Array.from({ length: 1001 }, (_, i) => ({
                nome: `Func ${i}`, funcao: 'Cargo', dataAdmissao: '2024-01-01'
            }));
            const res = await request(app).post('/api/funcionarios/bulk').send({ funcionarios: muitos });
            expect(res.status).toBe(400);
        });

        it('pula linhas sem nome silenciosamente', async () => {
            const res = await request(app).post('/api/funcionarios/bulk').send({
                funcionarios: [
                    { nome: 'Válido', funcao: 'Dev', dataAdmissao: '2024-01-01' },
                    { nome: '',       funcao: 'Dev', dataAdmissao: '2024-01-01' }
                ]
            });
            expect(res.status).toBe(201);
            expect(res.body.count).toBe(1);
        });
    });

    describe('PUT /api/funcionarios/:id', () => {
        it('edita funcionário existente', async () => {
            const { body: func } = await criarFuncionario();
            const res = await request(app).put(`/api/funcionarios/${func.id}`).send({
                nome:         'João Editado',
                funcao:       'Senior',
                dataAdmissao: '2024-01-15'
            });
            expect(res.status).toBe(200);
            expect(res.body.nome).toBe('João Editado');
        });

        it('retorna 400 para ID inexistente', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app).put(`/api/funcionarios/${fakeId}`).send({
                nome: 'X', funcao: 'Y', dataAdmissao: '2024-01-01'
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/não encontrado/i);
        });
    });

    describe('DELETE /api/funcionarios/:id', () => {
        it('remove funcionário existente', async () => {
            const { body: func } = await criarFuncionario();
            const res = await request(app).delete(`/api/funcionarios/${func.id}`);
            expect(res.status).toBe(204);
        });

        it('rejeita ID inválido', async () => {
            const res = await request(app).delete('/api/funcionarios/id-invalido');
            expect(res.status).toBe(400);
        });
    });
});

// =============================================================
// EQUIPAMENTOS
// =============================================================

describe('Equipamentos', () => {

    describe('POST /api/equipamentos', () => {
        it('cria equipamento com status DISPONIVEL por padrão', async () => {
            const res = await criarEquipamento();
            expect(res.status).toBe(201);
            expect(res.body.status).toBe('DISPONIVEL');
            expect(res.body.funcionarioId).toBeNull();
        });

        it('rejeita descricao vazia', async () => {
            const res = await criarEquipamento({ descricao: '' });
            expect(res.status).toBe(400);
        });

        it('rejeita modeloMarca ausente', async () => {
            const res = await criarEquipamento({ modeloMarca: undefined });
            expect(res.status).toBe(400);
        });
    });

    describe('PUT /api/equipamentos/:id', () => {
        it('aloca equipamento para funcionário existente', async () => {
            const { body: eqp }  = await criarEquipamento();
            const { body: func } = await criarFuncionario();

            const res = await request(app).put(`/api/equipamentos/${eqp.id}`).send({
                status:        'EM_USO',
                funcionarioId: func.id
            });
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('EM_USO');
            expect(res.body.funcionarioId).toBe(func.id);
        });

        it('devolve equipamento (funcionarioId null)', async () => {
            const { body: eqp }  = await criarEquipamento();
            const { body: func } = await criarFuncionario();

            await request(app).put(`/api/equipamentos/${eqp.id}`).send({
                status: 'EM_USO', funcionarioId: func.id
            });

            const res = await request(app).put(`/api/equipamentos/${eqp.id}`).send({
                status: 'DISPONIVEL', funcionarioId: null
            });
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('DISPONIVEL');
            expect(res.body.funcionarioId).toBeNull();
        });

        it('rejeita status inválido', async () => {
            const { body: eqp } = await criarEquipamento();
            const res = await request(app).put(`/api/equipamentos/${eqp.id}`).send({
                status: 'PERDIDO'
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/status/i);
        });

        it('rejeita funcionarioId de funcionário inexistente', async () => {
            const { body: eqp } = await criarEquipamento();
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app).put(`/api/equipamentos/${eqp.id}`).send({
                status: 'EM_USO', funcionarioId: fakeId
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/funcionário existente/i);
        });

        it('rejeita equipamento inexistente', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app).put(`/api/equipamentos/${fakeId}`).send({
                status: 'DISPONIVEL', funcionarioId: null
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/não encontrado/i);
        });
    });

    describe('DELETE /api/equipamentos/:id', () => {
        it('remove equipamento existente', async () => {
            const { body: eqp } = await criarEquipamento();
            const res = await request(app).delete(`/api/equipamentos/${eqp.id}`);
            expect(res.status).toBe(204);
        });
    });
});

// =============================================================
// HISTÓRICO
// =============================================================

describe('Histórico', () => {

    describe('POST /api/historico', () => {
        it('registra entrega com múltiplos equipamentos', async () => {
            const { body: func } = await criarFuncionario();
            const { body: eqp1 } = await criarEquipamento({ descricao: 'Notebook' });
            const { body: eqp2 } = await criarEquipamento({ descricao: 'Mouse', modeloMarca: 'Logitech' });

            const res = await request(app).post('/api/historico').send({
                tipo:           'ENTREGA',
                funcionarioId:  func.id,
                equipamentosIds: [eqp1.id, eqp2.id],
                data:           '2024-03-10'
            });
            expect(res.status).toBe(201);
            expect(res.body.tipo).toBe('ENTREGA');
            expect(res.body.equipamentosIds).toEqual([eqp1.id, eqp2.id]);
        });

        it('registra devolução simples com equipamentoId', async () => {
            const { body: func } = await criarFuncionario();
            const { body: eqp  } = await criarEquipamento();

            const res = await request(app).post('/api/historico').send({
                tipo:          'DEVOLUCAO',
                funcionarioId: func.id,
                equipamentoId: eqp.id,
                data:          '2024-03-15'
            });
            expect(res.status).toBe(201);
            expect(res.body.tipo).toBe('DEVOLUCAO');
        });

        it('rejeita tipo inválido', async () => {
            const { body: func } = await criarFuncionario();
            const res = await request(app).post('/api/historico').send({
                tipo:          'ROUBO',
                funcionarioId: func.id,
                data:          '2024-03-10'
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/tipo/i);
        });

        it('rejeita funcionarioId inexistente', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app).post('/api/historico').send({
                tipo:          'ENTREGA',
                funcionarioId: fakeId,
                data:          '2024-03-10'
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/funcionário existente/i);
        });

        it('rejeita data em formato inválido', async () => {
            const { body: func } = await criarFuncionario();
            const res = await request(app).post('/api/historico').send({
                tipo:          'ENTREGA',
                funcionarioId: func.id,
                data:          '10-03-2024'
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/data/i);
        });

        it('rejeita equipamentosIds que não é array', async () => {
            const { body: func } = await criarFuncionario();
            const res = await request(app).post('/api/historico').send({
                tipo:            'ENTREGA',
                funcionarioId:   func.id,
                equipamentosIds: 'nao-e-array',
                data:            '2024-03-10'
            });
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/historico', () => {
        it('retorna lista vazia inicialmente', async () => {
            const res = await request(app).get('/api/historico');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('retorna histórico com equipamentosIds parseado como array', async () => {
            const { body: func } = await criarFuncionario();
            const { body: eqp  } = await criarEquipamento();

            await request(app).post('/api/historico').send({
                tipo:            'ENTREGA',
                funcionarioId:   func.id,
                equipamentosIds: [eqp.id],
                data:            '2024-03-10'
            });

            const res = await request(app).get('/api/historico');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body[0].equipamentosIds)).toBe(true);
        });
    });

    describe('DELETE /api/historico/:id', () => {
        it('remove entrada específica', async () => {
            const { body: func } = await criarFuncionario();
            const { body: hist } = await request(app).post('/api/historico').send({
                tipo: 'ENTREGA', funcionarioId: func.id, data: '2024-03-10'
            });

            const res = await request(app).delete(`/api/historico/${hist.id}`);
            expect(res.status).toBe(204);

            const lista = await request(app).get('/api/historico');
            expect(lista.body).toHaveLength(0);
        });
    });

    describe('DELETE /api/historico', () => {
        it('apaga todo o histórico', async () => {
            const { body: func } = await criarFuncionario();
            await request(app).post('/api/historico').send({
                tipo: 'ENTREGA', funcionarioId: func.id, data: '2024-03-10'
            });
            await request(app).post('/api/historico').send({
                tipo: 'DEVOLUCAO', funcionarioId: func.id, data: '2024-03-11'
            });

            const del = await request(app).delete('/api/historico');
            expect(del.status).toBe(204);

            const lista = await request(app).get('/api/historico');
            expect(lista.body).toHaveLength(0);
        });
    });
});
