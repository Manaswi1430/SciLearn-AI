import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Materials styling helper for interaction states
const getMaterialProps = (name, baseColor, hoveredPart, selectedPart) => {
  const isHovered = hoveredPart === name;
  const isSelected = selectedPart === name;

  return {
    color: isSelected ? '#06b6d4' : isHovered ? '#8b5cf6' : baseColor,
    emissive: isSelected ? '#06b6d4' : isHovered ? '#8b5cf6' : '#000000',
    emissiveIntensity: isSelected ? 0.9 : isHovered ? 0.5 : 0,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
    transmission: 0.6, // Glassmorphic effect
    thickness: 1.5,
  };
};

// 1. Programmatic Heart (Biology Circulatory system)
function ProgrammaticHeart({ onPointerOver, onPointerOut, onClick, hoveredPart, selectedPart }) {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current && !selectedPart) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05; // Pulsing float
    }
  });

  return (
    <group ref={groupRef} scale={1.2}>
      {/* Left Ventricle */}
      <mesh
        name="LeftVentricle"
        position={[0.22, -0.3, 0]}
        scale={[0.7, 1.05, 0.7]}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("LeftVentricle"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("LeftVentricle", e.point); }}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial {...getMaterialProps("LeftVentricle", "#dc2626", hoveredPart, selectedPart)} />
      </mesh>

      {/* Right Ventricle */}
      <mesh
        name="RightVentricle"
        position={[-0.22, -0.2, 0]}
        scale={[0.65, 0.9, 0.65]}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("RightVentricle"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("RightVentricle", e.point); }}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial {...getMaterialProps("RightVentricle", "#ef4444", hoveredPart, selectedPart)} />
      </mesh>

      {/* Left Atrium */}
      <mesh
        name="LeftAtrium"
        position={[0.25, 0.35, -0.05]}
        scale={[0.45, 0.45, 0.45]}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("LeftAtrium"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("LeftAtrium", e.point); }}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial {...getMaterialProps("LeftAtrium", "#991b1b", hoveredPart, selectedPart)} />
      </mesh>

      {/* Right Atrium */}
      <mesh
        name="RightAtrium"
        position={[-0.25, 0.4, 0.05]}
        scale={[0.42, 0.42, 0.42]}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("RightAtrium"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("RightAtrium", e.point); }}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial {...getMaterialProps("RightAtrium", "#b91c1c", hoveredPart, selectedPart)} />
      </mesh>

      {/* Aorta (Arched Tube) */}
      <mesh
        name="Aorta"
        position={[0.08, 0.7, -0.08]}
        rotation={[0, 0, -0.3]}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("Aorta"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("Aorta", e.point); }}
      >
        <torusGeometry args={[0.35, 0.11, 16, 64, Math.PI * 1.25]} />
        <meshPhysicalMaterial {...getMaterialProps("Aorta", "#ea580c", hoveredPart, selectedPart)} />
      </mesh>
    </group>
  );
}

// 2. Programmatic Brain (Biology Nervous system)
function ProgrammaticBrain({ onPointerOver, onPointerOut, onClick, hoveredPart, selectedPart }) {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current && !selectedPart) {
      groupRef.current.rotation.y = t * 0.15;
    }
  });

  return (
    <group ref={groupRef} scale={1.2}>
      {/* Cerebrum (Large folded upper cortex) */}
      <mesh
        name="Cerebrum"
        position={[0, 0.15, 0]}
        scale={[1.1, 0.85, 1.35]}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("Cerebrum"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("Cerebrum", e.point); }}
      >
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshPhysicalMaterial {...getMaterialProps("Cerebrum", "#c084fc", hoveredPart, selectedPart)} />
      </mesh>

      {/* Cerebellum (Small posterior structure) */}
      <mesh
        name="Cerebellum"
        position={[0, -0.35, -0.55]}
        scale={[0.75, 0.55, 0.65]}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("Cerebellum"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("Cerebellum", e.point); }}
      >
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshPhysicalMaterial {...getMaterialProps("Cerebellum", "#8b5cf6", hoveredPart, selectedPart)} />
      </mesh>

      {/* Brain Stem (Lower support cylinder connecting spinal cord) */}
      <mesh
        name="BrainStem"
        position={[0, -0.65, -0.18]}
        rotation={[0.18, 0, 0]}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("BrainStem"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("BrainStem", e.point); }}
      >
        <cylinderGeometry args={[0.13, 0.08, 0.8, 16]} />
        <meshPhysicalMaterial {...getMaterialProps("BrainStem", "#4f46e5", hoveredPart, selectedPart)} />
      </mesh>
    </group>
  );
}

