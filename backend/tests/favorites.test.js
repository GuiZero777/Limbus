// backend/tests/favorites.test.js

describe('Sistema de Favoritos (Local por Usuário)', () => {
    let mockStorage = {};

    beforeEach(() => {
        mockStorage = {};
        global.localStorage = {
            getItem: (key) => mockStorage[key] || null,
            setItem: (key, val) => { mockStorage[key] = String(val); },
            removeItem: (key) => { delete mockStorage[key]; }
        };
        global.Auth = {
            getUser: () => ({ usuario: 'guilherme', id: 'user-123' })
        };
    });

    const Favorites = {
        getKey() {
            const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
            const identifier = user?.usuario || user?.id || 'default';
            return `limbus_favorites_${identifier}`;
        },
        getAll() {
            try {
                const raw = localStorage.getItem(this.getKey());
                const data = raw ? JSON.parse(raw) : {};
                return {
                    funcionarios: Array.isArray(data.funcionarios) ? data.funcionarios : [],
                    equipamentos: Array.isArray(data.equipamentos) ? data.equipamentos : []
                };
            } catch (e) {
                return { funcionarios: [], equipamentos: [] };
            }
        },
        isFavorite(type, id) {
            if (!id) return false;
            const favs = this.getAll();
            const list = favs[type] || [];
            return list.includes(id);
        },
        isFuncionario(id) {
            return this.isFavorite('funcionarios', id);
        },
        isEquipamento(id) {
            return this.isFavorite('equipamentos', id);
        },
        toggle(type, id) {
            if (!id) return false;
            const favs = this.getAll();
            if (!Array.isArray(favs[type])) {
                favs[type] = [];
            }
            const index = favs[type].indexOf(id);
            let added = false;
            if (index > -1) {
                favs[type].splice(index, 1);
                added = false;
            } else {
                favs[type].push(id);
                added = true;
            }
            try {
                localStorage.setItem(this.getKey(), JSON.stringify(favs));
            } catch (e) {
                console.error('Erro ao salvar favoritos no localStorage', e);
            }
            return added;
        },
        toggleFuncionario(id) {
            return this.toggle('funcionarios', id);
        },
        toggleEquipamento(id) {
            return this.toggle('equipamentos', id);
        }
    };

    test('deve inicializar com listas vazias', () => {
        expect(Favorites.getAll()).toEqual({ funcionarios: [], equipamentos: [] });
        expect(Favorites.isFuncionario('func-1')).toBe(false);
        expect(Favorites.isEquipamento('eqp-1')).toBe(false);
    });

    test('deve favoritar e desfavoritar colaborador com chave isolada por usuário', () => {
        const added = Favorites.toggleFuncionario('func-1');
        expect(added).toBe(true);
        expect(Favorites.isFuncionario('func-1')).toBe(true);

        // Chave do localStorage contém o username
        expect(Favorites.getKey()).toBe('limbus_favorites_guilherme');

        // Desfavorita
        const removed = Favorites.toggleFuncionario('func-1');
        expect(removed).toBe(false);
        expect(Favorites.isFuncionario('func-1')).toBe(false);
    });

    test('deve favoritar e desfavoritar equipamento', () => {
        const added = Favorites.toggleEquipamento('eqp-100');
        expect(added).toBe(true);
        expect(Favorites.isEquipamento('eqp-100')).toBe(true);

        const removed = Favorites.toggleEquipamento('eqp-100');
        expect(removed).toBe(false);
        expect(Favorites.isEquipamento('eqp-100')).toBe(false);
    });

    test('deve isolar favoritos entre usuários diferentes', () => {
        Favorites.toggleFuncionario('func-gui');

        // Muda usuário para 'outro'
        global.Auth.getUser = () => ({ usuario: 'outro', id: 'user-999' });

        expect(Favorites.isFuncionario('func-gui')).toBe(false);
        Favorites.toggleFuncionario('func-outro');
        expect(Favorites.isFuncionario('func-outro')).toBe(true);

        // Volta para guilherme
        global.Auth.getUser = () => ({ usuario: 'guilherme', id: 'user-123' });
        expect(Favorites.isFuncionario('func-gui')).toBe(true);
        expect(Favorites.isFuncionario('func-outro')).toBe(false);
    });

    test('ordenação sem pesquisa: favoritados devem ir para o topo mantendo a ordem relativa', () => {
        Favorites.toggleFuncionario('f-2'); // f-2 favoritado

        const lista = [
            { id: 'f-1', nome: 'Ana' },
            { id: 'f-2', nome: 'Bruno' },
            { id: 'f-3', nome: 'Carlos' }
        ];

        // Ordenação quando nada pesquisado
        lista.sort((a, b) => {
            const favA = Favorites.isFuncionario(a.id) ? 1 : 0;
            const favB = Favorites.isFuncionario(b.id) ? 1 : 0;
            return favB - favA;
        });

        expect(lista[0].nome).toBe('Bruno'); // favoritado no topo
        expect(lista[1].nome).toBe('Ana');
        expect(lista[2].nome).toBe('Carlos');
    });
});
