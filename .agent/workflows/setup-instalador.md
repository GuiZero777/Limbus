# Workflow: Setup de Instalador + Frontend Estático

## Contexto
Este workflow aplica três mudanças simultâneas no projeto Limbus:
1. O `server.js` do backend passa a servir o frontend estático (sem precisar abrir `index.html` direto)
2. Scripts de instalação com 1 clique são adicionados na raiz (`iniciar.bat` para Windows, `iniciar.sh` para Linux)
3. A `API_URL` do frontend é corrigida para usar caminho relativo em vez de `localhost:3000` fixo

Todos os arquivos novos já estão disponíveis em `.agent/workflows/` — não precisa gerá-los, só copiá-los para os destinos corretos.

---

## Passo 1 — Substituir o backend/server.js

Copiar o arquivo novo para o destino:

```
origem:  .agent/workflows/server.js
destino: backend/server.js
```

> Este arquivo já contém a validação de inputs (trabalho anterior) + a linha nova que serve o frontend:
> `app.use(express.static(path.join(__dirname, '..')));`

---

## Passo 2 — Substituir o package.json da raiz

Copiar o arquivo novo para o destino:

```
origem:  .agent/workflows/package.json
destino: package.json
```

> O `package.json` do `backend/` **não muda**. Apenas o da raiz do projeto é substituído.

---

## Passo 3 — Adicionar os scripts de instalação na raiz

Copiar os dois arquivos:

```
origem:  .agent/workflows/iniciar.bat   →   destino: iniciar.bat
origem:  .agent/workflows/iniciar.sh    →   destino: iniciar.sh
```

Após copiar, garantir que o `iniciar.sh` tem permissão de execução:

```bash
chmod +x iniciar.sh
```

---

## Passo 4 — Atualizar o .gitignore da raiz

Copiar o arquivo novo para o destino:

```
origem:  .agent/workflows/.gitignore
destino: .gitignore
```

---

## Passo 5 — Corrigir a API_URL no store.js

Abrir o arquivo `js/store.js` e localizar esta linha:

```js
const API_URL = 'http://localhost:3000/api';
```

Substituir por:

```js
const API_URL = '/api';
```

> Esta mudança faz o frontend funcionar em qualquer porta e em qualquer ambiente (local, servidor, produção) sem precisar editar código.

---

## Passo 6 — Verificar estrutura final

Confirmar que os seguintes arquivos existem no projeto:

```
Limbus/
├── iniciar.bat          ← novo
├── iniciar.sh           ← novo
├── package.json         ← atualizado
├── .gitignore           ← atualizado
├── backend/
│   └── server.js        ← atualizado
└── js/
    └── store.js         ← linha API_URL alterada
```

---

## Passo 7 — Testar localmente

```bash
# Instalar dependências se ainda não instaladas
cd backend && npm install && cd ..

# Iniciar o servidor
node backend/server.js
```

Abrir o navegador em `http://localhost:3000` e verificar:

- [ ] A tela do Limbus carrega normalmente (frontend servido pelo Node)
- [ ] O dashboard mostra os dados (API respondendo em `/api/...`)
- [ ] Nenhum erro de CORS ou "Failed to fetch" no console do navegador
- [ ] Navegar entre todas as telas sem erro

---

## Passo 8 — Commit

```bash
git add backend/server.js package.json iniciar.bat iniciar.sh .gitignore js/store.js
git commit -m "feat: serve frontend via Node.js and add one-click installer scripts"
```

---

## Notas para o agente

- O `backend/package.json` **não é tocado** neste workflow
- O `database.js` **não é tocado** neste workflow
- Os arquivos em `.agent/workflows/` são apenas fontes — não commitar a pasta `.agent/`
- Se o projeto já tiver um `iniciar.bat` ou `iniciar.sh` antigo, substituir sem aviso
