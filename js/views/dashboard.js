// js/views/dashboard.js

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
