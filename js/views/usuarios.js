// js/views/usuarios.js
// ---------------------------------------------------------
// GESTÃO DE USUÁRIOS E ACESSOS (Apenas Administradores)
// ---------------------------------------------------------

const renderUsuarios = async () => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const currentUser = Auth.getUser();
    if (!currentUser || currentUser.perfil !== 'admin') {
        mainContent.innerHTML = `
            <div class="p-8 text-center">
                <div class="inline-flex p-4 rounded-full bg-rose-500/10 text-rose-400 mb-4">
                    <i data-lucide="shield-alert" class="w-8 h-8"></i>
                </div>
                <h2 class="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
                <p class="text-slate-400 text-sm">Apenas administradores podem gerenciar usuários e acessos.</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    mainContent.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <div>
                    <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                        <i data-lucide="shield-check" class="text-indigo-400"></i> Controle de Usuários e Acessos
                    </h2>
                    <p class="text-slate-400 text-sm mt-1">Cadastre e gerencie os operadores que podem utilizar o Limbus.</p>
                </div>
                <button id="btn-novo-usuario" class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all">
                    <i data-lucide="user-plus" class="w-4 h-4"></i> Novo Usuário
                </button>
            </div>

            <!-- Tabela de Usuários -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div class="p-4 border-b border-slate-800 flex items-center justify-between">
                    <span class="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <i data-lucide="users" class="w-4 h-4 text-indigo-400"></i> Usuários Ativos no Sistema
                    </span>
                    <button id="btn-refresh-usuarios" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" title="Recarregar lista">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-300">
                        <thead class="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                            <tr>
                                <th class="px-6 py-4">Usuário / Nome</th>
                                <th class="px-6 py-4">Login</th>
                                <th class="px-6 py-4">Perfil / Cargo</th>
                                <th class="px-6 py-4">Último Acesso</th>
                                <th class="px-6 py-4">Status</th>
                                <th class="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="lista-usuarios-body" class="divide-y divide-slate-800/60">
                            <tr>
                                <td colspan="6" class="px-6 py-8 text-center text-slate-500">
                                    <i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400"></i>
                                    Carregando usuários...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('btn-novo-usuario')?.addEventListener('click', () => abrirModalUsuario());
    document.getElementById('btn-refresh-usuarios')?.addEventListener('click', carregarListaUsuarios);

    await carregarListaUsuarios();
};

const carregarListaUsuarios = async () => {
    const tbody = document.getElementById('lista-usuarios-body');
    if (!tbody) return;

    try {
        const res = await fetch('/api/usuarios', {
            headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
        });

        if (!res.ok) throw new Error('Erro ao buscar lista de usuários');
        const usuarios = await res.json();

        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                        Nenhum usuário cadastrado.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = usuarios.map(u => `
            <tr class="hover:bg-slate-800/40 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                            ${(u.nome || u.usuario).charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p class="font-semibold text-white">${u.nome}</p>
                            <p class="text-xs text-slate-400">${u.cargo || 'TI'}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 font-mono text-xs text-slate-300">
                    ${u.usuario}
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.perfil === 'admin' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }">
                        ${u.perfil === 'admin' ? 'Administrador' : 'Operador'}
                    </span>
                </td>
                <td class="px-6 py-4 text-xs text-slate-400">
                    ${u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('pt-BR') : 'Nunca acessou'}
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center gap-1.5 text-xs font-medium ${u.ativo ? 'text-emerald-400' : 'text-rose-400'}">
                        <span class="w-1.5 h-1.5 rounded-full ${u.ativo ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
                        ${u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="editarUsuario('${u.id}')" class="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors" title="Editar Usuário">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    ${u.usuario !== 'admin' ? `
                        <button onclick="excluirUsuario('${u.id}', '${u.nome}')" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors" title="Excluir Usuário">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');

        if (window.lucide) window.lucide.createIcons();

        // Guarda em memória para edição
        window._cachedUsuarios = usuarios;
    } catch (err) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-rose-400">
                    ${err.message}
                </td>
            </tr>
        `;
    }
};

