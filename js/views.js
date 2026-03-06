// js/views.js

// --- Dashboard ---
const renderDashboard = (container, headerActions) => {
    const fncs = getFuncionarios().length;
    const emps = getEmpresas().length;
    const equipamentos = getEquipamentos();
    const eqps = equipamentos.length;
    const eqpsEmUso = equipamentos.filter(e => e.status === 'EM_USO').length;
    const eqpsDisponiveis = eqps - eqpsEmUso;

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-4 text-emerald-600 mb-2">
                    <i data-lucide="users" class="w-8 h-8"></i>
                    <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Funcionários</h3>
                </div>
                <p class="text-3xl font-bold text-slate-800 dark:text-slate-100">${fncs}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Cadastrados no sistema</p>
                <button onclick="navigate('funcionarios')" class="mt-4 text-sm text-primary hover:underline font-medium">Ver todos &rarr;</button>
            </div>
            <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-4 text-blue-600 mb-2">
                    <i data-lucide="building-2" class="w-8 h-8"></i>
                    <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Empresas</h3>
                </div>
                <p class="text-3xl font-bold text-slate-800 dark:text-slate-100">${emps}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">CNPJs geradores</p>
                <button onclick="navigate('empresas')" class="mt-4 text-sm text-primary hover:underline font-medium">Gerenciar &rarr;</button>
            </div>
            <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-4 text-violet-600 mb-2">
                    <i data-lucide="laptop" class="w-8 h-8"></i>
                    <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Equipamentos</h3>
                </div>
                <div class="flex gap-4 mt-2">
                    <div>
                        <p class="text-3xl font-bold text-slate-800 dark:text-slate-100">${eqpsDisponiveis}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">Disponíveis</p>
                    </div>
                    <div class="border-l border-slate-200 dark:border-slate-700 pl-4">
                        <p class="text-3xl font-bold text-slate-800 dark:text-slate-100">${eqpsEmUso}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">Em Uso</p>
                    </div>
                </div>
                <button onclick="navigate('equipamentos')" class="mt-4 text-sm text-primary hover:underline font-medium">Gerenciar &rarr;</button>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <div class="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="file-plus-2" class="w-8 h-8"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Novo Termo Rápido</h3>
            <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Vá até a aba de funcionários para selecionar para quem você deseja gerar um novo termo de responsabilidade de equipamentos.</p>
            <button onclick="navigate('funcionarios')" class="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                <i data-lucide="arrow-right-circle" class="w-5 h-5"></i>
                Ir para Funcionários
            </button>
        </div>
    `;
};

// --- Empresas ---
const renderEmpresas = (container, headerActions) => {
    headerActions.innerHTML = `
        <button id="btn-add-empresa" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">
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
                    <tr class="border-b border-slate-100 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
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

        document.querySelectorAll('.btn-delete-empresa').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Tem certeza que deseja remover esta empresa?')) {
                    await removeEmpresa(id);
                    renderTable();
                }
            });
        });
    };

    renderTable();

    document.getElementById('btn-add-empresa').addEventListener('click', () => {
        const formHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Adicionar Empresa</h3>
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
                        <button type="submit" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        showModal(formHTML);

        document.getElementById('form-empresa').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await addEmpresa({
                nome: formData.get('nome'),
                cnpj: formData.get('cnpj'),
                cidade: formData.get('cidade'),
                uf: formData.get('uf').toUpperCase()
            });
            hideModal();
            renderTable();
        });
        document.querySelector('.btn-cancel').addEventListener('click', hideModal);
    });
};

