// js/views/setores.js

const renderSetores = (container, headerActions) => {
    headerActions.innerHTML = `
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
                <input type="text" id="search-setor" placeholder="Buscar setor..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100">
            </div>
            <button id="btn-novo-setor" class="btn-primary flex items-center justify-center gap-2 sm:hidden">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Novo Setor</span>
            </button>
        </div>
        <div id="setores-table-container"></div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const searchInput = document.getElementById('search-setor');
    const tableContainer = document.getElementById('setores-table-container');

    const renderTable = (filterText = '') => {
        const funcionarios = getFuncionarios();
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
                            <th class="py-3.5 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (filtered.length === 0) {
            tableHTML += `<tr><td colspan="3" class="py-8 text-center text-slate-500 dark:text-slate-400">Nenhum setor encontrado.</td></tr>`;
        } else {
            filtered.forEach(setor => {
                const count = funcionarios.filter(f => f.setor === setor).length;
                tableHTML += `
                    <tr class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td class="py-4 px-6 font-medium text-slate-800 dark:text-slate-100">
                            <button data-name="${setor}" class="btn-view-colabs text-left hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline font-semibold flex items-center gap-2 transition-colors" title="Clique para ver os colaboradores">
                                <i data-lucide="folder" class="w-4 h-4 text-indigo-500"></i>
                                <span>${setor}</span>
                            </button>
                        </td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300">
                            <button data-name="${setor}" class="btn-view-colabs inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-all cursor-pointer shadow-sm" title="Ver colaboradores vinculados">
                                <i data-lucide="users" class="w-3.5 h-3.5"></i>
                                <span>${count} ${count === 1 ? 'colaborador' : 'colaboradores'}</span>
                            </button>
                        </td>
                        <td class="py-4 px-6 text-right">
                            <div class="flex justify-end gap-1.5">
                                <button data-name="${setor}" class="btn-view-colabs text-slate-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title="Ver Colaboradores">
                                    <i data-lucide="eye" class="w-4 h-4"></i>
                                </button>
                                <button data-name="${setor}" class="btn-edit-setor text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors" title="Renomear Setor">
                                    <i data-lucide="pencil" class="w-4 h-4"></i>
                                </button>
                                <button data-name="${setor}" class="btn-delete-setor text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Remover Setor">
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

    const abrirModalVerColaboradores = (setorName) => {
        const funcionarios = getFuncionarios();
        const colabs = funcionarios.filter(f => f.setor === setorName);

        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4';

        let contentHTML = '';
        if (colabs.length === 0) {
            contentHTML = `
                <div class="py-8 px-4 text-center">
                    <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <i data-lucide="user-x" class="w-6 h-6"></i>
                    </div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Nenhum colaborador vinculado a este setor.</p>
                    <p class="text-xs text-slate-400 mt-1">Ao cadastrar ou editar um funcionário, selecione este setor para associá-lo.</p>
                </div>
            `;
        } else {
            contentHTML = `
                <div class="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 pr-1">
                    ${colabs.map(c => `
                        <div class="py-2.5 px-3 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-slate-700/60 transition-all cursor-pointer flex items-center justify-between gap-4 group colab-row-item" data-funcid="${c.id}" title="Clique para ver o perfil completo de ${c.nome}">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform shrink-0">
                                    ${c.nome.substring(0, 2).toUpperCase()}
                                </div>
                                <div class="min-w-0">
                                    <div class="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5 truncate">
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

        overlay.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6 transform scale-95 opacity-0 transition-all duration-200 modal-box">
                <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <i data-lucide="users" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">${setorName}</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400">${colabs.length} ${colabs.length === 1 ? 'colaborador vinculado' : 'colaboradores vinculados'} &bull; <span class="text-indigo-600 dark:text-indigo-400">Clique para abrir perfil</span></p>
                        </div>
                    </div>
                    <button type="button" id="btn-fechar-modal-colabs-x" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                
                ${contentHTML}
                
                <div class="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                    <button type="button" id="btn-fechar-modal-colabs" class="btn-primary">Fechar</button>
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

        overlay.querySelector('#btn-fechar-modal-colabs').addEventListener('click', fechar);
        overlay.querySelector('#btn-fechar-modal-colabs-x').addEventListener('click', fechar);

        // Click no colaborador -> Ir para Funcionários e abrir perfil
        overlay.querySelectorAll('.colab-row-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const funcId = e.currentTarget.dataset.funcid;
                fechar();
                navigate('funcionarios', { funcId, openProfile: true });
            });
        });
    };

    const bindTableEvents = () => {
        // Evento de Ver Colaboradores
        document.querySelectorAll('.btn-view-colabs').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.currentTarget.dataset.name;
                abrirModalVerColaboradores(name);
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
                        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Digite o novo nome para o setor <strong>"${oldName}"</strong>. Isso atualizará o setor de todos os colaboradores vinculados.</p>
                        
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
                const ok = await showConfirm(`Tem certeza que deseja remover o setor "${name}"? Os colaboradores vinculados a ele ficarão sem setor.`, {
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

    renderTable();
};
