# Alvorada

Um lugar só pra organizar a manhã, os hábitos e a vida financeira — sem precisar abrir três apps diferentes pra isso.

Comecei esse projeto porque cansei de ter minha rotina espalhada entre um app de hábitos, uma planilha de gastos e um bloco de notas cheio de tarefa perdida. A ideia do Alvorada é simples: uma rotina matinal com etapas que você monta do seu jeito, hábitos que você acompanha com sequências de dias, tarefas e metas, um controle financeiro completo, e tudo isso num painel único chamado "Meu dia".

## O que dá pra fazer hoje

**Rotina & hábitos**
- Montar a rotina matinal em etapas, com arrastar-e-soltar pra reordenar
- Hábitos diários ou em dias específicos da semana, com sequência (streak) atual e recorde
- Calendário unificado cruzando rotina, hábitos, tarefas e finanças num mapa de consistência
- Modo foco: sessões cronometradas pra quando precisa de concentração
- Diário rápido de humor e conquistas desbloqueadas conforme a consistência cresce
- Lembretes avulsos e rotina compartilhável por link público (somente leitura)

**Finanças**
- Contas (banco, carteira, dinheiro físico, investimento), receitas, despesas e transferências
- Contas da casa recorrentes (aluguel, luz, água...) com geração automática das próximas instâncias
- Categorias personalizadas além das já vindas prontas
- Dashboard do mês: saldo, resultado, gasto por categoria, contas a vencer

**Conta**
- Tema claro/escuro sincronizado com a conta, fuso horário, exportar todos os dados em `.json`
- Assinar seus prazos direto no Google Calendar / Apple Calendar via link `.ics`
- Instalável como PWA
- Plano Free com tudo isso liberado, e um Premium com estatísticas de evolução, relatórios financeiros mais a fundo e orçamento por categoria

## Stack

Vite + React 19 + TypeScript, Tailwind CSS v4, Supabase (Postgres + Auth + RLS) como backend, TanStack Query, React Router, React Hook Form + Zod pra formulários, Recharts pros gráficos, Framer Motion pras animações, dnd-kit pro drag-and-drop da rotina.

## Rodando local

```bash
npm install
```

O app funciona sem Supabase configurado (dá pra ver a landing page e navegar), mas login e qualquer dado real precisam de um projeto Supabase:

1. Crie um projeto gratuito em [supabase.com](https://supabase.com)
2. Em **Project Settings → API**, copie a `Project URL` e a chave `anon public`
3. Copie `.env.example` para `.env` e preencha as duas variáveis
4. No **SQL Editor** do painel, rode as migrations de `supabase/migrations/` **em ordem numérica**, uma por vez, de `0001` até a mais recente
5. `npm run dev` e abre em `http://localhost:5173`

Mais detalhes do setup do Supabase em `supabase/README.md`.

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run test      # testes (vitest)
npm run lint      # oxlint
npm run format    # prettier
```

## Sobre o código

`DESIGN.md` documenta o sistema de design (cores, espaçamento, animação, componentes) e `SECURITY.md` documenta as decisões de segurança tomadas — vale ler antes de mexer em qualquer um dos dois lados.

Ainda é um projeto em construção, sem prazo fixo — vou adicionando e ajustando conforme uso no dia a dia.
