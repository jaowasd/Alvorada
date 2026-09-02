# DESIGN.md — Sistema de design do Alvorada

Referência persistente para qualquer trabalho de UI neste repo. **Regra de ouro: se o código que você for gerar violar este documento, corrija antes de entregar.**

## O conceito: Primeira Luz

O produto se chama **Alvorada**, o logo é um nascer do sol e o app cumprimenta "Bom dia". O sistema visual parte disso: existe uma fonte de luz ambiente no topo de cada tela, e ela muda com a hora real do dia. Aparece uma vez por tela, nunca compete com o conteúdo, e é a coisa que torna esta interface impossível de confundir com um dashboard genérico.

Toda a ousadia do sistema está gasta nesse único elemento. O resto — cards, listas, formulários — é deliberadamente quieto. Se for adicionar mais um efeito chamativo, provavelmente é o efeito errado.

## Cores

Tokens em [src/index.css](src/index.css). Nunca hardcode um hex — sempre `var(--color-*)` ou as classes Tailwind geradas (`text-primary-600`, `bg-error-500/10`).

- `bg` / `surface` / `surface-raised` / `sidebar` / `border` / `hairline` / `text` / `text-muted` — trocam entre light/dark.
- `primary-{50,100,300,400,500,600,700,800}` — azul da marca (`#3562f6` = 500). Cor estrutural e interativa. Sem 200/900/950.
- `accent-{400,500}` — o laranja do amanhecer. **Reservado para dois usos**: a luz ambiente (via `--dawn-from`/`--dawn-to`) e marcação de conquista (a chama da sequência). Não use como segunda cor de marca; ele perde o significado se aparecer em botão, link ou ícone comum.
- `success-{50,500,600}`, `error-{50,500}` — sempre acompanhados de ícone ou texto, nunca só a cor sozinha transmitindo o significado.
- `warning-{50,500}`, `health-{100,500,600}` — definidos, **reservados**, sem uso hoje. Não force um uso artificial.
- **Dark mode nunca é preto puro** — `--color-bg` escuro é `#0b0d14`.
- Sem gradiente roxo/violeta/genérico-de-IA em lugar nenhum. Os gradientes existentes são azul-sobre-azul (avatar, `ProgressRing`) e o wash de amanhecer.
- `--color-hairline` (uma cor com alpha) substituiu `--color-border` como borda padrão de superfície. `--color-border` continua para divisores e traços que precisam ser vistos.

### A luz do dia

`data-daypart` no `<html>` (`dawn` | `day` | `dusk` | `night`) redefine três propriedades: `--dawn-from`, `--dawn-to`, `--dawn-intensity`. Mesmo mecanismo de `data-theme` — escrito em [public/theme-init.js](public/theme-init.js) antes da primeira pintura e mantido por [useDaypart](src/hooks/useDaypart.ts).

Quem renderiza é [`<DawnWash />`](src/components/ui/DawnWash.tsx). Ele é `absolute` em `-z-10` dentro de um pai com `isolate` — **nunca `fixed`, nunca `background-attachment: fixed`**: um horizonte só existe no topo da página, e assim não há jank de background fixo no Safari mobile nem disputa de z-index.

O grão fica em `body::before` a 2,5–3,5% de opacidade. Como está na camada de fundo, aparece só nas calhas entre cards e nunca cobre conteúdo. Não crie overlays de textura por cima do conteúdo.

## Tipografia

Três papéis, dois arquivos de fonte:

| Papel    | Família                       | Onde                                       |
| -------- | ----------------------------- | ------------------------------------------ |
| Display  | Plus Jakarta Sans 600/700/800 | `h1`–`h4` (automático), wordmark           |
| Corpo/UI | Geist 400/500/600             | todo o resto                               |
| Dados    | Geist + `numeric-display`     | números que o usuário compara entre linhas |

A escala vai de `text-2xs` (11px) a `text-6xl` (72px) e **cada degrau já traz seu próprio line-height e letter-spacing**. Não escreva `tracking-*` junto de um `text-*` — o valor certo já vem no token. O tracking abre nos tamanhos pequenos e fecha nos grandes; era um `-0.02em` fixo aplicado igual em 14px e 60px.

