-- Script de criação da tabela de usuários no Supabase
-- Cole e execute este script no "SQL Editor" do Supabase:

CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    usuario TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    cargo TEXT DEFAULT 'Operador de TI',
    perfil TEXT DEFAULT 'operador', -- 'admin' ou 'operador'
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e permitir acesso
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
