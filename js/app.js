// js/app.js

// Elements
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const navBtns = document.querySelectorAll('.nav-btn');

// State
let currentView = 'dashboard';
let viewParams = {};

const views = {
    'dashboard': { title: 'Início', render: renderDashboard },
    'empresas': { title: 'Gestão de Empresas', render: renderEmpresas },
    'equipamentos': { title: 'Gestão de Equipamentos', render: renderEquipamentos },
    'funcionarios': { title: 'Funcionários', render: renderFuncionarios },
    'gerador_termo': { title: 'Emissão de Termo', render: renderGeradorTermo }
};

const navigate = (viewName, params = {}) => {
    if (!views[viewName]) return;

    currentView = viewName;
    viewParams = params;

    // Update Title
    pageTitle.textContent = views[viewName].title;

    // Update Nav Activity
    navBtns.forEach(btn => {
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Render View
    contentArea.innerHTML = '';
    const HeaderActionsArea = document.getElementById('header-actions');
    HeaderActionsArea.innerHTML = '';

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

const init = () => {
    initializeStore();
    setupNavigation();
    navigate('dashboard');
};

// Global Exposure for inner-HTML onclick bindings if needed, though event delegation is preferred
window.navigate = navigate;

document.addEventListener('DOMContentLoaded', init);
