// js/views/funcionarios.js

const renderFuncionarios = (container, headerActions) => {
    headerActions.innerHTML = `
        <div class="flex flex-wrap items-center gap-4">
            <div class="relative">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input type="text" id="search-func" placeholder="Buscar funcionário..." class="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none w-48 lg:w-64 dark:text-slate-100 dark:bg-slate-900">
            </div>
            <select id="sort-func" class="py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                <option value="AZ">Ordem Alfabética (A-Z)</option>
                <option value="ZA">Ordem Alfabética (Z-A)</option>
                <option value="NEWEST">Mais Recentes</option>
            </select>
            <div class="flex items-center gap-2">
                <button id="btn-import-func" class="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 hover:dark:bg-emerald-900/50 px-4 py-2 rounded-lg font-medium transition-colors border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                    <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                    Importar
                </button>
                <button id="btn-add-func" class="btn-primary">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Novo Func.
                </button>
            </div>
        </div>
    `;

    const renderTable = (filterText = '') => {
        const sortMode = document.getElementById('sort-func')?.value || 'AZ';
        let funcionarios = getFuncionarios();

        // Sort
        if (sortMode === 'NEWEST') {
            funcionarios.sort((a, b) => (b.dataAdmissao || '').localeCompare(a.dataAdmissao || ''));
        } else if (sortMode === 'AZ') {
            funcionarios.sort((a, b) => a.nome.localeCompare(b.nome));
        } else if (sortMode === 'ZA') {
            funcionarios.sort((a, b) => b.nome.localeCompare(a.nome));
        }

        if (filterText) {
            funcionarios = funcionarios.filter(f =>
                f.nome.toLowerCase().includes(filterText.toLowerCase()) ||
                f.funcao.toLowerCase().includes(filterText.toLowerCase()) ||
                (f.setor || '').toLowerCase().includes(filterText.toLowerCase())
            );
        }

        const equipamentos = getEquipamentos();

        let tableHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                            <th class="py-3 px-6 font-semibold">Nome</th>
                            <th class="py-3 px-6 font-semibold hidden md:table-cell">Setor</th>
                            <th class="py-3 px-6 font-semibold hidden md:table-cell">Função</th>
                            <th class="py-3 px-6 font-semibold text-center hidden lg:table-cell">Admissão</th>
                            <th class="py-3 px-6 font-semibold text-center">Status</th>
                            <th class="py-3 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (funcionarios.length === 0) {
            tableHTML += `<tr><td colspan="6" class="py-6 text-center text-slate-500 dark:text-slate-400">Nenhum funcionário encontrado.</td></tr>`;
        } else {
            funcionarios.forEach(f => {
                const eqpsFunc = equipamentos.filter(e => e.funcionarioId === f.id && e.status === 'EM_USO');
                const hasEquip = eqpsFunc.length > 0;
                const statusBadge = hasEquip
                    ? `<span class="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 cursor-help" title="${eqpsFunc.map(e => e.descricao).join(', ')}"><i data-lucide="laptop" class="w-3.5 h-3.5"></i> ${eqpsFunc.length} item(s)</span>`
                    : `<span class="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"><i data-lucide="box" class="w-3.5 h-3.5"></i> Sem itens</span>`;

                tableHTML += `
                    <tr class="border-b border-slate-100 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors cursor-pointer row-funcionario" data-id="${f.id}">
                        <td class="py-4 px-6 font-medium text-slate-800 dark:text-slate-100">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs uppercase border border-slate-200 dark:border-slate-600">
                                    ${f.nome.substring(0, 2)}
                                </div>
                                <span>${f.nome}</span>
                            </div>
                            <div class="md:hidden text-xs text-slate-500 dark:text-slate-400 mt-1">${f.setor || 'Sem Setor'} &bull; ${f.funcao}</div>
                        </td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300 hidden md:table-cell">${f.setor || 'Sem Setor'}</td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300 hidden md:table-cell">${f.funcao}</td>
                        <td class="py-4 px-6 text-center text-slate-500 dark:text-slate-400 hidden lg:table-cell">${formatInputDate(f.dataAdmissao)}</td>
                        <td class="py-4 px-6 text-center">${statusBadge}</td>
                        <td class="py-4 px-6 text-right">
                            <div class="flex items-center justify-end gap-1" onclick="event.stopPropagation()">
                                <button data-id="${f.id}" class="btn-gerar text-slate-400 hover:text-primary p-2 rounded hover:bg-blue-50 transition-colors" title="Gerar Termo">
                                    <i data-lucide="file-text" class="w-4 h-4"></i>
                                </button>
                                <button data-id="${f.id}" class="btn-edit text-slate-400 hover:text-amber-500 p-2 rounded hover:bg-amber-50 transition-colors" title="Editar">
                                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                                </button>
                                <button data-id="${f.id}" class="btn-delete text-slate-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors" title="Remover">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        tableHTML += `</tbody></table></div>`;
        container.innerHTML = tableHTML;

        if (window.lucide) window.lucide.createIcons();

        // Clicar na linha abre o perfil
        document.querySelectorAll('.row-funcionario').forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const id = e.currentTarget.dataset.id;
                    renderFuncionarioPerfil(id);
                }
            });
        });

        document.querySelectorAll('.btn-gerar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                navigate('gerador_termo', { funcId: id });
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const eqps = getEquipamentos().filter(eq => eq.funcionarioId === id && eq.status === 'EM_USO');
                if (eqps.length > 0) {
                    showToast('O funcionário possui equipamentos em uso. Recolha-os antes de excluir.', 'error');
                    return;
                }
                const ok = await showConfirm('Tem certeza que deseja remover este funcionário? O histórico será mantido.', { title: 'Remover funcionário', type: 'danger', confirmText: 'Remover' });
                if (ok) {
                    try {
                        await removeFuncionario(id);
                        showToast('Funcionário removido com sucesso.', 'success');
                        renderTable(document.getElementById('search-func')?.value || '');
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                }
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                renderFuncionarioForm(id);
            });
        });
    };

    renderTable();

    document.getElementById('search-func')?.addEventListener('input', debounce((e) => renderTable(e.target.value), 300));
    document.getElementById('sort-func')?.addEventListener('change', () => renderTable(document.getElementById('search-func')?.value || ''));

    document.getElementById('btn-add-func').addEventListener('click', () => {
        renderFuncionarioForm();
    });

    document.getElementById('btn-import-func').addEventListener('click', () => {
        renderFuncionarioImport();
    });

    // Make renderTable accessible to updating functions (e.g. after import)
    window.renderTable = renderTable;
};

// Form Funcionário (Criar / Editar)
const renderFuncionarioForm = (id = null) => {
    let func = { nome: '', funcao: '', dataAdmissao: new Date().toISOString().split('T')[0], setor: '' };
    let isEdit = false;

    if (id) {
        const found = getFuncionarioById(id);
        if (found) {
            func = { ...found };
            isEdit = true;
        }
    }

    const title = isEdit ? 'Editar Funcionário' : 'Novo Funcionário';
    const formHTML = `
        <div class="p-6">
            <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">${title}</h3>
            <form id="form-funcionario" class="space-y-4">
                ${isEdit ? '<input type="hidden" name="id" value="' + func.id + '">' : ''}
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nome Completo</label>
                    <input type="text" name="nome" value="${func.nome}" required class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Setor</label>
                        <div class="relative select-setor-container">
                            <input type="text" id="search-setor-input" name="setor" value="${func.setor || ''}" required placeholder="Pesquisar ou digite um novo..." class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900" autocomplete="off">
                            <div id="search-setor-list" class="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hidden">
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Função / Cargo</label>
                        <input type="text" name="funcao" value="${func.funcao}" required class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Data de Admissão</label>
                    <input type="date" name="dataAdmissao" value="${func.dataAdmissao}" required class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                </div>
                <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" class="btn-cancel bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">Cancelar</button>
                    <button type="submit" class="btn-primary">Salvar</button>
                </div>
            </form>
        </div>
    `;

    showModal(formHTML);

    const searchInput = document.getElementById('search-setor-input');
    const searchList = document.getElementById('search-setor-list');
    const funcionarios = getFuncionarios();

    const getSetoresExistentes = () => {
        return [...new Set(funcionarios.map(f => f.setor).filter(Boolean))].sort();
    };

    const renderSetorList = (filterText = '') => {
        const setores = getSetoresExistentes();
        let filtered = setores;
        if (filterText) {
            filtered = setores.filter(s => s.toLowerCase().includes(filterText.toLowerCase()));
        }

        let listHTML = '';

        if (filterText && !setores.some(s => s.toLowerCase() === filterText.trim().toLowerCase())) {
            listHTML += `
                <div class="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-primary dark:text-blue-400 font-semibold text-sm border-b border-slate-100 dark:border-slate-700" data-value="${filterText.trim()}">
                    + Adicionar novo setor "${filterText.trim()}"
                </div>
            `;
        }

        if (filtered.length === 0 && !filterText) {
            listHTML += `<div class="px-4 py-3 text-slate-400 dark:text-slate-500 text-sm">Nenhum setor cadastrado</div>`;
        } else {
            listHTML += filtered.map(s => `
                <div class="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-100 text-sm" data-value="${s}">
                    ${s}
                </div>
            `).join('');
        }

        searchList.innerHTML = listHTML;

        searchList.querySelectorAll('[data-value]').forEach(item => {
            item.addEventListener('click', (e) => {
                const val = e.currentTarget.dataset.value;
                searchInput.value = val;
                searchList.classList.add('hidden');
            });
        });
    };

    searchInput.addEventListener('focus', () => {
        renderSetorList(searchInput.value);
        searchList.classList.remove('hidden');
    });

    searchInput.addEventListener('input', (e) => {
        renderSetorList(e.target.value);
        searchList.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.select-setor-container')) {
            searchList.classList.add('hidden');
        }
    }, { capture: true });

    document.getElementById('form-funcionario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            nome: formData.get('nome'),
            funcao: formData.get('funcao'),
            dataAdmissao: formData.get('dataAdmissao'),
            setor: formData.get('setor')
        };

        try {
            if (isEdit) {
                await editFuncionario(id, data);
                showToast('Funcionário atualizado!', 'success');
            } else {
                await addFuncionario(data);
                showToast('Funcionário cadastrado!', 'success');
            }
            hideModal();
            if (window.renderTable) window.renderTable(document.getElementById('search-func')?.value || '');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    document.querySelector('.btn-cancel').addEventListener('click', hideModal);
};

// --- Importação de Funcionários via Excel ---
const renderFuncionarioImport = () => {
    const html = `
        <div class="p-0 sm:p-2 flex flex-col h-[90vh] sm:h-auto max-h-[800px]">
            <!-- Header Fixa -->
            <div class="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 flex justify-between items-center sticky top-0 z-10 sm:rounded-t-2xl">
                <div>
                    <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <i data-lucide="file-spreadsheet" class="w-5 h-5"></i>
                        </div>
                        Importar Planilha
                    </h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-0">Adicione funcionários em lote a partir do Excel ou CSV.</p>
                </div>
                <button onclick="hideModal()" class="text-slate-400 hover:text-slate-600 dark:text-slate-300 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- Corpo Rolável -->
            <div class="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50 sm:rounded-b-2xl">
                
                <!-- Step 1: Upload -->
                <div id="import-step-upload" class="space-y-6">
                    <div class="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm flex items-start gap-3">
                        <i data-lucide="info" class="w-5 h-5 mt-0.5 shrink-0"></i>
                        <div class="text-sm space-y-2">
                            <p class="font-medium text-base">Instruções para a Planilha</p>
                            <p>O sistema buscará automaticamente as informações na primeira linha da planilha. É obrigatório ter os seguintes cabeçalhos (em qualquer ordem ou aba):</p>
                            <div class="flex flex-wrap gap-2 mt-2">
                                <span class="bg-white dark:bg-slate-800 px-2 py-1 border border-blue-200 dark:border-slate-700 rounded font-mono text-xs shadow-sm font-bold">NOME</span>
                                <span class="bg-white dark:bg-slate-800 px-2 py-1 border border-blue-200 dark:border-slate-700 rounded font-mono text-xs shadow-sm">ADMISSÃO</span>
                                <span class="bg-white dark:bg-slate-800 px-2 py-1 border border-blue-200 dark:border-slate-700 rounded font-mono text-xs shadow-sm">SETOR</span>
                            </div>
                            <p class="text-xs opacity-80 mt-2">Formatos suportados: .xlsx, .xls, .csv</p>
                        </div>
                    </div>

                    <div id="dropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-10 text-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary transition-all cursor-pointer group bg-white dark:bg-slate-800 shadow-sm relative overflow-hidden">
                        <div class="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform origin-center rounded-2xl"></div>
                        <input type="file" id="file-upload" accept=".xlsx, .xls, .csv" class="hidden">
                        <div class="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 dark:group-hover:bg-slate-600 transition-colors">
                            <i data-lucide="upload-cloud" class="w-8 h-8 text-primary"></i>
                        </div>
                        <p class="text-lg font-medium text-slate-800 dark:text-slate-100 mb-1">Clique para enviar ou arraste a planilha</p>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">Tamanho máximo: 5MB</p>
                    </div>

                    <div id="upload-error" class="hidden bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm flex items-center gap-2">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i>
                        <span id="upload-error-msg">Erro ao processar o arquivo.</span>
                    </div>
                </div>

                <!-- Step 2: Preview e Seleção de Abas -->
                <div id="import-step-preview" class="hidden space-y-6">
                    <div class="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                            <i data-lucide="table" class="w-6 h-6 text-emerald-600"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-2">
                                <span id="import-file-name" class="truncate max-w-[200px] sm:max-w-xs">planilha.xlsx</span>
                                <span class="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Lido</span>
                            </h4>
                            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5" id="import-total-count">Calculando...</p>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ml-1">Abas Encontradas</h4>
                        <div id="import-sheets-container" class="space-y-3">
                            <!-- Sheets injetadas via JS -->
                        </div>
                    </div>

                    <div class="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-slate-50 dark:bg-slate-900/50 -mx-6 px-6 -mb-6 pb-6">
                        <button type="button" id="btn-import-back" class="btn-cancel bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:bg-slate-900/50 transition-colors flex items-center gap-2">
                            <i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar
                        </button>
                        <button type="button" id="btn-import-confirm" class="btn-primary flex items-center gap-2 px-6">
                            Confirmar Importação <i data-lucide="check" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>

                <!-- Step 3: Success -->
                <div id="import-step-result" class="hidden text-center py-10 space-y-4">
                    <div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 scale-in">
                        <i data-lucide="check-circle-2" class="w-10 h-10 text-emerald-600 shrink-0"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100" id="import-result-title">X funcionários importados!</h3>
                    <p class="text-slate-500 dark:text-slate-400" id="import-result-desc">A lista foi atualizada e os duplicados foram ignorados.</p>
                    <div class="pt-6">
                        <button onclick="hideModal()" class="btn-primary w-full sm:w-auto px-8">Ver Lista de Funcionários</button>
                    </div>
                </div>

            </div>
        </div>
    `;

    showModal(html);
    if (window.lucide) window.lucide.createIcons();

    // Lógica XLSX
    setTimeout(() => {
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('file-upload');
        const errorDiv = document.getElementById('upload-error');
        let parsedSheets = []; // [{ name: 'Aba 1', data: [{nome, funcao, admissao}], selected: true }]

        const excelDateToString = (excelDate) => {
            if (!excelDate) return null;
            if (typeof excelDate === 'string') {
                const parts = excelDate.split('/');
                if (parts.length === 3) {
                    return parts[2] + '-' + parts[1].padStart(2,'0') + '-' + parts[0].padStart(2,'0'); // converte dd/mm/yyyy para yyyy-mm-dd
                }
                return null;
            }
            // Converter serial do Excel para JS Date. Excel considera 1900 bisexto (bug histórico), então -1 dia
            const date = new Date((excelDate - (25567 + 1)) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        };

        const processFile = (file) => {
            errorDiv.classList.add('hidden');
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    parsedSheets = [];

                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                        if (jsonData.length === 0) return;

                        // Procurar cabeçalhos (NOME, ADMISSÃO, SETOR)
                        let headerRowIdx = -1;
                        let nomeIdx = -1, admissaoIdx = -1, setorIdx = -1;

                        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
                            const row = jsonData[i];
                            if (!row) continue;
                            
                            for (let j = 0; j < row.length; j++) {
                                const cellValue = String(row[j] || '').toUpperCase().trim();
                                if (cellValue === 'NOME' || cellValue === 'NOME COMPLETO') nomeIdx = j;
                                else if (cellValue === 'ADMISSÃO' || cellValue === 'ADMISSAO' || cellValue === 'DATA ADMISSÃO') admissaoIdx = j;
                                else if (cellValue === 'SETOR' || cellValue === 'CARGO' || cellValue === 'FUNÇÃO' || cellValue === 'FUNCAO') setorIdx = j;
                            }

                            if (nomeIdx !== -1) {
                                headerRowIdx = i;
                                break;
                            }
                        }

                        if (nomeIdx === -1) return; // Coluna NOME é obrigatória

                        const rows = jsonData.slice(headerRowIdx + 1);
                        const employees = [];

                        rows.forEach(row => {
                            const nome = row[nomeIdx] ? String(row[nomeIdx]).trim() : '';
                            if (!nome) return; // Pular linhas sem nome

                            const funcao = setorIdx !== -1 && row[setorIdx] ? String(row[setorIdx]).trim() : 'Não Informado';
                            const dataRaw = admissaoIdx !== -1 ? row[admissaoIdx] : '';
                            const dataAdmissao = excelDateToString(dataRaw) || new Date().toISOString().split('T')[0];

                            employees.push({ nome, funcao, dataAdmissao });
                        });

                        if (employees.length > 0) {
                            parsedSheets.push({ name: sheetName, data: employees, selected: true });
                        }
                    });

                    if (parsedSheets.length === 0) {
                        errorDiv.textContent = 'Não foi possível encontrar dados válidos. Verifique se a planilha possui colunas NOME, ADMISSÃO e SETOR.';
                        errorDiv.classList.remove('hidden');
                        return;
                    }

                    showPreview(file.name);
                } catch (err) {
                    console.error('Erro ao processar planilha:', err);
                    errorDiv.textContent = 'Erro ao ler o arquivo. Verifique se é um Excel válido.';
                    errorDiv.classList.remove('hidden');
                }
            };
            reader.readAsArrayBuffer(file);
        };

        const showPreview = (fileName) => {
            document.getElementById('import-step-upload').classList.add('hidden');
            document.getElementById('import-step-preview').classList.remove('hidden');
            document.getElementById('import-file-name').textContent = fileName;

            renderSheetsPreview();
        };

        const renderSheetsPreview = () => {
            const container = document.getElementById('import-sheets-container');
            const existingNames = getFuncionarios().map(f => f.nome.trim().toUpperCase());

            container.innerHTML = parsedSheets.map((sheet, idx) => {
                const newCount = sheet.data.filter(e => !existingNames.includes(e.nome.toUpperCase())).length;
                const dupCount = sheet.data.length - newCount;
                const previewNames = sheet.data.slice(0, 4).map(e => e.nome).join(', ');
                const moreCount = sheet.data.length - 4;

                let classesSelected = sheet.selected ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700' : 'bg-white dark:bg-slate-800 opacity-60';
                let checkboxState = sheet.selected ? 'checked' : '';
                let dupCountSpan = dupCount > 0 ? '<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">' + dupCount + ' já cadastrados</span>' : '';
                let moreCountText = moreCount > 0 ? ' e mais ' + moreCount + '...' : '';

                return `
                    <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4 ${classesSelected}">
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" data-sheet-idx="${idx}" class="sheet-checkbox mt-1 w-4 h-4 text-emerald-600 border-slate-300 dark:border-slate-600 rounded focus:ring-emerald-500" ${checkboxState}>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-semibold text-slate-800 dark:text-slate-100">${sheet.name}</span>
                                    <span class="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">${sheet.data.length} registros</span>
                                    ${dupCountSpan}
                                </div>
                                <p class="text-xs text-slate-500 dark:text-slate-400">${previewNames}${moreCountText}</p>
                            </div>
                        </label>
                    </div>
                `;
            }).join('');

            updateImportCount();

            container.querySelectorAll('.sheet-checkbox').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const idx = parseInt(e.target.dataset.sheetIdx);
                    parsedSheets[idx].selected = e.target.checked;
                    renderSheetsPreview();
                });
            });
        };

        const updateImportCount = () => {
            const existingNames = getFuncionarios().map(f => f.nome.trim().toUpperCase());
            let totalNew = 0;
            parsedSheets.forEach(sheet => {
                if (sheet.selected) {
                    totalNew += sheet.data.filter(e => !existingNames.includes(e.nome.toUpperCase())).length;
                }
            });
            document.getElementById('import-total-count').innerHTML = '<strong>' + totalNew + '</strong> novos funcionários serão importados (duplicados serão ignorados).';
            const btnConfirm = document.getElementById('btn-import-confirm');
            if (totalNew === 0) {
                btnConfirm.disabled = true;
                btnConfirm.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                btnConfirm.disabled = false;
                btnConfirm.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        };

        // --- Event: Dropzone ---
        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-primary', 'bg-blue-50', 'dark:bg-blue-900/20');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-blue-900/20');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-blue-900/20');
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) processFile(file);
        });

        // --- Event: Voltar ---
        document.getElementById('btn-import-back')?.addEventListener('click', () => {
            document.getElementById('import-step-preview').classList.add('hidden');
            document.getElementById('import-step-upload').classList.remove('hidden');
            parsedSheets = [];
        });

        // --- Event: Confirmar Import ---
        document.getElementById('btn-import-confirm')?.addEventListener('click', async () => {
            const existingNames = getFuncionarios().map(f => f.nome.trim().toUpperCase());
            const toImport = [];

            parsedSheets.forEach(sheet => {
                if (!sheet.selected) return;
                sheet.data.forEach(emp => {
                    if (!existingNames.includes(emp.nome.toUpperCase())) {
                        toImport.push(emp);
                        // Adicionar ao set para evitar duplicados entre abas
                        existingNames.push(emp.nome.toUpperCase());
                    }
                });
            });

            if (toImport.length === 0) {
                showToast('Nenhum funcionário novo para importar.', 'warning');
                return;
            }

            // Desabilitar botão durante import
            const btnConfirm = document.getElementById('btn-import-confirm');
            btnConfirm.disabled = true;
            btnConfirm.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Importando...';
            if (window.lucide) window.lucide.createIcons();

            try {
                const result = await bulkAddFuncionarios(toImport);

                // Mostrar resultado
                document.getElementById('import-step-preview').classList.add('hidden');
                document.getElementById('import-step-result').classList.remove('hidden');
                document.getElementById('import-result-title').textContent = result.count + ' funcionários importados!';
                document.getElementById('import-result-desc').textContent = 'Os funcionários foram adicionados ao sistema com sucesso.';
                if (window.lucide) window.lucide.createIcons();

                // Atualizar tabela por trás do modal
                renderTable(document.getElementById('search-func')?.value || '');
            } catch (err) {
                showToast(err.message, 'error');
                btnConfirm.disabled = false;
                btnConfirm.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Confirmar Importação';
                if (window.lucide) window.lucide.createIcons();
            }
        });
    });
};

// --- Perfil do Funcionário (Histórico & Devolução) ---
window.renderFuncionarioPerfil = (id) => {
    const funcionario = getFuncionarioById(id);
    const equipamentos = getEquipamentos();
    const equipamentosEmPosse = equipamentos.filter(e => e.funcionarioId === id && e.status === 'EM_USO');

    // Pegar histórico geral e filtrar para este funcionário
    const historico = getHistorico().filter(h => h.funcionarioId === id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const historicoHTML = historico.length === 0 ?
        '<p class="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Nenhum registro no histórico.</p>' :
        historico.map(h => {
            const dataStr = formatInputDate(h.data);
            const timeStr = new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            let icone = '', corTexto = '', bgIcone = '', acao = '';
            if (h.tipo === 'ENTREGA' || h.tipo === 'ALOCACAO_MANUAL') {
                icone = 'arrow-down-right'; corTexto = 'text-emerald-700'; bgIcone = 'bg-emerald-100';
                acao = h.tipo === 'ENTREGA' ? 'Recebeu' : 'Alocação Manual';
            } else if (h.tipo === 'DEVOLUCAO' || h.tipo === 'DEVOLUCAO_COMPLETA') {
                icone = 'arrow-up-left'; corTexto = 'text-amber-700'; bgIcone = 'bg-amber-100'; acao = 'Devolveu';
            }

            let eqpContent = '';
            if (h.equipamentosIds && h.equipamentosIds.length > 0) {
                const eqps = h.equipamentosIds.map(eId => equipamentos.find(e => e.id === eId) || { descricao: 'Equipamento Excluído', modeloMarca: '' });
                const eqpHTML = eqps.map(eq => '<div><span class="font-bold text-slate-900 dark:text-slate-100">' + eq.descricao + '</span> <span class="text-xs text-slate-500 dark:text-slate-400">(' + eq.modeloMarca + ')</span></div>').join('');
                eqpContent = '<p class="text-sm font-medium text-slate-800 dark:text-slate-100">' + acao + ' múltiplos itens:</p>' +
                              '<div class="mt-1 space-y-1 pl-2 border-l-2 border-slate-200 dark:border-slate-700">' + eqpHTML + '</div>';
            } else {
                const eqp = equipamentos.find(e => e.id === h.equipamentoId) || { descricao: 'Equipamento Excluído', modeloMarca: '' };
                eqpContent = '<p class="text-sm font-medium text-slate-800 dark:text-slate-100">' + acao + ' <span class="font-bold text-slate-900 dark:text-slate-100">' + eqp.descricao + '</span></p>' +
                              '<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">' + eqp.modeloMarca + '</p>';
            }

            return `
                <div class="flex gap-4 items-start relative pb-6 last:pb-0 before:absolute before:left-[15px] before:top-8 before:bottom-0 before:-ml-px before:w-0.5 before:bg-slate-200 last:before:hidden">
                    <div class="relative z-10 w-8 h-8 rounded-full ${bgIcone} flex items-center justify-center shrink-0 ring-4 ring-white">
                        <i data-lucide="${icone}" class="w-4 h-4 ${corTexto}"></i>
                    </div>
                    <div>
                        ${eqpContent}
                        <p class="text-xs text-slate-400 mt-1.5 flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> ${dataStr} às ${timeStr}</p>
                    </div>
                </div>
             `;
        }).join('');

    let posseHTML = '';
    if (equipamentosEmPosse.length === 0) {
        posseHTML = '<p class="text-sm text-slate-500 dark:text-slate-400 py-4 text-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">Nenhum equipamento em posse atualmente.</p>';
    } else {
        const itensHTML = equipamentosEmPosse.map(eqp => `
                <div class="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                            <i data-lucide="laptop" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-800 dark:text-slate-100">${eqp.descricao}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400">${eqp.modeloMarca}</p>
                        </div>
                    </div>
                    <button data-eqpid="${eqp.id}" class="btn-devolver bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-red-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1" title="Registrar devolução do equipamento">
                        <i data-lucide="corner-up-left" class="w-4 h-4"></i> Devolver
                    </button>
                </div>
             `).join('');
        posseHTML = '<div class="space-y-3">' + itensHTML + '</div>';
    }

    const modalContentHTML = `
        <div class="flex flex-col h-[85vh] max-h-[800px]">
            <!-- Header Fixa -->
            <div class="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 flex justify-between items-start">
                <div>
                    <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100">${funcionario.nome}</h3>
                    <p class="text-slate-500 dark:text-slate-400">${funcionario.setor || 'Sem Setor'} &bull; ${funcionario.funcao} &bull; Admissão: ${formatInputDate(funcionario.dataAdmissao)}</p>
                </div>
                <button onclick="hideModal()" class="text-slate-400 hover:text-slate-600 dark:text-slate-300 p-1">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <!-- Corpo Rolável -->
            <div class="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    <!-- Coluna Esq: Posse Atual -->
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-2">
                                <i data-lucide="box" class="w-5 h-5 text-primary"></i>
                                <h4 class="text-lg font-bold text-slate-800 dark:text-slate-100">Posse Atual</h4>
                            </div>
                            ${equipamentosEmPosse.length > 1 ? `
                            <button id="btn-devolver-todos" class="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 shadow-sm">
                                <i data-lucide="corner-up-left" class="w-3.5 h-3.5"></i> Devolver Todos
                            </button>
                            ` : ''}
                        </div>
                        ${posseHTML}
                    </div>

                    <!-- Coluna Dir: Timeline -->
                    <div>
                        <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                            <i data-lucide="history" class="w-5 h-5 text-slate-600 dark:text-slate-300"></i>
                            <h4 class="text-lg font-bold text-slate-800 dark:text-slate-100">Linha do Tempo</h4>
                        </div>
                        <div class="pl-2">
                            ${historicoHTML}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalContentHTML);
    if (window.lucide) window.lucide.createIcons();

    // Eventos de Devolução
    document.querySelectorAll('.btn-devolver').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const eqpId = e.currentTarget.dataset.eqpid;
            const eqp = getEquipamentoById(eqpId);

            const ok = await showConfirm('Confirmar devolução de ' + eqp.descricao + '? O equipamento ficará disponível no estoque.', { title: 'Devolver equipamento', confirmText: 'Devolver' });
            if (ok) {
                try {
                    // 1. Atualizar status do equipamento
                    await editEquipamento(eqpId, { status: 'DISPONIVEL', funcionarioId: null });

                    // 2. Registrar no histórico
                    await addHistorico({
                        tipo: 'DEVOLUCAO',
                        funcionarioId: id,
                        equipamentoId: eqpId,
                        equipamentoSnapshot: { id: eqp.id, descricao: eqp.descricao, modeloMarca: eqp.modeloMarca },
                        data: new Date().toISOString().split('T')[0]
                    });

                    showToast('Equipamento devolvido com sucesso.', 'success');

                    // 3. Atualizar a tela
                    renderFuncionarioPerfil(id);
                    // Atualizar tabela por trás se o usuário estiver na tela de funcionários
                    const currentView = document.querySelector('a.nav-btn.active')?.dataset.view;
                    if (currentView === 'funcionarios') {
                        renderFuncionarios(document.getElementById('content-area'), document.getElementById('header-actions'));
                    } else if (currentView === 'equipamentos') {
                        renderEquipamentos(document.getElementById('content-area'), document.getElementById('header-actions'));
                    }
                } catch (err) {
                    showToast(err.message, 'error');
                }
            }
        });
    });

    const btnDevolverTodos = document.getElementById('btn-devolver-todos');
    if (btnDevolverTodos) {
        btnDevolverTodos.addEventListener('click', async () => {
            const okAll = await showConfirm('Confirmar devolução COMPLETA de todos os equipamentos em posse deste funcionário?', { title: 'Devolução completa', type: 'danger', confirmText: 'Devolver Todos' });
            if (okAll) {
                const todayStrInput = new Date().toISOString().split('T')[0];
                const dataRealStr = formatInputDate(todayStrInput);
                const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                try {
                    // 1. Atualizar e Histórico
                    for (const eqp of equipamentosEmPosse) {
                        await editEquipamento(eqp.id, { status: 'DISPONIVEL', funcionarioId: null });
                    }

                    await addHistorico({
                        tipo: 'DEVOLUCAO_COMPLETA',
                        funcionarioId: id,
                        equipamentosIds: equipamentosEmPosse.map(e => e.id),
                        equipamentosSnapshots: equipamentosEmPosse.map(eq => ({ id: eq.id, descricao: eq.descricao, modeloMarca: eq.modeloMarca })),
                        data: todayStrInput
                    });
                } catch (err) {
                    showToast(err.message, 'error');
                    return;
                }

                const itensDevolvidos = equipamentosEmPosse.map(eqp => `
                                    <tr>
                                        <td><strong>${eqp.descricao}</strong></td>
                                        <td>${eqp.modeloMarca}</td>
                                        <td>(   ) OK  (   ) Avariado</td>
                                    </tr>
                                `).join('');

                // 2. Gerar Recibo de Devolução (PDF Window)
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    const htmlContent = `
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <title>Recibo de Devolução - ${funcionario.nome}</title>
                        <style>
                            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
                            .header h1 { margin: 0; font-size: 24px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
                            .header p { margin: 5px 0 0; color: #64748b; }
                            .info-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                            .info-box p { margin: 5px 0; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                            th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
                            th { background-color: #f1f5f9; font-weight: bold; text-transform: uppercase; font-size: 12px; color: #475569; }
                            td { font-size: 14px; }
                            .signatures { margin-top: 80px; display: flex; justify-content: space-between; }
                            .signature-line { width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 10px; }
                            .signature-line p { margin: 0; font-weight: bold; font-size: 14px; }
                            .signature-line span { font-size: 12px; color: #64748b; }
                            @media print { body { padding: 0; margin: 1cm; } }
                        </style>
                    </head>
                    <body onload="window.print()">
                        <div class="header">
                            <h1>Recibo de Devolução Completa</h1>
                            <p>Limbus - Gestão de Equipamentos</p>
                        </div>
                        
                        <div class="info-box">
                            <p><strong>Devolvido por:</strong> ${funcionario.nome}</p>
                            <p><strong>Função/Cargo:</strong> ${funcionario.funcao}</p>
                            <p><strong>Data e Hora da Devolução:</strong> ${dataRealStr} às ${timeStr}</p>
                        </div>

                        <h3>Itens Devolvidos</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Equipamento</th>
                                    <th>Modelo / Marca</th>
                                    <th>Status Recebido</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itensDevolvidos}
                            </tbody>
                        </table>

                        <div class="signatures">
                            <div class="signature-line">
                                <p>${funcionario.nome}</p>
                                <span>Assinatura do Funcionário</span>
                            </div>
                            <div class="signature-line">
                                <p>Responsável TI</p>
                                <span>Assinatura do Recebedor</span>
                            </div>
                        </div>
                    </body>
                    </html>
                    `;
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                } else {
                    showToast('Equipamentos devolvidos, mas não foi possível abrir o Recibo (pop-up bloqueado).', 'warning');
                }

                // 3. Atualizar a tela
                renderFuncionarioPerfil(id);
                const currentView = document.querySelector('a.nav-btn.active')?.dataset.view;
                if (currentView === 'funcionarios') {
                    renderFuncionarios(document.getElementById('content-area'), document.getElementById('header-actions'));
                } else if (currentView === 'equipamentos') {
                    renderEquipamentos(document.getElementById('content-area'), document.getElementById('header-actions'));
                }
            }
        });
    }
};