// 3. Programmatic Solar System (Physics Astrophysics)
function ProgrammaticSolarSystem({ onPointerOver, onPointerOut, onClick, hoveredPart, selectedPart }) {
  const groupRef = useRef();
  const earthRef = useRef();
  const marsRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current && !selectedPart) {
      groupRef.current.rotation.y = t * 0.05;
    }
    // Orbit orbits
    if (earthRef.current) {
      earthRef.current.position.x = Math.sin(t * 0.7) * 0.95;
      earthRef.current.position.z = Math.cos(t * 0.7) * 0.95;
      earthRef.current.rotation.y = t * 1.5;
    }
    if (marsRef.current) {
      marsRef.current.position.x = Math.sin(t * 0.4 + 1.5) * 1.55;
      marsRef.current.position.z = Math.cos(t * 0.4 + 1.5) * 1.55;
      marsRef.current.rotation.y = t * 1.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Sun */}
      <mesh
        name="Sun"
        position={[0, 0, 0]}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("Sun"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("Sun", e.point); }}
      >
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshPhysicalMaterial 
          {...getMaterialProps("Sun", "#eab308", hoveredPart, selectedPart)} 
          transmission={0}
          emissive="#eab308"
          emissiveIntensity={selectedPart === "Sun" ? 1.5 : hoveredPart === "Sun" ? 1.0 : 0.6}
        />
      </mesh>

      {/* Earth Orbit path wireframe */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.005, 8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>

      {/* Earth Group */}
      <group ref={earthRef}>
        <mesh
          name="Earth"
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver("Earth"); }}
          onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
          onClick={(e) => { e.stopPropagation(); onClick("Earth", e.point); }}
        >
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshPhysicalMaterial {...getMaterialProps("Earth", "#0284c7", hoveredPart, selectedPart)} />
        </mesh>
      </group>

      {/* Mars Orbit path wireframe */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.005, 8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>

      {/* Mars Group */}
      <group ref={marsRef}>
        <mesh
          name="Mars"
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver("Mars"); }}
          onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
          onClick={(e) => { e.stopPropagation(); onClick("Mars", e.point); }}
        >
          <sphereGeometry args={[0.10, 24, 24]} />
          <meshPhysicalMaterial {...getMaterialProps("Mars", "#ea580c", hoveredPart, selectedPart)} />
        </mesh>
      </group>
    </group>
  );
}

