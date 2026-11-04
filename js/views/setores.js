// js/views/setores.js

const renderSetores = (container, headerActions, params = {}) => {
    const isViewer = typeof Auth !== 'undefined' && Auth.isViewer();
    headerActions.innerHTML = isViewer ? '' : `
        <button id="btn-header-novo-setor" class="btn-primary flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Novo Setor</span>
        </button>
    `;

    // Renderizar a estrutura básica de busca uma única vez para não perder o foco
    container.innerHTML = `
        <div class="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div class="relative flex-1 max-w-md">
                <i data-lucide="search" class="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500"></i>
                <input type="text" id="search-setor" value="${params.search || ''}" placeholder="Buscar setor..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100">
            </div>
            ${!isViewer ? `
            <button id="btn-novo-setor" class="btn-primary flex items-center justify-center gap-2 sm:hidden">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Novo Setor</span>
            </button>` : ''}
        </div>
        <div id="setores-table-container"></div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const searchInput = document.getElementById('search-setor');
    const tableContainer = document.getElementById('setores-table-container');

    const renderTable = (filterText = '') => {
        const funcionarios = getFuncionarios();
        const equipamentos = typeof getEquipamentos === 'function' ? getEquipamentos() : [];
        // Obter todos os setores cadastrados de forma independente
        const setores = getSetores();
        
        // Filtrar se houver busca
        let filtered = setores;
        if (filterText) {
            filtered = setores.filter(s => s.toLowerCase().includes(filterText.toLowerCase()));
        }

        let tableHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                            <th class="py-3.5 px-6 font-semibold">Nome do Setor</th>
                            <th class="py-3.5 px-6 font-semibold">Colaboradores</th>
                            <th class="py-3.5 px-6 font-semibold">Equipamentos</th>
                            <th class="py-3.5 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (filtered.length === 0) {
            tableHTML += `<tr><td colspan="4" class="py-8 text-center text-slate-500 dark:text-slate-400">Nenhum setor encontrado.</td></tr>`;
        } else {
            filtered.forEach(setor => {
                const countColabs = funcionarios.filter(f => f.setor === setor).length;
                const countEquips = equipamentos.filter(e => e.setor === setor).length;
                tableHTML += `
                    <tr class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td class="py-4 px-6 font-medium text-slate-800 dark:text-slate-100">
                            <button data-name="${setor}" data-tab="colaboradores" class="btn-view-setor text-left hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline font-semibold flex items-center gap-2 transition-colors" title="Clique para ver detalhes do setor">
                                <i data-lucide="folder" class="w-4 h-4 text-indigo-500"></i>
                                <span>${setor}</span>
                            </button>
                        </td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300">
                            <button data-name="${setor}" data-tab="colaboradores" class="btn-view-setor inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-all cursor-pointer shadow-sm" title="Ver colaboradores vinculados">
                                <i data-lucide="users" class="w-3.5 h-3.5"></i>
                                <span>${countColabs} ${countColabs === 1 ? 'colaborador' : 'colaboradores'}</span>
                            </button>
                        </td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300">
                            <button data-name="${setor}" data-tab="equipamentos" class="btn-view-setor inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-all cursor-pointer shadow-sm" title="Ver equipamentos vinculados">
                                <i data-lucide="laptop" class="w-3.5 h-3.5"></i>
                                <span>${countEquips} ${countEquips === 1 ? 'equipamento' : 'equipamentos'}</span>
                            </button>
                        </td>
                        <td class="py-4 px-6 text-right">
                            <div class="flex justify-end gap-1.5">
                                <button data-name="${setor}" data-tab="colaboradores" class="btn-view-setor text-slate-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title="Ver Detalhes do Setor">
                                    <i data-lucide="eye" class="w-4 h-4"></i>
                                </button>
                                ${!isViewer ? `
                                <button data-name="${setor}" class="btn-edit-setor text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors" title="Renomear Setor">
                                    <i data-lucide="pencil" class="w-4 h-4"></i>
                                </button>
                                <button data-name="${setor}" class="btn-delete-setor text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Remover Setor">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        tableHTML += `</tbody></table></div>`;
        tableContainer.innerHTML = tableHTML;

        if (window.lucide) window.lucide.createIcons();

        // Adicionar eventos dos botões
        bindTableEvents();
    };

    const abrirModalNovoSetor = () => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4';
        overlay.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 transform scale-95 opacity-0 transition-all duration-200 modal-box">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <i data-lucide="folder-plus" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Novo Setor</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400">Cadastre um novo setor no sistema</p>
                    </div>
                </div>
                
                <div class="my-5">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Nome do Setor</label>
                    <input type="text" id="input-novo-setor-nome-view" placeholder="Ex: Financeiro, TI, Marketing" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                </div>
                
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button type="button" id="btn-cancelar-novo-setor-view" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                    <button type="button" id="btn-confirmar-novo-setor-view" class="btn-primary">Salvar Setor</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        if (window.lucide) window.lucide.createIcons({ nodes: [overlay] });
        
        const box = overlay.querySelector('.modal-box');
        setTimeout(() => {
            box.classList.remove('scale-95', 'opacity-0');
            box.classList.add('scale-100', 'opacity-100');
        }, 10);
        
        const fechar = () => {
            box.classList.remove('scale-100', 'opacity-100');
            box.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                overlay.remove();
            }, 200);
        };
        
        const input = overlay.querySelector('#input-novo-setor-nome-view');
        
        overlay.querySelector('#btn-cancelar-novo-setor-view').addEventListener('click', fechar);
        overlay.querySelector('#btn-confirmar-novo-setor-view').addEventListener('click', async () => {
            const valor = input.value.trim();
            if (valor) {
                const uppercaseList = getSetores().map(s => s.toUpperCase());
                if (uppercaseList.includes(valor.toUpperCase())) {
                    showToast(`O setor "${valor}" já está cadastrado.`, 'warning');
                    return;
                }
                try {
                    await addSetor(valor);
                    showToast(`Setor "${valor}" criado com sucesso.`, 'success');
                    fechar();
                    renderTable(searchInput.value || '');
                } catch (err) {
                    showToast(err.message, 'error');
                }
            } else {
                showToast('O nome do setor não pode ser vazio.', 'warning');
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                overlay.querySelector('#btn-confirmar-novo-setor-view').click();
            }
        });

        setTimeout(() => input.focus(), 50);
    };

    const abrirModalVerSetor = (setorName, initialTab = 'colaboradores') => {
        const funcionarios = getFuncionarios();
        const equipamentos = typeof getEquipamentos === 'function' ? getEquipamentos() : [];
        const colabs = funcionarios.filter(f => f.setor === setorName);
        const equips = equipamentos.filter(e => e.setor === setorName);

        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4';

        let colabsHTML = '';
        if (colabs.length === 0) {
            colabsHTML = `
                <div class="py-8 px-4 text-center">
                    <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <i data-lucide="user-x" class="w-6 h-6"></i>
                    </div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Nenhum colaborador vinculado a este setor.</p>
                    <p class="text-xs text-slate-400 mt-1">Ao cadastrar ou editar um funcionário, selecione este setor para associá-lo.</p>
                </div>
            `;
        } else {
            colabsHTML = `
                <div class="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 pr-1">
                    ${colabs.map(c => `
                        <div class="py-2.5 px-3 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-slate-700/60 transition-all cursor-pointer flex items-center justify-between gap-4 group colab-row-item" data-funcid="${c.id}" title="Clique para ver o perfil completo de ${c.nome}">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform shrink-0">
                                    ${c.nome.substring(0, 2).toUpperCase()}
                                </div>
                                <div class="min-w-0">
                                    <div class="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 truncate">
                                        <span class="truncate">${c.nome}</span>
                                        <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 shrink-0"></i>
                                    </div>
                                    <div class="text-xs text-slate-500 dark:text-slate-400 truncate">${c.funcao || 'Cargo não informado'}</div>
                                </div>
                            </div>
                            <div class="text-right shrink-0">
                                <span class="text-xs font-mono text-slate-400 dark:text-slate-500">${formatInputDate(c.dataAdmissao) || c.dataAdmissao || ''}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        let equipsHTML = '';
        if (equips.length === 0) {
            equipsHTML = `
                <div class="py-8 px-4 text-center">
                    <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <i data-lucide="laptop" class="w-6 h-6"></i>
                    </div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Nenhum equipamento vinculado a este setor.</p>
                    <p class="text-xs text-slate-400 mt-1">Ao cadastrar ou editar um equipamento, selecione este setor para associá-lo.</p>
                </div>
            `;
        } else {
            equipsHTML = `
                <div class="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 pr-1">
                    ${equips.map(eq => {
                        const isDisp = eq.status === 'DISPONIVEL';
                        let responsavelText = 'Disponível';
                        if (!isDisp) {
                            const resp = funcionarios.find(f => f.id === eq.funcionarioId);
                            responsavelText = resp ? `Em uso: ${resp.nome.split(' ')[0]}` : 'Em Uso';
                        }
                        return `
                        <div class="py-2.5 px-3 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-slate-700/60 transition-all cursor-pointer flex items-center justify-between gap-4 group equip-row-item" data-eqpid="${eq.id}" data-search="${eq.patrimonio || eq.serialNumber || eq.descricao}" title="Clique para abrir na Gestão de Equipamentos">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                    <i data-lucide="laptop" class="w-4 h-4"></i>
                                </div>
                                <div class="min-w-0">
                                    <div class="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 truncate">
                                        ${eq.patrimonio ? `<span class="px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">#${eq.patrimonio}</span>` : ''}
                                        <span class="truncate">${eq.descricao}</span>
                                        <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500 shrink-0"></i>
                                    </div>
                                    <div class="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        ${eq.modeloMarca || 'Modelo não informado'}${eq.serialNumber ? ` &bull; S/N: ${eq.serialNumber}` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="text-right shrink-0">
                                ${isDisp ? `
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                        Disponível
                                    </span>
                                ` : `
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" title="${responsavelText}">
                                        ${responsavelText}
                                    </span>
                                `}
                            </div>
                        </div>
                    `;
                    }).join('')}
                </div>
            `;
        }

        overlay.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6 transform scale-95 opacity-0 transition-all duration-200 modal-box">
                <div class="flex items-center justify-between pb-4 mb-3 border-b border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <i data-lucide="folder" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">${setorName}</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400">${colabs.length} colaborador(es) &bull; ${equips.length} equipamento(s)</p>
                        </div>
                    </div>
                    <button type="button" id="btn-fechar-modal-setor-x" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <!-- Tabs -->
                <div class="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                    <button type="button" id="tab-btn-colabs" class="tab-btn flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer">
                        <i data-lucide="users" class="w-4 h-4"></i>
                        <span>Colaboradores (${colabs.length})</span>
                    </button>
                    <button type="button" id="tab-btn-equips" class="tab-btn flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer">
                        <i data-lucide="laptop" class="w-4 h-4"></i>
                        <span>Equipamentos (${equips.length})</span>
                    </button>
                </div>
                
                <!-- Tab Panes -->
                <div id="tab-pane-colabs" class="tab-pane">
                    ${colabsHTML}
                </div>
                <div id="tab-pane-equips" class="tab-pane hidden">
                    ${equipsHTML}
                </div>
                
                <div class="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                    <button type="button" id="btn-fechar-modal-setor" class="btn-primary">Fechar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        if (window.lucide) window.lucide.createIcons({ nodes: [overlay] });

        const box = overlay.querySelector('.modal-box');
        setTimeout(() => {
            box.classList.remove('scale-95', 'opacity-0');
            box.classList.add('scale-100', 'opacity-100');
        }, 10);

        const fechar = () => {
            box.classList.remove('scale-100', 'opacity-100');
            box.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                overlay.remove();
            }, 200);
        };

        overlay.querySelector('#btn-fechar-modal-setor').addEventListener('click', fechar);
        overlay.querySelector('#btn-fechar-modal-setor-x').addEventListener('click', fechar);

        // Tab Switching
        const tabColabs = overlay.querySelector('#tab-btn-colabs');
        const tabEquips = overlay.querySelector('#tab-btn-equips');
        const paneColabs = overlay.querySelector('#tab-pane-colabs');
        const paneEquips = overlay.querySelector('#tab-pane-equips');

        const switchTab = (tab) => {
            if (tab === 'equipamentos') {
                tabEquips.className = 'tab-btn flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 cursor-pointer';
                tabColabs.className = 'tab-btn flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer';
                paneColabs.classList.add('hidden');
                paneEquips.classList.remove('hidden');
            } else {
                tabColabs.className = 'tab-btn flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 cursor-pointer';
                tabEquips.className = 'tab-btn flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer';
                paneEquips.classList.add('hidden');
                paneColabs.classList.remove('hidden');
            }
        };

        tabColabs.addEventListener('click', () => switchTab('colaboradores'));
        tabEquips.addEventListener('click', () => switchTab('equipamentos'));
        switchTab(initialTab);

        // Click no colaborador -> Ir para Funcionários e abrir perfil
        overlay.querySelectorAll('.colab-row-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const funcId = e.currentTarget.dataset.funcid;
                fechar();
                navigate('funcionarios', { funcId, openProfile: true });
            });
        });

        // Click no equipamento -> Ir para Equipamentos e destacar
        overlay.querySelectorAll('.equip-row-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const eqpId = e.currentTarget.dataset.eqpid;
                const search = e.currentTarget.dataset.search;
                fechar();
                navigate('equipamentos', { search, highlightId: eqpId });
            });
        });
    };

    const abrirModalVerColaboradores = (setorName) => abrirModalVerSetor(setorName, 'colaboradores');

    const bindTableEvents = () => {
        // Evento de Ver Setor (Colaboradores ou Equipamentos)
        document.querySelectorAll('.btn-view-setor').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.currentTarget.dataset.name;
                const tab = e.currentTarget.dataset.tab || 'colaboradores';
                abrirModalVerSetor(name, tab);
            });
        });

        // Evento de Editar Setor
        document.querySelectorAll('.btn-edit-setor').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const oldName = e.currentTarget.dataset.name;
                
                const overlay = document.createElement('div');
                overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4';
                overlay.innerHTML = `
                    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 transform scale-95 opacity-0 transition-all duration-200 modal-box">
                        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Renomear Setor</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Digite o novo nome para o setor <strong>"${oldName}"</strong>. Isso atualizará o setor de todos os colaboradores e equipamentos vinculados.</p>
                        
                        <div class="mb-5">
                            <input type="text" id="input-edit-setor-nome" value="${oldName}" placeholder="Ex: Tecnologia" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                        </div>
                        
                        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button type="button" id="btn-cancelar-edit-setor" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                            <button type="button" id="btn-confirmar-edit-setor" class="btn-primary">Salvar</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(overlay);
                if (window.lucide) window.lucide.createIcons({ nodes: [overlay] });
                
                const box = overlay.querySelector('.modal-box');
                setTimeout(() => {
                    box.classList.remove('scale-95', 'opacity-0');
                    box.classList.add('scale-100', 'opacity-100');
                }, 10);
                
                const fechar = () => {
                    box.classList.remove('scale-100', 'opacity-100');
                    box.classList.add('scale-95', 'opacity-0');
                    setTimeout(() => {
                        overlay.remove();
                    }, 200);
                };
                
                const input = overlay.querySelector('#input-edit-setor-nome');
                
                overlay.querySelector('#btn-cancelar-edit-setor').addEventListener('click', fechar);
                overlay.querySelector('#btn-confirmar-edit-setor').addEventListener('click', async () => {
                    const newName = input.value.trim();
                    if (newName) {
                        if (newName === oldName) {
                            fechar();
                            return;
                        }
                        try {
                            await editSetor(oldName, newName);
                            showToast(`Setor renomeado para "${newName}" com sucesso.`, 'success');
                            fechar();
                            renderTable(searchInput.value || '');
                        } catch (err) {
                            showToast(err.message, 'error');
                        }
                    } else {
                        showToast('O nome do setor não pode ser vazio.', 'warning');
                    }
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        overlay.querySelector('#btn-confirmar-edit-setor').click();
                    }
                });

                setTimeout(() => input.focus(), 50);
            });
        });

        // Evento de Deletar Setor
        document.querySelectorAll('.btn-delete-setor').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const name = e.currentTarget.dataset.name;
                const ok = await showConfirm(`Tem certeza que deseja remover o setor "${name}"? Os colaboradores e equipamentos vinculados a ele ficarão sem setor definido.`, {
                    title: 'Remover Setor',
                    type: 'danger',
                    confirmText: 'Remover'
                });
                
                if (ok) {
                    try {
                        await removeSetor(name);
                        showToast(`Setor "${name}" removido com sucesso.`, 'success');
                        renderTable(searchInput.value || '');
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                }
            });
        });
    };

    // Botões de Novo Setor
    document.getElementById('btn-header-novo-setor')?.addEventListener('click', abrirModalNovoSetor);
    document.getElementById('btn-novo-setor')?.addEventListener('click', abrirModalNovoSetor);

    // Listener de busca
    searchInput.addEventListener('input', (e) => {
        renderTable(e.target.value);
    });

    renderTable(params.search || '');

    if (params.openColabs && params.setorName) {
        setTimeout(() => {
            abrirModalVerSetor(params.setorName, params.tab || 'colaboradores');
        }, 150);
    }
};
