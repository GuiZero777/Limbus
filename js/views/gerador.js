// js/views/gerador.js

// --- Emissão de Termo ---
const renderGeradorTermo = (container, headerActions, params) => {
    headerActions.innerHTML = '';

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
    // Apenas equipamentos disponíveis ordenados por descrição e modelo
    const equipamentosDB = getEquipamentos()
        .filter(e => e.status === 'DISPONIVEL')
        .sort((a, b) => a.descricao.localeCompare(b.descricao) || (a.modeloMarca || '').localeCompare(b.modeloMarca || '') || (a.patrimonio || '').localeCompare(b.patrimonio || ''));

    let errorEmpresaHTML = '';
    if (empresas.length === 0) {
        errorEmpresaHTML = `
            <div class="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                <i data-lucide="alert-triangle" class="w-5 h-5 mt-0.5"></i>
                <div>
                    <p class="font-medium">Nenhuma empresa cadastrada</p>
                    <p class="text-sm mt-1">É necessário cadastrar ao menos uma empresa antes de gerar um termo.</p>
                    <button type="button" onclick="navigate('empresas')" class="mt-2 text-amber-900 font-medium text-sm hover:underline">Ir para cadastros &rarr;</button>
                </div>
            </div>`;
    } else {
        errorEmpresaHTML = '<div class="space-y-3">' + empresas.map(emp => `
            <label class="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:bg-slate-900/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50/50">
                <input type="radio" name="empresaId" value="${emp.id}" required class="w-4 h-4 text-primary border-slate-300 dark:border-slate-600 focus:ring-primary dark:text-slate-100 dark:bg-slate-900">
                <div class="ml-3 flex-1 flex justify-between items-center">
                    <span class="font-medium text-slate-800 dark:text-slate-100">${emp.nome}</span>
                    <span class="text-sm text-slate-500 dark:text-slate-400">${formatCNPJ(emp.cnpj)}</span>
                </div>
            </label>
        `).join('') + '</div>';
    }

    let searchEqpHTML = '';
    if (equipamentosDB.length > 0) {
        searchEqpHTML = `
            <div class="relative w-full sm:w-80">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input type="text" id="search-termo-eqp" placeholder="Buscar por patrimônio, serial, modelo..." class="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900 transition-all">
            </div>`;
    }

    let errorEqpHTML = '';
    if (equipamentosDB.length === 0) {
        errorEqpHTML = `
            <div class="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                <i data-lucide="alert-triangle" class="w-5 h-5 mt-0.5"></i>
                <div>
                    <p class="font-medium">Nenhum equipamento disponível</p>
                    <p class="text-sm mt-1">Todos os equipamentos estão em uso ou nenhum foi cadastrado.</p>
                    <button type="button" onclick="navigate('equipamentos')" class="mt-2 text-amber-900 font-medium text-sm hover:underline">Ir para cadastros &rarr;</button>
                </div>
            </div>`;
    } else {
        errorEqpHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="equipamentos-grid-container">' + equipamentosDB.map((eqp, idx) => {
            const patrText = eqp.patrimonio || 'Sem Patr.';
            const searchData = `${eqp.descricao} ${eqp.modeloMarca} ${eqp.patrimonio || ''} ${eqp.serialNumber || ''} ${eqp.observacoes || ''}`.toLowerCase();

            return `
            <label data-order="${idx}" data-id="${eqp.id}" data-search="${searchData}" class="eqp-item flex items-start p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 dark:has-[:checked]:bg-indigo-950/40 has-[:checked]:ring-1 has-[:checked]:ring-indigo-500/50">
                <input type="checkbox" name="equipamentos" value="${eqp.id}" class="mt-1 w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 checkbox-eqp dark:text-slate-100 dark:bg-slate-900 shrink-0">
                <div class="ml-3 flex-1 min-w-0 eqp-item-text">
                    <div class="flex items-center justify-between gap-2 mb-1">
                        <span class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">${eqp.descricao}</span>
                        <span class="inline-flex items-center font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shrink-0">
                            <span class="text-indigo-400 dark:text-indigo-400 font-sans font-normal mr-1">Patr:</span>${patrText}
                        </span>
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2 flex-wrap">
                        <span class="truncate">${eqp.modeloMarca || 'Modelo não inf.'}</span>
                        ${eqp.serialNumber ? `
                        <span class="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                            <span class="text-slate-400 font-sans font-normal mr-0.5">S/N:</span>${eqp.serialNumber}
                        </span>` : ''}
                    </div>
                    ${eqp.observacoes ? `
                    <div class="text-[11px] text-slate-400 italic mt-1.5 truncate" title="${eqp.observacoes}">
                        ${eqp.observacoes}
                    </div>` : ''}
                </div>
            </label>
            `;
        }).join('') + '</div><div id="eqp-search-no-results" class="hidden py-8 text-center text-slate-400 dark:text-slate-500 text-sm"><i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>Nenhum equipamento disponível encontrado com este termo de busca.</div>';
    }

    const disabledBtn = (empresas.length === 0 || equipamentosDB.length === 0) ? 'disabled' : '';

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
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 border-slate-200 dark:border-slate-700">
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
                            ${errorEmpresaHTML}
                        </div>

                        <!-- Seleção de Equipamentos -->
                        <div class="mb-8">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-slate-100 pb-3 gap-3">
                                <div class="flex items-center gap-2">
                                    <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider">3. Equipamentos Entregues (Patrimoniados)</h4>
                                    <span id="badge-eqp-count" class="hidden text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200/60 dark:border-indigo-800/60">0 selecionados</span>
                                </div>
                                ${searchEqpHTML}
                            </div>
                            ${errorEqpHTML}
                        </div>

                        <!-- Seleção de Insumos / Periféricos -->
                        <div class="mb-8">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-slate-100 pb-3 gap-3">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider">4. Insumos & Periféricos (Sem Patrimônio)</h4>
                                    <span id="badge-insumo-count" class="hidden text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60 dark:border-emerald-800/60">0 selecionados</span>
                                    <button type="button" id="btn-kit-padrao" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-sm ml-1" title="Seleciona automaticamente Mouse, Teclado, Suporte, Mousepad e Fone de Ouvido">
                                        <i data-lucide="zap" class="w-3.5 h-3.5 text-indigo-500"></i>
                                        <span>⚡ Aplicar Kit Padrão Escritório</span>
                                    </button>
                                </div>
                                <div class="relative w-full sm:w-72">
                                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                                    <input type="text" id="search-termo-insumo" placeholder="Buscar por mouse, teclado, marca..." class="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900 transition-all">
                                </div>
                            </div>
                            <div id="insumos-grid-container" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                ${getInsumos().map(ins => {
                                    const searchData = `${ins.nome} ${ins.marca || ''}`.toLowerCase();
                                    const isDisponivel = ins.disponivel > 0;
                                    return `
                                    <label data-id="${ins.id}" data-name="${ins.nome}" data-search="${searchData}" class="insumo-item flex items-start p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 dark:has-[:checked]:bg-indigo-950/40 has-[:checked]:ring-1 has-[:checked]:ring-indigo-500/50 ${!isDisponivel ? 'opacity-50 pointer-events-none bg-slate-50 dark:bg-slate-900/20' : ''}">
                                        <input type="checkbox" name="insumos_selected" value="${ins.id}" ${!isDisponivel ? 'disabled' : ''} class="mt-1 w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 checkbox-insumo dark:text-slate-100 dark:bg-slate-900 shrink-0">
                                        <div class="ml-3 flex-1 min-w-0">
                                            <div class="flex items-center justify-between gap-2 mb-1">
                                                <span class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">${ins.nome}</span>
                                                <span class="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded ${isDisponivel ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80' : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/80 dark:border-red-800/80'} shrink-0">
                                                    ${isDisponivel ? `${ins.disponivel} disp.` : 'Esgotado'}
                                                </span>
                                            </div>
                                            <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
                                                <span class="truncate">${ins.marca || 'Sem marca'}</span>
                                                <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
                                                    <span class="text-[11px] text-slate-400 font-medium">Qtd:</span>
                                                    <input type="number" name="insumo_qty_${ins.id}" value="1" min="1" max="${ins.disponivel || 1}" ${!isDisponivel ? 'disabled' : ''} class="w-14 text-center text-xs py-0.5 px-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-primary font-bold">
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                    `;
                                }).join('')}
                            </div>
                            <div id="insumo-search-no-results" class="hidden py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                                <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                                Nenhum insumo encontrado com este termo de busca.
                            </div>
                        </div>

                        <!-- Data de Entrega -->
                        <div class="mb-8">
                            <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">5. Data de Entrega</h4>
                            <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">Informe a data real de entrega dos equipamentos. Por padrão, é a data de admissão.</p>
                            <input type="date" name="dataEntrega" id="input-data-entrega" value="${funcionario.dataAdmissao}" required class="w-full sm:w-64 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-slate-100 dark:bg-slate-900">
                        </div>

                        <div class="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button type="submit" id="btn-gerar" class="btn-primary text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
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

    const gridContainer = document.getElementById('equipamentos-grid-container');
    const searchInput = document.getElementById('search-termo-eqp');
    const insumosGrid = document.getElementById('insumos-grid-container');
    const searchInsumoInput = document.getElementById('search-termo-insumo');
    const btnKitPadrao = document.getElementById('btn-kit-padrao');

    const updateSelectedBadge = () => {
        if (gridContainer) {
            const checkedCount = gridContainer.querySelectorAll('.checkbox-eqp:checked').length;
            const badgeEl = document.getElementById('badge-eqp-count');
            if (badgeEl) {
                if (checkedCount > 0) {
                    badgeEl.textContent = `${checkedCount} ${checkedCount === 1 ? 'selecionado' : 'selecionados'}`;
                    badgeEl.classList.remove('hidden');
                } else {
                    badgeEl.classList.add('hidden');
                }
            }
        }
        if (insumosGrid) {
            const checkedInsumos = insumosGrid.querySelectorAll('.checkbox-insumo:checked').length;
            const badgeInsEl = document.getElementById('badge-insumo-count');
            if (badgeInsEl) {
                if (checkedInsumos > 0) {
                    badgeInsEl.textContent = `${checkedInsumos} ${checkedInsumos === 1 ? 'selecionado' : 'selecionados'}`;
                    badgeInsEl.classList.remove('hidden');
                } else {
                    badgeInsEl.classList.add('hidden');
                }
            }
        }
    };

    // Botão Aplicar Kit Padrão Escritório (Mouse + Teclado + Suporte + Mousepad + Fone de Ouvido)
    if (btnKitPadrao && insumosGrid) {
        btnKitPadrao.addEventListener('click', () => {
            const insumoCards = Array.from(insumosGrid.querySelectorAll('.insumo-item'));
            const keywords = ['mouse', 'teclado', 'kit', 'suporte', 'mousepad', 'fone', 'headset', 'ouvido'];
            let selectedCount = 0;

            insumoCards.forEach(card => {
                const searchStr = (card.dataset.search || '').toLowerCase();
                const checkbox = card.querySelector('.checkbox-insumo');
                if (!checkbox || checkbox.disabled) return;

                const isKitItem = keywords.some(kw => searchStr.includes(kw));
                if (isKitItem) {
                    checkbox.checked = true;
                    selectedCount++;
                }
            });

            updateSelectedBadge();
            if (selectedCount > 0) {
                showToast(`Kit Padrão Escritório aplicado! (${selectedCount} insumos selecionados: Mouse, Teclado, Suporte, Mousepad, Fone)`, 'success');
            } else {
                showToast('Nenhum item do Kit Padrão disponível em estoque no momento.', 'warning');
            }
        });
    }

    if (insumosGrid) {
        insumosGrid.addEventListener('change', (e) => {
            if (e.target.classList.contains('checkbox-insumo')) {
                updateSelectedBadge();
            }
        });
    }

    if (searchInsumoInput && insumosGrid) {
        searchInsumoInput.addEventListener('input', debounce((e) => {
            const term = (typeof normalizeText === 'function' ? normalizeText(e.target.value) : e.target.value.toLowerCase()).trim();
            let visibleCount = 0;

            insumosGrid.querySelectorAll('.insumo-item').forEach(item => {
                const rawSearch = item.dataset.search || item.textContent;
                const searchData = typeof normalizeText === 'function' ? normalizeText(rawSearch) : rawSearch.toLowerCase();
                const matches = !term || searchData.includes(term);
                item.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            });

            const noResultsEl = document.getElementById('insumo-search-no-results');
            if (noResultsEl) {
                noResultsEl.classList.toggle('hidden', visibleCount > 0);
                if (visibleCount === 0 && window.lucide) window.lucide.createIcons({ nodes: [noResultsEl] });
            }
        }, 150));
    }

    // Reorganiza os cards: os atualmente marcados ficam no topo, e os desmarcados voltam para a ordem natural
    const reorganizeGrid = () => {
        if (!gridContainer) return;
        const allCards = Array.from(gridContainer.querySelectorAll('.eqp-item'));
        allCards.sort((a, b) => {
            const aChecked = a.querySelector('.checkbox-eqp')?.checked || false;
            const bChecked = b.querySelector('.checkbox-eqp')?.checked || false;
            if (aChecked && !bChecked) return -1;
            if (!aChecked && bChecked) return 1;
            const aOrder = parseInt(a.dataset.order || '0', 10);
            const bOrder = parseInt(b.dataset.order || '0', 10);
            return aOrder - bOrder;
        });
        allCards.forEach(card => gridContainer.appendChild(card));
    };

    // Listener para mudanças nos checkboxes de equipamentos
    if (gridContainer) {
        gridContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('checkbox-eqp')) {
                const card = e.target.closest('.eqp-item');
                const isSearchActive = searchInput && searchInput.value.trim().length > 0;
                
                if (e.target.checked && !isSearchActive && card) {
                    const firstUnchecked = Array.from(gridContainer.querySelectorAll('.eqp-item')).find(c => !c.querySelector('.checkbox-eqp')?.checked);
                    if (firstUnchecked && firstUnchecked !== card) {
                        gridContainer.insertBefore(card, firstUnchecked);
                    } else if (!firstUnchecked) {
                        gridContainer.appendChild(card);
                    } else {
                        gridContainer.prepend(card);
                    }
                }
                updateSelectedBadge();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const rawVal = e.target.value;
            const term = (typeof normalizeText === 'function' ? normalizeText(rawVal) : rawVal.toLowerCase()).trim();

            if (!term) {
                reorganizeGrid();
                document.querySelectorAll('.eqp-item').forEach(item => {
                    item.style.display = '';
                });
                const noResultsEl = document.getElementById('eqp-search-no-results');
                if (noResultsEl) noResultsEl.classList.add('hidden');
                return;
            }

            let visibleCount = 0;
            document.querySelectorAll('.eqp-item').forEach(item => {
                const rawSearch = item.dataset.search || item.textContent;
                const searchData = typeof normalizeText === 'function' ? normalizeText(rawSearch) : rawSearch.toLowerCase();
                const matches = searchData.includes(term);
                item.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            });

            const noResultsEl = document.getElementById('eqp-search-no-results');
            if (noResultsEl) {
                noResultsEl.classList.toggle('hidden', visibleCount > 0);
                if (visibleCount === 0 && window.lucide) window.lucide.createIcons({ nodes: [noResultsEl] });
            }
        }, 150));
    }

    document.getElementById('form-gerar-termo').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const empresaId = formData.get('empresaId');
        const eqpsIds = formData.getAll('equipamentos');
        const selectedInsumosIds = formData.getAll('insumos_selected');

        if (eqpsIds.length === 0 && selectedInsumosIds.length === 0) {
            showToast('Selecione pelo menos 1 equipamento ou insumo para gerar o termo.', 'warning');
            return;
        }

        const empresaObj = getEmpresaById(empresaId);
        const equipamentosObjArray = eqpsIds.map(id => equipamentosDB.find(eq => eq.id === id)).filter(Boolean);
        const insumosDB = getInsumos();
        const dataEntrega = formData.get('dataEntrega');

        // Processar insumos selecionados
        const selectedInsumosList = [];
        for (const insId of selectedInsumosIds) {
            const insObj = insumosDB.find(i => i.id === insId);
            if (!insObj) continue;
            const qtyVal = parseInt(formData.get(`insumo_qty_${insId}`), 10) || 1;
            selectedInsumosList.push({
                insumoId: insObj.id,
                nome: insObj.nome,
                marca: insObj.marca,
                quantidade: qtyVal
            });
        }

        try {
            // 1. Atualizar Equipamentos patrimoniados para 'EM_USO'
            for (const eqp of equipamentosObjArray) {
                await editEquipamento(eqp.id, {
                    status: 'EM_USO',
                    funcionarioId: funcionario.id
                });
            }

            // 2. Atualizar Insumos do Funcionário
            if (selectedInsumosList.length > 0) {
                const currentFuncInsumos = Array.isArray(funcionario.insumos) ? [...funcionario.insumos] : [];
                for (const item of selectedInsumosList) {
                    const existingIdx = currentFuncInsumos.findIndex(i => i.insumoId === item.insumoId || i.id === item.insumoId);
                    if (existingIdx !== -1) {
                        currentFuncInsumos[existingIdx].quantidade = (parseInt(currentFuncInsumos[existingIdx].quantidade, 10) || 0) + item.quantidade;
                    } else {
                        currentFuncInsumos.push(item);
                    }
                }
                await editFuncionario(funcionario.id, { insumos: currentFuncInsumos });
                funcionario.insumos = currentFuncInsumos;
            }

            // 3. Montar snapshots combinados para o Histórico e para a Impressão
            // Equipamentos patrimoniados
            const eqpSnapshots = equipamentosObjArray.map(eq => ({
                id: eq.id,
                descricao: eq.descricao,
                modeloMarca: eq.modeloMarca,
                patrimonio: eq.patrimonio || '',
                serialNumber: eq.serialNumber || null
            }));

            // Insumos (sem patrimônio, representados de forma limpa e unificada)
            const insumoSnapshots = selectedInsumosList.map(ins => ({
                id: ins.insumoId,
                descricao: ins.quantidade > 1 ? `${ins.nome} (${ins.quantidade} un)` : ins.nome,
                modeloMarca: ins.marca || '',
                patrimonio: '',
                serialNumber: null
            }));

            const allSnapshots = [...eqpSnapshots, ...insumoSnapshots];

            // Registrar UMA única entrada no histórico com todos os itens do termo
            await addHistorico({
                tipo: 'ENTREGA',
                funcionarioId: funcionario.id,
                funcionarioSnapshot: {
                    id: funcionario.id,
                    nome: funcionario.nome,
                    funcao: funcionario.funcao || 'Não Informado',
                    setor: funcionario.setor || null
                },
                equipamentosIds: eqpsIds,
                equipamentosSnapshots: allSnapshots,
                data: dataEntrega
            });

            // Generate the print document with all combined items (equipments + insumos)
            generateAndPrintTermo(funcionario, empresaObj, allSnapshots, dataEntrega);

            showToast('Termo gerado com sucesso!', 'success');

            setTimeout(() => {
                navigate('funcionarios');
            }, 500);
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
};
