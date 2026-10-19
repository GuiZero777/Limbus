# ENGENHARIA E GESTÃO DE PROJETOS
## MODELO DE ESCOPO DE PROJETO
**Documento para planejamento e definição do escopo de projetos de TI**

* **Aluno(s):** Guilherme Bardalho
* **Turma:** Engenharia de Software / Gestão de TI
* **Data:** Outubro de 2026
* **Professor(a):** [Nome do Professor / Orientador]

---

### Como utilizar este documento
Este modelo define de forma simples, clara e objetiva o que faz parte do projeto **Limbus**, quais são as entregas, os limites do sistema, premissas e requisitos práticos para a operação.

---

## 1. Identificação do Projeto

| Campo | Preenchimento |
| :--- | :--- |
| **Nome do Projeto** | Limbus — Sistema de Gestão de Ativos, Insumos e Termos de TI |
| **Organização / Cliente** | Mais Internet Telecom |
| **Responsável Técnico / Owner** | Guilherme Bardalho |
| **Data de Início** | Agosto de 2026 |
| **Status Atual** | Versão Estável em Operação |

---

## 2. Contexto e Justificativa

| Pergunta Orientadora | Resposta da Equipe |
| :--- | :--- |
| **Qual problema foi identificado?** | Falta de centralização no controle de equipamentos e insumos de TI, dificuldade em rastrear com quem está cada item e demora para gerar termos de entrega e devolução. |
| **Quem é afetado pelo problema?** | A equipe de TI (que gerencia os itens) e os colaboradores da empresa (que utilizam os equipamentos). |
| **Por que o problema precisa ser resolvido?** | Para evitar perdas ou extravios de equipamentos da empresa, organizar o estoque e manter um histórico formal de quem recebeu cada ativo. |
| **Qual oportunidade foi identificada?** | Criar um sistema web próprio, simples e rápido para a TI consultar o estoque, vincular equipamentos a colaboradores e gerar termos prontos para assinatura em poucos segundos. |

---

## 3. Objetivos do Projeto

### 3.1. Objetivo Geral
Desenvolver e implantar um sistema web para controlar os equipamentos e insumos de TI da empresa e automatizar a emissão dos termos de responsabilidade.

### 3.2. Objetivos Específicos
1. **Controle de Equipamentos:** Saber exatamente onde está cada notebook, monitor ou celular e qual colaborador está em posse dele.
2. **Controle de Insumos:** Manter a contagem em estoque de periféricos (mouses, teclados, cabos, fones) atualizada a cada entrega.
3. **Agilidade em Termos:** Gerar termos formais de entrega e devolução formatados para impressão em poucos cliques.
4. **Histórico de Devolução e Desligamento:** Registrar o retorno dos equipamentos quando um funcionário for desligado, exigindo motivo do encerramento para manter o histórico organizado.
5. **Acesso Fácil e Estável:** Manter o sistema rodando na rede interna, com login seguro e sessão de 24 horas para o trabalho diário da TI.

---

## 4. Descrição do Produto ou Solução

O **Limbus** é um sistema web desenvolvido sob medida para a TI da Mais Internet Telecom. Ele funciona direto no navegador e conta com:
- Painel para cadastrar e consultar colaboradores, setores e empresas do grupo.
- Controle de equipamentos com status de disponibilidade (`DISPONÍVEL` ou `EM USO`).
- Controle de quantidade de periféricos e insumos em estoque.
- Emissor automático de **Termos de Responsabilidade** (Entrega e Devolução) prontos para imprimir em folha A4.
- Busca rápida (`Ctrl + K`) para localizar qualquer funcionário ou item instantaneamente.
- Histórico de movimentações e tela de desligamento de colaboradores para devolução rápida dos itens.

---

## 5. Escopo do Projeto

| ID | Item Incluído no Escopo | Descrição | Responsável |
| :---: | :--- | :--- | :--- |
| **ESC-01** | **Controle de Equipamentos** | Cadastro de notebooks, monitores, celulares e computadores com patrimônio, modelo, serial e colaborador vinculado. | Guilherme Bardalho |
| **ESC-02** | **Controle de Insumos** | Gestão de periféricos (mouse, teclado, cabo, headset), com saldo de estoque que abate automaticamente a cada entrega. | Guilherme Bardalho |
| **ESC-03** | **Gestão de Funcionários e Setores** | Cadastro dos colaboradores, seus respectivos setores e visualização rápida de todos os itens que estão sob sua posse. | Guilherme Bardalho |
| **ESC-04** | **Emissão de Termos de Responsabilidade** | Geração automática de termos de entrega e devolução em padrão A4 para impressão e assinatura. | Guilherme Bardalho |
| **ESC-05** | **Fluxo de Desligamento de Funcionários** | Tela para desligar colaboradores com justificativa, desvinculando os equipamentos e voltando-os para o estoque. | Guilherme Bardalho |
| **ESC-06** | **Sistema de Login e Usuários** | Acesso protegido por usuário e senha, com sessões ativas de 24 horas para que a TI trabalhe sem deslogar durante o expediente. | Guilherme Bardalho |
| **ESC-07** | **Histórico de Movimentações** | Registro de todas as entregas, devoluções e alterações feitas no sistema para consultas futuras. | Guilherme Bardalho |

