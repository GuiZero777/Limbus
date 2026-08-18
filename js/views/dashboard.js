// js/views/dashboard.js

const renderDashboard = (container, headerActions) => {
    headerActions.innerHTML = '';

    const funcionarios = getFuncionarios();
    const fncs = funcionarios.length;
    const emps = getEmpresas().length;
    const setores = getSetores();
    const totalSetores = setores.length;

    const equipamentos = getEquipamentos();
    const eqps = equipamentos.length;
    const eqpsEmUso = equipamentos.filter(e => e.status === 'EM_USO').length;
    const eqpsDisponiveis = eqps - eqpsEmUso;
    const usagePercent = eqps > 0 ? Math.round((eqpsEmUso / eqps) * 100) : 0;

    // Recent activity
    const historico = getHistorico().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

    const activityHTML = historico.length === 0
        ? '<p class="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">Nenhuma atividade recente.</p>'
        : historico.map(h => {
            const fnc = funcionarios.find(f => f.id === h.funcionarioId) || { nome: 'Desconhecido' };
            const dataStr = formatInputDate(h.data);
            let dotColor = '', label = '', badgeBg = '';
            if (h.tipo === 'ENTREGA' || h.tipo === 'ALOCACAO_MANUAL') {
                dotColor = 'bg-emerald-500';
                label = 'Entrega';
                badgeBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
            } else {
                dotColor = 'bg-amber-500';
                label = 'Devolução';
                badgeBg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
            }
            const eqpCount = h.equipamentosIds?.length || 1;
            return `
                <div class="activity-item flex items-center justify-between gap-3 py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <div class="flex items-center gap-3 min-w-0">
                        <span class="w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0"></span>
                        <div class="truncate">
                            <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">${fnc.nome}</p>
                            <p class="text-xs text-slate-400 dark:text-slate-500">${dataStr} • ${eqpCount} item${eqpCount > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${badgeBg} flex-shrink-0">${label}</span>
                </div>`;
        }).join('');

    // Distribution by sectors
    const sectorStats = setores.map(setor => {
        const count = funcionarios.filter(f => f.setor === setor).length;
        const percentage = fncs > 0 ? Math.round((count / fncs) * 100) : 0;
        return { setor, count, percentage };
    }).sort((a, b) => b.count - a.count).slice(0, 5);

    const sectorsHTML = sectorStats.length === 0
        ? '<p class="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">Nenhum setor cadastrado.</p>'
        : sectorStats.map(s => `
            <div class="py-2.5">
                <div class="flex items-center justify-between text-sm mb-1.5">
                    <span class="font-medium text-slate-700 dark:text-slate-200 truncate pr-2">${s.setor}</span>
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">${s.count} (${s.percentage}%)</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-500" style="width: ${Math.max(s.percentage, 4)}%"></div>
                </div>
            </div>
        `).join('');

    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="stat-card stagger-1" style="opacity:0; animation: fade-in-up 0.4s ease forwards 0ms">
                <div class="flex items-center gap-4 mb-3">
                    <div class="card-icon card-icon-green"><i data-lucide="users" class="w-6 h-6"></i></div>
                    <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Funcionários</h3>
                </div>
                <p class="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">${fncs}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Cadastrados no sistema</p>
                <button onclick="navigate('funcionarios')" class="mt-4 text-xs text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1 group transition-colors">
                    Ver todos <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"></i>
                </button>
            </div>

            <div class="stat-card stagger-2" style="opacity:0; animation: fade-in-up 0.4s ease forwards 60ms">
                <div class="flex items-center gap-4 mb-3">
                    <div class="card-icon bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 rounded-xl p-3"><i data-lucide="folder-tree" class="w-6 h-6"></i></div>
                    <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Setores</h3>
                </div>
                <p class="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">${totalSetores}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Departamentos ativos</p>
                <button onclick="navigate('setores')" class="mt-4 text-xs text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1 group transition-colors">
                    Gerenciar <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"></i>
                </button>
            </div>

            <div class="stat-card stagger-3" style="opacity:0; animation: fade-in-up 0.4s ease forwards 120ms">
                <div class="flex items-center gap-4 mb-3">
                    <div class="card-icon card-icon-blue"><i data-lucide="building-2" class="w-6 h-6"></i></div>
                    <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Empresas</h3>
                </div>
                <p class="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">${emps}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">CNPJs geradores</p>
                <button onclick="navigate('empresas')" class="mt-4 text-xs text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1 group transition-colors">
                    Gerenciar <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"></i>
                </button>
            </div>

            <div class="stat-card stagger-4" style="opacity:0; animation: fade-in-up 0.4s ease forwards 180ms">
                <div class="flex items-center gap-4 mb-3">
                    <div class="card-icon card-icon-violet"><i data-lucide="laptop" class="w-6 h-6"></i></div>
                    <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Equipamentos</h3>
                </div>
                <div class="flex gap-4 mb-2">
                    <div>
                        <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">${eqpsDisponiveis}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">Disponíveis</p>
                    </div>
                    <div class="border-l border-slate-200 dark:border-slate-700 pl-4">
                        <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">${eqpsEmUso}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">Em Uso</p>
                    </div>
                </div>
                ${eqps > 0 ? `
                <div>
                    <div class="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                        <span>Utilização</span><span>${usagePercent}%</span>
                    </div>
                    <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${usagePercent}%"></div></div>
                </div>` : ''}
                <button onclick="navigate('equipamentos')" class="mt-3 text-xs text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1 group transition-colors">
                    Gerenciar <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"></i>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" style="opacity:0; animation: fade-in-up 0.4s ease forwards 240ms">
            <div class="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/50">
                        <div class="flex items-center gap-2.5">
                            <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                <i data-lucide="activity" class="w-4 h-4"></i>
                            </div>
                            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Atividade Recente</h3>
                        </div>
                    </div>
                    <div class="divide-y divide-slate-100 dark:divide-slate-700/30">
                        ${activityHTML}
                    </div>
                </div>
                ${historico.length > 0 ? `
                <div class="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <button onclick="navigate('historico')" class="text-xs text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1 group transition-colors">
                        Ver histórico completo <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"></i>
                    </button>
                </div>` : ''}
            </div>

            <div class="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/50">
                        <div class="flex items-center gap-2.5">
                            <div class="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                <i data-lucide="pie-chart" class="w-4 h-4"></i>
                            </div>
                            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Colaboradores por Setor</h3>
                        </div>
                        <span class="text-xs text-slate-400 dark:text-slate-500">Top Departamentos</span>
                    </div>
                    <div class="space-y-1">
                        ${sectorsHTML}
                    </div>
                </div>
                <div class="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <button onclick="navigate('setores')" class="text-xs text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1 group transition-colors">
                        Gerenciar todos os setores <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
};
