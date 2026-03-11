// js/views.js

// --- Dashboard ---
const renderDashboard = (container, headerActions) => {
    const fncs = getFuncionarios().length;
    const emps = getEmpresas().length;
    const equipamentos = getEquipamentos();
    const eqps = equipamentos.length;
    const eqpsEmUso = equipamentos.filter(e => e.status === 'EM_USO').length;
    const eqpsDisponiveis = eqps - eqpsEmUso;
    const usagePercent = eqps > 0 ? Math.round((eqpsEmUso / eqps) * 100) : 0;

    // Recent activity
    const historico = getHistorico().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
    const funcionarios = getFuncionarios();

    const activityHTML = historico.length === 0
        ? '<p class="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">Nenhuma atividade recente.</p>'
        : historico.map(h => {
            const fnc = funcionarios.find(f => f.id === h.funcionarioId) || { nome: 'Desconhecido' };
            const dataStr = formatInputDate(h.data);
            let dotColor = '', label = '';
            if (h.tipo === 'ENTREGA' || h.tipo === 'ALOCACAO_MANUAL') { dotColor = 'bg-emerald-500'; label = 'Entrega'; }
            else { dotColor = 'bg-amber-500'; label = 'Devolução'; }
            const eqpCount = h.equipamentosIds?.length || 1;
            return `
                <div class="activity-item">
                    <span class="activity-dot ${dotColor}"></span>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-slate-700 dark:text-slate-200 truncate"><strong>${fnc.nome.split(' ')[0]}</strong> — ${label} (${eqpCount} item${eqpCount > 1 ? 's' : ''})</p>
                        <p class="text-xs text-slate-400 dark:text-slate-500">${dataStr}</p>
                    </div>
                </div>`;
        }).join('');

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="stat-card stagger-1" style="opacity:0; animation: fade-in-up 0.4s ease forwards 0ms">
                <div class="flex items-center gap-4 mb-3">
                    <div class="card-icon card-icon-green"><i data-lucide="users" class="w-6 h-6"></i></div>
                    <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Funcionários</h3>
                </div>
                <p class="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">${fncs}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">Cadastrados no sistema</p>
                <button onclick="navigate('funcionarios')" class="mt-4 text-sm text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1 group transition-colors">
                    Ver todos <i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1"></i>
                </button>
            </div>
            <div class="stat-card stagger-2" style="opacity:0; animation: fade-in-up 0.4s ease forwards 80ms">
                <div class="flex items-center gap-4 mb-3">
                    <div class="card-icon card-icon-blue"><i data-lucide="building-2" class="w-6 h-6"></i></div>
                    <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Empresas</h3>
                </div>
                <p class="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">${emps}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">CNPJs geradores</p>
                <button onclick="navigate('empresas')" class="mt-4 text-sm text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1 group transition-colors">
                    Gerenciar <i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1"></i>
                </button>
            </div>
            <div class="stat-card stagger-3" style="opacity:0; animation: fade-in-up 0.4s ease forwards 160ms">
                <div class="flex items-center gap-4 mb-3">
                    <div class="card-icon card-icon-violet"><i data-lucide="laptop" class="w-6 h-6"></i></div>
                    <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Equipamentos</h3>
                </div>
                <div class="flex gap-6 mb-3">
                    <div>
                        <p class="text-4xl font-extrabold text-slate-800 dark:text-slate-100">${eqpsDisponiveis}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">Disponíveis</p>
                    </div>
                    <div class="border-l border-slate-200 dark:border-slate-700 pl-6">
                        <p class="text-4xl font-extrabold text-slate-800 dark:text-slate-100">${eqpsEmUso}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">Em Uso</p>
                    </div>
                </div>
                ${eqps > 0 ? `
                <div class="mt-2">
                    <div class="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
                        <span>Utilização</span><span>${usagePercent}%</span>
                    </div>
                    <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${usagePercent}%"></div></div>
                </div>` : ''}
                <button onclick="navigate('equipamentos')" class="mt-4 text-sm text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1 group transition-colors">
                    Gerenciar <i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1"></i>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" style="opacity:0; animation: fade-in-up 0.4s ease forwards 240ms">
            <div class="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50">
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="activity" class="w-5 h-5 text-indigo-500"></i>
                    <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Atividade Recente</h3>
                </div>
                ${activityHTML}
                ${historico.length > 0 ? `<button onclick="navigate('historico')" class="mt-3 text-sm text-indigo-500 hover:text-indigo-400 font-semibold transition-colors">Ver histórico completo →</button>` : ''}
            </div>

            <div class="bg-white dark:bg-slate-800/50 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 text-center flex flex-col items-center justify-center">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                    <i data-lucide="file-plus-2" class="w-7 h-7 text-white"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Novo Termo Rápido</h3>
                <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm">Selecione um funcionário para gerar um novo termo de responsabilidade de equipamentos.</p>
                <button onclick="navigate('funcionarios')" class="btn-primary px-6 py-3 text-base">
                    <i data-lucide="arrow-right-circle" class="w-5 h-5"></i>
                    Ir para Funcionários
                </button>
            </div>
        </div>
    `;
};
// --- Empresas ---
const renderEmpresas = (container, headerActions) => {
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
                const ok = await showConfirm('Tem certeza que deseja remover esta empresa?', { title: 'Remover empresa', type: 'danger', confirmText: 'Remover' });
                if (ok) {
                    await removeEmpresa(id);
                    showToast('Empresa removida com sucesso.', 'success');
                    renderTable();
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

// --- Funcionarios ---
const renderFuncionarios = (container, headerActions) => {
    headerActions.innerHTML = `
        <div class="flex flex-wrap items-center gap-4">
            <div class="relative">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input type="text" id="search-func" placeholder="Buscar funcionário..." class="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none w-64 lg:w-80 dark:text-slate-100 dark:bg-slate-900">
            </div>
            <button id="btn-import-planilha" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                Importar Planilha
            </button>
            <button id="btn-add-func" class="btn-primary">
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
                            <button data-id="${f.id}" class="btn-edit-func text-slate-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors" title="Editar">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
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
                const ok = await showConfirm('Remover funcionário? Isso não apagará termos já gerados, mas o removerá da base.', { title: 'Remover funcionário', type: 'danger', confirmText: 'Remover' });
                if (ok) {
                    await removeFuncionario(id);
                    showToast('Funcionário removido com sucesso.', 'success');
                    renderTable();
                }
            });
        });

        // Botões de Editar
        document.querySelectorAll('.btn-edit-func').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const func = getFuncionarioById(id);
                if (!func) return;

                const formHTML = `
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Editar Funcionário</h3>
                        <form id="form-edit-func" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nome Completo</label>
                                <input type="text" name="nome" required value="${func.nome}" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Função / Cargo</label>
                                <input type="text" name="funcao" required value="${func.funcao}" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Data de Admissão</label>
                                <input type="date" name="dataAdmissao" required value="${func.dataAdmissao}" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                            </div>
                            <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" class="btn-cancel bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">Cancelar</button>
                                <button type="submit" class="btn-primary">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                `;

                showModal(formHTML);

                document.getElementById('form-edit-func').addEventListener('submit', async (ev) => {
                    ev.preventDefault();
                    const formData = new FormData(ev.target);
                    await editFuncionario(id, {
                        nome: formData.get('nome'),
                        funcao: formData.get('funcao'),
                        dataAdmissao: formData.get('dataAdmissao')
                    });
                    hideModal();
                    renderTable(document.getElementById('search-func')?.value || '');
                });
                document.querySelector('.btn-cancel').addEventListener('click', hideModal);
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
                        <button type="submit" class="btn-primary">Salvar</button>
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

    // --- Importar Planilha ---
    document.getElementById('btn-import-planilha').addEventListener('click', () => {
        const modalHTML = `
            <div class="p-6 max-h-[85vh] flex flex-col">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Importar Planilha</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Importe funcionários de um arquivo Excel (.xlsx, .xls) ou CSV.</p>
                    </div>
                    <button onclick="hideModal()" class="text-slate-400 hover:text-slate-600 dark:text-slate-300 p-1"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <!-- Etapa 1: Upload -->
                <div id="import-step-upload">
                    <div id="dropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                        <i data-lucide="upload-cloud" class="w-12 h-12 text-slate-400 mx-auto mb-4"></i>
                        <p class="text-slate-700 dark:text-slate-200 font-medium mb-1">Arraste seu arquivo aqui</p>
                        <p class="text-sm text-slate-500 dark:text-slate-400">ou clique para selecionar</p>
                        <p class="text-xs text-slate-400 mt-3">Formatos aceitos: .xlsx, .xls, .csv</p>
                        <input type="file" id="file-input-planilha" accept=".xlsx,.xls,.csv" class="hidden">
                    </div>
                    <div id="import-error" class="hidden mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200"></div>
                </div>

                <!-- Etapa 2: Preview -->
                <div id="import-step-preview" class="hidden flex flex-col flex-1 overflow-hidden">
                    <div id="import-file-info" class="bg-emerald-50 text-emerald-800 p-3 rounded-lg mb-4 text-sm border border-emerald-200 flex items-center gap-2">
                        <i data-lucide="file-check" class="w-4 h-4"></i>
                        <span id="import-file-name"></span>
                    </div>
                    <div id="import-sheets-container" class="overflow-y-auto flex-1 space-y-3 mb-4"></div>
                    <div id="import-summary" class="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-200 mb-4">
                        <span id="import-total-count"></span>
                    </div>
                    <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button id="btn-import-back" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">Voltar</button>
                        <button id="btn-import-confirm" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                            <i data-lucide="download" class="w-4 h-4"></i>
                            Importar
                        </button>
                    </div>
                </div>

                <!-- Etapa 3: Resultado -->
                <div id="import-step-result" class="hidden text-center py-8">
                    <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="check-circle" class="w-8 h-8"></i>
                    </div>
                    <h4 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2" id="import-result-title"></h4>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-6" id="import-result-desc"></p>
                    <button onclick="hideModal()" class="btn-primary">Fechar</button>
                </div>
            </div>
        `;

        showModal(modalHTML);
        if (window.lucide) window.lucide.createIcons();

        // --- Estado do Import ---
        let parsedSheets = []; // [ { name, data: [{ nome, funcao, dataAdmissao }] } ]

        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('file-input-planilha');
        const errorDiv = document.getElementById('import-error');

        // Converter serial de data do Excel para string YYYY-MM-DD
        const excelDateToString = (serial) => {
            if (!serial) return '';
            // Se já for string no formato de data, tentar converter
            if (typeof serial === 'string') {
                // Formato DD/MM/YYYY
                const parts = serial.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                if (parts) return `${parts[3]}-${parts[2]}-${parts[1]}`;
                // Formato YYYY-MM-DD (já está ok)
                if (/^\d{4}-\d{2}-\d{2}$/.test(serial)) return serial;
                return serial;
            }
            // Serial numérico do Excel
            if (typeof serial === 'number') {
                const utcDays = Math.floor(serial - 25569);
                const utcValue = utcDays * 86400;
                const date = new Date(utcValue * 1000);
                const yyyy = date.getUTCFullYear();
                const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(date.getUTCDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }
            return '';
        };

        // Encontrar índice da coluna pelo cabeçalho (case insensitive, aceita variantes)
        const findColumnIndex = (headers, ...keywords) => {
            return headers.findIndex(h => {
                if (!h) return false;
                const normalized = String(h).trim().toUpperCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove acentos
                return keywords.some(kw => normalized.includes(kw));
            });
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
                        const sheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

                        if (jsonData.length < 2) return; // Precisa de cabeçalho + pelo menos 1 linha

                        // Detectar linha do cabeçalho (procurar "NOME" nas primeiras 5 linhas)
                        let headerRowIdx = -1;
                        for (let i = 0; i < Math.min(5, jsonData.length); i++) {
                            const row = jsonData[i];
                            const hasNome = row.some(cell => {
                                const val = String(cell).trim().toUpperCase()
                                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                                return val === 'NOME';
                            });
                            if (hasNome) {
                                headerRowIdx = i;
                                break;
                            }
                        }

                        if (headerRowIdx === -1) return; // Sem cabeçalho detectável

                        const headers = jsonData[headerRowIdx];
                        const nomeIdx = findColumnIndex(headers, 'NOME');
                        const setorIdx = findColumnIndex(headers, 'SETOR', 'FUNCAO', 'CARGO', 'DEPARTAMENTO');
                        const admissaoIdx = findColumnIndex(headers, 'ADMISSAO', 'DATA', 'ADMISSÃO');

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

                return `
                    <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4 ${sheet.selected ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700' : 'bg-white dark:bg-slate-800 opacity-60'}">
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" data-sheet-idx="${idx}" class="sheet-checkbox mt-1 w-4 h-4 text-emerald-600 border-slate-300 dark:border-slate-600 rounded focus:ring-emerald-500" ${sheet.selected ? 'checked' : ''}>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-semibold text-slate-800 dark:text-slate-100">${sheet.name}</span>
                                    <span class="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">${sheet.data.length} registros</span>
                                    ${dupCount > 0 ? `<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">${dupCount} já cadastrados</span>` : ''}
                                </div>
                                <p class="text-xs text-slate-500 dark:text-slate-400">${previewNames}${moreCount > 0 ? ` e mais ${moreCount}...` : ''}</p>
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
            document.getElementById('import-total-count').innerHTML = `<strong>${totalNew}</strong> novos funcionários serão importados (duplicados serão ignorados).`;
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

            const result = await bulkAddFuncionarios(toImport);

            // Mostrar resultado
            document.getElementById('import-step-preview').classList.add('hidden');
            document.getElementById('import-step-result').classList.remove('hidden');
            document.getElementById('import-result-title').textContent = `${result.count} funcionários importados!`;
            document.getElementById('import-result-desc').textContent = `Os funcionários foram adicionados ao sistema com sucesso.`;
            if (window.lucide) window.lucide.createIcons();

            // Atualizar tabela por trás do modal
            renderTable(document.getElementById('search-func')?.value || '');
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

            const ok = await showConfirm(`Confirmar devolução de ${eqp.descricao}? O equipamento ficará disponível no estoque.`, { title: 'Devolver equipamento', confirmText: 'Devolver' });
            if (ok) {
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
            const okAll = await showConfirm('Confirmar devolução COMPLETA de todos os equipamentos em posse deste funcionário?', { title: 'Devolução completa', type: 'danger', confirmText: 'Devolver Todos' });
            if (okAll) {
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

                            <!-- Data de Entrega -->
                            <div class="mb-8">
                                <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">4. Data de Entrega</h4>
                                <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">Informe a data real de entrega dos equipamentos. Por padrão, é a data de admissão.</p>
                                <input type="date" name="dataEntrega" id="input-data-entrega" value="${funcionario.dataAdmissao}" required class="w-full sm:w-64 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                            </div>

                            <div class="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                <button type="submit" id="btn-gerar" class="btn-primary text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed" ${(empresas.length === 0 || equipamentosDB.length === 0) ? 'disabled' : ''}>
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
            showToast('Selecione pelo menos 1 equipamento.', 'warning');
            return;
        }

        const empresaObj = getEmpresaById(empresaId);
        const equipamentosObjArray = eqpsIds.map(id => equipamentosDB.find(eq => eq.id === id));
        const dataEntrega = formData.get('dataEntrega');

        // Generate the print document with the custom delivery date
        generateAndPrintTermo(funcionario, empresaObj, equipamentosObjArray, dataEntrega);

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
            data: dataEntrega
        });

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

    // Histórico já vem com os dados corretos do banco (sem necessidade de agrupamento)

    const equipamentos = getEquipamentos();
    const funcionarios = getFuncionarios();
    // Usar o histórico diretamente, já que cada entrada representa uma ação real
    const agrupadoHistorico = historico;

    // Event for printing
    setTimeout(() => {
        document.getElementById('btn-print-historico')?.addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showToast('Por favor, permita pop-ups para imprimir o relatório.', 'warning');
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
                if (h.tipo === 'ENTREGA') { badgeClass = 'entrega'; badgeLabel = 'Entrega'; }
                else if (h.tipo === 'ALOCACAO_MANUAL') { badgeClass = 'alocacao'; badgeLabel = 'Alocação Manual'; }
                else if (h.tipo === 'DEVOLUCAO' || h.tipo === 'DEVOLUCAO_COMPLETA') { badgeClass = 'devolucao'; badgeLabel = 'Devolução'; }

                let eqpContent = '';
                if (h.equipamentosIds && h.equipamentosIds.length > 0) {
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
                        <th class="py-3 px-6 font-semibold text-right w-16"></th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (agrupadoHistorico.length === 0) {
        tableHTML += `<tr><td colspan="5" class="py-12 text-center text-slate-500 dark:text-slate-400">
            <i data-lucide="inbox" class="w-12 h-12 mx-auto text-slate-300 mb-3"></i>
            Nenhum evento registrado no histórico ainda.
        </td></tr>`;
    } else {
        agrupadoHistorico.forEach(h => {
            const fnc = funcionarios.find(f => f.id === h.funcionarioId) || { nome: 'Func. Excluído' };

            const dataStr = formatInputDate(h.data);
            const timeStr = new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            let badge = '';
            if (h.tipo === 'ENTREGA') {
                badge = `<span class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800"><i data-lucide="arrow-down-right" class="w-3.5 h-3.5"></i> Entrega</span>`;
            } else if (h.tipo === 'ALOCACAO_MANUAL') {
                badge = `<span class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold bg-blue-100 text-blue-800"><i data-lucide="user-check" class="w-3.5 h-3.5"></i> Alocação Manual</span>`;
            } else if (h.tipo === 'DEVOLUCAO' || h.tipo === 'DEVOLUCAO_COMPLETA') {
                badge = `<span class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold bg-amber-100 text-amber-800"><i data-lucide="arrow-up-left" class="w-3.5 h-3.5"></i> Devolução</span>`;
            }

            let eqpContent = '';
            if (h.equipamentosIds && h.equipamentosIds.length > 0) {
                const eqps = h.equipamentosIds.map(eId => equipamentos.find(e => e.id === eId) || { descricao: 'Equip. Excluído', modeloMarca: '' });
                eqpContent = eqps.map(eq => `<span class="block text-slate-800 dark:text-slate-100 font-medium">${eq.descricao}</span><span class="block text-xs text-slate-500 dark:text-slate-400">${eq.modeloMarca}</span>`).join('<div class="my-2 border-t border-slate-100"></div>');
            } else {
                const eqp = equipamentos.find(e => e.id === h.equipamentoId) || { descricao: 'Equip. Excluído', modeloMarca: '' };
                eqpContent = `<span class="block text-slate-800 dark:text-slate-100 font-medium">${eqp.descricao}</span><span class="block text-xs text-slate-500 dark:text-slate-400">${eqp.modeloMarca}</span>`;
            }

            // ID para deletar
            const deleteIds = h.id ? [h.id] : [];
            const deleteDataAttr = deleteIds.length > 0 ? `data-ids='${JSON.stringify(deleteIds)}'` : '';

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
                    <td class="py-4 px-6 text-right">
                        <button ${deleteDataAttr} class="btn-delete-hist text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors" title="Remover esta entrada">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
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

    // Remover entrada individual do Histórico
    document.querySelectorAll('.btn-delete-hist').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const idsStr = e.currentTarget.dataset.ids;
            if (!idsStr) return;
            const ids = JSON.parse(idsStr);

            const ok = await showConfirm('Remover esta entrada do histórico?', { title: 'Remover entrada', type: 'danger', confirmText: 'Remover' });
            if (ok) {
                for (const id of ids) {
                    await removeHistoricoEntry(id);
                }
                renderHistoricoGeral(container, headerActions, {
                    start: startInput?.value || '',
                    end: endInput?.value || ''
                });
            }
        });
    });

    // Apagar Histórico Event
    document.getElementById('btn-clear-historico')?.addEventListener('click', async () => {
        const ok = await showConfirm('Tem certeza absoluta que deseja APAGAR TODO O HISTÓRICO? Esta ação não pode ser desfeita.', { title: 'Apagar todo histórico', type: 'danger', confirmText: 'Apagar Tudo' });
        if (ok) {
            await clearHistorico();
            renderHistoricoGeral(container, headerActions);
        }
    });
};
