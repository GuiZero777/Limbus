// js/auth.js
// ---------------------------------------------------------
// MÓDULO DE AUTENTICAÇÃO E SESSÃO (Validade de 1 dia)
// ---------------------------------------------------------

const TOKEN_STORAGE_KEY = 'limbus_auth_token';
const USER_STORAGE_KEY  = 'limbus_auth_user';

const Auth = {
    getToken() {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    },

    getUser() {
        try {
            const raw = localStorage.getItem(USER_STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    setSession(token, user) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    },

    clearSession() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
    },

    isAuthenticated() {
        const token = this.getToken();
        const user = this.getUser();
        if (!token || !user) return false;

        // Verifica expiração no payload (se for formato b64.signature)
        try {
            const payloadB64 = token.split('.')[0];
            const payload = JSON.parse(atob(payloadB64));
            if (payload.exp && Date.now() > payload.exp) {
                this.clearSession();
                return false;
            }
        } catch (e) {}

        return true;
    },

    async login(usuario, senha) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Erro ao realizar login');
        }

        this.setSession(data.token, data.user);
        return data.user;
    },

    logout() {
        this.clearSession();
        window.location.reload();
    },

    async changePassword(senhaAtual, novaSenha) {
        const res = await fetch('/api/auth/alterar-senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Erro ao alterar senha');
        }
        return data;
    },

    renderUserInfo() {
        const user = this.getUser();
        const userContainer = document.getElementById('sidebar-user-info');
        if (!userContainer || !user) return;

        userContainer.innerHTML = `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-md">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0">
                        ${(user.nome || user.usuario || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div class="truncate">
                        <p class="text-xs font-semibold text-slate-200 truncate leading-tight">${user.nome || user.usuario}</p>
                        <p class="text-[11px] text-indigo-400 truncate capitalize">${user.perfil === 'admin' ? 'Administrador' : (user.cargo || 'Operador')}</p>
                    </div>
                </div>
                <div class="flex items-center gap-1">
                    <button id="btn-alterar-senha-modal" title="Alterar Senha" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        <i data-lucide="key" class="w-4 h-4"></i>
                    </button>
                    <button id="btn-logout" title="Sair do Limbus" class="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors">
                        <i data-lucide="log-out" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        document.getElementById('btn-logout')?.addEventListener('click', () => {
            if (confirm('Deseja realmente sair do Limbus?')) {
                Auth.logout();
            }
        });

        document.getElementById('btn-alterar-senha-modal')?.addEventListener('click', () => {
            Auth.showChangePasswordModal();
        });

        // Mostra menu de gerenciamento de usuários se for admin
        const usuariosNav = document.getElementById('nav-usuarios-container');
        if (usuariosNav) {
            usuariosNav.style.display = user.perfil === 'admin' ? 'block' : 'none';
        }
    },

    showChangePasswordModal() {
        const modalHtml = `
            <div id="modal-change-pass" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                    <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <i data-lucide="key" class="text-indigo-400 w-5 h-5"></i> Alterar Minha Senha
                        </h3>
                        <button id="btn-close-change-pass" class="text-slate-400 hover:text-white">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <form id="form-change-pass" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1">Senha Atual</label>
                            <input type="password" id="input-current-pass" required class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500" placeholder="Digite sua senha atual">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1">Nova Senha</label>
                            <input type="password" id="input-new-pass" required minlength="4" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500" placeholder="Mínimo 4 caracteres">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1">Confirmar Nova Senha</label>
                            <input type="password" id="input-confirm-pass" required minlength="4" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500" placeholder="Confirme a nova senha">
                        </div>
                        <div id="change-pass-error" class="text-rose-400 text-xs hidden"></div>
                        <div class="flex justify-end gap-3 pt-3">
                            <button type="button" id="btn-cancel-change-pass" class="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors">Cancelar</button>
                            <button type="submit" id="btn-submit-change-pass" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all">Salvar Senha</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();

        const modal = document.getElementById('modal-change-pass');
        const closeModal = () => modal?.remove();

        document.getElementById('btn-close-change-pass')?.addEventListener('click', closeModal);
        document.getElementById('btn-cancel-change-pass')?.addEventListener('click', closeModal);

        document.getElementById('form-change-pass')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPass = document.getElementById('input-current-pass').value;
            const newPass = document.getElementById('input-new-pass').value;
            const confirmPass = document.getElementById('input-confirm-pass').value;
            const errorDiv = document.getElementById('change-pass-error');

            if (newPass !== confirmPass) {
                errorDiv.textContent = 'A confirmação da nova senha não confere.';
                errorDiv.classList.remove('hidden');
                return;
            }

            try {
                const btn = document.getElementById('btn-submit-change-pass');
                btn.disabled = true;
                btn.textContent = 'Salvando...';
                await Auth.changePassword(currentPass, newPass);
                closeModal();
                if (window.showToast) window.showToast('Senha alterada com sucesso!', 'success');
                else alert('Senha alterada com sucesso!');
            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.classList.remove('hidden');
                const btn = document.getElementById('btn-submit-change-pass');
                btn.disabled = false;
                btn.textContent = 'Salvar Senha';
            }
        });
    }
};
