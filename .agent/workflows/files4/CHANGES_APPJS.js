// ================================================================
// MUDANÇAS NO app.js — adicionar após initializeStore()
// ================================================================
//
// 1. Na função init(), adicionar carregamento da licença:
//
//    const init = async () => {
//        await initializeStore();
//        await loadLicenseState();       // ← ADICIONAR esta linha
//        setupNavigation();
//        renderLicenseBanner();          // ← ADICIONAR esta linha
//        navigate('dashboard');
//    };
//
//
// 2. Expor currentView globalmente para o license.js conseguir
//    recarregar a view após ativação. Modificar a função navigate():
//
//    const navigate = (viewName, params = {}) => {
//        if (!views[viewName]) return;
//        currentView = viewName;
//        window.currentView = viewName;  // ← ADICIONAR esta linha
//        viewParams = params;
//        // ... resto da função igual
//    };
//
//
// ================================================================
// MUDANÇAS NAS VIEWS — bloquear funcionalidades premium
// ================================================================
//
// Em js/views/funcionarios.js, no botão "Importar Planilha":
// Envolver o addEventListener com verificação:
//
//    document.getElementById('btn-import-planilha').addEventListener('click', () => {
//        if (!isFeatureAvailable('importar_planilha')) {          // ← ADICIONAR
//            renderLicenseActivation();                           // ← ADICIONAR
//            return;                                              // ← ADICIONAR
//        }                                                        // ← ADICIONAR
//        // ... resto do código de importação igual
//    });
//
//
// Em js/views/historico.js, na função renderHistoricoGeral():
// Adicionar verificação do período:
//
//    // Após carregar historico do getHistorico():
//    if (!isFeatureAvailable('historico_completo')) {             // ← ADICIONAR
//        const limite = new Date();                               // ← ADICIONAR
//        limite.setDate(limite.getDate() - 7);                   // ← ADICIONAR
//        const limiteStr = limite.toISOString().split('T')[0];   // ← ADICIONAR
//        historico = historico.filter(h => h.data >= limiteStr); // ← ADICIONAR
//    }                                                            // ← ADICIONAR
//
//    // No botão "Imprimir Relatório":
//    document.getElementById('btn-print-historico')?.addEventListener('click', () => {
//        if (!isFeatureAvailable('relatorios')) {                 // ← ADICIONAR
//            renderLicenseActivation();                           // ← ADICIONAR
//            return;                                              // ← ADICIONAR
//        }                                                        // ← ADICIONAR
//        // ... resto do código de impressão igual
//    });
//
// ================================================================
// MUDANÇAS NO index.html — adicionar script e estilo
// ================================================================
//
// 1. Adicionar ao <head>:
//    <link rel="stylesheet" href="styles.css">
//    (o license-styles.css deve ser copiado para o final de styles.css)
//
// 2. Adicionar script ANTES de app.js:
//    <script src="js/license.js"></script>
//
// Ordem final dos scripts:
//    utils.js → store.js → ui.js → print.js → license.js
//    → views/dashboard.js → ... → views/historico.js → app.js
