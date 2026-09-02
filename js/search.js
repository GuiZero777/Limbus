// js/search.js
// Busca Global Rápida / Command Palette (Ctrl+K / Cmd+K)

(function () {
    let isOpen = false;
    let selectedIndex = 0;
    let currentFilter = 'ALL'; // 'ALL', 'FUNCIONARIOS', 'EQUIPAMENTOS', 'SETORES', 'EMPRESAS', 'ACOES'
    let currentResults = [];
    let paletteOverlay = null;

    // Ações Rápidas do Sistema
    const getSystemActions = () => [
        {
            type: 'ACTION',
            id: 'act-novo-func',
            title: 'Novo Funcionário',
            subtitle: 'Cadastrar um novo colaborador no sistema',
            icon: 'user-plus',
            badge: 'Ação',
            badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            run: () => {
                navigate('funcionarios');
                setTimeout(() => {
                    if (typeof renderFuncionarioForm === 'function') renderFuncionarioForm();
                }, 150);
            }
        },
        {
            type: 'ACTION',
            id: 'act-novo-equip',
            title: 'Novo Equipamento',
            subtitle: 'Adicionar notebook, smartphone ou monitor patrimoniado',
            icon: 'laptop',
            badge: 'Ação',
            badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
            run: () => {
                navigate('equipamentos');
                setTimeout(() => {
                    const btnAdd = document.getElementById('btn-add-equipamento');
                    if (btnAdd) btnAdd.click();
                }, 150);
            }
        },
        {
            type: 'ACTION',
            id: 'act-novo-insumo',
            title: 'Novo Insumo de TI',
            subtitle: 'Cadastrar mouse, teclado, suporte ou fone de ouvido em lote',
            icon: 'box',
            badge: 'Ação',
            badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            run: () => {
                navigate('insumos');
                setTimeout(() => {
                    const btnAdd = document.getElementById('btn-header-novo-insumo') || document.getElementById('btn-novo-insumo');
                    if (btnAdd) btnAdd.click();
                }, 150);
            }
        },
        {
            type: 'ACTION',
            id: 'act-novo-termo',
            title: 'Emitir Termo de Entrega',
            subtitle: 'Gerar documento em PDF com assinatura digital para colaborador',
            icon: 'file-text',
            badge: 'Ação',
            badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            run: () => navigate('gerador_termo')
        },
        {
            type: 'ACTION',
            id: 'act-novo-setor',
            title: 'Novo Setor / Departamento',
            subtitle: 'Cadastrar um novo setor na organização',
            icon: 'folder-plus',
            badge: 'Ação',
            badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
            run: () => {
                navigate('setores');
                setTimeout(() => {
                    const btn = document.getElementById('btn-header-novo-setor') || document.getElementById('btn-novo-setor');
                    if (btn) btn.click();
                }, 150);
            }
        },
        {
            type: 'ACTION',
            id: 'act-nova-empresa',
            title: 'Nova Empresa (CNPJ)',
            subtitle: 'Cadastrar uma nova razão social no sistema',
            icon: 'building-2',
            badge: 'Ação',
            badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            run: () => {
                navigate('empresas');
                setTimeout(() => {
                    const btn = document.getElementById('btn-add-empresa');
                    if (btn) btn.click();
                }, 150);
            }
        },
        {
            type: 'ACTION',
            id: 'act-historico',
            title: 'Ver Histórico Geral',
            subtitle: 'Consultar todas as movimentações e devoluções registradas',
            icon: 'history',
            badge: 'Navegação',
            badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
            run: () => navigate('historico')
        },
        {
            type: 'ACTION',
            id: 'act-tema',
            title: 'Alternar Tema Claro / Escuro',
            subtitle: 'Mudar a aparência visual do Limbus',
            icon: 'moon',
            badge: 'Sistema',
            badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
            run: () => {
                const btn = document.getElementById('theme-toggle');
                if (btn) btn.click();
            }
        }
    ];

    // Busca unificada
    const searchAll = (rawQuery, filter) => {
        const query = typeof normalizeText === 'function' ? normalizeText(rawQuery) : rawQuery.toLowerCase().trim();
        const results = [];

        const funcionarios = typeof getFuncionarios === 'function' ? getFuncionarios() : [];
        const equipamentos = typeof getEquipamentos === 'function' ? getEquipamentos() : [];
        const setores = typeof getSetores === 'function' ? getSetores() : [];
        const empresas = typeof getEmpresas === 'function' ? getEmpresas() : [];
        const actions = getSystemActions();

        // 1. AÇÕES
        if (filter === 'ALL' || filter === 'ACOES') {
            actions.forEach(act => {
                if (!query || normalizeText(act.title).includes(query) || normalizeText(act.subtitle).includes(query)) {
                    results.push(act);
                }
            });
        }

        // 2. FUNCIONÁRIOS
        if (filter === 'ALL' || filter === 'FUNCIONARIOS') {
            const funcResults = [];
            funcionarios.forEach(f => {
                const nameNorm = normalizeText(f.nome);
                const roleNorm = normalizeText(f.funcao || '');
                const setorNorm = normalizeText(f.setor || '');

                if (!query || nameNorm.includes(query) || roleNorm.includes(query) || setorNorm.includes(query)) {
                    const eqps = equipamentos.filter(e => e.funcionarioId === f.id && e.status === 'EM_USO');
                    funcResults.push({
                        type: 'FUNCIONARIO',
                        id: f.id,
                        title: f.nome,
                        subtitle: `${f.funcao || 'Cargo não informado'} • ${f.setor || 'Sem Setor'}`,
                        icon: 'user',
                        badge: eqps.length > 0 ? `${eqps.length} item(s)` : 'Sem itens',
                        badgeClass: eqps.length > 0
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                        run: () => navigate('funcionarios', { funcId: f.id, openProfile: true })
                    });
                }
            });
            funcResults.sort((a, b) => a.title.localeCompare(b.title));
            results.push(...funcResults);
        }

        // 3. EQUIPAMENTOS
        if (filter === 'ALL' || filter === 'EQUIPAMENTOS') {
            const equipResults = [];
            equipamentos.forEach(eqp => {
                const descNorm = normalizeText(eqp.descricao);
                const modelNorm = normalizeText(eqp.modeloMarca || '');
                const patrNorm = normalizeText(eqp.patrimonio || '');
                const snNorm = normalizeText(eqp.serialNumber || '');
                const obsNorm = normalizeText(eqp.observacoes || '');

                if (!query || descNorm.includes(query) || modelNorm.includes(query) || patrNorm.includes(query) || snNorm.includes(query) || obsNorm.includes(query)) {
                    const isDisponivel = eqp.status === 'DISPONIVEL';
                    let statusLabel = 'Disponível';
                    if (!isDisponivel) {
                        const func = funcionarios.find(f => f.id === eqp.funcionarioId);
                        statusLabel = func ? `Em uso: ${func.nome.split(' ')[0]}` : 'Em Uso';
                    }

                    equipResults.push({
                        type: 'EQUIPAMENTO',
                        id: eqp.id,
                        title: `${eqp.descricao}${eqp.modeloMarca ? ' - ' + eqp.modeloMarca : ''}`,
                        subtitle: `Patr: ${eqp.patrimonio || 'S/ Patr.'} ${eqp.serialNumber ? '• S/N: ' + eqp.serialNumber : ''}`,
                        icon: 'laptop',
                        badge: statusLabel,
                        badgeClass: isDisponivel
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                        run: () => navigate('equipamentos', { search: eqp.patrimonio || eqp.serialNumber || eqp.modeloMarca, highlightId: eqp.id })
                    });
                }
            });
            equipResults.sort((a, b) => a.title.localeCompare(b.title));
            results.push(...equipResults);
        }

        // 4. SETORES
        if (filter === 'ALL' || filter === 'SETORES') {
            const setorResults = [];
            setores.forEach(s => {
                const setorNorm = normalizeText(s);
                if (!query || setorNorm.includes(query)) {
                    const colabsCount = funcionarios.filter(f => (f.setor || '').toUpperCase() === s.toUpperCase()).length;
                    setorResults.push({
                        type: 'SETOR',
                        id: s,
                        title: s,
                        subtitle: `Departamento com ${colabsCount} ${colabsCount === 1 ? 'colaborador vinculado' : 'colaboradores vinculados'}`,
                        icon: 'folder',
                        badge: `${colabsCount} colab(s)`,
                        badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                        run: () => navigate('setores', { search: s, openColabs: true, setorName: s })
                    });
                }
            });
            setorResults.sort((a, b) => a.title.localeCompare(b.title));
            results.push(...setorResults);
        }

        // 5. EMPRESAS
        if (filter === 'ALL' || filter === 'EMPRESAS') {
            const empResults = [];
            empresas.forEach(emp => {
                const nameNorm = normalizeText(emp.nome);
                const cnpjNorm = normalizeText(emp.cnpj || '');
                const cityNorm = normalizeText(emp.cidade || '');

                if (!query || nameNorm.includes(query) || cnpjNorm.includes(query) || cityNorm.includes(query)) {
                    empResults.push({
                        type: 'EMPRESA',
                        id: emp.id,
                        title: emp.nome,
                        subtitle: `${formatCNPJ ? formatCNPJ(emp.cnpj) : emp.cnpj} • ${emp.cidade} - ${emp.uf}`,
                        icon: 'building-2',
                        badge: 'Empresa',
                        badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                        run: () => navigate('empresas', { empresaId: emp.id })
                    });
                }
            });
            empResults.sort((a, b) => a.title.localeCompare(b.title));
            results.push(...empResults);
        }

        // 6. INSUMOS DE TI
        if (filter === 'ALL' || filter === 'INSUMOS') {
            const insumos = typeof getInsumos === 'function' ? getInsumos() : [];
            const insResults = [];
            insumos.forEach(ins => {
                const nameNorm = normalizeText(ins.nome || '');
                const marcaNorm = normalizeText(ins.marca || '');

                if (!query || nameNorm.includes(query) || marcaNorm.includes(query)) {
                    insResults.push({
                        type: 'INSUMO',
                        id: ins.id,
                        title: ins.nome,
                        subtitle: `${ins.marca || 'Sem marca'} • ${ins.disponivel} disponíveis em estoque (${ins.emUso} em uso)`,
                        icon: 'box',
                        badge: `${ins.disponivel} disp.`,
                        badgeClass: ins.disponivel > 0
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
                        run: () => navigate('insumos', { search: ins.nome })
                    });
                }
            });
            insResults.sort((a, b) => a.title.localeCompare(b.title));
            results.push(...insResults);
        }

        return results;
    };

    // Renderizar resultados da busca
    const renderResultsList = (container, results, query) => {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="py-12 px-4 text-center">
                    <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <i data-lucide="search-x" class="w-6 h-6"></i>
                    </div>
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Nenhum resultado encontrado${query ? ` para "${query}"` : ''}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">Tente buscar por nome de funcionário, número de patrimônio (ex: 28781), modelo ou setor.</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons({ nodes: [container] });
            return;
        }

        container.innerHTML = results.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return `
                <div data-index="${idx}" class="palette-item flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800' : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent'}">
                    <div class="flex items-center gap-3.5 min-w-0">
                        <div class="palette-icon-box w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} transition-colors">
                            <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate flex items-center gap-2">
                                <span>${item.title}</span>
                            </div>
                            <div class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${item.subtitle}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2.5 shrink-0 ml-3">
                        <span class="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border ${item.badgeClass}">
                            ${item.badge}
                        </span>
                        <i data-lucide="chevron-right" class="palette-chevron w-4 h-4 text-slate-300 dark:text-slate-600 ${isSelected ? 'opacity-100 text-indigo-500' : 'opacity-0'} transition-opacity"></i>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons({ nodes: [container] });

        // Eventos de clique e hover
        container.querySelectorAll('.palette-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.index);
                executeItem(results[idx]);
            });
            el.addEventListener('mouseenter', () => {
                const idx = parseInt(el.dataset.index);
                selectedIndex = idx;
                updateSelectionHighlight(container);
            });
        });

        scrollSelectedIntoView(container);
    };

    const updateSelectionHighlight = (container) => {
        const items = container.querySelectorAll('.palette-item');
        items.forEach((el, idx) => {
            const isSelected = idx === selectedIndex;
            const iconBox = el.querySelector('.palette-icon-box');
            const chevron = el.querySelector('.palette-chevron');

            if (isSelected) {
                el.className = 'palette-item flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800';
                if (iconBox) {
                    iconBox.className = 'palette-icon-box w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 transition-colors';
                }
                if (chevron) {
                    chevron.classList.remove('opacity-0');
                    chevron.classList.add('opacity-100', 'text-indigo-500');
                }
            } else {
                el.className = 'palette-item flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent';
                if (iconBox) {
                    iconBox.className = 'palette-icon-box w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors';
                }
                if (chevron) {
                    chevron.classList.add('opacity-0');
                    chevron.classList.remove('opacity-100', 'text-indigo-500');
                }
            }
        });
    };

    const scrollSelectedIntoView = (container) => {
        const selectedEl = container.querySelector(`[data-index="${selectedIndex}"]`);
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest' });
        }
    };

    const executeItem = (item) => {
        if (!item) return;
        closeCommandPalette();
        if (typeof item.run === 'function') {
            item.run();
        }
    };

    // Abrir o Command Palette
    const openCommandPalette = () => {
        if (isOpen) return;
        isOpen = true;
        selectedIndex = 0;
        currentFilter = 'ALL';

        paletteOverlay = document.createElement('div');
        paletteOverlay.id = 'command-palette-overlay';
        paletteOverlay.className = 'fixed inset-0 z-[200] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200';

        paletteOverlay.innerHTML = `
            <div id="command-palette-box" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col transform scale-95 opacity-0 transition-all duration-200">
                <!-- Header com Input de Busca -->
                <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <i data-lucide="search" class="w-4 h-4"></i>
                    </div>
                    <input type="text" id="palette-search-input" placeholder="Buscar por funcionário, patrimônio, serial, setor, empresa ou ação..." class="w-full bg-transparent text-slate-800 dark:text-slate-100 text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none">
                    <button id="btn-palette-clear" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hidden">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                    <kbd class="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">ESC</kbd>
                </div>

                <!-- Chips de Categorias -->
                <div class="px-4 py-2 bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
                    <button data-filter="ALL" class="palette-chip px-2.5 py-1 rounded-lg font-medium transition-colors bg-indigo-600 text-white shadow-xs">Todos</button>
                    <button data-filter="FUNCIONARIOS" class="palette-chip px-2.5 py-1 rounded-lg font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">Funcionários</button>
                    <button data-filter="EQUIPAMENTOS" class="palette-chip px-2.5 py-1 rounded-lg font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">Equipamentos</button>
                    <button data-filter="SETORES" class="palette-chip px-2.5 py-1 rounded-lg font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">Setores</button>
                    <button data-filter="EMPRESAS" class="palette-chip px-2.5 py-1 rounded-lg font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">Empresas</button>
                    <button data-filter="ACOES" class="palette-chip px-2.5 py-1 rounded-lg font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">Ações Rápidas</button>
                </div>

                <!-- Lista de Resultados -->
                <div id="palette-results" class="max-h-[50vh] overflow-y-auto p-2 space-y-1">
                    <!-- Injetado dinamicamente -->
                </div>

                <!-- Footer com Dicas de Navegação -->
                <div class="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <div class="flex items-center gap-4">
                        <span class="flex items-center gap-1"><kbd class="font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-2xs">↑</kbd> <kbd class="font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-2xs">↓</kbd> navegar</span>
                        <span class="flex items-center gap-1"><kbd class="font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-2xs">↵</kbd> selecionar</span>
                        <span class="flex items-center gap-1"><kbd class="font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-2xs">ESC</kbd> fechar</span>
                    </div>
                    <span id="palette-count" class="font-medium text-slate-500 dark:text-slate-400">0 resultados</span>
                </div>
            </div>
        `;

        document.body.appendChild(paletteOverlay);
        if (window.lucide) window.lucide.createIcons({ nodes: [paletteOverlay] });

        const box = paletteOverlay.querySelector('#command-palette-box');
        const input = paletteOverlay.querySelector('#palette-search-input');
        const resultsContainer = paletteOverlay.querySelector('#palette-results');
        const countEl = paletteOverlay.querySelector('#palette-count');
        const btnClear = paletteOverlay.querySelector('#btn-palette-clear');

        // Animação de entrada
        setTimeout(() => {
            box.classList.remove('scale-95', 'opacity-0');
            box.classList.add('scale-100', 'opacity-100');
            input.focus();
        }, 10);

        // Atualização de busca
        const updateSearch = () => {
            const val = input.value;
            if (val) {
                btnClear.classList.remove('hidden');
            } else {
                btnClear.classList.add('hidden');
            }

            currentResults = searchAll(val, currentFilter);
            if (selectedIndex >= currentResults.length) {
                selectedIndex = Math.max(0, currentResults.length - 1);
            }
            countEl.textContent = `${currentResults.length} ${currentResults.length === 1 ? 'resultado' : 'resultados'}`;
            renderResultsList(resultsContainer, currentResults, val);
        };

        input.addEventListener('input', updateSearch);

        btnClear.addEventListener('click', () => {
            input.value = '';
            input.focus();
            updateSearch();
        });

        // Troca de filtros (Chips)
        paletteOverlay.querySelectorAll('.palette-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                paletteOverlay.querySelectorAll('.palette-chip').forEach(c => {
                    c.className = 'palette-chip px-2.5 py-1 rounded-lg font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800';
                });
                chip.className = 'palette-chip px-2.5 py-1 rounded-lg font-medium transition-colors bg-indigo-600 text-white shadow-xs';
                currentFilter = chip.dataset.filter;
                selectedIndex = 0;
                updateSearch();
            });
        });

        // Navegação por teclado no input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (currentResults.length > 0) {
                    selectedIndex = (selectedIndex + 1) % currentResults.length;
                    updateSelectionHighlight(resultsContainer);
                    scrollSelectedIntoView(resultsContainer);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (currentResults.length > 0) {
                    selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
                    updateSelectionHighlight(resultsContainer);
                    scrollSelectedIntoView(resultsContainer);
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentResults.length > 0 && currentResults[selectedIndex]) {
                    executeItem(currentResults[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeCommandPalette();
            }
        });

        // Fechar ao clicar fora
        paletteOverlay.addEventListener('click', (e) => {
            if (!box.contains(e.target)) {
                closeCommandPalette();
            }
        });

        // Render inicial
        updateSearch();
    };

    // Fechar Command Palette
    const closeCommandPalette = () => {
        if (!isOpen || !paletteOverlay) return;
        const box = paletteOverlay.querySelector('#command-palette-box');
        if (box) {
            box.classList.remove('scale-100', 'opacity-100');
            box.classList.add('scale-95', 'opacity-0');
        }
        setTimeout(() => {
            if (paletteOverlay) {
                paletteOverlay.remove();
                paletteOverlay = null;
            }
            isOpen = false;
        }, 150);
    };

    // Atalhos Globais
    window.addEventListener('keydown', (e) => {
        // Ctrl+K ou Cmd+K
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (isOpen) {
                closeCommandPalette();
            } else {
                openCommandPalette();
            }
            return;
        }

        // Tecla / para buscar quando não estiver digitando em campos
        if (e.key === '/' && !isOpen) {
            const activeEl = document.activeElement;
            const isInput = activeEl && (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.isContentEditable);
            if (!isInput) {
                e.preventDefault();
                openCommandPalette();
            }
        }
    });

    // Expor globalmente
    window.openCommandPalette = openCommandPalette;
    window.closeCommandPalette = closeCommandPalette;
})();
