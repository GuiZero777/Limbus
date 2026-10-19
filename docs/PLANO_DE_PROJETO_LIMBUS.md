# Plano de Projeto — Limbus

**Sistema Corporativo de Gestão de Ativos, Insumos e Termos de Responsabilidade de TI**  
**Organização:** Mais Internet Telecom  
**Responsável Técnico:** Guilherme Bardalho  
**Versão do Documento:** 1.0.0 — Oficial  
**Data:** Setembro de 2026  

---

## 📑 Sumário

- **Plano de Projeto: Limbus** ..................................................................................................... 1
- **1. Escopo do Projeto** ............................................................................................................ 2
- **2. Introdução** ......................................................................................................................... 3
- **3. Objetivo** ............................................................................................................................ 4
- **4. Tecnologias Envolvidas** ..................................................................................................... 5
- **5. Descrição da Equipe** .......................................................................................................... 6
- **6. Comunicação** ..................................................................................................................... 7
- **7. Etapas do Projeto** ............................................................................................................. 8
- **8. Cronograma** ...................................................................................................................... 9
- **9. Produto Final** .................................................................................................................... 10
- **10. Entrega do Produto** ......................................................................................................... 11
- **11. Conclusão** ....................................................................................................................... 12

---

## 1. Escopo do Projeto

O escopo do projeto compreende a concepção, desenvolvimento, testes e implantação em produção de um sistema web corporativo completo para **Gestão de Ativos de Tecnologia da Informação (IT Asset Management - ITAM)** e emissão automatizada de **Termos de Responsabilidade**.

### 1.1. O que está DENTRO do Escopo:
* **Módulo de Equipamentos:** Cadastro e rastreamento de notebooks, monitores, celulares e computadores com controle de patrimônio, serial number, status (`DISPONIVEL` / `EM_USO`) e alocação por colaborador.
* **Módulo de Insumos de TI:** Gestão de estoque quantitativo de periféricos e acessórios (mouses, teclados, cabos, fones), calculando em tempo real o saldo disponível e itens entregues.
* **Módulo de Funcionários e Setores:** Cadastro de colaboradores, importação em lote via planilhas Excel (`.xlsx`, `.csv`), perfis detalhados e controle de departamentos com atualização em cascata.
* **Gerador de Termos de Responsabilidade:** Emissão automatizada de termos de Entrega e Devolução, formatados para impressão em padrão A4, vinculando o CNPJ da empresa geradora e os dados do colaborador.
* **Histórico e Trilha de Auditoria:** Registro permanente de todas as movimentações e fluxo de **desligamento de funcionários com justificativa obrigatória**, desvinculando automaticamente os itens e retornando-os ao estoque.
* **Autenticação e Segurança:** Sistema de login protegido por criptografia `PBKDF2-SHA512`, sessões persistentes de **24 horas** e controle de perfis de acesso (`Administrador` e `Operador`).
* **Infraestrutura de Produção 24/7:** Containerização com **Docker**, hospedagem em **VM Linux Ubuntu 24.04** (`172.16.254.50`), Proxy Reverso com **Nginx**, criptografia **HTTPS/SSL com extensão SAN** (`limbus.maisinternet.com.br`) e banco relacional em nuvem no **Supabase PostgreSQL**.
* **Garantia de Qualidade:** Suíte de 61 testes automatizados cobrindo todas as rotas da API e regras de autenticação.

### 1.2. O que está FORA do Escopo:
* Compra ou manutenção física de hardware.
* Integração direta com sistemas externos de folha de pagamento de terceiros nesta versão inicial.

---

## 2. Introdução

A gestão de ativos tecnológicos em empresas em crescimento frequentemente enfrenta gargalos decorrentes de controles manuais em planilhas dispersas, fichas de papel e falta de padronização na entrega de equipamentos aos colaboradores. Esse cenário gera riscos como extravio de notebooks, falta de controle sobre periféricos entregues, lentidão na emissão de termos físicos e insegurança jurídica no momento do desligamento de funcionários.

O **Limbus** surge como a resposta tecnológica da equipe de TI da **Mais Internet Telecom** para centralizar, digitalizar e assegurar 100% do ciclo de vida dos ativos corporativos, permitindo que toda a operação seja realizada de forma rápida, auditável e acessível em rede corporativa interna.

---

## 3. Objetivo

### 3.1. Objetivo Geral
Desenvolver e implantar uma plataforma digital integrada para gestão de inventário de TI, controle de estoque de insumos e automação de termos de responsabilidade, garantindo alta disponibilidade (24/7), integridade de dados e conformidade legal na empresa.

