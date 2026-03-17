@echo off
echo Iniciando Limbus...
cd backend
echo Instalando dependencias (se necessario)...
call npm install
echo Iniciando servidor...
echo O sistema ira abrir em http://localhost:3000 em breve.
start http://localhost:3000
node server.js
pause
