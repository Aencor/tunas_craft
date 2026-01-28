import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useLoader } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OrbitControls, Center, Float } from '@react-three/drei'

function Model({ url }) {
  const geometry = useLoader(STLLoader, url)
  const ref = useRef()

  useFrame((state, delta) => {
    // Auto-rotate on Z axis (vertical in this model context usually)
    // Adjust rotation axis based on model orientation
    if (ref.current) {
         ref.current.rotation.z += delta * 0.5 
    }
  })

  return (
    <mesh ref={ref} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} scale={[0.5, 0.5, 0.5]}>
      <meshPhongMaterial 
        color={0xffffff} 
        specular={0x111111} 
        shininess={200}
      />
    </mesh>
  )
}

export default function Hero3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 150], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-20, 0, 20]} color="#F59E0B" intensity={2} distance={100} />
        <pointLight position={[20, 0, 20]} color="#2563EB" intensity={2} distance={100} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Center>
            <React.Suspense fallback={null}>
                <Model url={`${import.meta.env.BASE_URL}images/Tuna-s_craft.stl`} />
            </React.Suspense>
            </Center>
        </Float>
        
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
    </div>
  )
}
