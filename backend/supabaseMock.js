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
    empresas: [], 
    funcionarios: readBOM(path.join(__dirname, 'backup_funcionarios.json')), 
    equipamentos: readBOM(path.join(__dirname, 'backup_equipamentos.json')), 
    historico: readBOM(path.join(__dirname, 'backup_historico.json')), 
    licenca: [{
        id: 1, 
        chave: 'LIMBUS-PREM-IUMM-MOCK', 
        documentoHash: 'mocked', 
        plano: 'PERPETUO', 
        ativadaEm: new Date().toISOString().split('T')[0], 
        expiresAt: null
    }], 
    licencas_emitidas: []
};

function resetMockDb() {
    db = { empresas: [], funcionarios: [], equipamentos: [], historico: [], licenca: [], licencas_emitidas: [] };
}

class QueryBuilder {
    constructor(table, data = null) {
        this.table = table;
        this.resultData = data !== null ? data : [...db[table]];
        this.resultError = null;
        this.isSingle = false;
        this.isMaybeSingle = false;
    }

    select(cols) { return this; }

    eq(col, val) {
        if (Array.isArray(this.resultData)) {
            this.resultData = this.resultData.filter(item => item[col] === val || item[col.replace(/"/g, '')] === val);
        }
        return this;
    }
    
    neq(col, val) {
        if (Array.isArray(this.resultData)) {
            this.resultData = this.resultData.filter(item => item[col] !== val && item[col.replace(/"/g, '')] !== val);
        }
        return this;
    }

    limit(n) {
        if (Array.isArray(this.resultData)) {
            this.resultData = this.resultData.slice(0, n);
        }
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
        if (['empresas', 'funcionarios', 'equipamentos', 'historico'].includes(this.table)) {
            fs.writeFileSync(path.join(__dirname, `backup_${this.table}.json`), JSON.stringify(db[this.table], null, 2), 'utf8');
        }
    }

    insert(rows) {
        const toInsert = Array.isArray(rows) ? rows : [rows];
        
        if (this.table === 'empresas') {
            for (const r of toInsert) {
                if (db.empresas.find(e => e.cnpj === r.cnpj)) {
                    this.resultError = { code: '23505', message: 'Unique violation' };
                    return this;
                }
            }
        }
        if (this.table === 'equipamentos' || this.table === 'historico') {
            for (const r of toInsert) {
                const fid = r.funcionarioId || r['funcionarioId'] || r['"funcionarioId"'];
                if (fid && !db.funcionarios.find(f => f.id === fid)) {
                    this.resultError = { code: '23503', message: 'FK violation' };
                    return this;
                }
            }
        }

        db[this.table].push(...toInsert);
        this.resultData = toInsert;
        this.persist();
        return this;
    }

    update(updates) {
        const fid = updates.funcionarioId || updates['funcionarioId'] || updates['"funcionarioId"'];
        if (this.table === 'equipamentos' && fid) {
            if (!db.funcionarios.find(f => f.id === fid)) {
                this.resultError = { code: '23503', message: 'FK violation' };
                return this;
            }
        }

        if (Array.isArray(this.resultData)) {
            this.resultData = this.resultData.map(item => {
                const newFid = updates['funcionarioId'] !== undefined ? updates['funcionarioId'] :
                               (updates.funcionarioId !== undefined ? updates.funcionarioId : item.funcionarioId);
                return { ...item, ...updates, funcionarioId: newFid };
            });
            for (let i = 0; i < db[this.table].length; i++) {
                const updatedItem = this.resultData.find(x => x.id === db[this.table][i].id || x.chave === db[this.table][i].chave);
                if (updatedItem) db[this.table][i] = updatedItem;
            }
        }
        this.persist();
        return this;
    }

    delete() {
        if (Array.isArray(this.resultData)) {
            const idsToDelete = this.resultData.map(i => i.id || i.chave);
            db[this.table] = db[this.table].filter(item => !idsToDelete.includes(item.id || item.chave));
        }
        this.persist();
        return this;
    }

    upsert(row) {
        const existingIdx = db[this.table].findIndex(item => 
            (item.id && item.id === row.id) || (item.chave && item.chave === row.chave)
        );
        if (existingIdx >= 0) {
            db[this.table][existingIdx] = { ...db[this.table][existingIdx], ...row };
        } else {
            db[this.table].push(row);
        }
        this.resultData = [row];
        this.persist();
        return this;
    }

    then(resolve, reject) {
        if (this.resultError) {
            resolve({ data: null, error: this.resultError });
            return;
        }

        let finalData = this.resultData;
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
    }
}

const mockClient = {
    from: (table) => new QueryBuilder(table)
};

module.exports = {
    createClient: () => mockClient,
    resetMockDb
};