---

## 6. Fora do Escopo

| ID | Item Fora do Escopo | Justificativa / Limite |
| :---: | :--- | :--- |
| **FES-01** | **Manutenção e Reparo Físico de Equipamentos** | O sistema cuida da gestão e rastreamento; reparos de hardware continuam na bancada física da TI. |
| **FES-02** | **Integração Automática com Sistemas de RH/Folha** | Os dados de colaboradores são cadastrados diretamente no sistema conforme as contratações acontecem. |
| **FES-03** | **Aplicativo para Celular nas Lojas de Apps** | O sistema é acessado direto pelo navegador web do computador ou celular, sem necessidade de app dedicado. |
| **FES-04** | **Compras e Cotação Financeira** | Pedidos de compra e notas fiscais continuam nos sistemas administrativos normais da empresa. |

---

## 7. Entregáveis

| ID | Entregável | Descrição | Critério de Aceitação | Responsável |
| :---: | :--- | :--- | :--- | :--- |
| **ENT-01** | **Sistema Web Limbus** | Código do frontend e backend da aplicação funcionando de forma integrada. | Sistema navegável, telas responsivas e todas as funções operando sem erros. | Guilherme Bardalho |
| **ENT-02** | **Banco de Dados** | Banco relacional configurado e estruturado para guardar os registros de forma segura. | Informações salvas com persistência e carregamento rápido nas consultas. | Guilherme Bardalho |
| **ENT-03** | **Servidor da Aplicação** | Sistema instalado e configurado no servidor interno da empresa. | Acesso liberado para a TI dentro da rede da Mais Internet. | Guilherme Bardalho |
| **ENT-04** | **Gerador de Termos de Responsabilidade** | Módulo de visualização e impressão de documentos. | Termo gerado em formato A4 correto com dados do colaborador e lista dos itens. | Guilherme Bardalho |
| **ENT-05** | **Documentação do Sistema** | Manuais de uso e plano do projeto explicando a operação da ferramenta. | Documentação simples e clara com o passo a passo para a equipe. | Guilherme Bardalho |

---

## 8. Requisitos

### 8.1 Requisitos Funcionais

| ID | Requisito Funcional | Prioridade | Critério de Aceitação |
| :---: | :--- | :---: | :--- |
| **RF-01** | Fazer login com usuário e senha e manter a sessão ativa por 24 horas. | **Alta** | Usuário consegue usar o sistema o dia todo sem precisar relogar a cada ação. |
| **RF-02** | Cadastrar, editar e consultar equipamentos por número de patrimônio e serial. | **Alta** | Não permitir patrimônios repetidos e mostrar se o item está disponível ou em uso. |
| **RF-03** | Controlar quantidade de insumos e diminuir o saldo no estoque ao entregar. | **Alta** | Saldo atualizado na hora; impedir entrega se o estoque estiver zerado. |
| **RF-04** | Gerar e imprimir termos de entrega e devolução. | **Alta** | Página formatada perfeitamente para folha A4 com campos para assinatura. |
| **RF-05** | Permitir o desligamento de funcionário exigindo justificativa. | **Alta** | Ao confirmar o desligamento, os itens do funcionário voltam automaticamente para o estoque. |
| **RF-06** | Busca rápida por atalho no teclado (`Ctrl + K`). | **Média** | Janela de busca abre na hora e filtra por nomes de pessoas, equipamentos ou insumos. |

### 8.2 Requisitos Não Funcionais

| ID | Requisito Não Funcional | Categoria | Critério de Aceitação |
| :---: | :--- | :--- | :--- |
| **RNF-01** | **Segurança de Senhas** | Segurança | Senhas de acesso salvas com criptografia e sem visualização em texto puro. |
| **RNF-02** | **Rapidez de Carregamento** | Performance | Telas e consultas abrem de forma rápida e fluida no navegador. |
| **RNF-03** | **Disponibilidade** | Confiabilidade | Sistema disponível para uso contínuo durante todo o expediente de trabalho. |
| **RNF-04** | **Usabilidade** | Interface | Visual moderno em tema escuro, intuitivo e com pouca necessidade de treinamento. |

