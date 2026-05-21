# Workflow: Migrar logo.png para WebP

## Contexto
A `logo.png` original (35KB) foi convertida para WebP com qualidade equivalente.
O resultado é `logo.webp` com 24KB — 31% menor, mesma aparência visual.

Também foram geradas variantes em tamanhos menores para uso contextual.

Todos os arquivos já estão em `.agent/workflows/` prontos para uso.

---

## Passo 1 — Copiar os novos arquivos para a raiz do projeto

```
origem:  .agent/workflows/logo.webp       →   destino: logo.webp
origem:  .agent/workflows/logo_256.webp   →   destino: logo_256.webp
origem:  .agent/workflows/logo_128.webp   →   destino: logo_128.webp
origem:  .agent/workflows/logo_64.webp    →   destino: logo_64.webp
origem:  .agent/workflows/logo_32.webp    →   destino: logo_32.webp
```

---

## Passo 2 — Atualizar referências no index.html

Abrir `index.html` e substituir todas as ocorrências de `logo.png` por `logo.webp`.

Exemplo do que procurar:
```html
<img src="logo.png"
```
```html
href="logo.png"
```
```html
content="logo.png"
```

Substituir todas por `logo.webp`.

---

## Passo 3 — Atualizar referência no ui.js

Abrir `js/ui.js` e localizar a modal "Sobre" (função `showInfoModal`).

Procurar:
```js
<img src="logo.png"
```

Substituir por:
```js
<img src="logo.webp"
```

---

## Passo 4 — Busca global por logo.png

Fazer uma busca em todos os arquivos do projeto pela string `logo.png` para garantir que nenhuma referência ficou para trás:

```bash
grep -r "logo.png" --include="*.html" --include="*.js" --include="*.css" .
```

Se encontrar alguma ocorrência, substituir por `logo.webp`.

---

## Passo 5 — Remover o arquivo antigo

```bash
git rm logo.png
```

---

## Passo 6 — Verificar no navegador

Iniciar o servidor e abrir `http://localhost:3000`.

Verificar:
- [ ] Logo aparece corretamente no cabeçalho/sidebar
- [ ] Modal "Sobre" exibe a logo sem erro
- [ ] Nenhum erro 404 no console do navegador relacionado à logo

---

## Passo 7 — Commit

```bash
git add logo.webp logo_256.webp logo_128.webp logo_64.webp logo_32.webp
git add index.html js/ui.js
git commit -m "perf: replace logo.png with WebP variants (24KB vs 35KB, -31%)"
```

---

## Estrutura final esperada

```
Limbus/
├── logo.webp        ← novo (principal, 640x640, 24KB)
├── logo_256.webp    ← novo (modal Sobre, splash)
├── logo_128.webp    ← novo (sidebar, cabeçalho)
├── logo_64.webp     ← novo (uso geral pequeno)
├── logo_32.webp     ← novo (favicon alternativo)
└── logo.png         ← REMOVIDO
```

---

## Notas para o agente

- Não apagar `logo.png` antes de confirmar que `logo.webp` está sendo servido corretamente
- WebP é suportado por todos os browsers modernos (Chrome, Firefox, Safari 14+, Edge) — sem necessidade de fallback para este projeto
- As variantes `logo_256`, `logo_128`, `logo_64`, `logo_32` não precisam ser referenciadas agora — ficam disponíveis para uso futuro em funcionalidades da Fase 2 (landing page, painel do revendedor, etc.)
