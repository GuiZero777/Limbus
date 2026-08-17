-- Este script apaga as tabelas antigas (vazias ou com colunas em minúsculo) e recria com o CamelCase correto.

DROP TABLE IF EXISTS historico CASCADE;
DROP TABLE IF EXISTS equipamentos CASCADE;
DROP TABLE IF EXISTS funcionarios CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;


-- Tabela: empresas
CREATE TABLE empresas (
    id UUID PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    cidade TEXT NOT NULL,
    uf TEXT NOT NULL
);

-- Tabela: funcionarios
CREATE TABLE funcionarios (
    id UUID PRIMARY KEY,
    nome TEXT NOT NULL,
    funcao TEXT NOT NULL,
    "dataAdmissao" TEXT NOT NULL,
    setor TEXT
);

-- Tabela: equipamentos
CREATE TABLE equipamentos (
    id UUID PRIMARY KEY,
    descricao TEXT NOT NULL,
    "modeloMarca" TEXT NOT NULL,
    status TEXT DEFAULT 'DISPONIVEL',
    "funcionarioId" UUID,
    patrimonio TEXT,
    "serialNumber" TEXT,
    observacoes TEXT,
    FOREIGN KEY ("funcionarioId") REFERENCES funcionarios(id) ON DELETE SET NULL
);

-- Tabela: historico
CREATE TABLE historico (
    id UUID PRIMARY KEY,
    tipo TEXT NOT NULL,
    "funcionarioId" UUID NOT NULL,
    "equipamentoId" UUID,
    "equipamentosIds" TEXT,
    data TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY ("funcionarioId") REFERENCES funcionarios(id) ON DELETE CASCADE
);