### 8.3 Restrições e Requisitos de Negócio

| ID | Descrição | Origem / Justificativa |
| :---: | :--- | :--- |
| **RN-01** | Todo equipamento entregue deve estar vinculado a um colaborador cadastrado. | Regra corporativa para garantir que sempre haja um responsável pelo bem. |
| **RN-02** | Equipamentos em uso não podem ser deletados sem antes registrar a devolução. | Evitar que itens ativos sumam do sistema sem histórico. |

---

## 9. Premissas

| ID | Premissa | Impacto Caso Não Seja Verdadeira |
| :---: | :--- | :--- |
| **PREM-01** | O servidor interno da empresa permanecerá ligado e conectado à rede. | O sistema fica inacessível para os computadores da TI até o servidor voltar. |
| **PREM-02** | A conexão com o banco de dados permanecerá estável. | Dificuldade temporária para salvar ou consultar informações. |
| **PREM-03** | Os computadores da equipe de TI possuem navegadores web modernos atualizados. | Algum recurso visual da página pode não carregar corretamente em navegadores muito antigos. |

---

## 10. Restrições

| ID | Restrição | Tipo | Impacto no Projeto |
| :---: | :--- | :---: | :--- |
| **RES-01** | **Custo Zero** | Orçamento | O projeto deve utilizar apenas ferramentas e tecnologias gratuitas/open source, sem compra de licenças. |
| **RES-02** | **Acesso Restrito** | Infraestrutura | O sistema é de uso interno corporativo, acessível prioritariamente dentro da rede da Mais Internet. |

---

## 11. Critérios de Aceitação

| ID | Entrega / Requisito | Critério de Aceitação | Como Será Verificado? |
| :---: | :--- | :--- | :--- |
| **CA-01** | **Login com Sessão de 24h** | Usuário loga de manhã e consegue trabalhar o dia todo sem ser deslogado. | Testando o uso contínuo e recarregando a página durante o dia. |
| **CA-02** | **Impressão do Termo em A4** | Termo de entrega/devolução cabe certinho em uma folha A4 com as assinaturas. | Clicando em imprimir termo e conferindo a prévia de impressão. |
| **CA-03** | **Devolução no Desligamento** | Ao desligar um colaborador, os itens voltam a ficar com status disponível. | Desligando um funcionário de teste e checando a lista de equipamentos. |
| **CA-04** | **Controle de Estoque** | Dar baixa em insumos reflete imediatamente no número de itens restantes. | Fazendo a entrega de um periférico e conferindo a redução no saldo. |

---

## 12. Stakeholders

| Stakeholder | Papel / Interesse | Influência | Necessidade / Expectativa |
| :--- | :--- | :---: | :--- |
| **Guilherme Bardalho** | Product Owner & Desenvolvedor | **Alta** | Criar um sistema funcional, fácil de usar e que atenda às necessidades reais da empresa. |
| **Liderança / Gestão de TI** | Patrocinadores do Projeto | **Alta** | Ter controle e visibilidade dos equipamentos da empresa e termos organizados. |
| **Colaboradores da Empresa** | Usuários Finais (Custodiantes) | **Baixa** | Receber os equipamentos com termos claros sobre o que está sob sua responsabilidade. |

---

## 13. Estrutura Analítica do Projeto – EAP / WBS

```text
1. PROJETO LIMBUS
│
├── 1.1 Planejamento
│   ├── 1.1.1 Definição das necessidades da TI
│   └── 1.1.2 Escolha das ferramentas e tecnologias
│
├── 1.2 Banco de Dados e Backend
│   ├── 1.2.1 Criação das tabelas do sistema
│   ├── 1.2.2 Sistema de login e controle de usuários
│   └── 1.2.3 Regras para cadastro e devolução de itens
│
├── 1.3 Telas e Interface (Frontend)
│   ├── 1.3.1 Telas de equipamentos e insumos
│   ├── 1.3.2 Telas de colaboradores e setores
│   ├── 1.3.3 Gerador e modelo do termo para impressão A4
│   └── 1.3.4 Atalho de busca rápida (Ctrl + K)
│
├── 1.4 Implantação e Servidor
│   ├── 1.4.1 Instalação do sistema no servidor interno
│   └── 1.4.2 Liberação de acesso na rede da empresa
│
└── 1.5 Documentação e Conclusão
    ├── 1.5.1 Manual de utilização para a equipe
    └── 1.5.2 Documento de escopo do projeto
```

