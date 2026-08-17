// js/views/gerador.js

// --- Emissão de Termo ---
const renderGeradorTermo = (container, headerActions, params) => {
    const funcionarioId = params?.funcId;
    if (!funcionarioId) {
        navigate('funcionarios');
        return;
    }

    const funcionario = getFuncionarioById(funcionarioId);
    if (!funcionario) {
        showToast('Funcionário não encontrado.', 'error');
        navigate('funcionarios');
        return;
    }

    const empresas = getEmpresas();
    // Apenas equipamentos disponíveis
    const equipamentosDB = getEquipamentos().filter(e => e.status === 'DISPONIVEL');

    let errorEmpresaHTML = '';
    if (empresas.length === 0) {
        errorEmpresaHTML = `
            <div class="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                <i data-lucide="alert-triangle" class="w-5 h-5 mt-0.5"></i>
                <div>
                    <p class="font-medium">Nenhuma empresa cadastrada</p>
                    <p class="text-sm mt-1">É necessário cadastrar ao menos uma empresa antes de gerar um termo.</p>
                    <button type="button" onclick="navigate('empresas')" class="mt-2 text-amber-900 font-medium text-sm hover:underline">Ir para cadastros &rarr;</button>
                </div>
            </div>`;
    } else {
        errorEmpresaHTML = '<div class="space-y-3">' + empresas.map(emp => `
            <label class="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:bg-slate-900/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50/50">
                <input type="radio" name="empresaId" value="${emp.id}" required class="w-4 h-4 text-primary border-slate-300 dark:border-slate-600 focus:ring-primary dark:text-slate-100 dark:bg-slate-900">
                <div class="ml-3 flex-1 flex justify-between items-center">
                    <span class="font-medium text-slate-800 dark:text-slate-100">${emp.nome}</span>
                    <span class="text-sm text-slate-500 dark:text-slate-400">${formatCNPJ(emp.cnpj)}</span>
                </div>
            </label>
        `).join('') + '</div>';
    }

    let searchEqpHTML = '';
    if (equipamentosDB.length > 0) {
        searchEqpHTML = `
            <div class="relative w-full sm:w-64">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input type="text" id="search-termo-eqp" placeholder="Buscar equipamento..." class="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-sm focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
            </div>`;
    }

    let errorEqpHTML = '';
    if (equipamentosDB.length === 0) {
        errorEqpHTML = `
            <div class="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                <i data-lucide="alert-triangle" class="w-5 h-5 mt-0.5"></i>
                <div>
                    <p class="font-medium">Nenhum equipamento disponível</p>
                    <p class="text-sm mt-1">Todos os equipamentos estão em uso ou nenhum foi cadastrado.</p>
                    <button type="button" onclick="navigate('equipamentos')" class="mt-2 text-amber-900 font-medium text-sm hover:underline">Ir para cadastros &rarr;</button>
                </div>
            </div>`;
    } else {
        errorEqpHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="equipamentos-grid-container">' + equipamentosDB.map(eqp => `
            <label class="eqp-item flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:bg-slate-900/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50/50">
                <input type="checkbox" name="equipamentos" value="${eqp.id}" class="mt-1 w-4 h-4 text-primary border-slate-300 dark:border-slate-600 rounded focus:ring-primary checkbox-eqp dark:text-slate-100 dark:bg-slate-900">
                <div class="ml-3 flex-1 eqp-item-text">
                    <span class="block font-medium text-slate-800 dark:text-slate-100">${eqp.descricao}</span>
                    <span class="block text-sm text-slate-500 dark:text-slate-400">${eqp.modeloMarca}</span>
                </div>
            </label>
        `).join('') + '</div>';
    }

    const disabledBtn = (empresas.length === 0 || equipamentosDB.length === 0) ? 'disabled' : '';

    container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                <div class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Gerar Termo de Responsabilidade</h3>
                        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Preencha as informações abaixo para gerar o PDF.</p>
                    </div>
                    <button onclick="navigate('funcionarios')" class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 font-medium text-sm flex items-center gap-1">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar
                    </button>
                </div>

                <div class="p-6">
                    <form id="form-gerar-termo">

                        <!-- Dados do Funcionário (Preenchido) -->
                        <div class="mb-8">
                            <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">1. Dados do Empregado</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 border-slate-200 dark:border-slate-700">
                                <div>
                                    <span class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nome</span>
                                    <span class="block text-slate-800 dark:text-slate-100 font-medium">${funcionario.nome}</span>
                                </div>
                                <div>
                                    <span class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Função</span>
                                    <span class="block text-slate-800 dark:text-slate-100 font-medium">${funcionario.funcao}</span>
                                </div>
                                <div>
                                    <span class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Data Admissão</span>
                                    <span class="block text-slate-800 dark:text-slate-100 font-medium">${formatInputDate(funcionario.dataAdmissao)}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Seleção da Empresa -->
                        <div class="mb-8">
                            <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">2. Empresa Cedente</h4>
                            ${errorEmpresaHTML}
                        </div>

                        <!-- Seleção de Equipamentos -->
                        <div class="mb-8">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-slate-100 pb-3 gap-3">
                                <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider">3. Equipamentos Entregues</h4>
                                ${searchEqpHTML}
                            </div>
                            ${errorEqpHTML}
                        </div>

                        <!-- Data de Entrega -->
                        <div class="mb-8">
                            <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">4. Data de Entrega</h4>
                            <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">Informe a data real de entrega dos equipamentos. Por padrão, é a data de admissão.</p>
                            <input type="date" name="dataEntrega" id="input-data-entrega" value="${funcionario.dataAdmissao}" required class="w-full sm:w-64 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                        </div>

                        <div class="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button type="submit" id="btn-gerar" class="btn-primary text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed" ${disabledBtn}>
                                <i data-lucide="printer" class="w-5 h-5"></i>
                                Imprimir / Salvar PDF
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const searchInput = document.getElementById('search-termo-eqp');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.eqp-item').forEach(item => {
                const text = item.querySelector('.eqp-item-text').textContent.toLowerCase();
                item.style.display = text.includes(term) ? '' : 'none';
            });
        }, 300));
    }

    document.getElementById('form-gerar-termo').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const empresaId = formData.get('empresaId');
        const eqpsIds = formData.getAll('equipamentos');

        if (eqpsIds.length === 0) {
            showToast('Selecione pelo menos 1 equipamento.', 'warning');
            return;
        }

        const empresaObj = getEmpresaById(empresaId);
        const equipamentosObjArray = eqpsIds.map(id => equipamentosDB.find(eq => eq.id === id));
        const dataEntrega = formData.get('dataEntrega');

        try {
            // Update Equipment states to 'EM_USO' and add Handover History Log
            for (const eqp of equipamentosObjArray) {
                await editEquipamento(eqp.id, {
                    status: 'EM_USO',
                    funcionarioId: funcionario.id
                });
            }

            // Registrar UMA única entrada no histórico com todos os equipamentos do termo
            await addHistorico({
                tipo: 'ENTREGA',
                funcionarioId: funcionario.id,
                equipamentosIds: eqpsIds,
                equipamentosSnapshots: equipamentosObjArray.map(eq => ({ id: eq.id, descricao: eq.descricao, modeloMarca: eq.modeloMarca })),
                data: dataEntrega
            });

            // Generate the print document with the custom delivery date
            generateAndPrintTermo(funcionario, empresaObj, equipamentosObjArray, dataEntrega);

            showToast('Termo gerado com sucesso!', 'success');

            // Redirect back to employees page after small delay to let print open safely
            setTimeout(() => {
                navigate('funcionarios');
            }, 500);
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
};
