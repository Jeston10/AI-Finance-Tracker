"use client"

import { useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

function AnimatedSphere() {
  const mesh = useRef<THREE.Mesh>(null!)
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.005
      mesh.current.rotation.y += 0.005
      mesh.current.rotation.z += 0.002
      
      // Add floating animation
      mesh.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <Sphere args={[1, 100, 200]} ref={mesh} scale={2}>
      <MeshDistortMaterial 
        color="#8352FD" 
        attach="material" 
        distort={0.5} 
        speed={2} 
        roughness={0.1}
        metalness={0.8}
      />
    </Sphere>
  )
}

function Scene() {
  return (
    <>
      <OrbitControls enableZoom={false} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 2, 1]} intensity={1.2} />
      <pointLight position={[-3, -2, -1]} intensity={0.8} color="#8352FD" />
      <AnimatedSphere />
    </>
  )
}

export default function ThreeDSceneClient() {
  return (
    <div className="w-full h-screen">
      <Canvas
        className="w-full h-screen"
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
