// js/views.js

// --- Dashboard ---
const renderDashboard = (container, headerActions) => {
    const fncs = getFuncionarios().length;
    const emps = getEmpresas().length;
    const eqps = getEquipamentos().length;

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div class="flex items-center gap-4 text-emerald-600 mb-2">
                    <i data-lucide="users" class="w-8 h-8"></i>
                    <h3 class="text-lg font-semibold text-slate-700">Funcionários</h3>
                </div>
                <p class="text-3xl font-bold text-slate-800">${fncs}</p>
                <p class="text-sm text-slate-500 mt-2">Cadastrados no sistema</p>
                <button onclick="navigate('funcionarios')" class="mt-4 text-sm text-primary hover:underline font-medium">Ver todos &rarr;</button>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div class="flex items-center gap-4 text-blue-600 mb-2">
                    <i data-lucide="building-2" class="w-8 h-8"></i>
                    <h3 class="text-lg font-semibold text-slate-700">Empresas</h3>
                </div>
                <p class="text-3xl font-bold text-slate-800">${emps}</p>
                <p class="text-sm text-slate-500 mt-2">CNPJs geradores</p>
                <button onclick="navigate('empresas')" class="mt-4 text-sm text-primary hover:underline font-medium">Gerenciar &rarr;</button>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div class="flex items-center gap-4 text-violet-600 mb-2">
                    <i data-lucide="laptop" class="w-8 h-8"></i>
                    <h3 class="text-lg font-semibold text-slate-700">Equipamentos</h3>
                </div>
                <p class="text-3xl font-bold text-slate-800">${eqps}</p>
                <p class="text-sm text-slate-500 mt-2">Itens pré-cadastrados</p>
                <button onclick="navigate('equipamentos')" class="mt-4 text-sm text-primary hover:underline font-medium">Gerenciar &rarr;</button>
            </div>
        </div>

        <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
            <div class="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="file-plus-2" class="w-8 h-8"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Novo Termo Rápido</h3>
            <p class="text-slate-500 mb-6 max-w-md mx-auto">Vá até a aba de funcionários para selecionar para quem você deseja gerar um novo termo de responsabilidade de equipamentos.</p>
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
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                            <th class="py-3 px-6 font-semibold">Nome da Empresa</th>
                            <th class="py-3 px-6 font-semibold">CNPJ</th>
                            <th class="py-3 px-6 font-semibold">Cidade/UF</th>
                            <th class="py-3 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (empresas.length === 0) {
            tableHTML += `<tr><td colspan="4" class="py-6 text-center text-slate-500">Nenhuma empresa cadastrada.</td></tr>`;
        } else {
            empresas.forEach(emp => {
                tableHTML += `
                    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td class="py-4 px-6 font-medium text-slate-800">${emp.nome}</td>
                        <td class="py-4 px-6 text-slate-600">${formatCNPJ(emp.cnpj)}</td>
                        <td class="py-4 px-6 text-slate-600">${emp.cidade} - ${emp.uf}</td>
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
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Tem certeza que deseja remover esta empresa?')) {
                    removeEmpresa(id);
                    renderTable();
                }
            });
        });
    };

    renderTable();

    document.getElementById('btn-add-empresa').addEventListener('click', () => {
        const formHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-4">Adicionar Empresa</h3>
                <form id="form-empresa" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Nome / Razão Social</label>
                        <input type="text" name="nome" required class="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                        <input type="text" name="cnpj" oninput="this.value = this.value.replace(/\\D/g, '')" required placeholder="Apenas números" class="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Cidade (Rodapé)</label>
                            <input type="text" name="cidade" required class="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">UF (Estado)</label>
                            <input type="text" name="uf" required maxlength="2" class="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none uppercase">
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" class="btn-cancel bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
                        <button type="submit" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        showModal(formHTML);

        document.getElementById('form-empresa').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            addEmpresa({
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
        <div class="flex items-center gap-4">
            <div class="relative">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input type="text" id="search-equip" placeholder="Buscar equipamento..." class="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none w-64 lg:w-80">
            </div>
            <button id="btn-add-equipamento" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Novo Equipamento
            </button>
        </div>
    `;

    const renderTable = (filterText = '') => {
        let equipamentos = getEquipamentos();
        if (filterText) {
            const lowerFilter = filterText.toLowerCase();
            equipamentos = equipamentos.filter(eqp =>
                eqp.descricao.toLowerCase().includes(lowerFilter) ||
                eqp.modeloMarca.toLowerCase().includes(lowerFilter)
            );
        }

        let tableHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                            <th class="py-3 px-6 font-semibold">Descrição do Equipamento</th>
                            <th class="py-3 px-6 font-semibold">Modelo/Marca</th>
                            <th class="py-3 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (equipamentos.length === 0) {
            tableHTML += `<tr><td colspan="3" class="py-6 text-center text-slate-500">Nenhum equipamento encontrado.</td></tr>`;
        } else {
            equipamentos.forEach(eqp => {
                tableHTML += `
                    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td class="py-4 px-6 font-medium text-slate-800">${eqp.descricao}</td>
                        <td class="py-4 px-6 text-slate-600">${eqp.modeloMarca}</td>
                        <td class="py-4 px-6 text-right">
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
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Tem certeza que deseja remover este equipamento?')) {
                    removeEquipamento(id);
                    renderTable();
                }
            });
        });
    };

    renderTable();

    document.getElementById('search-equip').addEventListener('input', (e) => {
        renderTable(e.target.value);
    });

    document.getElementById('btn-add-equipamento').addEventListener('click', () => {
        const formHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-4">Adicionar Equipamento</h3>
                <form id="form-equipamento" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                        <input type="text" name="descricao" required placeholder="Ex: Notebook, Celular, Monitor" class="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Modelo / Marca</label>
                        <input type="text" name="modeloMarca" required placeholder="Ex: Dell Inspiron 15" class="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    </div>
                    <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" class="btn-cancel bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
                        <button type="submit" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        showModal(formHTML);

        document.getElementById('form-equipamento').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            addEquipamento({
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
        <button id="btn-add-func" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            Novo Funcionário
        </button>
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
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                            <th class="py-3 px-6 font-semibold">Nome Completo</th>
                            <th class="py-3 px-6 font-semibold">Função/Cargo</th>
                            <th class="py-3 px-6 font-semibold">Data Admissão</th>
                            <th class="py-3 px-6 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (funcionarios.length === 0) {
            tableHTML += `<tr><td colspan="4" class="py-6 text-center text-slate-500">Nenhum funcionário cadastrado. Clique no botão acima para adicionar.</td></tr>`;
        } else {
            funcionarios.forEach(f => {
                tableHTML += `
                    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td class="py-4 px-6 font-medium text-slate-800">${f.nome}</td>
                        <td class="py-4 px-6 text-slate-600">${f.funcao}</td>
                        <td class="py-4 px-6 text-slate-600">${formatInputDate(f.dataAdmissao)}</td>
                        <td class="py-4 px-6 text-right flex justify-end gap-2">
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
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Remover funcionário? Isso não apagará termos já gerados ou impressos, mas o removerá da base.')) {
                    removeFuncionario(id);
                    renderTable();
                }
            });
        });
    };

    renderTable();

    document.getElementById('search-func').addEventListener('input', (e) => {
        renderTable(e.target.value);
    });

    document.getElementById('btn-add-func').addEventListener('click', () => {
        const formHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-4">Cadastrar Funcionário</h3>
                <form id="form-func" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input type="text" name="nome" required class="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Função / Cargo</label>
                        <input type="text" name="funcao" required class="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Data de Admissão</label>
                        <input type="date" name="dataAdmissao" required class="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-700">
                    </div>
                    <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" class="btn-cancel bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
                        <button type="submit" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        showModal(formHTML);

        document.getElementById('form-func').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            addFuncionario({
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
    const equipamentosDB = getEquipamentos();

    container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div class="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">Gerar Termo de Responsabilidade</h3>
                        <p class="text-slate-500 text-sm mt-1">Preencha as informações abaixo para gerar o PDF.</p>
                    </div>
                    <button onclick="navigate('funcionarios')" class="text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center gap-1">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar
                    </button>
                </div>
                
                <div class="p-6">
                    <form id="form-gerar-termo">
                        
                        <!-- Dados do Funcionário (Preenchido) -->
                        <div class="mb-8">
                            <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">1. Dados do Empregado</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div>
                                    <span class="block text-xs font-semibold text-slate-500 mb-1">Nome</span>
                                    <span class="block text-slate-800 font-medium">${funcionario.nome}</span>
                                </div>
                                <div>
                                    <span class="block text-xs font-semibold text-slate-500 mb-1">Função</span>
                                    <span class="block text-slate-800 font-medium">${funcionario.funcao}</span>
                                </div>
                                <div>
                                    <span class="block text-xs font-semibold text-slate-500 mb-1">Data Admissão</span>
                                    <span class="block text-slate-800 font-medium">${formatInputDate(funcionario.dataAdmissao)}</span>
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
                                        <label class="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50/50">
                                            <input type="radio" name="empresaId" value="${emp.id}" required class="w-4 h-4 text-primary border-slate-300 focus:ring-primary">
                                            <div class="ml-3 flex-1 flex justify-between items-center">
                                                <span class="font-medium text-slate-800">${emp.nome}</span>
                                                <span class="text-sm text-slate-500">${formatCNPJ(emp.cnpj)}</span>
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
                                    <input type="text" id="search-termo-eqp" placeholder="Buscar equipamento..." class="w-full pl-9 pr-3 py-1.5 border border-slate-200 bg-white rounded-md text-sm focus:ring-primary focus:border-primary outline-none">
                                </div>` : ''}
                            </div>
                            
                            ${equipamentosDB.length === 0 ?
            `<div class="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                                    <i data-lucide="alert-triangle" class="w-5 h-5 mt-0.5"></i>
                                    <div>
                                        <p class="font-medium">Nenhum equipamento cadastrado</p>
                                        <p class="text-sm mt-1">Cadastre os equipamentos disponíveis no sistema primeiro.</p>
                                        <button type="button" onclick="navigate('equipamentos')" class="mt-2 text-amber-900 font-medium text-sm hover:underline">Ir para cadastros &rarr;</button>
                                    </div>
                                </div>`
            :
            `<div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="equipamentos-grid-container">
                                    ${equipamentosDB.map(eqp => `
                                        <label class="eqp-item flex items-start p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50/50">
                                            <input type="checkbox" name="equipamentos" value="${eqp.id}" class="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary checkbox-eqp">
                                            <div class="ml-3 flex-1 eqp-item-text">
                                                <span class="block font-medium text-slate-800">${eqp.descricao}</span>
                                                <span class="block text-sm text-slate-500">${eqp.modeloMarca}</span>
                                            </div>
                                        </label>
                                    `).join('')}
                                </div>`
        }
                        </div>

                        <div class="pt-6 border-t border-slate-200 flex justify-end">
                            <button type="submit" id="btn-gerar" class="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed" ${(empresas.length === 0 || equipamentosDB.length === 0) ? 'disabled' : ''}>
                                <i data-lucide="printer" class="w-5 h-5"></i>
                                Imprimir / Salvar PDF
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const searchInput = document.getElementById('search-termo-eqp');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.eqp-item').forEach(item => {
                const text = item.querySelector('.eqp-item-text').textContent.toLowerCase();
                item.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    document.getElementById('form-gerar-termo').addEventListener('submit', (e) => {
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

        generateAndPrintTermo(funcionario, empresaObj, equipamentosObjArray);
    });
};
