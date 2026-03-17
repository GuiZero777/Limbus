# Workflow: Modularizar views.js

## Contexto
O arquivo `js/views.js` tem 1684 linhas e precisa ser dividido em 6 módulos separados dentro de uma nova pasta `js/views/`. Os arquivos novos já foram gerados externamente e estão prontos — sua tarefa é aplicá-los no repositório e garantir que tudo funcione.

---

## Passo 1 — Criar a pasta de módulos

```bash
mkdir -p js/views
```

---

## Passo 2 — Criar os 6 arquivos de módulo

Crie cada arquivo abaixo com o conteúdo exato indicado.

### `js/views/dashboard.js`
Contém apenas a função `renderDashboard`. Copie do arquivo externo gerado ou use o conteúdo abaixo:
- Função: `const renderDashboard = (container, headerActions) => { ... }`
- Dependências usadas: `getFuncionarios`, `getEmpresas`, `getEquipamentos`, `getHistorico`, `formatInputDate`, `navigate`

### `js/views/empresas.js`
Contém apenas a função `renderEmpresas`.
- Função: `const renderEmpresas = (container, headerActions) => { ... }`
- Dependências usadas: `getEmpresas`, `formatCNPJ`, `addEmpresa`, `removeEmpresa`, `showModal`, `hideModal`, `showConfirm`, `showToast`

### `js/views/equipamentos.js`
Contém apenas a função `renderEquipamentos`.
- Função: `const renderEquipamentos = (container, headerActions) => { ... }`
- Dependências usadas: `getEquipamentos`, `getEquipamentoById`, `getFuncionarios`, `addEquipamento`, `removeEquipamento`, `editEquipamento`, `addHistorico`, `showModal`, `hideModal`, `showConfirm`, `showToast`, `debounce`

### `js/views/funcionarios.js`
Contém `renderFuncionarios` e `window.renderFuncionarioPerfil`.
- Atenção: `renderFuncionarioPerfil` DEVE ser exposta como `window.renderFuncionarioPerfil` porque é chamada via `onclick` inline no HTML gerado.
- Dependências usadas: todas as anteriores + `bulkAddFuncionarios`, `editFuncionario`, `removeFuncionario`, `addFuncionario`, `getFuncionarioById`, `XLSX` (biblioteca externa já carregada)

### `js/views/gerador.js`
Contém apenas a função `renderGeradorTermo`.
- Função: `const renderGeradorTermo = (container, headerActions, params) => { ... }`
- Dependências usadas: `getFuncionarioById`, `getEmpresas`, `getEquipamentos`, `getEmpresaById`, `editEquipamento`, `addHistorico`, `generateAndPrintTermo`, `showToast`, `formatInputDate`, `formatCNPJ`, `navigate`, `debounce`

### `js/views/historico.js`
Contém apenas a função `renderHistoricoGeral`.
- Função: `const renderHistoricoGeral = (container, headerActions, filters = {}) => { ... }`
- Dependências usadas: `getHistorico`, `getEquipamentos`, `getFuncionarios`, `formatInputDate`, `removeHistoricoEntry`, `clearHistorico`, `showConfirm`, `showToast`

---

## Passo 3 — Atualizar o index.html

Localizar esta linha no `index.html`:
```html
<script src="js/views.js"></script>
```

Substituir por:
```html
<!-- Views modulares -->
<script src="js/views/dashboard.js"></script>
<script src="js/views/equipamentos.js"></script>
<script src="js/views/empresas.js"></script>
<script src="js/views/funcionarios.js"></script>
<script src="js/views/gerador.js"></script>
<script src="js/views/historico.js"></script>
```

A ordem final de todos os scripts no `index.html` deve ser:
```html
<script src="js/utils.js"></script>
<script src="js/store.js"></script>
<script src="js/ui.js"></script>
<script src="js/print.js"></script>
<script src="js/views/dashboard.js"></script>
<script src="js/views/empresas.js"></script>
<script src="js/views/equipamentos.js"></script>
<script src="js/views/funcionarios.js"></script>
<script src="js/views/gerador.js"></script>
<script src="js/views/historico.js"></script>
<script src="js/app.js"></script>
```

> ⚠️ `app.js` DEVE ser o último script. Ele depende de todas as funções `render*` estarem definidas.

---

## Passo 4 — Verificar seletor de navegação ativa

Em `js/views/funcionarios.js`, dentro de `renderFuncionarioPerfil`, há duas ocorrências deste seletor:

```js
const currentView = document.querySelector('a.nav-btn.active')?.dataset.view;
```

Abrir o `index.html` e verificar se os botões de navegação são `<a>` ou `<button>`. Se forem `<button>`, corrigir o seletor para:

```js
const currentView = document.querySelector('button.nav-btn.active')?.dataset.view;
```

---

## Passo 5 — Deletar o arquivo antigo

```bash
rm js/views.js
```

---

## Passo 6 — Testar o sistema

Iniciar o servidor normalmente e verificar:

- [ ] Dashboard carrega com os stats corretos
- [ ] Navegação entre todas as telas funciona
- [ ] Cadastro e remoção de empresa funciona
- [ ] Cadastro, remoção e alocação de equipamento funciona
- [ ] Cadastro, edição, remoção de funcionário funciona
- [ ] Importação de planilha Excel funciona
- [ ] Perfil do funcionário abre (botão "Perfil" na tabela)
- [ ] Devolução individual e "Devolver Todos" funciona
- [ ] Geração de termo PDF funciona
- [ ] Histórico com filtros de data funciona
- [ ] Imprimir relatório do histórico funciona

---

## Passo 7 — Commit

```bash
git add js/views/
git add index.html
git rm js/views.js
git commit -m "refactor: modularize views.js into js/views/ (6 modules)"
```

---

## Resultado esperado

| Antes | Depois |
|---|---|
| `js/views.js` — 1684 linhas | 6 arquivos, maior com 714 linhas |
| 1 arquivo para editar qualquer tela | arquivo específico por contexto |
| Conflitos de merge em qualquer mudança | merge cirúrgico por módulo |
