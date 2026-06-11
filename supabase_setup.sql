-- Copie e cole este código no SQL Editor do seu painel do Supabase e clique em RUN!

-- 1. Cria a tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  farm_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ativa a segurança (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Regras de Segurança (Policies)
CREATE POLICY "Usuários só podem ver o próprio perfil" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Proteção contra Elevação de Privilégio
-- Impede que o usuário comum altere a própria permissão (role) para admin
REVOKE UPDATE (role) ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, farm_name, phone) ON public.profiles TO authenticated;
