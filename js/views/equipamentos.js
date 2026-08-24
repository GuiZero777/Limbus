// js/views/equipamentos.js

const renderEquipamentos = (container, headerActions, params = {}) => {
    headerActions.innerHTML = `
        <button id="btn-add-equipamento" class="btn-primary flex items-center gap-2 py-2 text-sm">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Novo Equipamento</span>
        </button>
    `;

    // Renderizar a estrutura de filtros locais da página
    container.innerHTML = `
        <div class="mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-3 flex-1">
                <div class="relative flex-1 min-w-[220px] max-w-md">
                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                    <input type="text" id="search-equip" value="${params.search || ''}" placeholder="Buscar por patrimônio, serial, modelo..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100">
                </div>
                <select id="filter-status-equip" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100">
                    <option value="ALL">Todos os Status</option>
                    <option value="DISPONIVEL">Disponíveis</option>
                    <option value="EM_USO">Em Uso</option>
                </select>
                <select id="sort-equip" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100">
                    <option value="NEWEST">Mais Recentes</option>
                    <option value="AZ">Ordem Alfabética (A-Z)</option>
                    <option value="ZA">Ordem Alfabética (Z-A)</option>
                </select>
            </div>
        </div>
        <div id="equipamentos-table-container"></div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const tableContainer = document.getElementById('equipamentos-table-container');

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
                eqp.modeloMarca.toLowerCase().includes(filterText) ||
                (eqp.patrimonio || '').toLowerCase().includes(filterText) ||
                (eqp.serialNumber || '').toLowerCase().includes(filterText)
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
                            <th class="py-3 px-6 font-semibold">Patrimônio</th>
                            <th class="py-3 px-6 font-semibold">Descrição</th>
                            <th class="py-3 px-6 font-semibold">Modelo/Marca</th>
                            <th class="py-3 px-6 font-semibold">Serial Number</th>
                            <th class="py-3 px-6 font-semibold text-center">Status</th>
                            <th class="py-3 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (equipamentos.length === 0) {
            tableHTML += `<tr><td colspan="6" class="py-6 text-center text-slate-500 dark:text-slate-400">Nenhum equipamento encontrado.</td></tr>`;
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
                    <tr data-eqpid="${eqp.id}" class="border-b border-slate-100 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                        <td class="py-4 px-6 font-semibold text-indigo-600 dark:text-indigo-400">${eqp.patrimonio || 'Sem Patr.'}</td>
                        <td class="py-4 px-6 font-medium text-slate-800 dark:text-slate-100">
                            <span>${eqp.descricao}</span>
                            ${eqp.observacoes ? `<span class="block text-xs text-slate-400 italic mt-0.5" title="${eqp.observacoes}">${eqp.observacoes}</span>` : ''}
                        </td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300">${eqp.modeloMarca}</td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono text-xs">${eqp.serialNumber || 'Sem Serial'}</td>
                        <td class="py-4 px-6 text-center">
                            ${statusBadge}
                            ${eqp.funcionarioId ? `<span class="block text-xs text-slate-400 mt-1">${getFuncionarioById(eqp.funcionarioId)?.nome || 'Excluído'}</span>` : ''}
                        </td>
                        <td class="py-4 px-6 text-right flex justify-end items-center">
                            ${alocarBtn}
                            <button data-id="${eqp.id}" class="btn-edit-equip text-slate-400 hover:text-amber-500 p-2 rounded hover:bg-amber-50 transition-colors" title="Editar Equipamento">
                                <i data-lucide="edit-2" class="w-4 h-4"></i>
                            </button>
                            <button data-id="${eqp.id}" class="btn-delete-equip text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors" title="Remover">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        tableHTML += `</tbody></table></div>`;
        tableContainer.innerHTML = tableHTML;

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
                    try {
                        await removeEquipamento(id);
                        showToast('Equipamento removido com sucesso.', 'success');
                        renderTable(document.getElementById('search-equip')?.value || '');
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                }
            });
        });

        document.querySelectorAll('.btn-edit-equip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                renderEquipamentoForm(id);
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

                    try {
                        // 1. Change Status
                        await editEquipamento(eqId, { status: 'EM_USO', funcionarioId: fId });

                        // 2. Add History Log
                        await addHistorico({
                            tipo: 'ALOCACAO_MANUAL',
                            funcionarioId: fId,
                            equipamentoId: eqId,
                            data: dataEntrega
                        });

                        showToast('Equipamento alocado com sucesso.', 'success');
                        hideModal();
                        renderTable(document.getElementById('search-equip')?.value || '');
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                });
                document.querySelector('.btn-cancel').addEventListener('click', hideModal);
            });
        });
    };

    renderTable();

    document.getElementById('search-equip')?.addEventListener('input', debounce(renderTable, 300));
    document.getElementById('filter-status-equip')?.addEventListener('change', renderTable);
    document.getElementById('sort-equip')?.addEventListener('change', renderTable);

    if (params.highlightId) {
        setTimeout(() => {
            const row = document.querySelector(`tr[data-eqpid="${params.highlightId}"]`);
            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.classList.add('bg-indigo-50/90', 'dark:bg-indigo-950/60', 'ring-2', 'ring-indigo-500', 'transition-all');
                setTimeout(() => {
                    row.classList.remove('ring-2', 'ring-indigo-500');
                }, 3000);
            }
        }, 150);
    }

    const renderEquipamentoForm = (id = null) => {
        let eqp = { descricao: '', modeloMarca: '', patrimonio: '', serialNumber: '', observacoes: '', funcionarioId: null };
        let isEdit = false;

        if (id) {
            const found = getEquipamentoById(id);
            if (found) {
                eqp = { ...found };
                isEdit = true;
            }
        }

        const title = isEdit ? 'Editar Equipamento' : 'Novo Equipamento';
        const formHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">${title}</h3>
                <form id="form-equipamento" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Patrimônio (Tag)</label>
                            <input type="text" name="patrimonio" value="${eqp.patrimonio || ''}" placeholder="Ex: 02847" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Serial Number</label>
                            <input type="text" name="serialNumber" value="${eqp.serialNumber || ''}" placeholder="Ex: BGV69R1" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Descrição</label>
                        <input type="text" name="descricao" value="${eqp.descricao}" required placeholder="Ex: Notebook, Celular, Monitor" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Modelo / Marca</label>
                        <input type="text" name="modeloMarca" value="${eqp.modeloMarca}" required placeholder="Ex: Dell Inspiron 15" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Responsável (Proprietário)</label>
                        <div class="relative select-search-container">
                            <input type="text" id="search-responsavel-input" placeholder="Pesquisar funcionário por nome ou setor..." class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900" autocomplete="off">
                            <input type="hidden" name="funcionarioId" id="funcionarioId-value" value="${eqp.funcionarioId || ''}">
                            <div id="search-responsavel-list" class="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hidden">
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Observações (Opcional)</label>
                        <textarea name="observacoes" placeholder="Senhas administrativas, detalhes da garantia, etc." rows="2" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">${eqp.observacoes || ''}</textarea>
                    </div>
                    <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" class="btn-cancel bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">Cancelar</button>
                        <button type="submit" class="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        showModal(formHTML);

        const searchInput = document.getElementById('search-responsavel-input');
        const searchList = document.getElementById('search-responsavel-list');
        const hiddenValue = document.getElementById('funcionarioId-value');
        const funcionarios = getFuncionarios();

        // Inicializar com o valor atual
        if (eqp.funcionarioId) {
            const currentFunc = funcionarios.find(f => f.id === eqp.funcionarioId);
            if (currentFunc) {
                searchInput.value = `${currentFunc.nome} (${currentFunc.setor || 'Sem setor'})`;
            }
        } else {
            searchInput.value = 'Ninguém (Disponível no Estoque)';
        }

        const renderDropdownList = (filterText = '') => {
            let filtered = funcionarios;
            if (filterText) {
                filtered = funcionarios.filter(f =>
                    f.nome.toLowerCase().includes(filterText.toLowerCase()) ||
                    (f.setor || '').toLowerCase().includes(filterText.toLowerCase())
                );
            }

            let listHTML = `
                <div class="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-100 font-medium text-sm border-b border-slate-100 dark:border-slate-700" data-value="">
                    Ninguém (Disponível no Estoque)
                </div>
            `;

            if (filtered.length === 0) {
                listHTML += `<div class="px-4 py-3 text-slate-400 dark:text-slate-500 text-sm">Nenhum funcionário encontrado</div>`;
            } else {
                listHTML += filtered.map(f => `
                    <div class="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-100 text-sm flex flex-col" data-value="${f.id}" data-text="${f.nome} (${f.setor || 'Sem setor'})">
                        <span class="font-semibold">${f.nome}</span>
                        <span class="text-xs text-slate-400">${f.setor || 'Sem setor'}</span>
                    </div>
                `).join('');
            }

            searchList.innerHTML = listHTML;

            // Adicionar eventos de click
            searchList.querySelectorAll('[data-value]').forEach(item => {
                item.addEventListener('click', (e) => {
                    const val = e.currentTarget.dataset.value;
                    const text = e.currentTarget.dataset.text || 'Ninguém (Disponível no Estoque)';
                    hiddenValue.value = val;
                    searchInput.value = text;
                    searchList.classList.add('hidden');
                });
            });
        };

        // Mostrar lista ao focar/clicar
        searchInput.addEventListener('focus', () => {
            renderDropdownList(searchInput.value === 'Ninguém (Disponível no Estoque)' ? '' : searchInput.value);
            searchList.classList.remove('hidden');
        });

        // Filtrar ao digitar
        searchInput.addEventListener('input', (e) => {
            renderDropdownList(e.target.value);
            searchList.classList.remove('hidden');
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.select-search-container')) {
                searchList.classList.add('hidden');
                // Se o usuário digitou algo e não selecionou nada válido, resetar para o valor anterior
                const selectedId = hiddenValue.value;
                if (selectedId) {
                    const currentFunc = funcionarios.find(f => f.id === selectedId);
                    if (currentFunc) {
                        searchInput.value = `${currentFunc.nome} (${currentFunc.setor || 'Sem setor'})`;
                    }
                } else {
                    searchInput.value = 'Ninguém (Disponível no Estoque)';
                }
            }
        }, { capture: true });

        document.getElementById('form-equipamento').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const previousFuncId = eqp.funcionarioId || null;
            const newFuncId = formData.get('funcionarioId') || null;

            const data = {
                descricao: formData.get('descricao'),
                modeloMarca: formData.get('modeloMarca'),
                patrimonio: formData.get('patrimonio') || null,
                serialNumber: formData.get('serialNumber') || null,
                observacoes: formData.get('observacoes') || null,
                funcionarioId: newFuncId,
                status: newFuncId ? 'EM_USO' : 'DISPONIVEL'
            };

            try {
                if (isEdit) {
                    await editEquipamento(id, data);
                    
                    // Se o proprietário mudou, registrar a movimentação no histórico
                    if (previousFuncId !== newFuncId) {
                        const todayStr = new Date().toISOString().split('T')[0];
                        if (previousFuncId) {
                            // Registrar devolução
                            await addHistorico({
                                tipo: 'DEVOLUCAO',
                                funcionarioId: previousFuncId,
                                equipamentoId: id,
                                equipamentoSnapshot: { id, descricao: data.descricao, modeloMarca: data.modeloMarca, patrimonio: data.patrimonio, serialNumber: data.serialNumber },
                                data: todayStr
                            });
                        }
                        if (newFuncId) {
                            // Registrar alocação manual
                            await addHistorico({
                                tipo: 'ALOCACAO_MANUAL',
                                funcionarioId: newFuncId,
                                equipamentoId: id,
                                equipamentoSnapshot: { id, descricao: data.descricao, modeloMarca: data.modeloMarca, patrimonio: data.patrimonio, serialNumber: data.serialNumber },
                                data: todayStr
                            });
                        }
                    }
                    showToast('Equipamento atualizado com sucesso.', 'success');
                } else {
                    const newEqp = await addEquipamento(data);
                    
                    // Se já foi cadastrado com dono, logar no histórico
                    if (newFuncId) {
                        const todayStr = new Date().toISOString().split('T')[0];
                        await addHistorico({
                            tipo: 'ALOCACAO_MANUAL',
                            funcionarioId: newFuncId,
                            equipamentoId: newEqp.id,
                            equipamentoSnapshot: { id: newEqp.id, descricao: data.descricao, modeloMarca: data.modeloMarca, patrimonio: data.patrimonio, serialNumber: data.serialNumber },
                            data: todayStr
                        });
                    }
                    showToast('Equipamento cadastrado com sucesso.', 'success');
                }
                hideModal();
                renderTable(document.getElementById('search-equip')?.value || '');
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
        document.querySelector('.btn-cancel').addEventListener('click', hideModal);
    };

    document.getElementById('btn-add-equipamento').addEventListener('click', () => {
        renderEquipamentoForm();
    });
};
