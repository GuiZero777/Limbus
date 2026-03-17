@echo off
chcp 65001 >nul
title Limbus — Instalação

echo.
echo  ██╗     ██╗███╗   ███╗██████╗ ██╗   ██╗███████╗
echo  ██║     ██║████╗ ████║██╔══██╗██║   ██║██╔════╝
echo  ██║     ██║██╔████╔██║██████╔╝██║   ██║███████╗
echo  ██║     ██║██║╚██╔╝██║██╔══██╗██║   ██║╚════██║
echo  ███████╗██║██║ ╚═╝ ██║██████╔╝╚██████╔╝███████║
echo  ╚══════╝╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝ ╚══════╝
echo.
echo  Sistema de Gestao de Termos de Equipamentos
echo  --------------------------------------------
echo.

:: ── Verifica Node.js ──────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERRO] Node.js nao encontrado.
    echo.
    echo  Instale o Node.js em: https://nodejs.org
    echo  Recomendado: versao LTS mais recente
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo  [OK] Node.js encontrado: %NODE_VERSION%

:: ── Instala dependências do backend ───────────────────────────
echo.
echo  Instalando dependencias do backend...
cd /d "%~dp0backend"
call npm install --omit=dev --silent
if %ERRORLEVEL% NEQ 0 (
    echo  [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
)
echo  [OK] Dependencias instaladas.
cd /d "%~dp0"

:: ── Cria .env se não existir ───────────────────────────────────
if not exist "%~dp0backend\.env" (
    echo PORT=3000 > "%~dp0backend\.env"
    echo  [OK] Arquivo .env criado com porta padrao 3000.
)

:: ── Inicia o servidor ──────────────────────────────────────────
echo.
echo  Iniciando Limbus...
echo.
echo  Acesse no navegador: http://localhost:3000
echo  Para encerrar: feche esta janela ou pressione Ctrl+C
echo.
echo  ============================================
echo.

node backend/server.js