**`numeric-display`** é a assinatura tipográfica: num app de acompanhamento os números _são_ o conteúdo. Sequência, minutos, aproveitamento e saldo usam ele (tabular, `-0.035em`, peso 700). Use em números que carregam a recompensa, não em qualquer dígito da tela.

Rótulos de métrica são `text-2xs uppercase tracking-[0.08em]` — a caixa alta miúda é o que separa o rótulo do número sem competir com ele.

## Espaçamento

Escala padrão do Tailwind (múltiplos de 4px). Seções de landing respiram em `py-24`; dentro do app, blocos irmãos ficam em `gap-6`/`mt-8`. Nada de valores arbitrários tipo `p-[13px]`.

## Raio de borda — 5 níveis, por propósito

| Classe         | Valor | Quando usar                                               |
| -------------- | ----- | --------------------------------------------------------- |
| `rounded-md`   | 6px   | Controles micro: checkboxes                               |
| `rounded-lg`   | 8px   | "Controle": Input, Select, botão-ícone, popover           |
| `rounded-xl`   | 12px  | "Navegação": itens de sidebar, Logo, quadros de ícone     |
| `rounded-2xl`  | 20px  | "Painel": Card padrão                                     |
| `rounded-3xl`  | 28px  | "Herói": Card `elevated`, Modal, Bezel, ilha de navegação |
| `rounded-full` | —     | Pílulas, avatares, badges, botões `pill`                  |

Todo componente novo escolhe um desses. Nunca `rounded-[Npx]` arbitrário — a exceção é o núcleo do `Bezel`, cujo raio é calculado para ficar concêntrico com a casca.

## Superfícies e sombras

Uma superfície do Alvorada não é um retângulo pintado: ela capta luz no topo. Isso vem de `--surface-highlight` (um `inset` branco), aplicado junto da sombra:

```
[box-shadow:var(--shadow-card),var(--surface-highlight)]
```

Tokens: `--shadow-card` (repouso) · `--shadow-popover` (menus flutuantes) · `--shadow-card-lg` (modais, cards herói) · `--shadow-lift` (hover) · `--surface-highlight`.

Nunca use `shadow-sm`/`shadow-lg` genéricos do Tailwind. **Não passe `shadow-card-lg` como className para um `Card`** — use a prop `elevated`, que já traz sombra maior, raio herói e o brilho de topo juntos.

O `Bezel` (casca externa + núcleo de raio concêntrico) é reservado a superfícies-herói. Aplicado em todo card, vira ruído.

`backdrop-blur` só em elemento fixo, sticky pequeno (nav flutuante, folha "Mais", backdrop de modal) ou superfície isolada numa tela que não rola (o cartão de autenticação). Nunca sobre conteúdo em rolagem.

## Animação

Constantes em [src/lib/motion.ts](src/lib/motion.ts) — sempre reusar, nunca redigitar valores:

- `EASE_SMOOTH` / `EASE_GLIDE` — a segunda é mais pesada, para entradas e reveals.
- `DURATION` — `instant` / `quick` / `base` / `slow` / `ambient`. Nada de duração digitada no call site.
- `fadeIn` / `fadeUp` / `listItemVariants` / `staggerContainer` / `staggerSection` / `revealUp` / `REVEAL_VIEWPORT`.
- Em CSS/Tailwind: `duration-[--duration-base] ease-[--ease-glide]`.

Regras:

- Anime só `transform`, `opacity` e `filter` — nunca `width`/`height`/`top`/`left`.
- Reveal de scroll usa `whileInView` (IntersectionObserver por baixo). **Nunca** um listener de `scroll`.
- Feedback de clique = `active:scale-[0.98]` via `interactiveStates`, não `whileTap`.
- Hover de superfície clicável = `-translate-y-px` (ou `-translate-y-0.5`) + `--shadow-lift`.

**Conteúdo não deve depender de uma animação para aparecer.** Um bloco com `initial="hidden"` que nunca receba o `show` fica invisível — e um `hidden` com `opacity: 0` é exatamente isso. A regra para código novo: passe `initial={prefersReducedMotion ? false : 'hidden'}` no container, como faz a `LandingPage`. `SectionReveal`, `PageFade` e `AnimatedNumber` já retornam o estado estático quando `useReducedMotion()` é verdadeiro.

