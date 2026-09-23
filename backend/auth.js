// backend/auth.js
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.ADMIN_SECRET || 'limbus_secret_jwt_key_2026_mais_internet';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1 dia (24 horas)

// Arquivo de fallback local caso o Supabase ainda não tenha a tabela usuarios criada
const USERS_BACKUP_PATH = path.join(__dirname, 'backup_usuarios.json');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

function generateToken(user) {
    const payload = {
        userId: user.id,
        usuario: user.usuario,
        nome: user.nome,
        perfil: user.perfil || 'operador',
        cargo: user.cargo || 'TI',
        exp: Date.now() + TOKEN_EXPIRY_MS
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
    return `${payloadB64}.${signature}`;
}

function verifyToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
    if (signature !== expectedSignature) return null;

    try {
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
        if (Date.now() > payload.exp) {
            return null; // Token expirado (> 1 dia)
        }
        return payload;
    } catch (e) {
        return null;
    }
}

// Inicializa usuários locais se necessário
function getLocalUsers() {
    try {
        if (fs.existsSync(USERS_BACKUP_PATH)) {
            const raw = fs.readFileSync(USERS_BACKUP_PATH, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {}

    // Usuário padrão inicial: admin / admin123
    const defaultUsers = [
        {
            id: 'a0000000-0000-0000-0000-000000000001',
            nome: 'Administrador TI',
            usuario: 'admin',
            senha_hash: hashPassword('admin123'),
            cargo: 'Administrador',
            perfil: 'admin',
            ativo: true,
            created_at: new Date().toISOString()
        }
    ];
    saveLocalUsers(defaultUsers);
    return defaultUsers;
}

function saveLocalUsers(users) {
    try {
        fs.writeFileSync(USERS_BACKUP_PATH, JSON.stringify(users, null, 2), 'utf8');
    } catch (e) {}
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    getLocalUsers,
    saveLocalUsers,
    TOKEN_EXPIRY_MS
};
