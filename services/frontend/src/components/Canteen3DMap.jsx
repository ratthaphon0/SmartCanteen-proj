import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, ContactShadows, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Table = ({ position, seats = [], tableId, onSelect }) => {
  return (
    <group position={position}>
      {/* Table Surface */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[2, 0.1, 1.2]} />
        <meshStandardMaterial color="#0a2a1b" roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Table Legs */}
      {[[-0.8, -0.4], [0.8, -0.4], [-0.8, 0.4], [0.8, 0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.25, z]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}

      {/* Seats */}
      {seats.map((seat, i) => {
        const xPos = (i % 3) * 0.7 - 0.7;
        const zPos = i < 3 ? 0.8 : -0.8;
        const color = seat.status === 'vacant' ? '#00A651' : (seat.status === 'occupied' ? '#ef4444' : '#FFD700');
        
        return (
          <mesh key={seat.seat_id} position={[xPos, 0.1, zPos]} castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={seat.status === 'vacant' ? 0.5 : 0.1}
                transparent
                opacity={0.9}
            />
          </mesh>
        );
      })}

      {/* Label */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {tableId}
      </Text>
    </group>
  );
};

const Floor = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
    <planeGeometry args={[20, 20]} />
    <meshStandardMaterial color="#05150d" roughness={0.8} />
    <gridHelper args={[20, 20, '#006633', '#002211']} rotation={[Math.PI / 2, 0, 0]} />
  </mesh>
);

const CanteenScene = ({ tables = {} }) => {
  const tableEntries = Object.entries(tables);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <spotLight position={[-10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
      
      <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={40} />
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        maxPolarAngle={Math.PI / 2.2} 
        minDistance={5}
        maxDistance={15}
      />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group>
          {tableEntries.map(([tableId, seats], idx) => {
            const row = Math.floor(idx / 3);
            const col = idx % 3;
            return (
              <Table 
                key={tableId} 
                tableId={tableId} 
                seats={seats} 
                position={[col * 4 - 4, 0, row * 4 - 2]} 
              />
            );
          })}
        </group>
      </Float>

      <Floor />
      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.25} far={10} color="#000000" />
      
      {/* Background Glow */}
      <mesh position={[0, -1, 0]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#006633" side={THREE.BackSide} transparent opacity={0.05} />
      </mesh>
    </>
  );
};

const Canteen3DMap = ({ tables }) => {
  return (
    <div className="w-full h-full min-h-[400px] bg-[#05150d] rounded-3xl overflow-hidden border border-white/5">
      <Canvas shadows dpr={[1, 2]}>
        <CanteenScene tables={tables} />
      </Canvas>
    </div>
  );
};

export default Canteen3DMap;