// --- Equipamentos ---
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
            <button id="btn-add-equipamento" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2 ml-auto">
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
                    alert('Não é possível remover um equipamento que está atualmente em uso. Devolva-o primeiro no perfil do funcionário.');
                    return;
                }
                if (confirm('Tem certeza que deseja remover este equipamento?')) {
                    await removeEquipamento(id);
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
                    alert('Cadastre um funcionário primeiro para poder alocar o equipamento.');
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
                                <button type="submit" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">Confirmar Alocação</button>
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
                        alert('Selecione um funcionário da lista.');
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
                        <button type="submit" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">Salvar</button>
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

// --- Funcionarios ---
const renderFuncionarios = (container, headerActions) => {
    headerActions.innerHTML = `
        <div class="flex flex-wrap items-center gap-4">
            <div class="relative">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input type="text" id="search-func" placeholder="Buscar funcionário..." class="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none w-64 lg:w-80 dark:text-slate-100 dark:bg-slate-900">
            </div>
            <button id="btn-add-func" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                <i data-lucide="user-plus" class="w-4 h-4"></i>
                Novo Funcionário
            </button>
        </div>
    `;

    const renderTable = (filterText = '') => {
        let funcionarios = getFuncionarios();
        if (filterText) {
            const lowerFilter = filterText.toLowerCase();
            funcionarios = funcionarios.filter(f =>
                f.nome.toLowerCase().includes(lowerFilter) ||
                f.funcao.toLowerCase().includes(lowerFilter)
            );
        }
        let tableHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                            <th class="py-3 px-6 font-semibold">Nome Completo</th>
                            <th class="py-3 px-6 font-semibold">Função/Cargo</th>
                            <th class="py-3 px-6 font-semibold">Data Admissão</th>
                            <th class="py-3 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (funcionarios.length === 0) {
            tableHTML += `<tr><td colspan="4" class="py-6 text-center text-slate-500 dark:text-slate-400">Nenhum funcionário cadastrado. Clique no botão acima para adicionar.</td></tr>`;
        } else {
            funcionarios.forEach(f => {
                tableHTML += `
                    <tr class="border-b border-slate-100 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                        <td class="py-4 px-6 font-medium text-slate-800 dark:text-slate-100">${f.nome}</td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300">${f.funcao}</td>
                        <td class="py-4 px-6 text-slate-600 dark:text-slate-300">${formatInputDate(f.dataAdmissao)}</td>
                        <td class="py-4 px-6 text-right flex justify-end gap-2">
                            <button onclick="renderFuncionarioPerfil('${f.id}')" class="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1" title="Visualizar Histórico e Devoluções">
                                <i data-lucide="clock" class="w-4 h-4"></i> Perfil
                            </button>
                            <button onclick="navigate('gerador_termo', { funcId: '${f.id}' })" class="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                                <i data-lucide="file-text" class="w-4 h-4"></i> Gerar Termo
                            </button>
                            <button data-id="${f.id}" class="btn-delete-func text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Remover">
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

        document.querySelectorAll('.btn-delete-func').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Remover funcionário? Isso não apagará termos já gerados ou impressos, mas o removerá da base.')) {
                    await removeFuncionario(id);
                    renderTable();
                }
            });
        });
    };

    renderTable();

    document.getElementById('search-func').addEventListener('input', debounce((e) => {
        renderTable(e.target.value);
    }, 300));

    document.getElementById('btn-add-func').addEventListener('click', () => {
        const formHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Cadastrar Funcionário</h3>
                <form id="form-func" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nome Completo</label>
                        <input type="text" name="nome" required class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Função / Cargo</label>
                        <input type="text" name="funcao" required class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Data de Admissão</label>
                        <input type="date" name="dataAdmissao" required class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                    </div>
                    <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" class="btn-cancel bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">Cancelar</button>
                        <button type="submit" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        showModal(formHTML);

        document.getElementById('form-func').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await addFuncionario({
                nome: formData.get('nome'),
                funcao: formData.get('funcao'),
                dataAdmissao: formData.get('dataAdmissao')
            });
            hideModal();
            renderTable(document.getElementById('search-func')?.value || '');
        });
        document.querySelector('.btn-cancel').addEventListener('click', hideModal);
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
            if (h.tipo === 'DEVOLUCAO_COMPLETA' && h.equipamentosIds) {
                const eqps = h.equipamentosIds.map(eId => equipamentos.find(e => e.id === eId) || { descricao: 'Equipamento Excluído', modeloMarca: '' });
                eqpContent = `<p class="text-sm font-medium text-slate-800 dark:text-slate-100">${acao} múltiplos itens:</p>
                              <div class="mt-1 space-y-1 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                                ${eqps.map(eq => `<div><span class="font-bold text-slate-900 dark:text-slate-100">${eq.descricao}</span> <span class="text-xs text-slate-500 dark:text-slate-400">(${eq.modeloMarca})</span></div>`).join('')}
                              </div>`;
            } else {
                const eqp = equipamentos.find(e => e.id === h.equipamentoId) || { descricao: 'Equipamento Excluído', modeloMarca: '' };
                eqpContent = `<p class="text-sm font-medium text-slate-800 dark:text-slate-100">${acao} <span class="font-bold text-slate-900 dark:text-slate-100">${eqp.descricao}</span></p>
                              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${eqp.modeloMarca}</p>`;
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

    const posseHTML = equipamentosEmPosse.length === 0 ?
        '<p class="text-sm text-slate-500 dark:text-slate-400 py-4 text-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">Nenhum equipamento em posse atualmente.</p>' :
        `<div class="space-y-3">
             ${equipamentosEmPosse.map(eqp => `
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
             `).join('')}
         </div>`;

    const html = `
        <div class="flex flex-col h-[85vh] max-h-[800px]">
            <!-- Header Fixa -->
            <div class="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 flex justify-between items-start">
                <div>
                    <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100">${funcionario.nome}</h3>
                    <p class="text-slate-500 dark:text-slate-400">${funcionario.funcao} &bull; Admissão: ${formatInputDate(funcionario.dataAdmissao)}</p>
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

    showModal(html);
    if (window.lucide) window.lucide.createIcons();

    // Eventos de Devolução
    document.querySelectorAll('.btn-devolver').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const eqpId = e.currentTarget.dataset.eqpid;
            const eqp = getEquipamentoById(eqpId);

            if (confirm(`Confirmar devolução de ${eqp.descricao}? O equipamento ficará disponível no estoque.`)) {
                // 1. Atualizar status do equipamento
                await editEquipamento(eqpId, { status: 'DISPONIVEL', funcionarioId: null });

                // 2. Registrar no histórico
                await addHistorico({
                    tipo: 'DEVOLUCAO',
                    funcionarioId: id,
                    equipamentoId: eqpId,
                    data: new Date().toISOString().split('T')[0]
                });

                // 3. Atualizar a tela
                renderFuncionarioPerfil(id);
                // Atualizar tabela por trás se o usuário estiver na tela de funcionários
                const currentView = document.querySelector('a.nav-btn.active')?.dataset.view;
                if (currentView === 'funcionarios') {
                    renderFuncionarios(document.getElementById('content-area'), document.getElementById('header-actions'));
                } else if (currentView === 'equipamentos') {
                    renderEquipamentos(document.getElementById('content-area'), document.getElementById('header-actions'));
                }
            }
        });
    });

    const btnDevolverTodos = document.getElementById('btn-devolver-todos');
    if (btnDevolverTodos) {
        btnDevolverTodos.addEventListener('click', async () => {
            if (confirm('Confirmar devolução COMPLETA de todos os equipamentos em posse deste funcionário?')) {
                const todayStrInput = new Date().toISOString().split('T')[0];
                const dataRealStr = formatInputDate(todayStrInput);
                const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                // 1. Atualizar e Histórico
                for (const eqp of equipamentosEmPosse) {
                    await editEquipamento(eqp.id, { status: 'DISPONIVEL', funcionarioId: null });
                }

                await addHistorico({
                    tipo: 'DEVOLUCAO_COMPLETA',
                    funcionarioId: id,
                    equipamentosIds: equipamentosEmPosse.map(e => e.id),
                    data: todayStrInput
                });

                // 2. Gerar Recibo de Devolução (PDF Window)
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    const html = `
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
                                ${equipamentosEmPosse.map(eqp => `
                                    <tr>
                                        <td><strong>${eqp.descricao}</strong></td>
                                        <td>${eqp.modeloMarca}</td>
                                        <td>(   ) OK  (   ) Avariado</td>
                                    </tr>
                                `).join('')}
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
                    printWindow.document.write(html);
                    printWindow.document.close();
                } else {
                    alert('Os equipamentos foram devolvidos, mas não foi possível abrir o Recibo (pop-up bloqueado).');
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

// --- Emissão de Termo ---
const renderGeradorTermo = (container, headerActions, params) => {
    const funcionarioId = params?.funcId;
    if (!funcionarioId) {
        navigate('funcionarios');
        return;
    }

    const funcionario = getFuncionarioById(funcionarioId);
    if (!funcionario) {
        alert('Funcionário não encontrado');
        navigate('funcionarios');
        return;
    }

    const empresas = getEmpresas();
    // Apenas equipamentos disponíveis
    const equipamentosDB = getEquipamentos().filter(e => e.status === 'DISPONIVEL');

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
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100">
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
                                ${empresas.length === 0 ?
            `<div class="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                                    <i data-lucide="alert-triangle" class="w-5 h-5 mt-0.5"></i>
                                    <div>
                                        <p class="font-medium">Nenhuma empresa cadastrada</p>
                                        <p class="text-sm mt-1">É necessário cadastrar ao menos uma empresa antes de gerar um termo.</p>
                                        <button type="button" onclick="navigate('empresas')" class="mt-2 text-amber-900 font-medium text-sm hover:underline">Ir para cadastros &rarr;</button>
                                    </div>
                                </div>`
            :
            `<div class="space-y-3">
                                    ${empresas.map(emp => `
                                        <label class="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:bg-slate-900/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50/50">
                                            <input type="radio" name="empresaId" value="${emp.id}" required class="w-4 h-4 text-primary border-slate-300 dark:border-slate-600 focus:ring-primary dark:text-slate-100 dark:bg-slate-900">
                                            <div class="ml-3 flex-1 flex justify-between items-center">
                                                <span class="font-medium text-slate-800 dark:text-slate-100">${emp.nome}</span>
                                                <span class="text-sm text-slate-500 dark:text-slate-400">${formatCNPJ(emp.cnpj)}</span>
                                            </div>
                                        </label>
                                    `).join('')}
                                </div>`
        }
                            </div>

                            <!-- Seleção de Equipamentos -->
                            <div class="mb-8">
                                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-slate-100 pb-3 gap-3">
                                    <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider">3. Equipamentos Entregues</h4>
                                    ${equipamentosDB.length > 0 ? `
                                <div class="relative w-full sm:w-64">
                                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                                    <input type="text" id="search-termo-eqp" placeholder="Buscar equipamento..." class="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-sm focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                                </div>` : ''}
                                </div>

                                ${equipamentosDB.length === 0 ?
            `<div class="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                                    <i data-lucide="alert-triangle" class="w-5 h-5 mt-0.5"></i>
                                    <div>
                                        <p class="font-medium">Nenhum equipamento disponível</p>
                                        <p class="text-sm mt-1">Todos os equipamentos estão em uso ou nenhum foi cadastrado.</p>
                                        <button type="button" onclick="navigate('equipamentos')" class="mt-2 text-amber-900 font-medium text-sm hover:underline">Ir para cadastros &rarr;</button>
                                    </div>
                                </div>`
            :
            `<div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="equipamentos-grid-container">
                                    ${equipamentosDB.map(eqp => `
                                        <label class="eqp-item flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:bg-slate-900/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50/50">
                                            <input type="checkbox" name="equipamentos" value="${eqp.id}" class="mt-1 w-4 h-4 text-primary border-slate-300 dark:border-slate-600 rounded focus:ring-primary checkbox-eqp dark:text-slate-100 dark:bg-slate-900">
                                            <div class="ml-3 flex-1 eqp-item-text">
                                                <span class="block font-medium text-slate-800 dark:text-slate-100">${eqp.descricao}</span>
                                                <span class="block text-sm text-slate-500 dark:text-slate-400">${eqp.modeloMarca}</span>
                                            </div>
                                        </label>
                                    `).join('')}
                                </div>`
        }
                            </div>

                            <div class="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                <button type="submit" id="btn-gerar" class="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed" ${(empresas.length === 0 || equipamentosDB.length === 0) ? 'disabled' : ''}>
                                    <i data-lucide="printer" class="w-5 h-5"></i>
                                    Imprimir / Salvar PDF
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
        </div >
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
            alert('Selecione pelo menos 1 equipamento.');
            return;
        }

        const empresaObj = getEmpresaById(empresaId);
        const equipamentosObjArray = eqpsIds.map(id => equipamentosDB.find(eq => eq.id === id));

        // Generate the print document
        generateAndPrintTermo(funcionario, empresaObj, equipamentosObjArray);

        // Update Equipment states to 'EM_USO' and add Handover History Log
        const todayStr = new Date().toISOString().split('T')[0];

        for (const eqp of equipamentosObjArray) {
            // Update equipment
            await editEquipamento(eqp.id, {
                status: 'EM_USO',
                funcionarioId: funcionario.id
            });

            // Add history
            await addHistorico({
                tipo: 'ENTREGA',
                funcionarioId: funcionario.id,
                equipamentoId: eqp.id,
                data: todayStr
            });
        }

        // Redirect back to employees page after small delay to let print open safely
        setTimeout(() => {
            navigate('funcionarios');
        }, 500);
    });
};

// --- Histórico Geral ---
const renderHistoricoGeral = (container, headerActions, filters = {}) => {
    headerActions.innerHTML = `
        <div class="flex flex-col sm:flex-row items-center gap-3">
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 shadow-sm">
                <i data-lucide="filter" class="w-4 h-4 text-slate-400"></i>
                <input type="date" id="filter-hist-start" value="${filters.start || ''}" class="border-none bg-transparent py-2 focus:ring-0 text-slate-700 dark:text-slate-200 outline-none w-[120px] text-xs sm:text-sm cursor-pointer">
                <span class="text-slate-300">até</span>
                <input type="date" id="filter-hist-end" value="${filters.end || ''}" class="border-none bg-transparent py-2 focus:ring-0 text-slate-700 dark:text-slate-200 outline-none w-[120px] text-xs sm:text-sm cursor-pointer">
            </div>
            <div class="flex items-center gap-2">
                <button id="btn-print-historico" class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                    <i data-lucide="printer" class="w-4 h-4"></i>
                    <span class="hidden sm:inline">Imprimir Relatório</span>
                    <span class="sm:hidden">Imprimir</span>
                </button>
                <button id="btn-clear-historico" class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2 border border-red-100" title="Apagar todo o histórico">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;

    let historico = getHistorico().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Aplicar Filtros de Data
    if (filters.start) {
        historico = historico.filter(h => h.data >= filters.start);
    }
    if (filters.end) {
        historico = historico.filter(h => h.data <= filters.end);
    }

    // --- Agrupar Entregas Simultâneas ---
    const agrupadoHistorico = [];
    let currentGroup = null;

    historico.forEach(h => {
        // Se for entrega (via gerador de termo) podemos tentar agrupar
        // Agrupa se: mesmo funcionario, tipo (ENTREGA) e timestamp exato
        if (h.tipo === 'ENTREGA') {
            if (!currentGroup) {
                currentGroup = {
                    tipo: 'ENTREGA_AGRUPADA',
                    funcionarioId: h.funcionarioId,
                    data: h.data,
                    timestamp: h.timestamp,
                    equipamentosIds: [h.equipamentoId]
                };
            } else if (
                currentGroup.funcionarioId === h.funcionarioId &&
                currentGroup.timestamp === h.timestamp
            ) {
                currentGroup.equipamentosIds.push(h.equipamentoId);
            } else {
                agrupadoHistorico.push(currentGroup);
                currentGroup = {
                    tipo: 'ENTREGA_AGRUPADA',
                    funcionarioId: h.funcionarioId,
                    data: h.data,
                    timestamp: h.timestamp,
                    equipamentosIds: [h.equipamentoId]
                };
            }
        } else {
            // Se não é ENTREGA, salva qualquer grupo aberto de entrega e insere o comum
            if (currentGroup) {
                agrupadoHistorico.push(currentGroup);
                currentGroup = null;
            }
            agrupadoHistorico.push(h);
        }
    });

    if (currentGroup) {
        agrupadoHistorico.push(currentGroup);
    }
    // ------------------------------------

    const equipamentos = getEquipamentos();
    const funcionarios = getFuncionarios();

    // Event for printing
    setTimeout(() => {
        document.getElementById('btn-print-historico')?.addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Por favor, permita pop-ups para imprimir o relatório.');
                return;
            }

            const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Histórico de Movimentações - Limbus</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; color: #000; }
                    .print-header { text-align: center; margin-bottom: 30px; }
                    .print-header h1 { font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin: 0 0 15px 0; font-weight: normal; }
                    .print-header h2 { font-size: 22px; margin: 0 0 5px 0; }
                    .print-header p { color: #555; font-size: 14px; margin: 0; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f8fafc; font-weight: bold; text-transform: uppercase; font-size: 11px; }
                    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
                    .badge.entrega { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
                    .badge.alocacao { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
                    .badge.devolucao { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
                    @page { margin: 0; }
                    @media print { body { padding: 0; margin: 1.5cm; } }
                </style>
            </head>
            <body onload="window.print()">
                <div class="print-header">
                    <h1>Limbus</h1>
                    <h2>Histórico Geral de Movimentações</h2>
                    <p>Relatório completo de entregas e devoluções de equipamentos.</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Data / Hora</th>
                            <th>Tipo de Evento</th>
                            <th>Funcionário</th>
                            <th>Equipamento</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${agrupadoHistorico.length === 0 ? '<tr><td colspan="4" style="text-align:center;">Nenhum evento registrado.</td></tr>' : ''}
                        ${agrupadoHistorico.map(h => {
                const fnc = funcionarios.find(f => f.id === h.funcionarioId) || { nome: 'Func. Excluído' };
                const dataStr = formatInputDate(h.data);
                const timeStr = new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                let badgeClass = '', badgeLabel = '';
                if (h.tipo === 'ENTREGA' || h.tipo === 'ENTREGA_AGRUPADA') { badgeClass = 'entrega'; badgeLabel = 'Entrega'; }
                else if (h.tipo === 'ALOCACAO_MANUAL') { badgeClass = 'alocacao'; badgeLabel = 'Alocação Manual'; }
                else if (h.tipo === 'DEVOLUCAO' || h.tipo === 'DEVOLUCAO_COMPLETA') { badgeClass = 'devolucao'; badgeLabel = 'Devolução'; }

                let eqpContent = '';
                if ((h.tipo === 'DEVOLUCAO_COMPLETA' || h.tipo === 'ENTREGA_AGRUPADA') && h.equipamentosIds) {
                    const eqps = h.equipamentosIds.map(eId => equipamentos.find(e => e.id === eId) || { descricao: 'Equip. Excluído', modeloMarca: '' });
                    eqpContent = eqps.map(eq => `<strong>${eq.descricao}</strong><br><span style="color:#666; font-size:11px;">${eq.modeloMarca}</span>`).join('<div style="margin: 5px 0; border-top: 1px dotted #ccc;"></div>');
                } else {
                    const eqp = equipamentos.find(e => e.id === h.equipamentoId) || { descricao: 'Equip. Excluído', modeloMarca: '' };
                    eqpContent = `<strong>${eqp.descricao}</strong><br><span style="color:#666; font-size:11px;">${eqp.modeloMarca}</span>`;
                }

                return `
                                <tr>
                                    <td><strong>${dataStr}</strong><br><span style="color:#666; font-size:11px;">${timeStr}</span></td>
                                    <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
                                    <td><strong>${fnc.nome}</strong></td>
                                    <td>${eqpContent}</td>
                                </tr>
                             `;
            }).join('')}
                    </tbody>
                </table>
            </body>
            </html>
            `;
            printWindow.document.write(html);
            printWindow.document.close();
        });
    }, 100);

    let tableHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                        <th class="py-3 px-6 font-semibold">Data / Hora</th>
                        <th class="py-3 px-6 font-semibold">Tipo de Evento</th>
                        <th class="py-3 px-6 font-semibold">Funcionário</th>
                        <th class="py-3 px-6 font-semibold">Equipamento</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (agrupadoHistorico.length === 0) {
        tableHTML += `<tr><td colspan="4" class="py-12 text-center text-slate-500 dark:text-slate-400">
            <i data-lucide="inbox" class="w-12 h-12 mx-auto text-slate-300 mb-3"></i>
            Nenhum evento registrado no histórico ainda.
        </td></tr>`;
    } else {
        agrupadoHistorico.forEach(h => {
            const fnc = funcionarios.find(f => f.id === h.funcionarioId) || { nome: 'Func. Excluído' };

            const dataStr = formatInputDate(h.data);
            const timeStr = new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            let badge = '';
            if (h.tipo === 'ENTREGA' || h.tipo === 'ENTREGA_AGRUPADA') {
                badge = `<span class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800"><i data-lucide="arrow-down-right" class="w-3.5 h-3.5"></i> Entrega</span>`;
            } else if (h.tipo === 'ALOCACAO_MANUAL') {
                badge = `<span class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold bg-blue-100 text-blue-800"><i data-lucide="user-check" class="w-3.5 h-3.5"></i> Alocação Manual</span>`;
            } else if (h.tipo === 'DEVOLUCAO' || h.tipo === 'DEVOLUCAO_COMPLETA') {
                badge = `<span class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold bg-amber-100 text-amber-800"><i data-lucide="arrow-up-left" class="w-3.5 h-3.5"></i> Devolução</span>`;
            }

            let eqpContent = '';
            if ((h.tipo === 'DEVOLUCAO_COMPLETA' || h.tipo === 'ENTREGA_AGRUPADA') && h.equipamentosIds) {
                const eqps = h.equipamentosIds.map(eId => equipamentos.find(e => e.id === eId) || { descricao: 'Equip. Excluído', modeloMarca: '' });
                eqpContent = eqps.map(eq => `<span class="block text-slate-800 dark:text-slate-100 font-medium">${eq.descricao}</span><span class="block text-xs text-slate-500 dark:text-slate-400">${eq.modeloMarca}</span>`).join('<div class="my-2 border-t border-slate-100"></div>');
            } else {
                const eqp = equipamentos.find(e => e.id === h.equipamentoId) || { descricao: 'Equip. Excluído', modeloMarca: '' };
                eqpContent = `<span class="block text-slate-800 dark:text-slate-100 font-medium">${eqp.descricao}</span><span class="block text-xs text-slate-500 dark:text-slate-400">${eqp.modeloMarca}</span>`;
            }

            tableHTML += `
                <tr class="border-b border-slate-100 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                    <td class="py-4 px-6 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <span class="font-medium text-slate-800 dark:text-slate-100">${dataStr}</span>
                        <span class="text-xs text-slate-400 block">${timeStr}</span>
                    </td>
                    <td class="py-4 px-6">${badge}</td>
                    <td class="py-4 px-6 font-medium text-slate-800 dark:text-slate-100">${fnc.nome}</td>
                    <td class="py-4 px-6">
                        ${eqpContent}
                    </td>
                </tr>
             `;
        });
    }

    tableHTML += `</tbody></table></div>`;

    // Desktop View Additions
    tableHTML = `
        <div class="mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Histórico de Movimentações</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Acompanhamento completo de entregas e devoluções de equipamentos na empresa.</p>
        </div>
        ${tableHTML}
    `;

    container.innerHTML = tableHTML;
    if (window.lucide) window.lucide.createIcons();

    // Filtros de Data Events
    const startInput = document.getElementById('filter-hist-start');
    const endInput = document.getElementById('filter-hist-end');

    const updateFilters = () => {
        renderHistoricoGeral(container, headerActions, {
            start: startInput.value,
            end: endInput.value
        });
    };

    startInput?.addEventListener('change', updateFilters);
    endInput?.addEventListener('change', updateFilters);

    // Apagar Histórico Event
    document.getElementById('btn-clear-historico')?.addEventListener('click', async () => {
        if (confirm('Tem certeza absoluta que deseja APAGAR TODO O HISTÓRICO? Esta ação não pode ser desfeita.')) {
            await clearHistorico();
            renderHistoricoGeral(container, headerActions);
        }
    });
};
