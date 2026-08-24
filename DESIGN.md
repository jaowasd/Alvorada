# DESIGN.md — Sistema de design do Alvorada

Referência persistente para qualquer trabalho de UI neste repo. Documenta o sistema **como ele já é** — a maior parte já existia e estava consistente na prática, só não estava escrita em lugar nenhum. **Regra de ouro: se o código que você for gerar violar este documento, corrija antes de entregar.**

## Cores

Tokens em [src/index.css](src/index.css), light (`:root`) e dark (`:root[data-theme='dark']`). Nunca hardcode um hex — sempre `var(--color-*)` ou as classes Tailwind geradas (`text-primary-600`, `bg-error-500/10`, etc.).

- `bg` / `surface` / `sidebar` / `border` / `text` / `text-muted` — trocam entre light/dark.
- `primary-{50,100,300,400,500,600,700,800}` — azul da marca (`#3562f6` = 500). Sem 200/900/950 — não inventar esses steps sem necessidade real.
- `success-{50,500,600}`, `error-{50,500}` — usados em toda a parte; sempre acompanhados de ícone ou texto, nunca só a cor sozinha transmitindo o significado.
- `warning-{50,500}` — definidos, **reservados** (nenhum componente usa ainda). Não force um uso artificial só para "usar o token"; use quando a necessidade real aparecer.
- `accent-{400,500}`, `health-{100,500,600}` — paletas secundárias, uso pontual.
- **Dark mode nunca é preto puro** — `--color-bg` escuro é `#0b0d14` (cinza-azulado rico), não `#000`. Manter esse princípio em qualquer token novo.
- Sem gradiente roxo/violeta/genérico-de-IA em lugar nenhum do site — os únicos 2 gradientes existentes são azul-sobre-azul (avatar do usuário, stroke do `ProgressRing`). Manter assim.

## Tipografia

- `--font-sans` (Inter) — corpo de texto.
- `--font-heading` (Plus Jakarta Sans) — aplicada automaticamente a `h1`-`h4`.

## Espaçamento

Escala padrão do Tailwind (múltiplos de 4px). Nada de valores arbitrários tipo `p-[13px]` — se o espaçamento "quase encaixa" num múltiplo de 4/8, ajuste o layout em vez de forçar um valor exato.

## Raio de borda — 5 níveis, por propósito (não por preferência)

| Classe         | Valor | Quando usar                                                      |
| -------------- | ----- | ---------------------------------------------------------------- |
| `rounded-md`   | 6px   | Controles micro: checkboxes customizados                         |
| `rounded-lg`   | 8px   | "Controle": Button, Input, Select, botão-ícone, popover/dropdown |
| `rounded-xl`   | 12px  | "Navegação": itens de sidebar, Logo, segmented control           |
| `rounded-2xl`  | 16px  | "Painel": Card, Modal                                            |
| `rounded-full` | —     | Pílulas de status, avatares, badges                              |

Todo componente novo escolhe um desses 5. Nunca `rounded-[Npx]` arbitrário.

## Sombras — 3 níveis

Tokens em `index.css`:

- `--shadow-card` — cards estáticos em repouso, botão primário.
- `--shadow-popover` — dropdowns/menus flutuantes pequenos (ex. `ItemMenu`).
- `--shadow-card-lg` — modais e páginas de auth/erro (maior elevação do site).

Nunca usar `shadow-sm`/`shadow-lg` genéricos do Tailwind — sempre um desses 3 tokens.

## Animação

Constantes em [src/lib/motion.ts](src/lib/motion.ts) — sempre reusar, nunca redigitar valores à mão:

- `EASE_SMOOTH` — curva padrão de easing (`[0.16, 1, 0.3, 1]`) para praticamente toda transição de entrada/saída.
- `SPRING_SNAPPY` — spring para elementos que "encaixam" (ex. pílula ativa da navegação).
- `SPRING_SOFT` — spring para interações contínuas de ponteiro (ex. `TiltCard`).
- `fadeIn` / `fadeUp` / `listItemVariants` / `staggerContainer` — variantes de valor prontas; use `variants={x} initial="hidden" animate="show"` em vez de `initial={{...}} animate={{...}}` hand-rolled.

Regras (Emil Kowalski):

- Anime só `transform`/`opacity` — nunca `width`/`height`/`top`/`left` diretamente (exceção documentada abaixo).
- Anime com intenção: só elementos que guiam o usuário (abrir modal, feedback de clique, carregar).
- Feedback de clique em botão = `active:scale-[0.98]` via `interactiveStates` (ver abaixo) — não usar `whileTap` do Framer Motion, o projeto usa CSS para isso.

## Estados de interação

[src/lib/interactive-states.ts](src/lib/interactive-states.ts) exporta `interactiveStates` — aplique em **todo** elemento clicável (`<button>`, links que agem como botão): dá `active:scale-[0.98]` + anel de `focus-visible` + transição. `button-variants.ts` já usa. Qualquer `<button>` cru novo deve importar e aplicar essa mesma constante.

`Input`/`Select` mantêm `focus:` (não `focus-visible:`) — correto para campo de texto, mostra o anel mesmo em clique de mouse. Todo controle desabilitado precisa de `disabled:opacity-50 disabled:cursor-not-allowed` (ou `disabled:pointer-events-none` quando fizer sentido).

## Componentes compartilhados

Antes de reimplementar um padrão visual, verifique se já existe em `src/components/ui/`:

- `Card`/`MotionCard`, `Modal` (focus trap + Escape + clique-fora já implementados), `Button`, `Input`, `Select`, `ItemMenu` (menu "⋮ mais ações"), `Badge` (pílula de status), `ProgressRing`, `AnimatedNumber`, `ThemeToggle`, `TiltCard`, `PageFade`.
- `cn()` ([src/lib/cn.ts](src/lib/cn.ts)) usa `tailwind-merge` — pode passar `className` para sobrescrever default com segurança, classes conflitantes resolvem pela última que "ganha" de verdade, não por ordem de geração do CSS.

## Acessibilidade

- Todo botão/link só-ícone precisa de `aria-label` descritivo (já é o padrão em 100% dos casos existentes — manter).
- Estados de carregamento usam `role="status" aria-live="polite"` no texto "Carregando…".
- `Modal` já implementa focus trap completo (foco entra ao abrir, Tab preso dentro, foco volta ao elemento que abriu ao fechar) — não precisa reimplementar em cada uso.
- Não há `<img>` no projeto (tudo é ícone Lucide/SVG/avatar CSS) — se algum dia entrar uma imagem raster, ela precisa de `alt` descritivo.

## Exceções documentadas (não são bugs)

- **Mockup da Landing Page** ([src/pages/LandingPage.tsx](src/pages/LandingPage.tsx), `DashboardPreview`/`LaptopMockup`): usa cores `slate-*` fixas em vez dos tokens `var(--color-*)`. Intencional — é um "screenshot" fixo do produto em tema claro dentro de uma moldura de laptop; acompanhar o tema do visitante prejudicaria o contraste dentro da moldura escura. Não trocar pelos tokens.
- **Colapso do submenu Finanças** (`AppShell.tsx`): anima `height` diretamente (não é `transform`/`opacity` puro). Baixa frequência (abre 1x ao entrar em Finanças), sem alternativa simples sem complexidade extra. Aceito como está.
- **`Badge` da Landing Page** (chip de marketing, `rounded-full` grande, 2 tons fixos) é intencionalmente separado do componente `Badge` de `src/components/ui/` (pílula de status) — propósitos visuais diferentes, não deve ser unificado.
