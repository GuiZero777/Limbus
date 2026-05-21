const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'backup_funcionarios.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const uniqueMap = new Map();
data.forEach(item => {
    if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
    }
});

const uniqueData = Array.from(uniqueMap.values());
fs.writeFileSync(file, JSON.stringify(uniqueData, null, 2), 'utf8');
console.log(`Deduplication complete. Reduced from ${data.length} to ${uniqueData.length} records.`);
