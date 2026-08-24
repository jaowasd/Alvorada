import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

// mesmo valor de --color-primary-500 em src/index.css
const PRIMARY_COLOR = '#3562f6'

function RotatingObject() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 0.3
    meshRef.current.rotation.x += delta * 0.12
  })

  return (
    <mesh ref={meshRef} position={[0.3, -0.2, 0.2]}>
      <icosahedronGeometry args={[1.7, 0]} />
      <meshStandardMaterial
        color={PRIMARY_COLOR}
        roughness={0.3}
        metalness={0.1}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}

export default function HeroScene() {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-20 -z-10"
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        frameloop={prefersReducedMotion ? 'demand' : 'always'}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        {!prefersReducedMotion && <RotatingObject />}
        {prefersReducedMotion && (
          <mesh position={[0.3, -0.2, 0.2]}>
            <icosahedronGeometry args={[1.7, 0]} />
            <meshStandardMaterial
              color={PRIMARY_COLOR}
              roughness={0.3}
              metalness={0.1}
              transparent
              opacity={0.85}
            />
          </mesh>
        )}
      </Canvas>
    </div>
  )
}
