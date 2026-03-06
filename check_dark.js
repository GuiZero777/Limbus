const fs = require('fs');

const content = fs.readFileSync('c:/Users/Mais_40351/.gemini/antigravity/scratch/Limbus/js/views.js', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/text-slate-[89]00/)) {
        if (!line.match(/dark:text-/)) {
            console.log(`Line ${i + 1}: ${line.trim()}`);
        }
    }
}
