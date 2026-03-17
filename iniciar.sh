#!/bin/bash
set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN} ██╗     ██╗███╗   ███╗██████╗ ██╗   ██╗███████╗${NC}"
echo -e "${CYAN} ██║     ██║████╗ ████║██╔══██╗██║   ██║██╔════╝${NC}"
echo -e "${CYAN} ██║     ██║██╔████╔██║██████╔╝██║   ██║███████╗${NC}"
echo -e "${CYAN} ██║     ██║██║╚██╔╝██║██╔══██╗██║   ██║╚════██║${NC}"
echo -e "${CYAN} ███████╗██║██║ ╚═╝ ██║██████╔╝╚██████╔╝███████║${NC}"
echo -e "${CYAN} ╚══════╝╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝ ╚══════╝${NC}"
echo ""
echo " Sistema de Gestão de Termos de Equipamentos"
echo " --------------------------------------------"
echo ""

# ── Detecta diretório raiz do script ──────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Verifica Node.js ──────────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo -e " ${RED}[ERRO]${NC} Node.js não encontrado."
    echo ""
    echo " Instale via gerenciador de pacotes:"
    echo "   Ubuntu/Debian : sudo apt install nodejs npm"
    echo "   Fedora/RHEL   : sudo dnf install nodejs"
    echo "   macOS (brew)  : brew install node"
    echo "   Ou baixe em  : https://nodejs.org"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e " ${GREEN}[OK]${NC} Node.js encontrado: $NODE_VERSION"

# ── Instala dependências do backend ───────────────────────────
echo ""
echo " Instalando dependências do backend..."
cd "$SCRIPT_DIR/backend"
npm install --omit=dev --silent
echo -e " ${GREEN}[OK]${NC} Dependências instaladas."
cd "$SCRIPT_DIR"

# ── Cria .env se não existir ──────────────────────────────────
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    echo "PORT=3000" > "$SCRIPT_DIR/backend/.env"
    echo -e " ${GREEN}[OK]${NC} Arquivo .env criado com porta padrão 3000."
fi

# ── Lê porta do .env ──────────────────────────────────────────
PORT=$(grep -E '^PORT=' "$SCRIPT_DIR/backend/.env" | cut -d '=' -f2 | tr -d '[:space:]')
PORT=${PORT:-3000}

# ── Inicia o servidor ──────────────────────────────────────────
echo ""
echo " Iniciando Limbus..."
echo ""
echo -e " Acesse no navegador: ${CYAN}http://localhost:${PORT}${NC}"
echo " Para encerrar: pressione Ctrl+C"
echo ""
echo " ============================================"
echo ""

node backend/server.js
