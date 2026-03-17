// js/ui.js

// === MODAL SYSTEM ===
const showModal = (contentHTML) => {
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = contentHTML;
    modalContainer.classList.remove('hidden');
    modalContainer.classList.add('flex');

    // Add enter animation classes
    setTimeout(() => {
        modalContent.classList.remove('opacity-0', 'translate-y-4', 'scale-95');
        modalContent.classList.add('modal-enter');
    }, 10);
};

const hideModal = () => {
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');

    // Add leave animation classes
    modalContent.classList.remove('modal-enter');
    modalContent.classList.add('modal-leave');

    setTimeout(() => {
        modalContainer.classList.add('hidden');
        modalContainer.classList.remove('flex');
        modalContent.classList.remove('modal-leave');
        modalContent.classList.add('opacity-0', 'translate-y-4', 'scale-95');
        modalContent.innerHTML = '';
    }, 200);
};


// === TOAST NOTIFICATION SYSTEM ===
const TOAST_ICONS = {
    success: 'check',
    error: 'x',
    warning: 'alert-triangle',
    info: 'info'
};

const TOAST_TITLES = {
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Atenção',
    info: 'Informação'
};

const showToast = (message, type = 'success', duration = 4000) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i data-lucide="${TOAST_ICONS[type]}" class="w-4 h-4"></i>
        </div>
        <div class="toast-body">
            <div class="toast-title">${TOAST_TITLES[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Render Lucide icons inside the toast
    if (window.lucide) window.lucide.createIcons({ nodes: [toast] });

    // Set progress bar duration
    const progressBar = toast.querySelector('.toast-progress');
    if (progressBar) {
        progressBar.style.animationDuration = `${duration}ms`;
    }

    // Auto dismiss
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};


// === CUSTOM CONFIRM DIALOG ===
const showConfirm = (message, { title = 'Confirmar ação', type = 'warning', confirmText = 'Confirmar', cancelText = 'Cancelar' } = {}) => {
    return new Promise((resolve) => {
        const iconName = type === 'danger' ? 'alert-octagon' : 'alert-triangle';
        const iconClass = type === 'danger' ? 'confirm-icon-danger' : 'confirm-icon-warning';
        const btnClass = type === 'danger'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white';

        const backdrop = document.createElement('div');
        backdrop.className = 'confirm-backdrop';
        backdrop.innerHTML = `
            <div class="confirm-panel">
                <div class="confirm-icon ${iconClass}">
                    <i data-lucide="${iconName}" class="w-6 h-6"></i>
                </div>
                <h3 class="confirm-title">${title}</h3>
                <p class="confirm-message">${message}</p>
                <div class="confirm-actions">
                    <button class="btn-secondary confirm-cancel">${cancelText}</button>
                    <button class="${btnClass} px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg confirm-ok">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        if (window.lucide) window.lucide.createIcons({ nodes: [backdrop] });

        const cleanup = (result) => {
            backdrop.style.opacity = '0';
            backdrop.style.transition = 'opacity 0.2s ease';
            setTimeout(() => {
                backdrop.remove();
                resolve(result);
            }, 200);
        };

        backdrop.querySelector('.confirm-cancel').addEventListener('click', () => cleanup(false));
        backdrop.querySelector('.confirm-ok').addEventListener('click', () => cleanup(true));

        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) cleanup(false);
        });

        // Close on Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', escHandler);
                cleanup(false);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Focus the confirm button
        setTimeout(() => backdrop.querySelector('.confirm-ok')?.focus(), 100);
    });
};


// === INFO MODAL (About) ===
const showInfoModal = () => {
    const html = `
        <div class="p-8 text-center">
            <div class="w-24 h-24 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <img src="logo_256.webp" alt="Limbus Logo" class="w-20 h-20">
            </div>
            <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Sobre o <span class="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Limbus</span></h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Sistema de gestão de termos de equipamentos</p>
            <div class="space-y-2 mb-8">
                <p class="text-slate-600 dark:text-slate-400 text-sm">Criador: <strong class="text-slate-800 dark:text-slate-200">Guilherme Bardalho</strong></p>
                <p class="text-slate-600 dark:text-slate-400 text-sm">Email: <a href="mailto:guilhermevb2019@Outlook.com" class="text-indigo-500 hover:text-indigo-400 hover:underline font-medium transition-colors">guilhermevb2019@Outlook.com</a></p>
            </div>
            <button onclick="hideModal()" class="btn-primary px-8 py-2.5">Fechar</button>
        </div>
    `;
    showModal(html);
};

window.showInfoModal = showInfoModal;
window.showToast = showToast;
window.showConfirm = showConfirm;
