const request = require('supertest');
const app = require('../server');
const { generateToken } = require('../auth');

describe('Autenticação e Gestão de Usuários', () => {
    let adminToken;

    beforeAll(async () => {
        // Realiza login com o usuário admin padrão
        const res = await request(app)
            .post('/api/auth/login')
            .send({ usuario: 'admin', senha: 'admin123' });
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.usuario).toBe('admin');
        adminToken = res.body.token;
    });

    describe('POST /api/auth/login', () => {
        it('deve rejeitar credenciais incorretas', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ usuario: 'admin', senha: 'senha_errada' });
            expect(res.status).toBe(401);
            expect(res.body.error).toMatch(/incorretos/i);
        });

        it('deve rejeitar requisição sem usuário ou senha', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/auth/me', () => {
        it('deve retornar dados do usuário autenticado', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.user.usuario).toBe('admin');
            expect(res.body.user.perfil).toBe('admin');
        });

        it('deve rejeitar requisição sem token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });

        it('deve rejeitar token com assinatura inválida', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer token_invalido.123456');
            expect(res.status).toBe(401);
        });
    });

    describe('CRUD de Usuários (Apenas Admin)', () => {
        let createdUserId;

        it('deve cadastrar um novo operador', async () => {
            const res = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nome: 'Guilherme Bardalho',
                    usuario: 'guilherme.teste',
                    senha: 'senhaForte123',
                    cargo: 'Analista de TI',
                    perfil: 'operador'
                });

            expect(res.status).toBe(201);
            expect(res.body.usuario).toBe('guilherme.teste');
            expect(res.body).not.toHaveProperty('senha_hash');
            createdUserId = res.body.id;
        });

        it('o novo operador deve conseguir logar no sistema', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ usuario: 'guilherme.teste', senha: 'senhaForte123' });
            expect(res.status).toBe(200);
            expect(res.body.user.nome).toBe('Guilherme Bardalho');
        });

        it('deve listar os usuários cadastrados', async () => {
            const res = await request(app)
                .get('/api/usuarios')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.some(u => u.usuario === 'guilherme.teste')).toBe(true);
        });

        it('deve editar o usuário criado', async () => {
            const res = await request(app)
                .put(`/api/usuarios/${createdUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ cargo: 'Coordenador TI', ativo: true });
            expect(res.status).toBe(200);
            expect(res.body.cargo).toBe('Coordenador TI');
        });

        it('deve remover o usuário criado', async () => {
            const res = await request(app)
                .delete(`/api/usuarios/${createdUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(204);
        });
    });
});
