// js/app.js

// Elements
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const navBtns = document.querySelectorAll('.nav-btn');

// State
let currentView = 'dashboard';
let viewParams = {};

const views = {
    'dashboard': { title: 'Início', breadcrumbs: ['Início'], render: renderDashboard },
    'empresas': { title: 'Gestão de Empresas', breadcrumbs: ['Início', 'Cadastros', 'Empresas'], render: renderEmpresas },
    'equipamentos': { title: 'Gestão de Equipamentos', breadcrumbs: ['Início', 'Cadastros', 'Equipamentos'], render: renderEquipamentos },
    'funcionarios': { title: 'Funcionários', breadcrumbs: ['Início', 'Funcionários'], render: renderFuncionarios },
    'gerador_termo': { title: 'Emissão de Termo', breadcrumbs: ['Início', 'Termos', 'Gerador'], render: renderGeradorTermo },
    'historico': { title: 'Histórico Geral', breadcrumbs: ['Início', 'Cadastros', 'Histórico'], render: renderHistoricoGeral }
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

    // Se estiver no dashboard principal, oculta as migalhas pra ficar mais limpo
    if (currentView === 'dashboard') {
        breadcrumbEl.classList.add('hidden');
        breadcrumbEl.classList.remove('flex');
        return;
    }

    breadcrumbEl.classList.remove('hidden');
    breadcrumbEl.classList.add('flex');

    let crumbs = [...viewDef.breadcrumbs];

    // Complementos dinâmicos baseados no tipo de view que abrir por app.js/views.js
    // Exemplo: se abrir gerador de termo de um func especifico
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
    viewParams = params;

    // Update Title & Breadcrumbs
    pageTitle.textContent = views[viewName].title;
    renderBreadcrumbs(views[viewName], params);

    // Update Nav Activity
    navBtns.forEach(btn => {
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Render View with transition
    contentArea.classList.remove('view-fade-in');
    contentArea.innerHTML = '';
    const HeaderActionsArea = document.getElementById('header-actions');
    HeaderActionsArea.innerHTML = '';

    // Force reflow to restart animation
    void contentArea.offsetWidth;
    contentArea.classList.add('view-fade-in');

    views[viewName].render(contentArea, HeaderActionsArea, params);

    // Refresh Icons (important when injecting new HTML)
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

const setupNavigation = () => {
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const view = btn.dataset.view;
            if (view) navigate(view);
        });
    });
};

const init = async () => {
    await initializeStore();
    setupNavigation();
    navigate('dashboard');
};

// Global Exposure for inner-HTML onclick bindings if needed, though event delegation is preferred
window.navigate = navigate;

document.addEventListener('DOMContentLoaded', init);
