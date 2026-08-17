const assert = require('assert');
const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse response from ${url}: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

async function verifyState() {
    console.log('--- Verifying Database State via REST APIs ---');

    // 1. Get all equipments
    const equipments = await get('http://localhost:3000/api/equipamentos');
    const adaoId = '64ce6fe1-a7f4-4519-b03f-30f4210e9853';

    const adaoEquipments = equipments.filter(eq => eq.funcionarioId === adaoId);
    console.log(`Adão Cleiton has ${adaoEquipments.length} equipments in possession:`);
    adaoEquipments.forEach(eq => console.log(` - [${eq.status}] ${eq.descricao} (${eq.modeloMarca}) - ID: ${eq.id}`));

    assert.strictEqual(adaoEquipments.length, 5, 'Adão should have exactly 5 equipments in possession');
    adaoEquipments.forEach(eq => {
        assert.strictEqual(eq.status, 'EM_USO', `Equipment ID ${eq.id} status should be EM_USO`);
    });

    // 2. Get history
    const history = await get('http://localhost:3000/api/historico');
    const adaoHistory = history.filter(h => h.funcionarioId === adaoId);
    console.log(`Adão Cleiton has ${adaoHistory.length} history timeline entries:`);

    adaoHistory.forEach(h => {
        console.log(` - [${h.tipo}] Date: ${h.data}, Timestamp: ${h.timestamp}`);
        if (h.equipamentosIds) {
            console.log('   Items:', h.equipamentosIds);
        }
        if (h.equipamentosSnapshots) {
            console.log('   Snapshots:', h.equipamentosSnapshots);
        }
    });

    assert.strictEqual(adaoHistory.length, 1, 'Adão should have exactly 1 history timeline entry');
    const delivery = adaoHistory[0];
    assert.strictEqual(delivery.tipo, 'ENTREGA', 'Timeline entry type should be ENTREGA');
    assert.strictEqual(delivery.equipamentosIds.length, 5, 'Timeline entry should contain all 5 equipment IDs');
    assert.strictEqual(delivery.equipamentosSnapshots.length, 5, 'Timeline entry should contain all 5 snapshots');

    console.log('✔ All database state verification checks passed successfully!');
}

verifyState().catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
});
