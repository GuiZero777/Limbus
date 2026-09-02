// js/views/insumos.js

const renderInsumos = (container, headerActions, params = {}) => {
    headerActions.innerHTML = `
        <button id="btn-header-novo-insumo" class="btn-primary flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Novo Insumo</span>
        </button>
    `;

    const insumos = getInsumos();
    const totalItens = insumos.length;
    const totalDisponivel = insumos.reduce((acc, i) => acc + i.disponivel, 0);
    const totalEmUso = insumos.reduce((acc, i) => acc + i.emUso, 0);

    container.innerHTML = `
        <!-- Cards de Resumo -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="stat-card">
                <div class="flex items-center gap-3 mb-2">
                    <div class="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        <i data-lucide="box" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipos de Insumo</h3>
                        <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">${totalItens}</p>
                    </div>
                </div>
                <p class="text-xs text-slate-400 dark:text-slate-500">Modelos cadastrados</p>
            </div>

            <div class="stat-card">
                <div class="flex items-center gap-3 mb-2">
                    <div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                        <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Em Estoque</h3>
                        <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">${totalDisponivel}</p>
                    </div>
                </div>
                <p class="text-xs text-slate-400 dark:text-slate-500">Unidades disponíveis</p>
            </div>

            <div class="stat-card">
                <div class="flex items-center gap-3 mb-2">
                    <div class="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                        <i data-lucide="users" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Em Uso</h3>
                        <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">${totalEmUso}</p>
                    </div>
                </div>
                <p class="text-xs text-slate-400 dark:text-slate-500">Unidades com colaboradores</p>
            </div>
        </div>

        <div class="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div class="relative flex-1 max-w-md">
                <i data-lucide="search" class="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500"></i>
                <input type="text" id="search-insumo" value="${params.search || ''}" placeholder="Buscar por mouse, teclado, marca..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100">
            </div>
            <button id="btn-novo-insumo" class="btn-primary flex items-center justify-center gap-2 sm:hidden">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Novo Insumo</span>
            </button>
        </div>
        <div id="insumos-table-container"></div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const searchInput = document.getElementById('search-insumo');
    const tableContainer = document.getElementById('insumos-table-container');

    const renderTable = (filterText = '') => {
        const insumosList = getInsumos();
        let filtered = insumosList;
        if (filterText) {
            const term = (typeof normalizeText === 'function' ? normalizeText(filterText) : filterText.toLowerCase()).trim();
            filtered = insumosList.filter(i => {
                const searchStr = (typeof normalizeText === 'function' ? normalizeText(i.nome + ' ' + (i.marca || '')) : (i.nome + ' ' + (i.marca || ''))).toLowerCase();
                return searchStr.includes(term);
            });
        }

        let tableHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                            <th class="py-3.5 px-6 font-semibold">Insumo / Periférico</th>
                            <th class="py-3.5 px-6 font-semibold">Marca / Modelo</th>
                            <th class="py-3.5 px-6 font-semibold">Status do Estoque</th>
                            <th class="py-3.5 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (filtered.length === 0) {
            tableHTML += `<tr><td colspan="4" class="py-10 text-center text-slate-500 dark:text-slate-400"><i data-lucide="inbox" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>Nenhum insumo cadastrado ou encontrado.</td></tr>`;
        } else {
            filtered.forEach(ins => {
                const percent = ins.quantidade > 0 ? Math.round((ins.emUso / ins.quantidade) * 100) : 0;
                const isEsgotado = ins.disponivel === 0;

                tableHTML += `
                    <tr class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td class="py-4 px-6 font-semibold text-slate-800 dark:text-slate-100">
                            <div class="flex items-center gap-3">
                                <div class="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <i data-lucide="box" class="w-4 h-4"></i>
                                </div>
                                <div>
                                    <span class="block text-sm font-bold text-slate-800 dark:text-slate-100">${ins.nome}</span>
                                    <span class="block text-xs text-slate-400 dark:text-slate-500">Insumo sem patrimônio</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                            ${ins.marca || '<span class="text-slate-400 italic">Não informada</span>'}
                        </td>
                        <td class="py-4 px-6">
                            <div class="max-w-xs">
                                <div class="flex items-center justify-between text-xs mb-1.5">
                                    <span class="inline-flex items-center gap-1 font-semibold ${isEsgotado ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}">
                                        <span class="w-2 h-2 rounded-full ${isEsgotado ? 'bg-red-500' : 'bg-emerald-500'}"></span>
                                        ${ins.disponivel} disp.
                                    </span>
                                    <button data-id="${ins.id}" class="btn-ver-alocados text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors" title="Clique para ver colaboradores">
                                        ${ins.emUso} em uso (${ins.quantidade} total)
                                    </button>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                                    <div class="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
                                </div>
                            </div>
                        </td>
                        <td class="py-4 px-6 text-right">
                            <div class="flex justify-end gap-1.5">
                                <button data-id="${ins.id}" class="btn-add-estoque-rapido text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors" title="Adicionar / Ajustar Estoque">
                                    <i data-lucide="plus-circle" class="w-4 h-4"></i>
                                </button>
                                <button data-id="${ins.id}" class="btn-ver-alocados text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors" title="Ver Colaboradores em Posse">
                                    <i data-lucide="users" class="w-4 h-4"></i>
                                </button>
                                <button data-id="${ins.id}" class="btn-edit-insumo text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors" title="Editar Insumo">
                                    <i data-lucide="pencil" class="w-4 h-4"></i>
                                </button>
                                <button data-id="${ins.id}" class="btn-delete-insumo text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Remover Insumo">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        tableHTML += `</tbody></table></div>`;
        tableContainer.innerHTML = tableHTML;

        if (window.lucide) window.lucide.createIcons();

        bindInsumoEvents();
    };

    const bindInsumoEvents = () => {
        document.querySelectorAll('.btn-add-estoque-rapido').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const insumo = getInsumoById(id);
                if (!insumo) return;
                showAjusteEstoqueModal(insumo);
            });
        });

        document.querySelectorAll('.btn-ver-alocados').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const insumo = getInsumoById(id);
                if (!insumo) return;
                showColaboradoresInsumoModal(insumo);
            });
        });

        document.querySelectorAll('.btn-edit-insumo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const insumo = getInsumoById(id);
                if (!insumo) return;
                showInsumoFormModal(insumo);
            });
        });

        document.querySelectorAll('.btn-delete-insumo').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const insumo = getInsumoById(id);
                if (!insumo) return;

                if (insumo.emUso > 0) {
                    showToast(`Não é possível excluir: existem ${insumo.emUso} unidades deste insumo em posse de colaboradores.`, 'warning');
                    return;
                }

                const ok = await showConfirm(`Tem certeza que deseja excluir o insumo "${insumo.nome}"?`, { title: 'Excluir Insumo', type: 'danger', confirmText: 'Excluir' });
                if (ok) {
                    try {
                        await removeInsumo(id);
                        showToast('Insumo removido com sucesso.', 'success');
                        renderInsumos(container, headerActions, { search: searchInput?.value || '' });
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                }
            });
        });
    };

    const showInsumoFormModal = (insumo = null) => {
        const isEditing = !!insumo;
        const title = isEditing ? 'Editar Insumo' : 'Novo Insumo';
        const submitText = isEditing ? 'Salvar Alterações' : 'Cadastrar Insumo';

        const formHTML = `
            <div class="p-6">
                <div class="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-700/80">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
                            <i data-lucide="box" class="w-5 h-5"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">${title}</h3>
                    </div>
                    <button type="button" onclick="hideModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <form id="form-insumo" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Nome / Descrição do Insumo *</label>
                        <input type="text" name="nome" id="input-nome-insumo" value="${insumo ? insumo.nome : ''}" required placeholder="Ex: Mouse USB, Kit Teclado e Mouse, Suporte de Notebook..." class="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 outline-none text-sm dark:text-slate-100">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Marca / Modelo</label>
                        <input type="text" name="marca" value="${insumo ? (insumo.marca || '') : ''}" placeholder="Ex: Logitech MK120, Dell, Genérico..." class="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 outline-none text-sm dark:text-slate-100">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Quantidade Total em Estoque *</label>
                        <input type="number" name="quantidade" min="${insumo ? insumo.emUso : 0}" value="${insumo ? insumo.quantidade : 10}" required class="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 outline-none text-sm dark:text-slate-100">
                        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Controle de saldo total. As unidades entregues a colaboradores serão abatidas automaticamente.</p>
                    </div>
                    <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                        <button type="button" class="btn-cancel px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" class="btn-primary px-5 py-2 text-sm text-white font-medium rounded-lg shadow-sm flex items-center gap-2">
                            <i data-lucide="check" class="w-4 h-4"></i>
                            <span>${submitText}</span>
                        </button>
                    </div>
                </form>
            </div>
        `;

        showModal(formHTML);
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('form-insumo').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const nome = formData.get('nome').trim();
            const marca = formData.get('marca').trim();
            const quantidade = parseInt(formData.get('quantidade'), 10) || 0;

            if (!nome) {
                showToast('Informe o nome do insumo.', 'warning');
                return;
            }

            try {
                if (isEditing) {
                    await editInsumo(insumo.id, { nome, marca, quantidade });
                    showToast('Insumo atualizado com sucesso.', 'success');
                } else {
                    await addInsumo({ nome, marca, quantidade });
                    showToast('Insumo cadastrado com sucesso.', 'success');
                }
                hideModal();
                renderInsumos(container, headerActions, { search: searchInput?.value || '' });
            } catch (err) {
                showToast(err.message, 'error');
            }
        });

        document.querySelector('.btn-cancel')?.addEventListener('click', hideModal);
    };

    const showAjusteEstoqueModal = (insumo) => {
        const formHTML = `
            <div class="p-6">
                <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/80">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
                            <i data-lucide="sliders" class="w-5 h-5"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Ajustar Estoque</h3>
                    </div>
                    <button type="button" onclick="hideModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <p class="font-bold text-slate-800 dark:text-slate-100 text-sm">${insumo.nome}</p>
                        <p class="text-xs text-slate-400">${insumo.marca || 'Sem marca'} • Atual: ${insumo.quantidade} total (${insumo.disponivel} disponíveis, ${insumo.emUso} em uso)</p>
                    </div>
                    <div class="flex items-center justify-center gap-4 py-2">
                        <button type="button" id="btn-quick-minus-5" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors">-5</button>
                        <button type="button" id="btn-quick-minus-1" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors">-1</button>
                        <input type="number" id="input-nova-qtd" min="${insumo.emUso}" value="${insumo.quantidade}" class="w-24 text-center font-bold text-lg px-2 py-1.5 border border-indigo-300 dark:border-indigo-700 rounded-lg bg-white dark:bg-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary">
                        <button type="button" id="btn-quick-plus-1" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors">+1</button>
                        <button type="button" id="btn-quick-plus-5" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors">+5</button>
                        <button type="button" id="btn-quick-plus-10" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors">+10</button>
                    </div>
                    <div class="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                        <button type="button" class="btn-cancel px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors">Cancelar</button>
                        <button type="button" id="btn-salvar-ajuste" class="btn-primary px-5 py-2 text-sm text-white font-medium rounded-lg shadow-sm flex items-center gap-2">
                            <i data-lucide="save" class="w-4 h-4"></i>
                            <span>Atualizar Estoque</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        showModal(formHTML);
        if (window.lucide) window.lucide.createIcons();

        const inputQtd = document.getElementById('input-nova-qtd');
        const minQtd = insumo.emUso;

        document.getElementById('btn-quick-minus-5')?.addEventListener('click', () => {
            inputQtd.value = Math.max(minQtd, parseInt(inputQtd.value, 10) - 5);
        });
        document.getElementById('btn-quick-minus-1')?.addEventListener('click', () => {
            inputQtd.value = Math.max(minQtd, parseInt(inputQtd.value, 10) - 1);
        });
        document.getElementById('btn-quick-plus-1')?.addEventListener('click', () => {
            inputQtd.value = parseInt(inputQtd.value, 10) + 1;
        });
        document.getElementById('btn-quick-plus-5')?.addEventListener('click', () => {
            inputQtd.value = parseInt(inputQtd.value, 10) + 5;
        });
        document.getElementById('btn-quick-plus-10')?.addEventListener('click', () => {
            inputQtd.value = parseInt(inputQtd.value, 10) + 10;
        });

        document.getElementById('btn-salvar-ajuste')?.addEventListener('click', async () => {
            const novaQtd = parseInt(inputQtd.value, 10);
            if (isNaN(novaQtd) || novaQtd < minQtd) {
                showToast(`A quantidade não pode ser menor que o total em uso (${minQtd}).`, 'warning');
                return;
            }

            try {
                await editInsumo(insumo.id, { quantidade: novaQtd });
                showToast('Estoque atualizado com sucesso.', 'success');
                hideModal();
                renderInsumos(container, headerActions, { search: searchInput?.value || '' });
            } catch (err) {
                showToast(err.message, 'error');
            }
        });

        document.querySelector('.btn-cancel')?.addEventListener('click', hideModal);
    };

    const showColaboradoresInsumoModal = (insumo) => {
        const funcionarios = getFuncionarios();
        const alocados = [];
        funcionarios.forEach(f => {
            const match = (f.insumos || []).find(i => i.insumoId === insumo.id || i.id === insumo.id);
            if (match) {
                alocados.push({
                    funcionario: f,
                    quantidade: parseInt(match.quantidade, 10) || 1
                });
            }
        });

        const listHTML = alocados.length === 0
            ? '<p class="text-sm text-slate-400 text-center py-6">Nenhum colaborador possui este insumo no momento.</p>'
            : '<div class="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">' + alocados.map(item => `
                <div class="py-3 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                            ${item.funcionario.nome.charAt(0).toUpperCase()}
                        </div>
                        <div class="truncate">
                            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">${item.funcionario.nome}</p>
                            <p class="text-xs text-slate-400 truncate">${item.funcionario.funcao || 'Cargo não informado'} • ${item.funcionario.setor || 'Sem setor'}</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                        ${item.quantidade} ${item.quantidade === 1 ? 'unidade' : 'unidades'}
                    </span>
                </div>
            `).join('') + '</div>';

        const modalHTML = `
            <div class="p-6">
                <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/80">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                            <i data-lucide="users" class="w-5 h-5"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Colaboradores com este Insumo</h3>
                    </div>
                    <button type="button" onclick="hideModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <p class="font-bold text-slate-800 dark:text-slate-100 text-sm">${insumo.nome}</p>
                            <p class="text-xs text-slate-400">${insumo.marca || 'Sem marca'}</p>
                        </div>
                        <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            ${insumo.emUso} em uso
                        </span>
                    </div>
                    ${listHTML}
                    <div class="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-700/60">
                        <button type="button" class="btn-cancel btn-primary px-5 py-2 text-sm text-white font-medium rounded-lg shadow-sm">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        showModal(modalHTML);
        if (window.lucide) window.lucide.createIcons();
        document.querySelector('.btn-cancel')?.addEventListener('click', hideModal);
    };

    document.getElementById('btn-header-novo-insumo')?.addEventListener('click', () => showInsumoFormModal());
    document.getElementById('btn-novo-insumo')?.addEventListener('click', () => showInsumoFormModal());

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            renderTable(e.target.value);
        }, 200));
    }

    renderTable(params.search || '');
};
