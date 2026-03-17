// js/views/equipamentos.js

const renderEquipamentos = (container, headerActions) => {
    headerActions.innerHTML = `
        <div class="flex flex-wrap items-center gap-4">
            <div class="relative">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input type="text" id="search-equip" placeholder="Buscar equipamento..." class="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none w-48 lg:w-64 dark:text-slate-100 dark:bg-slate-900">
            </div>
            <select id="filter-status-equip" class="py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                <option value="ALL">Todos os Status</option>
                <option value="DISPONIVEL">Disponíveis</option>
                <option value="EM_USO">Em Uso</option>
            </select>
            <select id="sort-equip" class="py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                <option value="NEWEST">Mais Recentes</option>
                <option value="AZ">Ordem Alfabética (A-Z)</option>
                <option value="ZA">Ordem Alfabética (Z-A)</option>
            </select>
            <button id="btn-add-equipamento" class="btn-primary">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Novo Equipamento
            </button>
        </div>
    `;

    const renderTable = () => {
        const filterText = document.getElementById('search-equip')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('filter-status-equip')?.value || 'ALL';
        const sortMode = document.getElementById('sort-equip')?.value || 'NEWEST';

        let equipamentos = getEquipamentos();

        // Sort First
        if (sortMode === 'NEWEST') {
            equipamentos.reverse();
        } else if (sortMode === 'AZ') {
            equipamentos.sort((a, b) => a.descricao.localeCompare(b.descricao));
        } else if (sortMode === 'ZA') {
            equipamentos.sort((a, b) => b.descricao.localeCompare(a.descricao));
        }

        // Filter by Text
        if (filterText) {
            equipamentos = equipamentos.filter(eqp =>
                eqp.descricao.toLowerCase().includes(filterText) ||
                eqp.modeloMarca.toLowerCase().includes(filterText)
            );
        }

        // Filter by Status
        if (statusFilter !== 'ALL') {
            equipamentos = equipamentos.filter(eqp => eqp.status === statusFilter);
        }

        let tableHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                            <th class="py-3 px-6 font-semibold">Descrição do Equipamento</th>
                            <th class="py-3 px-6 font-semibold">Modelo/Marca</th>
                            <th class="py-3 px-6 font-semibold text-center">Status</th>
                            <th class="py-3 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (equipamentos.length === 0) {
            tableHTML += `<tr><td colspan="4" class="py-6 text-center text-slate-500 dark:text-slate-400">Nenhum equipamento encontrado.</td></tr>`;
        } else {
            equipamentos.forEach(eqp => {
                const isDisponivel = eqp.status === 'DISPONIVEL';
                const statusBadge = isDisponivel
                    ? `<span class="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Disponível</span>`
                    : `<span class="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Em Uso</span>`;

                let alocarBtn = '';
                if (isDisponivel) {
                    alocarBtn = `
                        <button data-id="${eqp.id}" class="btn-alocar-manual bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 mr-2" title="Alocar Manualmente para funcionário (sem gerar termo)">
                            <i data-lucide="user-check" class="w-4 h-4"></i> Alocar
                        </button>`;
                }

                tableHTML += `
                    <tr class="border-b border-slate-100 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                        <td class="py-4 px-6 font-medium text-slate-800 dark:text-slate-100">${eqp.descricao}</td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300">${eqp.modeloMarca}</td>
                        <td class="py-4 px-6 text-center">${statusBadge}</td>
                        <td class="py-4 px-6 text-right flex justify-end items-center">
                            ${alocarBtn}
                            <button data-id="${eqp.id}" class="btn-delete-equip text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors" title="Remover">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        tableHTML += `</tbody></table></div>`;
        container.innerHTML = tableHTML;

        if (window.lucide) window.lucide.createIcons();

        document.querySelectorAll('.btn-delete-equip').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const eqp = getEquipamentoById(id);
                if (eqp.status === 'EM_USO') {
                    showToast('Não é possível remover um equipamento em uso. Devolva-o primeiro no perfil do funcionário.', 'warning');
                    return;
                }
                const ok = await showConfirm('Tem certeza que deseja remover este equipamento?', { title: 'Remover equipamento', type: 'danger', confirmText: 'Remover' });
                if (ok) {
                    await removeEquipamento(id);
                    showToast('Equipamento removido com sucesso.', 'success');
                    renderTable(document.getElementById('search-equip')?.value || '');
                }
            });
        });

        // Alocação Manual
        document.querySelectorAll('.btn-alocar-manual').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const equipamento = getEquipamentoById(id);
                const funcionarios = getFuncionarios();

                if (funcionarios.length === 0) {
                    showToast('Cadastre um funcionário primeiro para poder alocar o equipamento.', 'warning');
                    return;
                }

                const todayStr = new Date().toISOString().split('T')[0];

                const formHTML = `
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Alocação Manual</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Usado para registrar equipamentos que já foram entregues anteriormente sem passar pela geração do Termo via sistema.</p>
                        
                        <div class="bg-blue-50 text-blue-800 p-3 rounded-lg mb-6 text-sm border border-blue-100">
                            <strong>Equipamento:</strong> ${equipamento.descricao} (${equipamento.modeloMarca})
                        </div>

                        <form id="form-alocar" class="space-y-4">
                            <input type="hidden" name="equipamentoId" value="${equipamento.id}">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Quem está com este equipamento?</label>
                                <input type="text" id="search-alocar-func" placeholder="Buscar funcionário por nome..." class="w-full border border-slate-300 dark:border-slate-600 rounded-t-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none mb-0 border-b-0 dark:text-slate-100 dark:bg-slate-900">
                                <select name="funcionarioId" id="select-alocar-func" required size="5" class="w-full border border-slate-300 dark:border-slate-600 rounded-b-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                                    <option value="" disabled>Selecione um funcionário abaixo</option>
                                    ${funcionarios.map(f => `<option value="${f.id}">${f.nome} - ${f.funcao}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Data da Entrega</label>
                                <input type="date" name="dataEntrega" required max="${todayStr}" value="${todayStr}" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                            </div>
                            <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" class="btn-cancel bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">Cancelar</button>
                                <button type="submit" class="btn-primary">Confirmar Alocação</button>
                            </div>
                        </form>
                    </div>
                `;

                showModal(formHTML);

                // Setup the search filter for the dropdown
                document.getElementById('search-alocar-func').addEventListener('input', (ev) => {
                    const term = ev.target.value.toLowerCase();
                    const options = document.getElementById('select-alocar-func').options;
                    // Start from 1 skipping the placeholder
                    for (let i = 1; i < options.length; i++) {
                        const opt = options[i];
                        opt.style.display = opt.text.toLowerCase().includes(term) ? '' : 'none';
                    }
                });

                document.getElementById('form-alocar').addEventListener('submit', async (ev) => {
                    ev.preventDefault();
                    const formData = new FormData(ev.target);
                    const fId = formData.get('funcionarioId');
                    const eqId = formData.get('equipamentoId');
                    const dataEntrega = formData.get('dataEntrega');

                    if (!fId) {
                        showToast('Selecione um funcionário da lista.', 'warning');
                        return;
                    }

                    // 1. Change Status
                    await editEquipamento(eqId, { status: 'EM_USO', funcionarioId: fId });

                    // 2. Add History Log
                    await addHistorico({
                        tipo: 'ALOCACAO_MANUAL',
                        funcionarioId: fId,
                        equipamentoId: eqId,
                        data: dataEntrega
                    });

                    hideModal();
                    renderTable(document.getElementById('search-equip')?.value || '');
                });
                document.querySelector('.btn-cancel').addEventListener('click', hideModal);
            });
        });
    };

    renderTable();

    document.getElementById('search-equip')?.addEventListener('input', debounce(renderTable, 300));
    document.getElementById('filter-status-equip')?.addEventListener('change', renderTable);
    document.getElementById('sort-equip')?.addEventListener('change', renderTable);

    document.getElementById('btn-add-equipamento').addEventListener('click', () => {
        const formHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Adicionar Equipamento</h3>
                <form id="form-equipamento" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Descrição</label>
                        <input type="text" name="descricao" required placeholder="Ex: Notebook, Celular, Monitor" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Modelo / Marca</label>
                        <input type="text" name="modeloMarca" required placeholder="Ex: Dell Inspiron 15" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                    </div>
                    <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" class="btn-cancel bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">Cancelar</button>
                        <button type="submit" class="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        showModal(formHTML);

        document.getElementById('form-equipamento').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await addEquipamento({
                descricao: formData.get('descricao'),
                modeloMarca: formData.get('modeloMarca')
            });
            hideModal();
            renderTable(document.getElementById('search-equip')?.value || '');
        });
        document.querySelector('.btn-cancel').addEventListener('click', hideModal);
    });
};
