// js/views/historico.js

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

    const equipamentos = getEquipamentos();
    const funcionarios = getFuncionarios();
    const agrupadoHistorico = historico;

    // Event for printing
    setTimeout(() => {
        document.getElementById('btn-print-historico')?.addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showToast('Por favor, permita pop-ups para imprimir o relatório.', 'warning');
                return;
            }

            const htmlContent = `
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
                        ${agrupadoHistorico.length === 0 ? '<tr><td colspan="4" style="text-align:center;">Nenhum evento registrado.</td></tr>' : agrupadoHistorico.map(h => {
                            const fnc = funcionarios.find(f => f.id === h.funcionarioId) || { nome: 'Func. Excluído' };
                            const dataStr = formatInputDate(h.data);
                            const timeStr = new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                            let badgeClass = '', badgeLabel = '';
                            if (h.tipo === 'ENTREGA') { badgeClass = 'entrega'; badgeLabel = 'Entrega'; }
                            else if (h.tipo === 'ALOCACAO_MANUAL') { badgeClass = 'alocacao'; badgeLabel = 'Alocação Manual'; }
                            else if (h.tipo === 'DEVOLUCAO' || h.tipo === 'DEVOLUCAO_COMPLETA') { badgeClass = 'devolucao'; badgeLabel = 'Devolução'; }

                            let eqpContent = '';
                            let eqIds = h.equipamentosIds;
                            if (typeof eqIds === 'string') {
                                try { eqIds = JSON.parse(eqIds); } catch { eqIds = []; }
                            }
                            if (Array.isArray(eqIds) && eqIds.length > 0) {
                                const eqps = eqIds.map(eId => {
                                    const found = equipamentos.find(e => e.id === eId);
                                    if (found) return found;
                                    
                                    if (Array.isArray(h.equipamentosSnapshots)) {
                                        const snap = h.equipamentosSnapshots.find(s => s.id === eId);
                                        if (snap) return snap;
                                    }
                                    return { descricao: 'Equip. Excluído', modeloMarca: '' };
                                });
                                eqpContent = eqps.map(eq => '<strong>' + eq.descricao + '</strong><br><span style="color:#666; font-size:11px;">' + eq.modeloMarca + '</span>').join('<div style="margin: 5px 0; border-top: 1px dotted #ccc;"></div>');
                            } else {
                                let eqp = equipamentos.find(e => e.id === h.equipamentoId);
                                if (!eqp) {
                                    if (h.equipamentoSnapshot) eqp = h.equipamentoSnapshot;
                                    else eqp = { descricao: 'Equip. Excluído', modeloMarca: '' };
                                }
                                eqpContent = '<strong>' + eqp.descricao + '</strong><br><span style="color:#666; font-size:11px;">' + eqp.modeloMarca + '</span>';
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
            printWindow.document.write(htmlContent);
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
                badge = '<span class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800"><i data-lucide="arrow-down-right" class="w-3.5 h-3.5"></i> Entrega</span>';
            } else if (h.tipo === 'ALOCACAO_MANUAL') {
                badge = '<span class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold bg-blue-100 text-blue-800"><i data-lucide="user-check" class="w-3.5 h-3.5"></i> Alocação Manual</span>';
            } else if (h.tipo === 'DEVOLUCAO' || h.tipo === 'DEVOLUCAO_COMPLETA') {
                badge = '<span class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold bg-amber-100 text-amber-800"><i data-lucide="arrow-up-left" class="w-3.5 h-3.5"></i> Devolução</span>';
            }

            let eqpContent = '';
            let eqIds = h.equipamentosIds;
            if (typeof eqIds === 'string') {
                try { eqIds = JSON.parse(eqIds); } catch { eqIds = []; }
            }
            if (Array.isArray(eqIds) && eqIds.length > 0) {
                const eqps = eqIds.map(eId => {
                    const found = equipamentos.find(e => e.id === eId);
                    if (found) return found;
                    
                    // Fallback para o snapshot
                    if (Array.isArray(h.equipamentosSnapshots)) {
                        const snap = h.equipamentosSnapshots.find(s => s.id === eId);
                        if (snap) return snap;
                    }
                    return { descricao: 'Equip. Excluído', modeloMarca: '' };
                });
                eqpContent = eqps.map(eq => {
                    const tagInfo = eq.patrimonio ? ` <span class="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold px-1.5 py-0.5 rounded">Patr: ${eq.patrimonio}</span>` : '';
                    const serialInfo = eq.serialNumber ? ` &bull; Serial: ${eq.serialNumber}` : '';
                    return '<span class="block text-slate-800 dark:text-slate-100 font-medium">' + eq.descricao + tagInfo + '</span><span class="block text-xs text-slate-500 dark:text-slate-400">' + eq.modeloMarca + serialInfo + '</span>';
                }).join('<div class="my-2 border-t border-slate-100 dark:border-slate-700"></div>');
            } else {
                let eqp = equipamentos.find(e => e.id === h.equipamentoId);
                if (!eqp) {
                    if (h.equipamentoSnapshot) eqp = h.equipamentoSnapshot;
                    else eqp = { descricao: 'Equip. Excluído', modeloMarca: '' };
                }
                const tagInfo = eqp.patrimonio ? ` <span class="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold px-1.5 py-0.5 rounded">Patr: ${eqp.patrimonio}</span>` : '';
                const serialInfo = eqp.serialNumber ? ` &bull; Serial: ${eqp.serialNumber}` : '';
                eqpContent = '<span class="block text-slate-800 dark:text-slate-100 font-medium">' + eqp.descricao + tagInfo + '</span><span class="block text-xs text-slate-500 dark:text-slate-400">' + eqp.modeloMarca + serialInfo + '</span>';
            }

            // ID para deletar
            const deleteIds = h.id ? [h.id] : [];
            const deleteDataAttr = deleteIds.length > 0 ? "data-ids='" + JSON.stringify(deleteIds) + "'" : '';

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

    tableHTML += '</tbody></table></div>';

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
                try {
                    for (const id of ids) {
                        await removeHistoricoEntry(id);
                    }
                    showToast('Entrada removida do histórico.', 'success');
                    renderHistoricoGeral(container, headerActions, {
                        start: startInput?.value || '',
                        end: endInput?.value || ''
                    });
                } catch (err) {
                    showToast(err.message, 'error');
                }
            }
        });
    });

    // Apagar Histórico Event
    document.getElementById('btn-clear-historico')?.addEventListener('click', async () => {
        const ok = await showConfirm('Tem certeza absoluta que deseja APAGAR TODO O HISTÓRICO? Esta ação não pode ser desfeita.', { title: 'Apagar todo histórico', type: 'danger', confirmText: 'Apagar Tudo' });
        if (ok) {
            try {
                await clearHistorico();
                showToast('Todo o histórico foi apagado com sucesso.', 'success');
                renderHistoricoGeral(container, headerActions);
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    });
};
