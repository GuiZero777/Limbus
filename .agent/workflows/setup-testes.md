# Workflow: Setup de Testes Automatizados (Jest + Supertest)

## Contexto
Este workflow adiciona testes automatizados à API do Limbus. São 4 arquivos envolvidos — dois substituídos, um atualizado e um novo.

Os arquivos já estão em `.agent/workflows/` prontos para uso.

---

## Passo 1 — Substituir backend/server.js

```
origem:  .agent/workflows/server.js
destino: backend/server.js
```

**O que mudou em relação à versão anterior:**
- Removida a declaração `const PORT` do topo do arquivo
- O bloco `app.listen()` foi movido para dentro de um `if (require.main === module)` no final
- Adicionado `module.exports = app` — isso permite o Supertest importar o Express sem subir o servidor numa porta real

---

## Passo 2 — Substituir backend/database.js

```
origem:  .agent/workflows/database.js
destino: backend/database.js
```

**O que mudou:**
- Quando `NODE_ENV=test`, o banco usa `:memory:` em vez do arquivo `database.sqlite`
- Adicionada função `resetDb()` exportada — usada pelos testes para limpar o estado entre suítes

---

## Passo 3 — Substituir backend/package.json

```
origem:  .agent/workflows/package-backend.json
destino: backend/package.json
```

> Atenção: o arquivo de origem chama-se `package-backend.json` para não conflitar com o `package.json` da raiz. O destino final é `backend/package.json`.

**O que mudou:**
- Adicionadas devDependencies: `jest` e `supertest`
- Script `test` configurado: `jest --runInBand --forceExit`
- Script `test:watch` adicionado para desenvolvimento
- Configuração do Jest adicionada apontando para `tests/`

---

## Passo 4 — Criar pasta de testes e arquivo de teste

Criar a pasta se não existir:
```bash
mkdir -p backend/tests
```

Copiar o arquivo de testes:
```
origem:  .agent/workflows/api.test.js
destino: backend/tests/api.test.js
```

---

## Passo 5 — Instalar as novas dependências

```bash
cd backend
npm install
cd ..
```

Isso vai instalar `jest` e `supertest` nas devDependencies.

---

## Passo 6 — Rodar os testes para verificar

```bash
cd backend
npm test
```

**Resultado esperado:**
```
 PASS  tests/api.test.js
  Empresas
    GET /api/empresas
      ✓ retorna lista vazia inicialmente
      ✓ retorna empresas cadastradas
    POST /api/empresas
      ✓ cria empresa com dados válidos
      ✓ rejeita CNPJ com menos de 14 dígitos
      ...
  Funcionários ...
  Equipamentos ...
  Histórico ...

Test Suites: 1 passed, 1 total
Tests:       XX passed, XX total
```

Se algum teste falhar, reportar o erro exato antes de continuar.

---

## Passo 7 — Commit

```bash
git add backend/server.js backend/database.js backend/package.json backend/package-lock.json backend/tests/api.test.js
git commit -m "test: add Jest + Supertest API test suite (in-memory SQLite)"
```

---

## Estrutura final esperada

```
backend/
├── tests/
│   └── api.test.js     ← novo
├── database.js          ← atualizado (suporte a :memory:)
├── server.js            ← atualizado (module.exports + require.main)
├── package.json         ← atualizado (jest + supertest)
└── package-lock.json    ← gerado pelo npm install
```

---

## Notas para o agente

- `--runInBand` faz os testes rodarem em série, não em paralelo — necessário porque todos compartilham o mesmo módulo de banco em memória
- `--forceExit` garante que o processo Jest encerra mesmo se houver conexões abertas
- O `database.sqlite` real nunca é tocado durante os testes
- Para rodar em modo watch durante desenvolvimento: `npm run test:watch`