---

## 14. Riscos Relacionados ao Escopo

| ID | Risco | Causa | Impacto no Escopo | Resposta Planejada (Mitigação) |
| :---: | :--- | :--- | :---: | :--- |
| **RSK-01** | **Instabilidade de Conexão com o Banco** | Oscilação na internet que conecta ao banco em nuvem. | **Médio** | O sistema conta com salvamento seguro para evitar perda de dados preenchidos. |
| **RSK-02** | **Expiração Rápida de Sessão** | Usuário ser deslogado enquanto está atendendo alguém e perder o preenchimento. | **Médio** | Sessão configurada para durar **24 horas seguidas**, garantindo estabilidade no expediente. |

---

## 15. Controle de Mudanças

| ID | Solicitação de Mudança | Impacto | Decisão | Responsável | Data |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **CR-01** | Aumento da sessão de login de 2h para 24h contínuas. | Pequena mudança técnica com grande ganho no dia a dia da TI. | **Aprovado** | Guilherme Bardalho | Setembro/2026 |
| **CR-02** | Criação de perfil "Viewer" (somente leitura). | Avaliado como desnecessário para o momento, pois adicionaria complexidade sem ganho real. | **Cancelado / Revertido** | Guilherme Bardalho | Setembro/2026 |
| **CR-03** | Adicionar justificativa obrigatória no desligamento de funcionários. | Ajuda a manter o histórico de devoluções claro e auditável. | **Aprovado** | Guilherme Bardalho | Setembro/2026 |

---

## 16. Histórico de Versões

| Versão | Data | Alteração Realizada | Responsável |
| :---: | :---: | :--- | :---: |
| **0.1.0** | Agosto/2026 | Criação dos primeiros protótipos de tela e fluxo de termos. | Guilherme Bardalho |
| **1.0.0** | Setembro/2026 | Integração com banco de dados e primeiras rotinas de cadastro. | Guilherme Bardalho |
| **2.0.0** | Setembro/2026 | Sistema rodando no servidor com tela de login e termos funcionando. | Guilherme Bardalho |
| **2.1.0** | Outubro/2026 | Atingida versão estável no momento com documentação e fluxo completo validado. | Guilherme Bardalho |

---

## 17. Checklist Final do Escopo

* [x] **O problema e a justificativa estão claramente descritos?** (Sim, na Seção 2)
* [x] **O objetivo do projeto está definido?** (Sim, na Seção 3.1)
* [x] **Os objetivos são compatíveis com o projeto?** (Sim, na Seção 3.2)
* [x] **O produto/solução está claramente descrito?** (Sim, na Seção 4)
* [x] **O que está dentro do escopo foi definido?** (Sim, na Seção 5)
* [x] **O que está fora do escopo foi explicitado?** (Sim, na Seção 6)
* [x] **As principais entregas foram identificadas?** (Sim, na Seção 7)
* [x] **Os requisitos funcionais e não funcionais foram registrados?** (Sim, na Seção 8)
* [x] **As premissas e restrições foram identificadas?** (Sim, nas Seções 9 e 10)
* [x] **Existem critérios objetivos de aceitação?** (Sim, na Seção 11)
* [x] **Os principais stakeholders foram identificados?** (Sim, na Seção 12)
* [x] **A EAP foi elaborada?** (Sim, na Seção 13)
* [x] **Os riscos relacionados ao escopo foram considerados?** (Sim, na Seção 14)
* [x] **Existe um registro de controle de mudanças?** (Sim, na Seção 15)
* [x] **O documento possui versão, data e responsável?** (Sim, nas Seções 1 e 16)

---

## 18. Exemplo Resumido da Solução (Projeto de TI)

| Elemento | Definição no Projeto Limbus |
| :--- | :--- |
| **Tipo de Solução** | Sistema Web Corporativo. |
| **Objetivo Principal** | Centralizar a gestão de equipamentos e insumos de TI e automatizar a emissão de termos de responsabilidade. |
| **Público-Alvo** | Equipe de TI e colaboradores da Mais Internet Telecom. |
| **Dentro do Escopo** | Cadastro de equipamentos, estoque de insumos, termos em A4, fluxo de desligamento e login de 24h. |
| **Fora do Escopo** | Manutenção física de peças, app para lojas de celular e integração com sistemas de folha. |
| **Principal Entregável** | Plataforma Web Limbus ativa em funcionamento no servidor interno da empresa. |
| **Critério de Sucesso** | TI conseguir localizar ativos e imprimir termos em poucos segundos sem planilhas soltas. |
