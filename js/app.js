// js/app.js

// Elements
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const loginScreen = document.getElementById('login-screen');
const appWrapper = document.getElementById('app-wrapper');

// State
let currentView = 'dashboard';
let viewParams = {};

const views = {
    'dashboard': { title: 'Início', breadcrumbs: ['Início'], render: renderDashboard },
    'empresas': { title: 'Gestão de Empresas', breadcrumbs: ['Início', 'Cadastros', 'Empresas'], render: renderEmpresas },
    'equipamentos': { title: 'Gestão de Equipamentos', breadcrumbs: ['Início', 'Cadastros', 'Equipamentos'], render: renderEquipamentos },
    'insumos': { title: 'Gestão de Insumos de TI', breadcrumbs: ['Início', 'Cadastros', 'Insumos'], render: renderInsumos },
    'funcionarios': { title: 'Funcionários', breadcrumbs: ['Início', 'Funcionários'], render: renderFuncionarios },
    'gerador_termo': { title: 'Emissão de Termo', breadcrumbs: ['Início', 'Termos', 'Gerador'], render: renderGeradorTermo },
    'historico': { title: 'Histórico Geral', breadcrumbs: ['Início', 'Cadastros', 'Histórico'], render: renderHistoricoGeral },
    'setores': { title: 'Gestão de Setores', breadcrumbs: ['Início', 'Cadastros', 'Setores'], render: renderSetores },
    'usuarios': { title: 'Usuários & Acessos', breadcrumbs: ['Início', 'Administração', 'Usuários'], render: renderUsuarios }
};

// Dark Mode handling
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

const getPreferredTheme = () => {
    if (localStorage.getItem('theme')) {
        return localStorage.getItem('theme');
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
    if (theme === 'dark') {
        htmlEl.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        htmlEl.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
};

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.classList.contains('dark') ? 'dark' : 'light';
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}
applyTheme(getPreferredTheme());

const renderBreadcrumbs = (viewDef, params) => {
    const breadcrumbEl = document.getElementById('breadcrumb');
    if (!breadcrumbEl || !viewDef.breadcrumbs) return;

    if (currentView === 'dashboard') {
        breadcrumbEl.classList.add('hidden');
        breadcrumbEl.classList.remove('flex');
        return;
    }

    breadcrumbEl.classList.remove('hidden');
    breadcrumbEl.classList.add('flex');

    let crumbs = [...viewDef.breadcrumbs];

    if (currentView === 'gerador_termo' && params.funcId) {
        const funcionarios = getFuncionarios ? getFuncionarios() : [];
        const func = funcionarios.find(f => f.id === params.funcId);
        if (func) {
            crumbs.push(func.nome.split(' ')[0]);
        }
    }

    breadcrumbEl.innerHTML = crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return `
            <span class="${isLast ? 'text-slate-700 dark:text-slate-300 font-semibold' : ''}">${crumb}</span>
            ${!isLast ? '<i data-lucide="chevron-right" class="w-3 h-3 text-slate-400"></i>' : ''}
        `;
    }).join('');
};

const navigate = (viewName, params = {}) => {
    if (!views[viewName]) return;

    currentView = viewName;
    window.currentView = viewName;
    viewParams = params;

    // Update Title & Breadcrumbs
    if (pageTitle) pageTitle.textContent = views[viewName].title;
    renderBreadcrumbs(views[viewName], params);

    // Update Nav Activity
    const allNavBtns = document.querySelectorAll('.nav-btn');
    allNavBtns.forEach(btn => {
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Render View with transition
    if (contentArea) {
        contentArea.classList.remove('view-fade-in');
        contentArea.innerHTML = '';
        const HeaderActionsArea = document.getElementById('header-actions');
        if (HeaderActionsArea) HeaderActionsArea.innerHTML = '';

        void contentArea.offsetWidth;
        contentArea.classList.add('view-fade-in');

        views[viewName].render(contentArea, HeaderActionsArea, params);
    }

    // Refresh Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

const setupNavigation = () => {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const view = btn.dataset.view;
            if (view) navigate(view);
        };
    });
};

// =============================================================
// CONTROLE DE LOGIN / AUTENTICAÇÃO
// =============================================================

const showLoginScreen = () => {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (appWrapper) appWrapper.style.display = 'none';
};

const hideLoginScreen = () => {
    if (loginScreen) loginScreen.style.display = 'none';
    if (appWrapper) appWrapper.style.display = 'flex';
};

const setupLoginHandlers = () => {
    const formLogin = document.getElementById('form-login-app');
    const inputUsuario = document.getElementById('login-input-usuario');
    const inputSenha = document.getElementById('login-input-senha');
    const btnTogglePass = document.getElementById('btn-toggle-login-pass');
    const iconEye = document.getElementById('icon-eye-login');
    const errorAlert = document.getElementById('login-error-alert');
    const errorText = document.getElementById('login-error-text');
    const btnSubmit = document.getElementById('btn-submit-login');

    if (btnTogglePass && inputSenha) {
        btnTogglePass.addEventListener('click', () => {
            const isPassword = inputSenha.type === 'password';
            inputSenha.type = isPassword ? 'text' : 'password';
            if (iconEye) {
                iconEye.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
                if (window.lucide) window.lucide.createIcons();
            }
        });
    }

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuario = inputUsuario.value.trim();
            const senha = inputSenha.value;

            if (!usuario || !senha) return;

            if (errorAlert) errorAlert.classList.add('hidden');
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Autenticando...</span>`;
                if (window.lucide) window.lucide.createIcons();
            }

            try {
                await Auth.login(usuario, senha);
                hideLoginScreen();
                Auth.renderUserInfo();
                await initializeStore();
                setupNavigation();
                navigate('dashboard');
            } catch (err) {
                if (errorText) errorText.textContent = err.message || 'Credenciais inválidas';
                if (errorAlert) errorAlert.classList.remove('hidden');
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = `<i data-lucide="log-in" class="w-4 h-4"></i><span>Entrar no Sistema</span>`;
                    if (window.lucide) window.lucide.createIcons();
                }
            }
        });
    }
};

const init = async () => {
    setupLoginHandlers();

    if (!Auth.isAuthenticated()) {
        showLoginScreen();
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    hideLoginScreen();
    Auth.renderUserInfo();
    await initializeStore();
    setupNavigation();
    navigate('dashboard');
};

// Global Exposure
window.navigate = navigate;

document.addEventListener('DOMContentLoaded', init);
