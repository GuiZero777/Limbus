# Workflow: Sistema de Licença

## Contexto
Implementa o sistema de licença do Limbus. Funciona assim:
- Você emite uma chave via rota admin (`POST /api/licenca/emitir`)
- O cliente insere a chave + CPF ou CNPJ no sistema
- O backend valida e ativa a licença
- Sem licença válida: histórico limitado a 7 dias, sem relatórios, sem importação de planilha

Todos os arquivos estão em `.agent/workflows/` prontos para uso.

---

## Passo 1 — Adicionar arquivo de licença no backend

```
origem:  .agent/workflows/license-backend.js
destino: backend/license.js
```

---

## Passo 2 — Atualizar backend/database.js

```
origem:  .agent/workflows/database.js
destino: backend/database.js
```

Mudança: adiciona tabela `licenca` e `licencas_emitidas` ao schema.

---

## Passo 3 — Atualizar backend/server.js

```
origem:  .agent/workflows/server.js
destino: backend/server.js
```

Mudança: importa `license.js`, adiciona 3 rotas (`GET /api/licenca`, `POST /api/licenca/ativar`, `POST /api/licenca/emitir`) e aplica middleware de feature no histórico.

---

## Passo 4 — Adicionar ADMIN_SECRET no .env

Abrir (ou criar) `backend/.env` e adicionar:

```
PORT=3000
ADMIN_SECRET=troque_por_uma_senha_forte_aqui
```

> Este secret protege a rota `/api/licenca/emitir`. Troque por uma string aleatória longa antes de usar em produção.

---

## Passo 5 — Adicionar arquivo de licença no frontend

```
origem:  .agent/workflows/license-frontend.js
destino: js/license.js
```

---

## Passo 6 — Adicionar estilos do banner ao styles.css

Abrir `styles.css` e adicionar todo o conteúdo do arquivo abaixo ao **final** do arquivo:

```
origem:  .agent/workflows/license-styles.css
```

Não substituir o styles.css — apenas **concatenar** ao final.

---

## Passo 7 — Modificar app.js

Abrir `js/app.js` e fazer duas mudanças:

**Mudança 1** — na função `init()`, adicionar carregamento da licença:

```js
const init = async () => {
    await initializeStore();
    await loadLicenseState();       // ← adicionar
    setupNavigation();
    renderLicenseBanner();          // ← adicionar
    navigate('dashboard');
};
```

**Mudança 2** — na função `navigate()`, expor a view atual globalmente:

```js
const navigate = (viewName, params = {}) => {
    if (!views[viewName]) return;
    currentView = viewName;
    window.currentView = viewName;  // ← adicionar esta linha
    viewParams = params;
    // ... resto igual
};
```

---

## Passo 8 — Modificar js/views/funcionarios.js

No evento do botão `btn-import-planilha`, adicionar verificação de licença no início do handler:

```js
document.getElementById('btn-import-planilha').addEventListener('click', () => {
    if (!isFeatureAvailable('importar_planilha')) {
        renderLicenseActivation();
        return;
    }
    // ... resto do código de importação igual
});
```

---

## Passo 9 — Modificar js/views/historico.js

**Mudança 1** — após carregar o histórico do `getHistorico()`, adicionar filtro de período:

```js
let historico = getHistorico().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// Limite de 7 dias no modo sem licença
if (!isFeatureAvailable('historico_completo')) {
    const limite = new Date();
    limite.setDate(limite.getDate() - 7);
    const limiteStr = limite.toISOString().split('T')[0];
    historico = historico.filter(h => h.data >= limiteStr);
}
```

**Mudança 2** — no evento do botão `btn-print-historico`, adicionar verificação:

```js
document.getElementById('btn-print-historico')?.addEventListener('click', () => {
    if (!isFeatureAvailable('relatorios')) {
        renderLicenseActivation();
        return;
    }
    // ... resto do código de impressão igual
});
```

---

## Passo 10 — Modificar index.html

**Adicionar** `js/license.js` na lista de scripts, ANTES de `app.js`:

```html
<script src="js/license.js"></script>
<script src="js/app.js"></script>
```

Ordem completa dos scripts após a mudança:
```html
<script src="js/utils.js"></script>
<script src="js/store.js"></script>
<script src="js/ui.js"></script>
<script src="js/print.js"></script>
<script src="js/license.js"></script>
<script src="js/views/dashboard.js"></script>
<script src="js/views/empresas.js"></script>
<script src="js/views/equipamentos.js"></script>
<script src="js/views/funcionarios.js"></script>
<script src="js/views/gerador.js"></script>
<script src="js/views/historico.js"></script>
<script src="js/app.js"></script>
```

---

## Passo 11 — Testar o sistema

Iniciar o servidor:
```bash
node backend/server.js
```

**Teste 1 — emitir uma chave de licença (você como admin):**
```bash
curl -X POST http://localhost:3000/api/licenca/emitir \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: troque_por_uma_senha_forte_aqui" \
  -d '{"documento": "12345678000195", "plano": "PERPETUO"}'
```
Deve retornar `{ "chave": "LIMBUS-XXXX-XXXX-XXXX", "plano": "PERPETUO", "documento": "CNPJ" }`

**Teste 2 — verificar status sem licença:**
```bash
curl http://localhost:3000/api/licenca
```
Deve retornar `{ "ativa": false, ... }`

**Teste 3 — ativar a chave:**
```bash
curl -X POST http://localhost:3000/api/licenca/ativar \
  -H "Content-Type: application/json" \
  -d '{"chave": "LIMBUS-XXXX-XXXX-XXXX", "documento": "12345678000195"}'
```
Deve retornar `{ "ativa": true, "plano": "PERPETUO", ... }`

**Teste 4 — verificar no navegador:**
- [ ] Abrir `http://localhost:3000`
- [ ] Sem licença: banner amarelo aparece no topo
- [ ] Histórico mostra só últimos 7 dias
- [ ] Botão "Importar Planilha" abre modal de ativação
- [ ] Botão "Imprimir Relatório" abre modal de ativação
- [ ] Ativar a licença via modal: banner some, funcionalidades desbloqueadas

---

## Passo 12 — Commit

```bash
git add backend/license.js backend/database.js backend/server.js
git add js/license.js styles.css index.html
git add js/app.js js/views/funcionarios.js js/views/historico.js
git commit -m "feat: add license system (perpetual + annual, CPF/CNPJ, freemium mode)"
```

---

## Estrutura final

```
Limbus/
├── backend/
│   ├── license.js          ← novo
│   ├── database.js         ← atualizado (tabela licenca)
│   ├── server.js           ← atualizado (rotas de licença)
│   └── .env                ← atualizado (ADMIN_SECRET)
└── js/
    ├── license.js          ← novo
    ├── app.js              ← atualizado (loadLicenseState)
    └── views/
        ├── funcionarios.js ← atualizado (bloqueia import)
        └── historico.js    ← atualizado (limita 7 dias + bloqueia relatório)
```

---

## Como emitir licenças para clientes

Após cada venda, você chama a rota de emissão com o documento do comprador e o plano:

```bash
# Licença perpétua para CNPJ
curl -X POST https://seuservidor/api/licenca/emitir \
  -H "x-admin-secret: SUA_SENHA" \
  -d '{"documento": "CNPJ_DO_CLIENTE", "plano": "PERPETUO"}'

# Licença anual para CPF
curl -X POST https://seuservidor/api/licenca/emitir \
  -H "x-admin-secret: SUA_SENHA" \
  -d '{"documento": "CPF_DO_CLIENTE", "plano": "ANUAL"}'
```

A chave retornada é enviada ao cliente por email ou WhatsApp.
