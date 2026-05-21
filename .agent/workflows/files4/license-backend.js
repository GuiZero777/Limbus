// backend/license.js
// Toda a lógica de licenças isolada neste módulo

const crypto = require('crypto');

// =============================================================
// GERAÇÃO DE CHAVES
// =============================================================

// Formato: LIMBUS-XXXX-XXXX-XXXX  (legível, fácil de digitar)
const generateLicenseKey = () => {
    const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    return `LIMBUS-${seg()}-${seg()}-${seg()}`;
};

// Hash do documento (CPF ou CNPJ) para não armazenar em texto puro
const hashDocument = (doc) => {
    const digits = doc.replace(/\D/g, '');
    return crypto.createHash('sha256').update(digits).digest('hex');
};

// =============================================================
// TIPOS E LIMITES
// =============================================================

const PLANOS = {
    PERPETUO: { label: 'Perpétuo',    expiresInDays: null },
    ANUAL:    { label: 'Anual',        expiresInDays: 365  }
};

// Funcionalidades bloqueadas no modo limitado
const FUNCIONALIDADES_PREMIUM = [
    'historico_completo',   // histórico limitado a 7 dias sem licença
    'relatorios',           // impressão de relatório geral
    'importar_planilha',    // importação de Excel
    'exportar_dados'        // exportação de dados
];

// =============================================================
// CÁLCULO DE EXPIRAÇÃO
// =============================================================

const calcularExpiracao = (plano) => {
    const dias = PLANOS[plano]?.expiresInDays;
    if (!dias) return null; // perpétuo
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

// =============================================================
// STATUS DA LICENÇA
// =============================================================

const getLicenseStatus = (licenca) => {
    if (!licenca) {
        return { valid: false, plano: null, expiresAt: null, daysLeft: null };
    }

    if (!licenca.expiresAt) {
        return { valid: true, plano: licenca.plano, expiresAt: null, daysLeft: null };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const expira = new Date(licenca.expiresAt);
    expira.setHours(0, 0, 0, 0);

    const daysLeft = Math.ceil((expira - hoje) / (1000 * 60 * 60 * 24));

    return {
        valid:     daysLeft > 0,
        plano:     licenca.plano,
        expiresAt: licenca.expiresAt,
        daysLeft:  Math.max(0, daysLeft)
    };
};

// =============================================================
// MIDDLEWARE DE VERIFICAÇÃO DE FEATURE
// =============================================================

// Retorna middleware que bloqueia a rota se a feature for premium
// e a licença não for válida
const requireFeature = (feature) => async (req, res, next) => {
    if (!FUNCIONALIDADES_PREMIUM.includes(feature)) return next();

    try {
        const { getDbConnection } = require('./database');
        const db = await getDbConnection();
        const licenca = await db.get('SELECT * FROM licenca LIMIT 1');
        const status = getLicenseStatus(licenca);

        if (status.valid) return next();

        return res.status(403).json({
            error: 'Funcionalidade disponível apenas com licença ativa.',
            feature,
            licenseRequired: true
        });
    } catch (err) {
        console.error('Erro ao verificar licença:', err);
        return next(); // fail open — não bloqueia por erro técnico
    }
};

module.exports = {
    generateLicenseKey,
    hashDocument,
    calcularExpiracao,
    getLicenseStatus,
    requireFeature,
    PLANOS,
    FUNCIONALIDADES_PREMIUM
};
