require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const crypto = require('crypto');
const hashDocument = (doc) => {
    const digits = doc.replace(/\D/g, '');
    return crypto.createHash('sha256').update(digits).digest('hex');
};

async function run() {
    const docHash = hashDocument('11111111111');
    const ativadaEm = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('licenca').upsert({
        id: 1, 
        chave: 'LIMBUS-AAAA-BBBB-CCCC', 
        documentoHash: docHash, 
        plano: 'PERPETUO', 
        ativadaEm: ativadaEm, 
        expiresAt: null
    });
    console.log("Licença status:", error || 'Ativada com sucesso');
}
run();
