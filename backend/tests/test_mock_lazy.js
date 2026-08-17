const assert = require('assert');
const { createClient } = require('../supabaseMock');

async function runTests() {
    console.log('--- Running Lazy QueryBuilder Tests ---');
    const supabase = createClient();

    // 1. Test Select with Filters
    console.log('Test 1: Select with filters...');
    const { data: allEq } = await supabase.from('equipamentos').select('*');
    assert(allEq && allEq.length > 0, 'Should load equipments');
    console.log(`Loaded ${allEq.length} equipments initially.`);

    const targetEq = allEq[0];
    console.log(`Targeting equipment ID: ${targetEq.id}, status: ${targetEq.status}`);

    const { data: filtered } = await supabase.from('equipamentos').select('*').eq('id', targetEq.id);
    assert.strictEqual(filtered.length, 1, 'Should return exactly 1 equipment with matching ID');
    assert.strictEqual(filtered[0].id, targetEq.id, 'IDs should match');

    // 2. Test Lazy Update (This is the critical fix!)
    console.log('Test 2: Update with filters (lazy evaluation check)...');
    const originalStatus = targetEq.status;
    const testStatus = 'TEST_STATUS_' + Date.now();

    // Perform the update
    const { data: updatedData, error: updateErr } = await supabase
        .from('equipamentos')
        .update({ status: testStatus })
        .eq('id', targetEq.id);

    assert(!updateErr, `Update failed: ${JSON.stringify(updateErr)}`);
    assert.strictEqual(updatedData.length, 1, 'Update response should return exactly 1 updated record');
    assert.strictEqual(updatedData[0].status, testStatus, 'Updated record should have the new status');

    // Verify in database that ONLY that one row was modified
    const { data: reloadedAll } = await supabase.from('equipamentos').select('*');
    const updatedCount = reloadedAll.filter(item => item.status === testStatus).length;
    assert.strictEqual(updatedCount, 1, `CRITICAL BUG: Expected exactly 1 item to be updated, but found ${updatedCount}!`);

    // Verify other items did not change
    const otherItems = reloadedAll.filter(item => item.id !== targetEq.id);
    otherItems.forEach(item => {
        assert.notStrictEqual(item.status, testStatus, `Equipment ID ${item.id} was improperly updated!`);
    });

    console.log('✔ Lazy update test passed perfectly! No database pollution or batch update leak.');

    // 3. Test Select with non-matching filter
    console.log('Test 3: Select with non-matching filter...');
    const { data: emptyResult } = await supabase.from('equipamentos').select('*').eq('id', 'non-existent-id');
    assert.strictEqual(emptyResult.length, 0, 'Should return 0 records');

    // 4. Test Single & MaybeSingle modifier
    console.log('Test 4: Single / maybeSingle modifiers...');
    const { data: singleItem } = await supabase.from('equipamentos').select('*').eq('id', targetEq.id).single();
    assert.strictEqual(typeof singleItem, 'object', 'Should return a single object');
    assert.strictEqual(singleItem.id, targetEq.id);

    // Restore original status
    await supabase.from('equipamentos').update({ status: originalStatus }).eq('id', targetEq.id);
    console.log('✔ All tests passed successfully!');
}

runTests().catch(err => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
});
