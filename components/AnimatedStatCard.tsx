'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, Text3D } from '@react-three/drei'
import * as THREE from 'three'

interface AnimatedStatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  color: string
  gradient: string
}

function AnimatedCube({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005
      meshRef.current.rotation.y += 0.008
    }
  })

  return (
    <Box ref={meshRef} args={[1, 1, 1]}>
      <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.4} />
    </Box>
  )
}

export default function AnimatedStatCard({
  icon,
  label,
  value,
  change,
  color,
  gradient,
}: AnimatedStatCardProps) {
  return (
    <div className={`glass-hover group relative overflow-hidden p-6 rounded-2xl transition-all duration-300 ${gradient}`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-full h-full">
          <Canvas camera={{ position: [0, 0, 2], fov: 50 }} dpr={1}>
            <ambientLight intensity={0.5} />
            <pointLight position={[2, 2, 2]} intensity={0.8} color={color} />
            <AnimatedCube color={color} />
          </Canvas>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <div className={`p-2 rounded-full glow-${color === '#6366f1' ? 'purple' : color === '#00bfff' ? 'cyan' : 'accent'}`}>
            {icon}
          </div>
        </div>

        <div className="mb-2">
          <h3 className="text-4xl font-bold text-white mb-1">{value}</h3>
          <p className="text-green-400 text-sm font-medium">{change}</p>
        </div>
      </div>
    </div>
  )
}
