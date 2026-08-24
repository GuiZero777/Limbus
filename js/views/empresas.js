// js/views/empresas.js

const renderEmpresas = (container, headerActions, params = {}) => {
    headerActions.innerHTML = `
        <button id="btn-add-empresa" class="btn-primary">
            <i data-lucide="plus" class="w-4 h-4"></i>
            Nova Empresa
        </button>
    `;

    const renderTable = () => {
        const empresas = getEmpresas();
        let tableHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                            <th class="py-3 px-6 font-semibold">Nome da Empresa</th>
                            <th class="py-3 px-6 font-semibold">CNPJ</th>
                            <th class="py-3 px-6 font-semibold">Cidade/UF</th>
                            <th class="py-3 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (empresas.length === 0) {
            tableHTML += `<tr><td colspan="4" class="py-6 text-center text-slate-500 dark:text-slate-400">Nenhuma empresa cadastrada.</td></tr>`;
        } else {
            empresas.forEach(emp => {
                tableHTML += `
                    <tr data-id="${emp.id}" class="border-b border-slate-100 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                        <td class="py-4 px-6 font-medium text-slate-800 dark:text-slate-100">${emp.nome}</td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300">${formatCNPJ(emp.cnpj)}</td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300">${emp.cidade} - ${emp.uf}</td>
                        <td class="py-4 px-6 text-right">
                            <button data-id="${emp.id}" class="btn-delete-empresa text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors" title="Remover">
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

        if (params.empresaId) {
            setTimeout(() => {
                const row = document.querySelector(`tr[data-id="${params.empresaId}"]`);
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    row.classList.add('bg-indigo-50/90', 'dark:bg-indigo-950/60', 'ring-2', 'ring-indigo-500', 'transition-all');
                    setTimeout(() => {
                        row.classList.remove('ring-2', 'ring-indigo-500');
                    }, 3000);
                }
            }, 150);
        }

        document.querySelectorAll('.btn-delete-empresa').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const ok = await showConfirm('Tem certeza que deseja remover esta empresa?', { title: 'Remover empresa', type: 'danger', confirmText: 'Remover' });
                if (ok) {
                    try {
                        await removeEmpresa(id);
                        showToast('Empresa removida com sucesso.', 'success');
                        renderTable();
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                }
            });
        });
    };

    renderTable();

    document.getElementById('btn-add-empresa').addEventListener('click', () => {
        const formHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Adicionar Empresa</h3>
                <form id="form-empresa" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nome / Razão Social</label>
                        <input type="text" name="nome" required class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">CNPJ</label>
                        <input type="text" name="cnpj" oninput="this.value = this.value.replace(/\\D/g, '')" required placeholder="Apenas números" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Cidade (Rodapé)</label>
                            <input type="text" name="cidade" required class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">UF (Estado)</label>
                            <input type="text" name="uf" required maxlength="2" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none uppercase dark:text-slate-100 dark:bg-slate-900">
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" class="btn-cancel bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">Cancelar</button>
                        <button type="submit" class="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        showModal(formHTML);

        document.getElementById('form-empresa').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
                await addEmpresa({
                    nome: formData.get('nome'),
                    cnpj: formData.get('cnpj'),
                    cidade: formData.get('cidade'),
                    uf: formData.get('uf').toUpperCase()
                });
                showToast('Empresa cadastrada com sucesso.', 'success');
                hideModal();
                renderTable();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
        document.querySelector('.btn-cancel').addEventListener('click', hideModal);
    });
};
