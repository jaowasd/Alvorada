# Configurar o Supabase (necessário para a Fase 2 funcionar de verdade)

1. Crie uma conta gratuita em https://supabase.com e clique em "New project".
2. Escolha um nome (ex.: `alvorada`), uma senha para o banco e a região mais próxima. Aguarde o projeto ser provisionado (leva 1-2 minutos).
3. No painel do projeto, vá em **Project Settings > API** e copie:
   - `Project URL` → cole em `VITE_SUPABASE_URL`
   - `anon public` key → cole em `VITE_SUPABASE_ANON_KEY`
4. Na raiz do projeto (`Nextask`), copie `.env.example` para um novo arquivo chamado `.env` e preencha os dois valores. O `.env` nunca é commitado (já está no `.gitignore`).
5. No painel do Supabase, vá em **SQL Editor > New query**, cole o conteúdo de `supabase/migrations/0001_profiles.sql` e clique em **Run**. Isso cria a tabela `profiles`, as políticas de segurança (RLS) e o gatilho que cria um perfil automaticamente para cada novo usuário.
6. (Opcional, útil para testar mais rápido) Em **Authentication > Providers > Email**, você pode desativar "Confirm email" durante o desenvolvimento, para não precisar confirmar o e-mail a cada teste de cadastro. Lembre de reativar antes de ir para produção.
7. Reinicie o servidor de desenvolvimento (`npm run dev`) depois de criar o `.env` — variáveis de ambiente só são lidas na inicialização.

Sem esse passo, o site continua funcionando (landing page, navegação), mas as telas de cadastro/login mostram uma mensagem pedindo para configurar o Supabase.
