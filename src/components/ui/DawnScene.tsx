import { type CSSProperties, type ReactNode } from 'react'
import {
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { DURATION, EASE_GLIDE, SPRING_SOFT } from '@/lib/motion'
import { cn } from '@/lib/cn'

/** Perspectiva do palco. Compartilhada com o cálculo de escala das camadas. */
const PERSPECTIVE = 1400

/**
 * Uma camada empurrada em Z encolhe na perspectiva, e aí `inset-0` deixa de
 * cobrir a tela — aparecem as bordas do retângulo. Esta é a escala que
 * devolve a camada ao tamanho da viewport.
 */
function depthScale(depth: number): number {
  return (PERSPECTIVE + Math.abs(depth)) / PERSPECTIVE
}

interface SceneLayerProps {
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  /**
   * Quanto a camada acompanha o ponteiro. É o que cria a profundidade: o que
   * está longe se desloca pouco, o que está perto se desloca muito.
   */
  parallax: number
  /** Profundidade real no eixo Z, dentro da `perspective` do palco. */
  depth: number
  delay?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

function SceneLayer({
  pointerX,
  pointerY,
  parallax,
  depth,
  delay = 0,
  className,
  style,
  children,
}: SceneLayerProps) {
  const x = useSpring(
    useTransform(pointerX, (v) => v * parallax),
    SPRING_SOFT,
  )
  const y = useSpring(
    useTransform(pointerY, (v) => v * parallax),
    SPRING_SOFT,
  )

  // A opacidade da entrada fica no invólucro e a de intensidade no filho, em
  // elementos separados: no mesmo elemento, o `animate` do Framer sobrescreve
  // o `opacity` do style e a camada termina em 1 — a cena inteira estoura.
  return (
    <motion.div
      style={{ x, y, translateZ: depth, scale: depthScale(depth) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.ambient, ease: EASE_GLIDE, delay }}
      className="absolute inset-0"
    >
      <div className={cn('absolute inset-0', className)} style={style}>
        {children}
      </div>
    </motion.div>
  )
}

interface DawnSceneProps {
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  animate: boolean
  /**
   * `viewport` prende a cena na tela inteira — para páginas que não rolam
   * (autenticação). `section` ancora no topo do container, para páginas que
   * rolam: o amanhecer é um horizonte e some junto com a dobra, em vez de
   * seguir o leitor até o rodapé.
   */
  anchor?: 'viewport' | 'section'
  /**
   * Posição horizontal do sol. O padrão (centro) serve a layouts centrados;
   * num layout assimétrico o sol precisa cair sobre alguma coisa, senão vira
   * uma bola flutuando no vazio.
   */
  sunX?: string
  className?: string
}

/**
 * O amanhecer em profundidade.
 *
 * Camadas empilhadas no eixo Z dentro de uma `perspective`, cada uma
 * acompanhando o ponteiro numa velocidade diferente. Não é uma imagem com
 * efeito de paralaxe: as camadas ocupam profundidades diferentes de verdade,
 * então mover o ponteiro as reorganiza como um relevo.
 *
 * A cena é deliberadamente quieta. O que precisa ser lido na frente dela é um
 * formulário ou uma manchete; a profundidade aparece no movimento, não no
 * volume de cor. Tudo sai de --dawn-from/--dawn-to, que mudam com a hora do
 * dia.
 */
export function DawnScene({
  pointerX,
  pointerY,
  animate,
  anchor = 'viewport',
  sunX = '50%',
  className,
}: DawnSceneProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none -z-10 overflow-hidden',
        anchor === 'viewport'
          ? 'fixed inset-0'
          : 'absolute inset-x-0 top-0 h-[900px]',
        className,
      )}
      style={{ perspective: `${PERSPECTIVE}px`, transformStyle: 'preserve-3d' }}
    >
      {/* Céu: a luz mais distante, quase parada. */}
      <SceneLayer
        pointerX={pointerX}
        pointerY={pointerY}
        parallax={0.006}
        depth={-320}
        style={{
          background:
            'radial-gradient(110% 70% at 50% 2%, var(--dawn-from) 0%, var(--dawn-to) 40%, transparent 72%)',
          opacity: 'calc(var(--dawn-intensity) * 1.4)',
        }}
      />

      {/* Halo do sol: respira devagar, o único movimento contínuo da tela. */}
      <SceneLayer
        pointerX={pointerX}
        pointerY={pointerY}
        parallax={0.016}
        depth={-240}
        delay={0.1}
      >
        <motion.div
          className="absolute top-[-14%] h-[52vmax] w-[52vmax] -translate-x-1/2 rounded-full"
          style={{
            left: sunX,
            background:
              'radial-gradient(circle, var(--dawn-to) 0%, transparent 60%)',
            opacity: 'calc(var(--dawn-intensity) * 1.9)',
            filter: 'blur(50px)',
          }}
          animate={animate ? { scale: [1, 1.045, 1] } : undefined}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </SceneLayer>

      {/* O disco. Nasce por trás do cartão na entrada da página. */}
      <SceneLayer
        pointerX={pointerX}
        pointerY={pointerY}
        parallax={0.03}
        depth={-190}
      >
        <motion.div
          className="absolute top-[4%] h-[17vmax] w-[17vmax] -translate-x-1/2"
          style={{ left: sunX }}
          initial={animate ? { y: '30vmax', opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.8, ease: EASE_GLIDE, delay: 0.2 }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, var(--dawn-from) 0%, var(--dawn-to) 55%, transparent 72%)',
              opacity: 'calc(var(--dawn-intensity) * 3.4)',
              filter: 'blur(20px)',
            }}
          />
        </motion.div>
      </SceneLayer>

      {/*
        Raios. Um leque cônico girando devagar, cortado por máscara radial pra
        existir só em volta do sol. É o detalhe que faz a luz parecer vinda de
        um ponto, e não de um degradê.
      */}
      <SceneLayer
        pointerX={pointerX}
        pointerY={pointerY}
        parallax={0.022}
        depth={-215}
        delay={0.5}
      >
        <motion.div
          className="absolute top-[-26%] h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full"
          style={{
            left: sunX,
            background:
              'repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, var(--dawn-to) 5deg, transparent 11deg, transparent 24deg)',
            opacity: 'calc(var(--dawn-intensity) * 0.8)',
            filter: 'blur(22px)',
            maskImage:
              'radial-gradient(circle, rgba(0,0,0,0.9) 12%, transparent 52%)',
            WebkitMaskImage:
              'radial-gradient(circle, rgba(0,0,0,0.9) 12%, transparent 52%)',
          }}
          animate={animate ? { rotate: 360 } : undefined}
          transition={{ duration: 220, repeat: Infinity, ease: 'linear' }}
        />
      </SceneLayer>

      {/*
        Bandas atmosféricas: leem como camadas de ar sobre o horizonte. São
        abstratas de propósito — silhueta de montanha viraria ilustração, e o
        resto do produto não é ilustrado.
      */}
      <SceneLayer
        pointerX={pointerX}
        pointerY={pointerY}
        parallax={0.055}
        depth={-120}
        delay={0.3}
      >
        <div
          className="absolute inset-x-[-20%] top-[46%] h-[26vmax]"
          style={{
            background:
              'linear-gradient(180deg, transparent, var(--dawn-to) 50%, transparent)',
            opacity: 'calc(var(--dawn-intensity) * 1.1)',
            filter: 'blur(40px)',
          }}
        />
      </SceneLayer>

      <SceneLayer
        pointerX={pointerX}
        pointerY={pointerY}
        parallax={0.1}
        depth={-60}
        delay={0.42}
      >
        <div
          className="absolute inset-x-[-20%] top-[64%] h-[18vmax]"
          style={{
            background:
              'linear-gradient(180deg, transparent, var(--dawn-from) 50%, transparent)',
            opacity: 'calc(var(--dawn-intensity) * 0.9)',
            filter: 'blur(34px)',
          }}
        />
      </SceneLayer>
    </div>
  )
}