### 3.2. Objetivos Específicos
1. **Eliminar Extravios:** Rastrear com exatidão onde está cada equipamento, a qual funcionário pertence e quando foi entregue.
2. **Otimizar Tempo da TI:** Reduzir o tempo de emissão de termos de entrega/devolução de vários minutos para menos de 10 segundos.
3. **Agilizar Cadastros:** Permitir a importação em massa de centenas de colaboradores a partir de planilhas de RH em um único clique.
4. **Segurança Jurídica:** Manter uma trilha de auditoria permanente com histórico de entregas, devoluções e motivos de desligamento.
5. **Autonomia e Acessibilidade:** Disponibilizar o sistema em rede local privada com domínio corporativo e sessões de 24 horas.

---

## 4. Tecnologias Envolvidas

A arquitetura do Limbus utiliza padrões modernos da indústria para entregar alta performance, segurança e custo zero de licenças:

```text
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (SPA): HTML5 • Tailwind CSS (Dark) • Vanilla JS  │
│  Ícones: Lucide Icons • Importador: SheetJS (XLSX)          │
├─────────────────────────────────────────────────────────────┤
│  BACKEND (API REST): Node.js 20 LTS • Express 5            │
│  Segurança: Crypto PBKDF2-SHA512 • Assinatura HMAC-SHA256  │
├─────────────────────────────────────────────────────────────┤
│  BANCO DE DADOS: PostgreSQL 15 (Supabase Cloud - SP)       │
│  Row Level Security (RLS) • Migrations SQL                  │
├─────────────────────────────────────────────────────────────┤
│  INFRAESTRUTURA & DEVOPS: Docker • Docker Compose          │
│  Nginx Proxy Reverso • OpenSSL (HTTPS/SAN) • Linux Ubuntu  │
└─────────────────────────────────────────────────────────────┘
```

* **Frontend:** Single Page Application (SPA) construída com Vanilla JavaScript (ES6+) modular, Tailwind CSS em tema escuro (Dark Theme), Lucide Icons e biblioteca SheetJS para leitura de arquivos Excel.
* **Backend:** Node.js 20 LTS com framework Express 5, estruturado em arquitetura RESTful com validação estrita de esquemas e tratamento padronizado de erros.
* **Banco de Dados:** PostgreSQL 15 gerenciado via **Supabase Cloud** na região de São Paulo (`sa-east-1`), garantindo persistência em nuvem e latência mínima.
* **Infraestrutura:** Containerização com Docker e Docker Compose (com Live Volume Mount), servidor web Nginx atuando como Proxy Reverso e terminação SSL/TLS (HTTPS).

---

## 5. Descrição da Equipe

| Papel / Função | Responsável | Atribuições |
| :--- | :--- | :--- |
| **Líder Técnico & Desenvolvedor Full Stack** | **Guilherme Bardalho** | Arquitetura do sistema, desenvolvimento completo de frontend e backend, modelagem do banco de dados, testes unitários, automação Docker e documentação. |
| **Infraestrutura & Redes** | **Equipe de TI / Redes** | Provisionamento da VM Linux Ubuntu, alocação do IP `172.16.254.50`, regras de firewall e apontamento de DNS corporativo. |
| **Stakeholders & Validação** | **Liderança de TI (Mais Internet)** | Definição de requisitos de negócio, aprovação de layouts de termos de responsabilidade e homologação em ambiente de produção. |

---

## 6. Comunicação

O alinhamento e a evolução do projeto seguiram canais diretos e estruturados:

* **Repositório de Código:** Versionamento contínuo no GitHub (`GuiZero777/Limbus`), na branch `feature/corporate-deployment`.
* **Rastreabilidade de Decisões:** Registros de commits semânticos documentando cada feature implementada.
* **Documentação Viva:** Manuais técnicos e operacionais integrados ao repositório na pasta `docs/` (`DEPLOY_VM.md`, `ARQUITETURA_E_SEGURANCA.md`, `MANUAL_DO_USUARIO.md`, `PLANO_DE_EVOLUCAO_E_ROADMAP.md`).
* **Homologação:** Demonstrações diretas em ambiente real de produção via rede corporativa.

---

## 7. Etapas do Projeto

O projeto foi executado através de 7 etapas estruturadas:

1. **Etapa 1 — Levantamento & Arquitetura:** Mapeamento do fluxo de TI, regras de devolução, inventário de insumos e definição da arquitetura REST.
2. **Etapa 2 — Frontend SPA & Emissão de Termos:** Construção da interface com Tailwind Dark Mode, Command Palette (`Ctrl + K`), importador Excel e módulo de impressão em A4.
3. **Etapa 3 — Backend REST & Banco de Dados em Nuvem:** Implementação da API Node.js/Express, migração para PostgreSQL no Supabase Cloud e criação dos scripts de schema.
4. **Etapa 4 — Containerização & Deploy na VM:** Criação do Dockerfile multi-stage, orquestração com Docker Compose e implantação no Ubuntu Server.
5. **Etapa 5 — Proxy Reverso & Segurança HTTPS:** Configuração do Nginx, criação de certificados SSL internos com extensão SAN e redirecionamento HTTP->HTTPS.
6. **Etapa 6 — Sistema de Autenticação e Gestão de Usuários:** Criação do módulo de login, tokens assinados com validade de 24h e painel administrativo de operadores.
7. **Etapa 7 — Testes, Otimização & Documentação:** Execução de 61 testes unitários com Jest/Supertest, configuração de Live Volume Mount e elaboração da documentação técnica.

---

## 8. Cronograma

| Fase / Marco | Período | Status | Entregáveis |
| :--- | :--- | :---: | :--- |
| **Fase 1: Concepção & Frontend** | Agosto / 2026 | ✅ Concluído | Protótipo funcional, gerador de termos e layout A4. |
| **Fase 2: Backend & Supabase** | Setembro / 2026 (Semana 1-2) | ✅ Concluído | API REST, migração de dados e persistência na nuvem. |
| **Fase 3: Docker & Servidor VM** | Setembro / 2026 (Semana 3) | ✅ Concluído | VM Ubuntu provisionada, Docker ativo e Nginx configurado. |
| **Fase 4: Autenticação & Deploy** | Setembro / 2026 (Semana 4) | ✅ Concluído | Login 24h, gestão de usuários e deploy multi-máquina. |
| **Fase 5: Documentação & Homologação** | Setembro / 2026 (Semana 4) | ✅ Concluído | 61 testes aprovados, documentação completa e produção ativa. |

---

## 9. Produto Final

O resultado é a plataforma **Limbus v2.1.0 Corporativa**, entregando os seguintes módulos funcionais:

1. **Dashboard Executivo:** Métricas em tempo real de colaboradores, setores, empresas e percentual de ocupação do estoque.
2. **Painel de Funcionários:** Gestão completa de colaboradores com importação Excel e perfil individual de posse de itens.
3. **Controle de Equipamentos:** Inventário detalhado por patrimônio e número de série com status em tempo real.
4. **Estoque de Insumos:** Gestão de periféricos com cálculo automático de saldo e entregas diretas.
5. **Cadastros Base:** Centralização de Empresas (CNPJs) e Setores com sincronização automática.
6. **Emissor de Termos:** Geração e impressão imediata de termos de responsabilidade em conformidade com as regras corporativas.
7. **Histórico Geral & Auditoria:** Trilha completa de movimentações com justificativas de desligamento.
8. **Administração de Usuários:** Controle de acesso da equipe de TI com sessões de 24 horas.

---

## 10. Entrega do Produto

A entrega do sistema foi homologada e disponibilizada em produção:

* **URL de Acesso Corporativo:** `http://172.16.254.50` / `https://limbus.maisinternet.com.br`
* **Disponibilidade:** Operação contínua 24 horas por dia, 7 dias por semana.
* **Repositório Oficial:** `https://github.com/GuiZero777/Limbus.git` (branch `feature/corporate-deployment`).
* **Documentação Fornecida:**
  - *Manual de Operação do Usuário* para a equipe de TI.
  - *Guia de Implantação e Manutenção em Servidor* para a equipe de infraestrutura.
  - *Relatório de Arquitetura e Segurança* para conformidade corporativa.

---

## 11. Conclusão

O projeto **Limbus** atingiu 100% dos seus objetivos estratégicos, técnicos e operacionais. A TI da **Mais Internet Telecom** passa a contar com uma ferramenta moderna, rápida e totalmente blindada para gerir seu patrimônio tecnológico.

Com a base consolidada, o sistema encontra-se pronto para as próximas etapas de evolução contínua, incluindo a adoção de leitores de código de barras/QR Code e assinatura digital na tela, garantindo inovação constante e eficiência máxima para a organização.
