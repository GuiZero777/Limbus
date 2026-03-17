#!/bin/bash
echo "Iniciando Limbus..."
cd backend
echo "Instalando dependencias (se necessario)..."
npm install
echo "Iniciando servidor..."
echo "O sistema estara disponivel em http://localhost:3000"
node server.js
