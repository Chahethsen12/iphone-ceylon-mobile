import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function PhoneModel({ rotationX = 0, rotationY = 0, scale = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Smoothly lerp towards the target rotation from props
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, rotationX, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotationY, 0.1);
    }
  });

  return (
    <group scale={scale}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.7, 3.5, 0.2]} />
        <meshPhysicalMaterial
          color="#111111"
          metalness={1}
          roughness={0.1}
          envMapIntensity={2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
        />
        {/* Screen */}
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[1.6, 3.4]} />
          <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
        </mesh>
      </mesh>
    </group>
  );
}

export default function ThreeDPhoneScene({ rotationX = 0, rotationY = 0, scale = 1 }) {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#4550ff" />
        
        <PresentationControls
          global
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 400 }}
        >
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <PhoneModel rotationX={rotationX} rotationY={rotationY} scale={scale} />
          </Float>
        </PresentationControls>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
