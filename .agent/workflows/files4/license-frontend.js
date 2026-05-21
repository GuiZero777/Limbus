// js/license.js
// Gerencia o estado da licença no frontend e exibe a tela de ativação

// Estado global da licença (carregado uma vez na inicialização)
let licenseState = {
    ativa:     false,
    plano:     null,
    expiresAt: null,
    daysLeft:  null
};

// Funcionalidades bloqueadas no modo limitado (espelho do backend)
const FEATURES_PREMIUM = [
    'historico_completo',
    'relatorios',
    'importar_planilha',
    'exportar_dados'
];

// Carrega o status da licença do backend
const loadLicenseState = async () => {
    try {
        const res = await fetch('/api/licenca');
        if (res.ok) {
            licenseState = await res.json();
        }
    } catch (err) {
        console.warn('Não foi possível verificar licença:', err);
    }
    return licenseState;
};

// Verifica se uma feature está disponível
const isFeatureAvailable = (feature) => {
    if (!FEATURES_PREMIUM.includes(feature)) return true;
    return licenseState.ativa === true;
};

// Retorna o estado atual da licença
const getLicenseState = () => licenseState;

// Renderiza banner de aviso quando licença está inativa ou próxima de expirar
const renderLicenseBanner = () => {
    const existing = document.getElementById('license-banner');
    if (existing) existing.remove();

    // Licença ativa sem problemas — sem banner
    if (licenseState.ativa && (!licenseState.daysLeft || licenseState.daysLeft > 30)) return;

    const banner = document.createElement('div');
    banner.id = 'license-banner';

    let html = '';

    if (!licenseState.ativa) {
        banner.className = 'license-banner license-banner--warning';
        html = `
            <div class="license-banner__content">
                <span class="license-banner__icon">⚠</span>
                <div>
                    <strong>Modo limitado ativo.</strong>
                    Histórico limitado a 7 dias · Sem relatórios · Sem importação de planilha
                </div>
                <button onclick="renderLicenseActivation()" class="license-banner__btn">
                    Ativar licença
                </button>
            </div>
        `;
    } else if (licenseState.daysLeft <= 30) {
        banner.className = 'license-banner license-banner--expiring';
        html = `
            <div class="license-banner__content">
                <span class="license-banner__icon">⏱</span>
                <div>
                    <strong>Licença expira em ${licenseState.daysLeft} dias.</strong>
                    Renove para manter acesso completo.
                </div>
                <button onclick="renderLicenseActivation()" class="license-banner__btn">
                    Renovar
                </button>
            </div>
        `;
    }

    banner.innerHTML = html;

    // Insere no topo do content-area
    const contentArea = document.getElementById('content-area');
    if (contentArea) contentArea.prepend(banner);
};

// Tela de ativação de licença (abre como modal)
const renderLicenseActivation = () => {
    const html = `
        <div class="p-8 max-w-md mx-auto">
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="key" class="w-8 h-8 text-indigo-500"></i>
                </div>
                <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Ativar Licença</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm">
                    Insira a chave recebida por email ou WhatsApp após a compra.
                </p>
            </div>

            <form id="form-ativar-licenca" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                        Chave de licença
                    </label>
                    <input
                        type="text"
                        id="input-chave-licenca"
                        name="chave"
                        required
                        placeholder="LIMBUS-XXXX-XXXX-XXXX"
                        class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:text-slate-100 dark:bg-slate-900 font-mono text-sm tracking-widest uppercase"
                        oninput="this.value = this.value.toUpperCase()"
                    >
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                        CPF ou CNPJ do comprador
                    </label>
                    <input
                        type="text"
                        id="input-documento-licenca"
                        name="documento"
                        required
                        placeholder="Apenas números"
                        maxlength="18"
                        class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:text-slate-100 dark:bg-slate-900"
                        oninput="this.value = this.value.replace(/\\D/g, '')"
                    >
                    <p class="text-xs text-slate-400 mt-1">O mesmo documento informado na compra</p>
                </div>

                <div id="license-activation-error" class="hidden bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800"></div>
                <div id="license-activation-success" class="hidden bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-sm border border-emerald-200 dark:border-emerald-800"></div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="hideModal()" class="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                        Fechar
                    </button>
                    <button type="submit" id="btn-ativar-licenca" class="flex-1 btn-primary py-2.5">
                        Ativar
                    </button>
                </div>
            </form>

            <p class="text-center text-xs text-slate-400 mt-6">
                Ainda não tem uma licença?
                <a href="https://limbus.app" target="_blank" class="text-indigo-500 hover:underline font-medium">Comprar agora</a>
            </p>
        </div>
    `;

    showModal(html);
    if (window.lucide) window.lucide.createIcons();

    document.getElementById('form-ativar-licenca').addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn      = document.getElementById('btn-ativar-licenca');
        const errorDiv = document.getElementById('license-activation-error');
        const successDiv = document.getElementById('license-activation-success');
        const chave    = document.getElementById('input-chave-licenca').value.trim();
        const documento = document.getElementById('input-documento-licenca').value.trim();

        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');
        btn.disabled = true;
        btn.textContent = 'Ativando...';

        try {
            const res = await fetch('/api/licenca/ativar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chave, documento })
            });

            const data = await res.json();

            if (!res.ok) {
                errorDiv.textContent = data.error || 'Erro ao ativar licença.';
                errorDiv.classList.remove('hidden');
                btn.disabled = false;
                btn.textContent = 'Ativar';
                return;
            }

            // Sucesso
            successDiv.textContent = data.mensagem;
            successDiv.classList.remove('hidden');

            // Atualiza estado global
            licenseState = {
                ativa:     data.ativa,
                plano:     data.plano,
                expiresAt: data.expiresAt,
                daysLeft:  data.daysLeft
            };

            // Atualiza UI após 1.5s
            setTimeout(() => {
                hideModal();
                renderLicenseBanner();
                showToast('Licença ativada com sucesso!', 'success');
                // Recarrega a view atual para desbloquear funcionalidades
                if (window.navigate && window.currentView) {
                    navigate(window.currentView);
                }
            }, 1500);

        } catch (err) {
            errorDiv.textContent = 'Erro de conexão. Verifique se o servidor está rodando.';
            errorDiv.classList.remove('hidden');
            btn.disabled = false;
            btn.textContent = 'Ativar';
        }
    });
};

// Expõe globalmente
window.renderLicenseActivation = renderLicenseActivation;
window.isFeatureAvailable = isFeatureAvailable;
window.getLicenseState = getLicenseState;
window.loadLicenseState = loadLicenseState;
window.renderLicenseBanner = renderLicenseBanner;