Estado atual: as listas do app (`staggerContainer` + `listItemVariants`) ainda usam `initial="hidden"` puro. Não é um bug visível — o padrão do Framer Motion é `reducedMotion="never"`, então a animação roda normalmente mesmo com movimento reduzido ligado. É fragilidade, não falha: se a animação não completar por qualquer motivo, a lista fica em branco. Vale migrar quando encostar em cada página.

O `@media (prefers-reduced-motion)` do CSS **não** alcança o Framer Motion — trate em JS.

**Armadilha: `animate` do Framer sobrescreve `opacity` do `style`.** Se um elemento tem `style={{ opacity: 'calc(...)' }}` e ao mesmo tempo `animate={{ opacity: 1 }}`, o valor do style é ignorado e o elemento termina em opacidade 1. Numa cena de camadas isso estoura tudo de uma vez. Separe: transformação e fade de entrada no invólucro, opacidade de intensidade num filho. Ver `SceneLayer` em [AuthScene.tsx](src/components/auth/AuthScene.tsx).

**Armadilha: profundidade em Z encolhe a camada.** Um elemento com `translateZ(-320px)` dentro de uma `perspective` de 1400px aparece a 81% do tamanho — e aí `inset-0` deixa de cobrir a tela e as bordas do retângulo ficam visíveis. Compense com `scale: (perspective + |depth|) / perspective`.

## Estados de interação

[src/lib/interactive-states.ts](src/lib/interactive-states.ts) exporta `interactiveStates` — aplique em **todo** elemento clicável. [src/lib/field-styles.ts](src/lib/field-styles.ts) faz o mesmo para `Input`/`Select`.

Existe **uma** linguagem de foco no app: `focus-visible:outline-2 outline-offset-2 outline-primary-500`. Campos de texto casam com `:focus-visible` mesmo em clique de mouse, então não há motivo para um segundo tratamento. Todo controle desabilitado precisa de `disabled:opacity-50 disabled:cursor-not-allowed`.

## Componentes compartilhados

Antes de reimplementar um padrão visual, verifique `src/components/ui/`:

`Card`/`MotionCard` (prop `elevated`), `Bezel`, `Modal`, `ConfirmDialog`, `Button` (`variant` · `size` · `pill`), `Input`, `Select`, `Badge`, `EmptyState`, `ItemMenu`, `PageFade`, `SectionReveal`, `DawnWash`, `ProgressRing`, `AnimatedNumber`, `ConsistencyHeatmap`, `ThemeToggle`, `TiltCard`.

Não existe Skeleton, Toast nem Tabs: carregamento é `<p role="status" aria-live="polite">Carregando…</p>`, sucesso é `useInlineFeedback`, abas são um array de `<button>` (`rounded-lg`, ativo em `bg-primary-500/10 text-primary-600`).

## Acessibilidade

- Todo botão/link só-ícone precisa de `aria-label` descritivo.
- Estados de carregamento usam `role="status" aria-live="polite"`.
- `Modal` já implementa focus trap completo — não reimplemente.
- Nada que atualize por segundo pode ficar dentro de uma região `aria-live` (ver o cronômetro em `StudyTimerCard`: `role="timer"` + `aria-live="off"`, com um `role="status"` separado só para início e fim).
- Cor sozinha nunca carrega significado: barra colorida sempre acompanha o número.

## Exceções documentadas (não são bugs)

- **Preview da Landing** ([src/pages/LandingPage.tsx](src/pages/LandingPage.tsx), `AppPreview`): usa cores `slate-*` fixas em vez dos tokens. Intencional — é um "screenshot" do produto em tema claro dentro de uma moldura; acompanhar o tema do visitante arruinaria o contraste dentro dela.
- **Colapso do submenu na sidebar** (`AppShell.tsx`): anima `height` diretamente. Baixa frequência, sem alternativa simples. Aceito.
- **Cores de matéria e de categoria** vêm do usuário e entram por `style={{ backgroundColor }}` — é dado, não token.
- **A cena de autenticação** ([AuthScene.tsx](src/components/auth/AuthScene.tsx)) é `fixed inset-0`, não `absolute` como o `DawnWash`. A regra do `DawnWash` existe porque ele é um horizonte no topo de uma página que rola; a cena de auth ocupa a viewport inteira numa tela que não rola, então `fixed` é o correto — e ela precisa ficar parada se o teclado do celular empurrar o layout.
