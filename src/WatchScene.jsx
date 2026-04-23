import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'

function WatchIndices() {
  return Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
    const r = 0.83
    const isMajor = i % 3 === 0
    return (
      <mesh
        key={i}
        position={[Math.cos(angle) * r, Math.sin(angle) * r, 0.227]}
        rotation={[0, 0, angle + Math.PI / 2]}
      >
        <boxGeometry args={[0.034, isMajor ? 0.15 : 0.08, 0.003]} />
        <meshStandardMaterial color="#C4964A" emissive="#C4964A" emissiveIntensity={0.5} />
      </mesh>
    )
  })
}

function WatchModel({ scrollProgress }) {
  const groupRef = useRef()

  useFrame(() => {
    if (!groupRef.current) return
    const p = scrollProgress.current
    groupRef.current.rotation.y = p * Math.PI * 2
    groupRef.current.rotation.x = Math.sin(p * Math.PI) * 0.12
  })

  return (
    <group ref={groupRef}>
      {/* Cuerpo principal — disco orientado hacia cámara */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.38, 64]} />
        <meshPhysicalMaterial metalness={0.92} roughness={0.1} color="#7a8c98" envMapIntensity={1.2} />
      </mesh>

      {/* Bisel frontal */}
      <mesh position={[0, 0, 0.19]}>
        <torusGeometry args={[1.2, 0.065, 16, 64]} />
        <meshPhysicalMaterial metalness={0.95} roughness={0.06} color="#566470" />
      </mesh>

      {/* Dial negro */}
      <mesh position={[0, 0, 0.205]}>
        <circleGeometry args={[1.1, 64]} />
        <meshStandardMaterial color="#080810" />
      </mesh>

      {/* Índices de hora */}
      <WatchIndices />

      {/* Logotipo placeholder */}
      <mesh position={[0, 0.25, 0.228]}>
        <planeGeometry args={[0.55, 0.07]} />
        <meshStandardMaterial color="#C4964A" transparent opacity={0.5} />
      </mesh>

      {/* Subesfera — decorativa */}
      <mesh position={[0, -0.3, 0.221]}>
        <ringGeometry args={[0.12, 0.17, 32]} />
        <meshStandardMaterial color="#C4964A" transparent opacity={0.35} />
      </mesh>

      {/* Cristal */}
      <mesh position={[0, 0, 0.225]}>
        <circleGeometry args={[1.1, 64]} />
        <meshPhysicalMaterial transmission={0.96} thickness={0.1} roughness={0} transparent opacity={0.07} color="#88aaff" />
      </mesh>

      {/* Corona */}
      <mesh position={[1.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, 0.22, 16]} />
        <meshPhysicalMaterial metalness={0.9} roughness={0.2} color="#7a8c98" />
      </mesh>
      <mesh position={[1.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 24]} />
        <meshPhysicalMaterial metalness={0.85} roughness={0.35} color="#647080" />
      </mesh>
    </group>
  )
}

export default function WatchScene({ scrollProgress }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent', position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <directionalLight color="#C4964A" intensity={1.5} position={[3, 4, 3]} />
      <directionalLight color="#F8F6F2" intensity={0.6} position={[-3, 1, 2]} />
      <directionalLight color="#ffffff" intensity={0.3} position={[0, -2, -4]} />
      <ambientLight color="#F8F6F2" intensity={0.1} />
      <Environment preset="studio" />
      <WatchModel scrollProgress={scrollProgress} />
    </Canvas>
  )
}
