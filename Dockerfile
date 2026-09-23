# Imagem leve e otimizada do Node.js LTS
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências do backend
COPY backend/package*.json ./backend/

# Instalar apenas dependências de produção
WORKDIR /app/backend
RUN npm ci --only=production

# Voltar para a raiz da aplicação e copiar todo o código
WORKDIR /app
COPY . .

# Expor a porta do servidor Express
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar o servidor
WORKDIR /app/backend
CMD ["node", "server.js"]