// 4. Programmatic Bohr Atom (Chemistry)
function ProgrammaticAtom({ onPointerOver, onPointerOut, onClick, hoveredPart, selectedPart }) {
  const groupRef = useRef();
  const e1Ref = useRef();
  const e2Ref = useRef();
  const e3Ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current && !selectedPart) {
      groupRef.current.rotation.y = t * 0.15;
    }
    // Rotate orbits
    if (e1Ref.current) {
      e1Ref.current.position.x = Math.sin(t * 2.2) * 1.1;
      e1Ref.current.position.z = Math.cos(t * 2.2) * 1.1;
    }
    if (e2Ref.current) {
      e2Ref.current.position.y = Math.sin(t * 1.8) * 1.1;
      e2Ref.current.position.x = Math.cos(t * 1.8) * 1.1;
    }
    if (e3Ref.current) {
      e3Ref.current.position.y = Math.sin(t * 2.5) * 1.1;
      e3Ref.current.position.z = Math.cos(t * 2.5) * 1.1;
    }
  });

  return (
    <group ref={groupRef} scale={1.1}>
      {/* Central Nucleus (Cluster of protons & neutrons) */}
      <group 
        name="Nucleus"
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("Nucleus"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("Nucleus", e.point); }}
      >
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshPhysicalMaterial {...getMaterialProps("Nucleus", "#dc2626", hoveredPart, selectedPart)} />
        </mesh>
        <mesh position={[0.12, 0.12, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshPhysicalMaterial {...getMaterialProps("Nucleus", "#2563eb", hoveredPart, selectedPart)} />
        </mesh>
        <mesh position={[-0.12, -0.08, 0.08]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshPhysicalMaterial {...getMaterialProps("Nucleus", "#dc2626", hoveredPart, selectedPart)} />
        </mesh>
        <mesh position={[0.08, -0.12, -0.12]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshPhysicalMaterial {...getMaterialProps("Nucleus", "#2563eb", hoveredPart, selectedPart)} />
        </mesh>
        <mesh position={[-0.08, 0.12, -0.08]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshPhysicalMaterial {...getMaterialProps("Nucleus", "#dc2626", hoveredPart, selectedPart)} />
        </mesh>
      </group>

      {/* Orbit 1 */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[1.1, 0.015, 8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
      {/* Electron 1 */}
      <mesh 
        ref={e1Ref}
        name="Electrons"
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("Electrons"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("Electrons", e.point); }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhysicalMaterial {...getMaterialProps("Electrons", "#06b6d4", hoveredPart, selectedPart)} transmission={0.8} />
      </mesh>

      {/* Orbit 2 */}
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.1, 0.015, 8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
      {/* Electron 2 */}
      <mesh 
        ref={e2Ref}
        name="Electrons"
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("Electrons"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("Electrons", e.point); }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhysicalMaterial {...getMaterialProps("Electrons", "#06b6d4", hoveredPart, selectedPart)} transmission={0.8} />
      </mesh>

      {/* Orbit 3 */}
      <mesh rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.1, 0.015, 8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
      {/* Electron 3 */}
      <mesh 
        ref={e3Ref}
        name="Electrons"
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver("Electrons"); }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick("Electrons", e.point); }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhysicalMaterial {...getMaterialProps("Electrons", "#06b6d4", hoveredPart, selectedPart)} transmission={0.8} />
      </mesh>
    </group>
  );
}

// Root Selector routing lessonId to respective structured 3D compound fallbacks
export default function ProgrammaticInteractiveModel({ lessonId, hoveredPart, selectedPart, onPointerOver, onPointerOut, onClick }) {
  const normalizedId = (lessonId || '').toLowerCase();

  // Route to the appropriate interactive system
  if (normalizedId.includes('brain')) {
    return (
      <ProgrammaticBrain
        hoveredPart={hoveredPart}
        selectedPart={selectedPart}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      />
    );
  }

  if (normalizedId.includes('orbit') || normalizedId.includes('solar') || normalizedId.includes('circuit') || normalizedId.includes('lens')) {
    return (
      <ProgrammaticSolarSystem
        hoveredPart={hoveredPart}
        selectedPart={selectedPart}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      />
    );
  }

  if (normalizedId.includes('atom') || normalizedId.includes('bohr') || normalizedId.includes('bond') || normalizedId.includes('benzene')) {
    return (
      <ProgrammaticAtom
        hoveredPart={hoveredPart}
        selectedPart={selectedPart}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      />
    );
  }

  // Default fallback is the Heart model (highly detailed biological structure)
  return (
    <ProgrammaticHeart
      hoveredPart={hoveredPart}
      selectedPart={selectedPart}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    />
  );
}
