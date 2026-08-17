const fs = require('fs');
const path = require('path');

function readBOM(file) {
    if (!fs.existsSync(file)) return [];
    let str = fs.readFileSync(file, 'utf8');
    str = str.replace(/^\uFEFF/, '');
    if (!str.trim()) return [];
    try {
        const d = JSON.parse(str);
        return d.value || d || [];
    } catch(e) {
        return [];
    }
}

let db = {
    empresas: readBOM(path.join(__dirname, 'backup_empresas.json')),
    funcionarios: readBOM(path.join(__dirname, 'backup_funcionarios.json')),
    equipamentos: readBOM(path.join(__dirname, 'backup_equipamentos.json')),
    historico: readBOM(path.join(__dirname, 'backup_historico.json'))
};

function resetMockDb() {
    db = { empresas: [], funcionarios: [], equipamentos: [], historico: [] };
}

class QueryBuilder {
    constructor(table, data = null) {
        this.table = table;
        this.data = data;
        this.action = null;
        this.filters = [];
        this.limitVal = null;
        this.rowsToInsert = null;
        this.updates = null;
        this.rowToUpsert = null;
        this.isSingle = false;
        this.isMaybeSingle = false;
        this.resultError = null;
    }

    select(_cols) {
        if (!this.action) {
            this.action = 'select';
        }
        return this;
    }

    eq(col, val) {
        this.filters.push({ type: 'eq', col, val });
        return this;
    }

    neq(col, val) {
        this.filters.push({ type: 'neq', col, val });
        return this;
    }

    limit(n) {
        this.limitVal = n;
        return this;
    }

    single() {
        this.isSingle = true;
        return this;
    }

    maybeSingle() {
        this.isMaybeSingle = true;
        return this;
    }

    persist() {
        if (process.env.NODE_ENV === 'test') return;
        if (['empresas', 'funcionarios', 'equipamentos', 'historico'].includes(this.table)) {
            fs.writeFileSync(path.join(__dirname, `backup_${this.table}.json`), JSON.stringify(db[this.table], null, 2), 'utf8');
        }
    }

    insert(rows) {
        this.action = 'insert';
        this.rowsToInsert = rows;
        return this;
    }

    update(updates) {
        this.action = 'update';
        this.updates = updates;
        return this;
    }

    delete() {
        this.action = 'delete';
        return this;
    }

    upsert(row) {
        this.action = 'upsert';
        this.rowToUpsert = row;
        return this;
    }

    then(resolve, _reject) {
        try {
            if (this.resultError) {
                resolve({ data: null, error: this.resultError });
                return;
            }

            let sourceData = this.data !== null ? this.data : db[this.table];
            if (!sourceData) {
                resolve({ data: null, error: { code: 'PGRST116', message: `Table ${this.table} not found` } });
                return;
            }

            let finalData = null;

            if (this.action === 'insert') {
                const toInsert = Array.isArray(this.rowsToInsert) ? this.rowsToInsert : [this.rowsToInsert];

                if (this.table === 'empresas') {
                    for (const r of toInsert) {
                        if (db.empresas.find(e => e.cnpj === r.cnpj)) {
                            resolve({ data: null, error: { code: '23505', message: 'Unique violation' } });
                            return;
                        }
                    }
                }
                if (this.table === 'equipamentos' || this.table === 'historico') {
                    for (const r of toInsert) {
                        const fid = r.funcionarioId || r['funcionarioId'] || r['"funcionarioId"'];
                        if (fid && !db.funcionarios.find(f => f.id === fid)) {
                            resolve({ data: null, error: { code: '23503', message: 'FK violation' } });
                            return;
                        }
                    }
                }

                db[this.table].push(...toInsert);
                this.persist();
                finalData = JSON.parse(JSON.stringify(toInsert));

            } else if (this.action === 'upsert') {
                const row = this.rowToUpsert;
                const existingIdx = db[this.table].findIndex(item =>
                    (item.id && item.id === row.id) || (item.chave && item.chave === row.chave)
                );
                if (existingIdx >= 0) {
                    db[this.table][existingIdx] = { ...db[this.table][existingIdx], ...row };
                } else {
                    db[this.table].push(row);
                }
                this.persist();
                finalData = [JSON.parse(JSON.stringify(row))];

            } else {
                let targetIndexes = [];
                for (let i = 0; i < db[this.table].length; i++) {
                    const item = db[this.table][i];
                    let matches = true;
                    for (const filter of this.filters) {
                        const valInItem = item[filter.col] !== undefined ? item[filter.col] : item[filter.col.replace(/"/g, '')];
                        if (filter.type === 'eq') {
                            if (valInItem !== filter.val) {
                                matches = false;
                                break;
                            }
                        } else if (filter.type === 'neq') {
                            if (valInItem === filter.val) {
                                matches = false;
                                break;
                            }
                        }
                    }
                    if (matches) {
                        targetIndexes.push(i);
                    }
                }

                if (this.limitVal !== null) {
                    targetIndexes = targetIndexes.slice(0, this.limitVal);
                }

                if (this.action === 'update') {
                    const updates = this.updates || {};
                    const fid = updates.funcionarioId || updates['funcionarioId'] || updates['"funcionarioId"'];
                    if (this.table === 'equipamentos' && fid) {
                        if (!db.funcionarios.find(f => f.id === fid)) {
                            resolve({ data: null, error: { code: '23503', message: 'FK violation' } });
                            return;
                        }
                    }

                    for (const idx of targetIndexes) {
                        const item = db[this.table][idx];
                        const newFid = updates['funcionarioId'] !== undefined ? updates['funcionarioId'] :
                            (updates.funcionarioId !== undefined ? updates.funcionarioId : item.funcionarioId);
                        db[this.table][idx] = { ...item, ...updates, funcionarioId: newFid };
                    }
                    this.persist();
                    finalData = targetIndexes.map(idx => JSON.parse(JSON.stringify(db[this.table][idx])));

                } else if (this.action === 'delete') {
                    finalData = targetIndexes.map(idx => JSON.parse(JSON.stringify(db[this.table][idx])));
                    db[this.table] = db[this.table].filter((_, idx) => !targetIndexes.includes(idx));
                    this.persist();

                } else {
                    finalData = targetIndexes.map(idx => JSON.parse(JSON.stringify(db[this.table][idx])));
                }
            }

            if (this.isSingle) {
                if (!finalData || finalData.length === 0) {
                    resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
                    return;
                }
                finalData = finalData[0];
            } else if (this.isMaybeSingle) {
                finalData = finalData && finalData.length > 0 ? finalData[0] : null;
            }

            resolve({ data: finalData, error: null });
        } catch (e) {
            resolve({ data: null, error: { code: 'UNKNOWN', message: e.message } });
        }
    }
}

const mockClient = {
    from: (table) => new QueryBuilder(table)
};

module.exports = {
    createClient: () => mockClient,
    resetMockDb
};
