# Limbus - Gerador de Termos

Sistema de gestão de termos de equipamentos (EPI/TI), com cadastro de empresas, funcionários, equipamentos e controle de histórico de alocações e devoluções.

## Stack

- **Frontend:** HTML5, Tailwind CSS (CDN), JavaScript vanilla, Lucide Icons, SheetJS
- **Backend:** Node.js, Express 5, SQLite

## Como Rodar

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Iniciar o servidor

```bash
cd backend
npm start
```

O servidor roda em `http://localhost:3000`.

### 3. Abrir o frontend

Abra o arquivo `index.html` no navegador, ou sirva-o com um servidor local (ex: Live Server do VS Code).

## Estrutura do Projeto

```
Limbus/
├── backend/
│   ├── database.js      # Conexão e schema SQLite
│   ├── server.js        # API REST (Express)
│   └── package.json
├── js/
│   ├── app.js           # Entry point
│   ├── views.js         # Renderização das telas
│   ├── store.js         # Gerenciamento de estado
│   ├── print.js         # Geração de termos para impressão
│   ├── ui.js            # Utilitários de UI
│   └── utils.js         # Funções auxiliares
├── index.html           # Página principal
├── styles.css           # Estilos customizados
└── README.md
```

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST/DELETE | `/api/empresas` | CRUD de empresas |
| GET/POST/PUT/DELETE | `/api/funcionarios` | CRUD de funcionários |
| POST | `/api/funcionarios/bulk` | Importação em massa |
| GET/POST/PUT/DELETE | `/api/equipamentos` | CRUD de equipamentos |
| GET/POST/DELETE | `/api/historico` | Histórico de alocações |
