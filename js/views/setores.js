// js/views/setores.js

const renderSetores = (container, headerActions) => {
    headerActions.innerHTML = '';

    // Renderizar a estrutura básica de busca uma única vez para não perder o foco
    container.innerHTML = `
        <div class="mb-6 flex items-center justify-between gap-4">
            <div class="relative flex-1 max-w-md">
                <i data-lucide="search" class="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500"></i>
                <input type="text" id="search-setor" placeholder="Buscar setor..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100">
            </div>
        </div>
        <div id="setores-table-container"></div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const searchInput = document.getElementById('search-setor');
    const tableContainer = document.getElementById('setores-table-container');

    const renderTable = (filterText = '') => {
        const funcionarios = getFuncionarios();
        // Obter setores únicos
        const setores = [...new Set(funcionarios.map(f => f.setor).filter(Boolean))].sort();
        
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
                            <th class="py-3 px-6 font-semibold">Nome do Setor</th>
                            <th class="py-3 px-6 font-semibold">Colaboradores</th>
                            <th class="py-3 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (filtered.length === 0) {
            tableHTML += `<tr><td colspan="3" class="py-6 text-center text-slate-500 dark:text-slate-400">Nenhum setor encontrado.</td></tr>`;
        } else {
            filtered.forEach(setor => {
                const count = funcionarios.filter(f => f.setor === setor).length;
                tableHTML += `
                    <tr class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td class="py-4 px-6 font-medium text-slate-800 dark:text-slate-100">${setor}</td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300">
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                ${count} ${count === 1 ? 'colaborador' : 'colaboradores'}
                            </span>
                        </td>
                        <td class="py-4 px-6 text-right flex justify-end gap-2">
                            <button data-name="${setor}" class="btn-edit-setor text-indigo-500 hover:text-indigo-700 p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors" title="Editar Nome">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                            </button>
                            <button data-name="${setor}" class="btn-delete-setor text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Remover Setor">
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

        // Adicionar eventos dos botões
        bindTableEvents();
    };

    const bindTableEvents = () => {
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

    // Adicionar listener de busca
    searchInput.addEventListener('input', (e) => {
        renderTable(e.target.value);
    });

    renderTable();
};
