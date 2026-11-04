-- Script de migração: Adicionar coluna setor na tabela equipamentos
-- Execute este comando no "SQL Editor" do painel do Supabase:

ALTER TABLE public.equipamentos ADD COLUMN IF NOT EXISTS setor TEXT;