const abrirModalUsuario = (usuarioParaEditar = null) => {
    const isEdit = Boolean(usuarioParaEditar);
    const modalHtml = `
        <div id="modal-usuario" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        <i data-lucide="${isEdit ? 'user-check' : 'user-plus'}" class="text-indigo-400 w-5 h-5"></i>
                        ${isEdit ? 'Editar Usuário' : 'Novo Usuário do Limbus'}
                    </h3>
                    <button id="btn-close-modal-user" class="text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <form id="form-usuario" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
                        <input type="text" id="input-user-nome" required value="${usuarioParaEditar?.nome || ''}" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500" placeholder="Ex: Guilherme Bardalho">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Login / Nome de Usuário</label>
                        <input type="text" id="input-user-login" required ${isEdit ? 'readonly disabled class="opacity-60 cursor-not-allowed"' : ''} value="${usuarioParaEditar?.usuario || ''}" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500" placeholder="Ex: guilherme ou g.bardalho">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Cargo / Departamento</label>
                        <input type="text" id="input-user-cargo" value="${usuarioParaEditar?.cargo || 'TI'}" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500" placeholder="Ex: Suporte TI">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1">Perfil de Acesso</label>
                            <select id="input-user-perfil" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                <option value="operador" ${usuarioParaEditar?.perfil === 'operador' ? 'selected' : ''}>Operador</option>
                                <option value="admin" ${usuarioParaEditar?.perfil === 'admin' ? 'selected' : ''}>Administrador</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                            <select id="input-user-ativo" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                <option value="true" ${usuarioParaEditar?.ativo !== false ? 'selected' : ''}>Ativo</option>
                                <option value="false" ${usuarioParaEditar?.ativo === false ? 'selected' : ''}>Inativo</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">${isEdit ? 'Redefinir Senha (opcional)' : 'Senha de Acesso'}</label>
                        <input type="password" id="input-user-senha" ${!isEdit ? 'required minlength="4"' : ''} class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500" placeholder="${isEdit ? 'Deixe em branco para manter a atual' : 'Mínimo 4 caracteres'}">
                    </div>
                    <div id="modal-user-error" class="text-rose-400 text-xs hidden"></div>
                    <div class="flex justify-end gap-3 pt-3">
                        <button type="button" id="btn-cancel-modal-user" class="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors">Cancelar</button>
                        <button type="submit" id="btn-save-modal-user" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all">
                            ${isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();

    const modal = document.getElementById('modal-usuario');
    const closeModal = () => modal?.remove();

    document.getElementById('btn-close-modal-user')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-modal-user')?.addEventListener('click', closeModal);

    document.getElementById('form-usuario')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('input-user-nome').value;
        const usuario = document.getElementById('input-user-login').value;
        const cargo = document.getElementById('input-user-cargo').value;
        const perfil = document.getElementById('input-user-perfil').value;
        const ativo = document.getElementById('input-user-ativo').value === 'true';
        const senha = document.getElementById('input-user-senha').value;
        const errorDiv = document.getElementById('modal-user-error');

        try {
            const btn = document.getElementById('btn-save-modal-user');
            btn.disabled = true;
            btn.textContent = 'Salvando...';

            if (isEdit) {
                const body = { nome, cargo, perfil, ativo };
                if (senha && senha.trim().length >= 4) body.nova_senha = senha.trim();
                const res = await fetch(`/api/usuarios/${usuarioParaEditar.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Auth.getToken()}`
                    },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Erro ao editar usuário');
            } else {
                const res = await fetch('/api/usuarios', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Auth.getToken()}`
                    },
                    body: JSON.stringify({ nome, usuario, cargo, perfil, senha })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Erro ao criar usuário');
            }

            closeModal();
            if (window.showToast) window.showToast('Usuário salvo com sucesso!', 'success');
            await carregarListaUsuarios();
        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('hidden');
            const btn = document.getElementById('btn-save-modal-user');
            btn.disabled = false;
            btn.textContent = isEdit ? 'Salvar Alterações' : 'Criar Usuário';
        }
    });
};

window.editarUsuario = (id) => {
    const target = (window._cachedUsuarios || []).find(u => u.id === id);
    if (target) abrirModalUsuario(target);
};

window.excluirUsuario = async (id, nome) => {
    if (!confirm(`Deseja realmente remover o usuário "${nome}"?`)) return;
    try {
        const res = await fetch(`/api/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Erro ao excluir usuário');
        }
        if (window.showToast) window.showToast('Usuário removido com sucesso!', 'success');
        await carregarListaUsuarios();
    } catch (err) {
        alert(err.message);
    }
};
