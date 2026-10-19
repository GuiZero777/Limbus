# Manual de Operação do Usuário — Limbus

Este manual orienta a equipe de Tecnologia da Informação (TI) e operadores sobre o uso diário de todos os recursos do **Limbus**.

---

## 🧭 1. Acesso ao Sistema e Autenticação

### Como Acessar
No seu navegador Google Chrome, Microsoft Edge ou Mozilla Firefox, digite:
👉 **`http://172.16.254.50`** ou **`https://limbus.maisinternet.com.br`**

### Tela de Login
1. Digite seu **Usuário** e **Senha**.
2. Clique em **Entrar no Sistema**.
3. **Persistência de Sessão:** A sua conexão fica ativa e salva por **24 horas (1 dia)** no seu computador. No fim do expediente você pode fechar a janela normalmente.

> 🔑 **Primeiro Acesso do Administrador:**
> - **Usuário Inicial:** `admin`
> - **Senha Inicial:** `admin123`

### Como Alterar a Sua Senha
No rodapé da barra lateral esquerda:
1. Clique no ícone de chave (**`🔑`**) ao lado do seu nome.
2. Digite sua senha atual, a nova senha desejada e confirme.
3. Clique em **Salvar Senha**.

### Como Sair (Logout)
Clique no ícone de saída (**`🚪`**) no rodapé da barra lateral e confirme o encerramento da sessão.

---

## 📊 2. Dashboard e Navegação Global

### O Dashboard Principal exibe:
- **Total de Colaboradores Ativos.**
- **Total de Setores e Departamentos.**
- **Total de Empresas / CNPJs cadastrados.**
- **Resumo do Estoque de Equipamentos:** Quantidade total, itens em uso, itens disponíveis e percentual de alocação.
- **Atividade Recente:** Linha do tempo com as últimas entregas e devoluções realizadas.

### 🔍 Busca Global Rápida (Command Palette)
A qualquer momento no sistema, pressione **`Ctrl + K`** (ou a tecla **`/`**) para abrir a barra de busca inteligente.
- Você pode digitar o nome de um funcionário, número de patrimônio, serial number de notebook, setor ou CNPJ de empresa para navegar direto para o item desejado!

---

## 👥 3. Gestão de Funcionários

### Cadastrar um Novo Funcionário
1. No menu lateral, clique em **Funcionários**.
2. Clique no botão **`+ Novo Func.`** no canto superior direito.
3. Preencha:
   - **Nome Completo.**
   - **Setor / Departamento:** Você pode selecionar um setor existente ou clicar em `+ Novo Setor` para criar um na hora.
   - **Função / Cargo.**
   - **Data de Admissão.**
4. Clique em **Salvar**.

### 📥 Importação em Lote via Planilha Excel
Para cadastrar dezenas ou centenas de funcionários de uma só vez:
1. Na tela de Funcionários, clique no botão verde **`Importar`**.
2. Arraste ou selecione a planilha (`.xlsx`, `.xls` ou `.csv`).
3. O sistema analisa automaticamente as abas da planilha procurando pelas colunas **`NOME`**, **`ADMISSÃO`** e **`SETOR`**.
4. Selecione as abas desejadas e clique em **Confirmar Importação**. Colaboradores já cadastrados são identificados e duplicatas são ignoradas com segurança.

### Perfil do Colaborador (Visualização Completa)
Ao clicar em qualquer linha de funcionário:
- Você vê todos os **Equipamentos em uso** pelo colaborador.
- Todos os **Insumos de TI** entregues a ele.
- O **Histórico completo** de termos e devoluções desse funcionário.
- Botões de ação rápida para emitir termos, entregar insumos ou devolver itens.

### ⚠️ Desligamento de Colaborador
Quando um colaborador sai da empresa:
1. No perfil do colaborador ou na tabela, clique no ícone de lixeira (**`🗑️`**).
2. O sistema abrirá uma janela solicitando o **Motivo do Desligamento** (ex: *Demissão sem justa causa*, *Pedido de demissão*, *Término de contrato de experiência*).
3. Ao confirmar:
   - O colaborador é removido da lista de funcionários ativos.
   - Todos os equipamentos que estavam na mão dele retornam **automaticamente para o estoque como `DISPONIVEL`**.
   - O histórico de movimentações é preservado permanentemente com o selo `[Excluído ℹ️]` contendo a justificativa informada.

