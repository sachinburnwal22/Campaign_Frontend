import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Sphere, Wireframe } from '@react-three/drei'
import * as THREE from 'three'

function RotatingOrb() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.0003
      meshRef.current.rotation.y += 0.0005
    }
  })

  return (
    <>
      <Sphere ref={meshRef} args={[2, 64, 64]} position={[0, 0, 0]}>
        <meshPhongMaterial
          color="#6366f1"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          wireframe={false}
          shininess={100}
        />
      </Sphere>
      <Sphere args={[2.1, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#00bfff"
          transparent
          opacity={0.1}
          wireframe={true}
        />
      </Sphere>
    </>
  )
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.InstancedMesh>(null)
  const count = 200

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x += 0.00005
      particlesRef.current.rotation.y += 0.0001
    }
  })

  const dummy = new THREE.Object3D()
  const positions = []

  for (let i = 0; i < count; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    )
    dummy.updateMatrix()
    positions.push(dummy.position.clone())
  }

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.8} />
    </instancedMesh>
  )
}

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: 'transparent' }}
        dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#00bfff" />
        
        <RotatingOrb />
        <FloatingParticles />

        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
