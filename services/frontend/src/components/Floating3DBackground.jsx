import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, MeshWobbleMaterial } from '@react-three/drei';

const FloatingObject = ({ color, position, speed, factor }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    mesh.current.position.y = position[1] + Math.sin(t) * 0.5;
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={mesh} position={position}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={0.4}
          radius={1}
        />
      </mesh>
    </Float>
  );
};

const Floating3DBackground = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <FloatingObject color="#00A651" position={[-5, 2, 0]} speed={1} />
        <FloatingObject color="#FFD700" position={[5, -2, -2]} speed={1.2} />
        <FloatingObject color="#006633" position={[0, -4, 2]} speed={0.8} />

        <mesh position={[0, 0, -5]}>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#05150d" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default Floating3DBackground;