---

## 💻 4. Gestão de Equipamentos (Notebooks, Monitores, etc.)

### Cadastrar Equipamento no Estoque
1. No menu lateral, clique em **Equipamentos**.
2. Clique em **`+ Novo Equipamento`**.
3. Preencha:
   - **Descrição:** Ex: *Notebook*, *Monitor 24 polegadas*, *Smartphone*.
   - **Modelo / Marca:** Ex: *Dell Vostro 3520*, *Samsung T350*, *Lenovo ThinkPad*.
   - **Número de Patrimônio:** Código de etiqueta interna (opcional).
   - **Serial Number (S/N):** Número de série do fabricante (opcional).
   - **Observações:** Detalhes de configuração, acessórios, carregador, etc.
4. Clique em **Salvar**. O item entra imediatamente no estoque com status **`DISPONIVEL`**.

### Alocação Rápida para Funcionário (Sem Termo)
Na tabela de equipamentos disponíveis, você pode clicar no botão **`Alocar`** para associar o item diretamente a um colaborador sem abrir o gerador de termos completo.

---

## 📦 5. Gestão de Insumos de TI (Periféricos & Acessórios)

O módulo de Insumos gerencia itens de consumo e periféricos menores (mouses, teclados, cabos de rede, fones, adaptadores):
1. No menu lateral, clique em **Insumos de TI**.
2. Clique em **`+ Novo Insumo`**:
   - Informe o **Nome do Insumo** (ex: *Mouse sem fio Logitech M170*), **Categoria** e a **Quantidade Total Adquirida**.
3. O sistema calcula automaticamente:
   - $\text{Disponível em Estoque} = \text{Quantidade Total} - \text{Quantidade Entregue a Colaboradores}$

---

## 📄 6. Emissão de Termos de Responsabilidade

### Termo de Entrega (Alocação de Itens)
1. No perfil do funcionário ou na tabela, clique no botão com ícone de documento (**`📄`**).
2. Selecione a **Empresa Emissora (CNPJ)** do grupo.
3. Marque os equipamentos disponíveis que serão entregues ao colaborador.
4. O sistema gera a prévia do **Termo de Responsabilidade** pronto para assinatura física ou digital.
5. Clique em **Imprimir Termo** para abrir a janela de impressão em folha padrão A4.
6. Ao confirmar a emissão, o sistema:
   - Altera os equipamentos selecionados para status **`EM_USO`**.
   - Vincula os itens ao colaborador.
   - Registra o evento no **Histórico Geral**.

### Devolução de Equipamentos
- **Devolução Individual:** No perfil do colaborador, clique em **Devolver** ao lado do equipamento desejado.
- **Devolução Completa:** Clique em **Devolver Tudo** para retornar todos os itens em posse do colaborador para o estoque de uma só vez.

---

## 🛡️ 7. Gestão de Usuários & Acessos (Apenas Administradores)

Usuários com perfil de **Administrador** têm acesso à aba **Usuários & Acessos**:
1. Clique em **`+ Novo Usuário`**.
2. Preencha:
   - **Nome Completo** (ex: *Lucas Silva*).
   - **Login / Usuário** (ex: *lucas.silva*).
   - **Perfil:**
     - `Administrador`: Gestão total + administração de usuários.
     - `Operador`: Operação diária completa de TI.
   - **Senha Inicial.**
3. Clique em **Criar Usuário**.
4. Você pode editar o perfil, redefinir senhas ou desativar o acesso de qualquer usuário a qualquer momento.

---

## ⌨️ 8. Atalhos de Teclado Úteis

| Tecla | Ação |
| :--- | :--- |
| `Ctrl + K` ou `/` | Abre a busca global (Command Palette) |
| `Esc` | Fecha qualquer modal ou janela aberta |
| `Ctrl + F5` | Força a atualização do navegador limpando o cache local |
| `Ctrl + P` | Imprime a página ou termo aberto |
