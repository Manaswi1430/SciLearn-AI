import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { 
  Play, Pause, RotateCcw, Activity, HelpCircle, 
  ChevronRight, Compass, ShieldAlert, Sparkles, Rocket
} from 'lucide-react';

// --- SVG REAL-TIME CHART COMPONENT ---
function KinematicGraph({ data, valKey, label, color, minVal, maxVal, unit }) {
  const width = 240;
  const height = 80;
  const padding = 10;

  if (!data || data.length === 0) return null;

  // Find bounds
  const xMax = Math.max(20, Math.max(...data.map(d => d.time)));
  const yVals = data.map(d => d[valKey]);
  const yMinObserved = Math.min(...yVals);
  const yMaxObserved = Math.max(...yVals);

  const yMin = minVal !== undefined ? minVal : Math.min(0, yMinObserved);
  const yMax = maxVal !== undefined ? maxVal : Math.max(1, yMaxObserved);
  const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

  // Convert coordinate spaces
  const getX = (t) => padding + (t / xMax) * (width - 2 * padding);
  const getY = (v) => height - padding - ((v - yMin) / yRange) * (height - 2 * padding);

  let pathData = '';
  let areaData = '';

  data.forEach((pt, index) => {
    const x = getX(pt.time);
    const y = getY(pt[valKey]);

    if (index === 0) {
      pathData = `M ${x} ${y}`;
      areaData = `M ${x} ${height - padding} L ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
      areaData += ` L ${x} ${y}`;
    }

    if (index === data.length - 1) {
      areaData += ` L ${x} ${height - padding} Z`;
    }
  });

  const latestVal = yVals[yVals.length - 1] || 0;
  const currentX = getX(data[data.length - 1].time);

  return (
    <div className="glass-panel p-3 rounded-xl border-white/5 bg-[#090d1a]/60 shadow flex-1 min-w-[200px]">
      <div className="flex justify-between items-center mb-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">
        <span>{label}</span>
        <span style={{ color }} className="font-mono">
          {latestVal.toFixed(1)} {unit}
        </span>
      </div>

      <div className="relative h-[80px] w-full bg-black/30 rounded-lg overflow-hidden border border-white/5">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Zero reference line */}
          {yMin < 0 && yMax > 0 && (
            <line 
              x1={padding} 
              y1={getY(0)} 
              x2={width - padding} 
              y2={getY(0)} 
              stroke="rgba(255,255,255,0.15)" 
              strokeDasharray="2,2" 
            />
          )}

          {/* Area fill */}
          {data.length > 1 && (
            <path 
              d={areaData} 
              fill={`url(#grad-${valKey})`} 
              opacity="0.25" 
            />
          )}

          {/* Line stroke */}
          {data.length > 1 && (
            <path 
              d={pathData} 
              fill="none" 
              stroke={color} 
              strokeWidth="2" 
            />
          )}

          {/* Current time point indicator */}
          {data.length > 0 && (
            <circle 
              cx={currentX} 
              cy={getY(latestVal)} 
              r="3.5" 
              fill={color} 
              stroke="white" 
              strokeWidth="1" 
            />
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id={`grad-${valKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}


// --- 3D VECTOR ARROW ---
function ForceArrow({ position, length, direction = 1, color, label, isVisible, offset = [0, 1.2, 0] }) {
  if (!isVisible || Math.abs(length) < 0.05) return null;

  const arrowLength = Math.max(0.4, Math.min(4, Math.abs(length)));
  const dirSign = direction >= 0 ? 1 : -1;
  const arrowX = position + dirSign * (arrowLength / 2);

  return (
    <group position={[arrowX, offset[1], offset[2]]}>
      {/* Shaft */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, arrowLength, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Cone Tip */}
      <mesh position={[dirSign * (arrowLength / 2), 0, 0]} rotation={[0, 0, -dirSign * Math.PI / 2]}>
        <coneGeometry args={[0.22, 0.5, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Floating Label */}
      <Html distanceFactor={6} position={[0, 0.6, 0]} center>
        <div className="px-2 py-0.5 rounded bg-slate-950/90 border border-white/10 text-[8px] font-mono font-extrabold text-white whitespace-nowrap shadow-lg select-none">
          {label}
        </div>
      </Html>
    </group>
  );
}

// --- 3D VERTICAL FORCE ARROW (Rocket) ---
function VerticalForceArrow({ positionY, length, direction = 1, color, label, isVisible, offsetX = 0 }) {
  if (!isVisible || Math.abs(length) < 0.05) return null;

  const arrowLength = Math.max(0.4, Math.min(4, Math.abs(length)));
  const dirSign = direction >= 0 ? 1 : -1;
  const arrowY = positionY + dirSign * (arrowLength / 2);

  return (
    <group position={[offsetX, arrowY, 0]}>
      {/* Shaft */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, arrowLength, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Cone Tip */}
      <mesh position={[0, dirSign * (arrowLength / 2), 0]} rotation={[dirSign >= 0 ? 0 : Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 0.5, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Floating Label */}
      <Html distanceFactor={6} position={[0.6, 0, 0]} center>
        <div className="px-2 py-0.5 rounded bg-slate-950/90 border border-white/10 text-[8px] font-mono font-extrabold text-white whitespace-nowrap shadow-lg select-none">
          {label}
        </div>
      </Html>
    </group>
  );
}

// --- ROCKET FIRE PARTICLES ---
const RocketParticles = ({ active, thrust }) => {
  const groupRef = useRef();
  const particleCount = 20;
  const particles = useRef(
    Array.from({ length: particleCount }).map(() => ({
      pos: [0, 0, 0],
      speed: 0.15 + Math.random() * 0.2,
      scale: 0.15 + Math.random() * 0.2,
      age: Math.random()
    }))
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.03);

    particles.current.forEach((p, i) => {
      if (active && thrust > 0) {
        // Move particle downward
        p.pos[1] -= p.speed * (thrust * 0.005 + 1.5) * dt * 60;
        p.pos[0] += (Math.random() - 0.5) * 0.06;
        p.pos[2] += (Math.random() - 0.5) * 0.06;
        p.age += dt;

        // Reset particle if expired
        if (p.age > 0.8 || p.pos[1] < -6) {
          p.pos[0] = (Math.random() - 0.5) * 0.15;
          p.pos[1] = -0.5; // engine bell level
          p.pos[2] = (Math.random() - 0.5) * 0.15;
          p.age = 0;
          p.speed = 0.15 + Math.random() * 0.25;
        }
      } else {
        // Hide particles
        p.pos[1] = -999;
      }

      // Sync position/scale with three meshes
      const mesh = groupRef.current.children[i];
      if (mesh) {
        mesh.position.set(...p.pos);
        const s = p.scale * (1.0 - p.age);
        mesh.scale.set(s, s, s);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: particleCount }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#f97316" : "#ef4444"} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  );
};


// --- R3F ENVIRONMENT & GRID ---
function LabEnvironment({ activeLaw, frictionEnabled }) {
  // Color the track or floor based on the active law and settings
  const gridColor = '#1e293b';
  
  return (
    <group>
      <ambientLight intensity={0.65} />
      <directionalLight 
        position={[5, 12, 4]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      
      {/* Physics platform base */}
      {activeLaw !== 'action-reaction' ? (
        <group>
          {/* Surface board */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[500, 12]} />
            <meshStandardMaterial 
              color={activeLaw === 'inertia' ? (frictionEnabled ? '#1e293b' : '#0369a1') : '#0f172a'} 
              roughness={activeLaw === 'inertia' ? (frictionEnabled ? 0.9 : 0.02) : 0.4} 
              metalness={activeLaw === 'inertia' ? (frictionEnabled ? 0.0 : 0.8) : 0.5} 
            />
          </mesh>

          {/* Runway reference lines */}
          <gridHelper args={[500, 100, '#06b6d4', '#334155']} position={[0, 0.001, 0]} />
        </group>
      ) : (
        <group>
          {/* Rocket launchpad circular ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[0, 4, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
          
          <gridHelper args={[100, 40, '#06b6d4', '#1e293b']} position={[0, 0.001, 0]} />
          
          {/* Launch Tower scaffolding */}
          <group position={[-1.5, 4, -1]}>
            <mesh>
              <boxGeometry args={[0.3, 8, 0.3]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
            {/* cross beams */}
            <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.1, 2, 0.1]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.6, 2, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.1, 2, 0.1]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.6, -2, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.1, 2, 0.1]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

// --- R3F CAMERA FOLLOW CONTROLLER ---
function CameraFollow({ activeLaw, posX, posY }) {
  useFrame((state) => {
    let targetX, targetY, targetZ;
    let lookTarget;

    if (activeLaw === 'action-reaction') {
      targetX = 6;
      targetY = posY + 2;
      targetZ = 10;
      lookTarget = [0, posY, 0];
    } else {
      targetX = posX;
      targetY = 2;
      targetZ = 7;
      lookTarget = [posX, 0.5, 0];
    }

    // Smooth camera lerp
    state.camera.position.x += (targetX - state.camera.position.x) * 0.05;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.05;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.05;

    state.camera.lookAt(...lookTarget);
  });
  return null;
}

// --- SIMULATION PHYSICS ENGINE NODE (Inside R3F hierarchy) ---
function SimulationEngine({
  activeLaw,
  isPlaying,
  force,
  mass,
  frictionEnabled,
  rocketThrust,
  rocketMass,
  posRef,
  velRef,
  accRef,
  timeRef,
  setIsPlaying
}) {
  useFrame((state, delta) => {
    if (!isPlaying) return;

    // Cap frame step to prevent physics exploding on tab backgrounding
    const dt = Math.min(delta, 0.03);
    timeRef.current += dt;

    if (activeLaw === 'inertia') {
      const g = 9.81;
      const mu_s = frictionEnabled ? 0.28 : 0;
      const mu_k = frictionEnabled ? 0.18 : 0;

      const appliedForce = force;
      const normalForce = mass * g;
      const staticFrictionMax = mu_s * normalForce;
      const currentVel = velRef.current;
      
      let netForce = 0;

      if (Math.abs(currentVel) < 0.01) {
        // At Rest
        if (Math.abs(appliedForce) > staticFrictionMax) {
          // Break inertia!
          const frictionForce = Math.sign(appliedForce) * mu_k * normalForce;
          netForce = appliedForce - frictionForce;
        } else {
          netForce = 0;
          velRef.current = 0;
        }
      } else {
        // In Motion
        const frictionForce = Math.sign(currentVel) * mu_k * normalForce;
        netForce = appliedForce - frictionForce;

        // Verify if friction stops the motion in deceleration
        const nextVel = currentVel + (netForce / mass) * dt;
        if (Math.sign(nextVel) !== Math.sign(currentVel) && Math.abs(appliedForce) <= Math.abs(frictionForce)) {
          netForce = 0;
          velRef.current = 0;
        }
      }

      const acc = netForce / mass;
      accRef.current = acc;
      velRef.current += acc * dt;
      posRef.current += velRef.current * dt;

    } else if (activeLaw === 'fma') {
      // Frictionless linear rail experiment
      const acc = force / mass;
      accRef.current = acc;
      velRef.current += acc * dt;
      posRef.current += velRef.current * dt;

    } else if (activeLaw === 'action-reaction') {
      // Vertical rocket acceleration
      const g = 9.81;
      const gravityForce = rocketMass * g;
      const thrustForce = rocketThrust;

      let acc = 0;
      if (posRef.current > 0.01 || thrustForce > gravityForce) {
        acc = (thrustForce - gravityForce) / rocketMass;
      } else {
        acc = 0;
        velRef.current = 0;
      }

      accRef.current = acc;
      velRef.current += acc * dt;
      posRef.current += velRef.current * dt;

      // Bound rocket to ground plane
      if (posRef.current < 0) {
        posRef.current = 0;
        velRef.current = 0;
        accRef.current = 0;
      }
    }
  });

  return null;
}

// --- MAIN LAWS SIMULATOR DASHBOARD ---
export default function NewtonsLawsSimulator({ selectedPart, onSelectPart, hoveredPart, onHoverPart }) {
  // Tab State
  const [activeLaw, setActiveLaw] = useState('inertia'); // 'inertia', 'fma', 'action-reaction'
  const [isPlaying, setIsPlaying] = useState(false);

  // Dynamic Slider States
  const [force, setForce] = useState(25); // N (applied force)
  const [mass, setMass] = useState(10); // kg
  const [frictionEnabled, setFrictionEnabled] = useState(true); // Law 1 only
  const [rocketThrust, setRocketThrust] = useState(1200); // N
  const [rocketMass, setRocketMass] = useState(100); // kg

  // HUD Readouts
  const [time, setTime] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [acceleration, setAcceleration] = useState(0);

  // Live telemetry graphs data
  const [history, setHistory] = useState([{ time: 0, force: 25, mass: 10, acceleration: 0, velocity: 0 }]);

  // High freq references
  const posRef = useRef(0);
  const velRef = useRef(0);
  const accRef = useRef(0);
  const timeRef = useRef(0);

  // Sync state between tabs
  const handleLawTabChange = (law) => {
    setActiveLaw(law);
    setIsPlaying(false);
    
    // Reset engine
    posRef.current = 0;
    velRef.current = 0;
    accRef.current = 0;
    timeRef.current = 0;

    // Reset states
    setTime(0);
    setPosX(0);
    setPosY(0);
    setVelocity(0);
    setAcceleration(0);

    if (law === 'inertia') {
      setForce(25);
      setMass(10);
      setHistory([{ time: 0, force: 25, mass: 10, acceleration: 0, velocity: 0 }]);
    } else if (law === 'fma') {
      setForce(40);
      setMass(10);
      setHistory([{ time: 0, force: 40, mass: 10, acceleration: 4, velocity: 0 }]);
    } else if (law === 'action-reaction') {
      setRocketThrust(1200);
      setRocketMass(100);
      setHistory([{ time: 0, force: 1200, mass: 100, acceleration: 2.19, velocity: 0 }]);
    }
  };

  // Main UI ticker interval updating states and graphs at 20Hz
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentSimTime = timeRef.current;
        const currentPos = posRef.current;
        const currentVel = velRef.current;
        const currentAcc = accRef.current;

        setTime(currentSimTime);
        if (activeLaw === 'action-reaction') {
          setPosY(currentPos);
          setPosX(0);
        } else {
          setPosX(currentPos);
          setPosY(0);
        }
        setVelocity(currentVel);
        setAcceleration(currentAcc);

        const currentForce = activeLaw === 'action-reaction' ? rocketThrust : force;
        const currentMass = activeLaw === 'action-reaction' ? rocketMass : mass;

        setHistory(prev => {
          // Filter duplicates
          if (prev.length > 0 && prev[prev.length - 1].time === currentSimTime) return prev;
          
          return [...prev, {
            time: currentSimTime,
            force: currentForce,
            mass: currentMass,
            acceleration: currentAcc,
            velocity: currentVel
          }].slice(-100); // cap history for render speed
        });
      }, 50);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeLaw, force, mass, rocketThrust, rocketMass]);

  const handleReset = () => {
    setIsPlaying(false);
    posRef.current = 0;
    velRef.current = 0;
    accRef.current = 0;
    timeRef.current = 0;

    setTime(0);
    setPosX(0);
    setPosY(0);
    setVelocity(0);
    setAcceleration(0);

    const currentForce = activeLaw === 'action-reaction' ? rocketThrust : force;
    const currentMass = activeLaw === 'action-reaction' ? rocketMass : mass;
    const initialAcc = activeLaw === 'action-reaction' 
      ? Math.max(0, (rocketThrust - rocketMass * 9.81) / rocketMass)
      : currentForce / currentMass;

    setHistory([{ 
      time: 0, 
      force: currentForce, 
      mass: currentMass, 
      acceleration: activeLaw === 'inertia' && frictionEnabled ? 0 : initialAcc, 
      velocity: 0 
    }]);
  };

  // Live mathematical helper calculation
  const getFmaLabel = () => {
    if (activeLaw === 'action-reaction') {
      const g = 9.81;
      const w = (rocketMass * g).toFixed(1);
      const net = (rocketThrust - rocketMass * g).toFixed(1);
      return `a = (Thrust - Gravity) / m = (${rocketThrust}N - ${w}N) / ${rocketMass}kg = ${acceleration.toFixed(2)} m/s²`;
    }
    if (activeLaw === 'inertia') {
      if (Math.abs(velocity) < 0.01 && Math.abs(force) <= (frictionEnabled ? mass * 9.81 * 0.28 : 0)) {
        const threshold = (mass * 9.81 * 0.28).toFixed(1);
        return `At Rest: Applied Force (${force}N) <= Static Friction Limit (${threshold}N)`;
      }
      const frictionForce = frictionEnabled ? (Math.sign(velocity || force || 1) * 0.18 * mass * 9.81).toFixed(1) : 0;
      return `a = (F_app - F_fric) / m = (${force}N - ${frictionForce}N) / ${mass}kg = ${acceleration.toFixed(2)} m/s²`;
    }
    return `a = F / m = ${force}N / ${mass}kg = ${acceleration.toFixed(2)} m/s²`;
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Tab Selectors for the Three Laws */}
      <div className="flex items-center p-1 rounded-2xl bg-[#050914]/60 border border-white/5 backdrop-blur-xl">
        <button
          onClick={() => handleLawTabChange('inertia')}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 ${
            activeLaw === 'inertia'
              ? 'bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-cyan/35 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wide">Law 1</span>
          <span className="text-[9px] text-gray-500 font-medium">Inertia</span>
        </button>
        
        <button
          onClick={() => handleLawTabChange('fma')}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 ${
            activeLaw === 'fma'
              ? 'bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-cyan/35 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wide">Law 2</span>
          <span className="text-[9px] text-gray-500 font-medium">F = ma</span>
        </button>
        
        <button
          onClick={() => handleLawTabChange('action-reaction')}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 ${
            activeLaw === 'action-reaction'
              ? 'bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-cyan/35 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wide">Law 3</span>
          <span className="text-[9px] text-gray-500 font-medium">Action & Reaction</span>
        </button>
      </div>

      {/* 3D Lab Box Canvas */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02050f] overflow-hidden h-[300px] shadow-xl">
        <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
          <LabEnvironment activeLaw={activeLaw} frictionEnabled={frictionEnabled} />

          {/* LAW 1 & 2: Box or Cart on Runway */}
          {activeLaw === 'inertia' && (
            <group position={[posX, 0.4, 0]}>
              {/* Box Geometry */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial 
                  color={selectedPart === 'Law 1: Inertia' ? '#22d3ee' : '#3b82f6'} 
                  roughness={0.4}
                  metalness={0.2}
                />
              </mesh>
              {/* Box Outline Details */}
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(0.81, 0.81, 0.81)]} />
                <lineBasicMaterial color="#ffffff" linewidth={1.5} opacity={0.3} transparent />
              </lineSegments>
            </group>
          )}

          {activeLaw === 'fma' && (
            <group position={[posX, 0.25, 0]}>
              {/* Linear Cart Sled */}
              <mesh castShadow>
                <boxGeometry args={[1.2, 0.3, 0.6]} />
                <meshStandardMaterial 
                  color={selectedPart === 'Law 2: F = ma' ? '#a855f7' : '#64748b'} 
                  roughness={0.2} 
                  metalness={0.8} 
                />
              </mesh>
              {/* Wheels */}
              <mesh position={[-0.4, -0.15, 0.3]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} />
              </mesh>
              <mesh position={[0.4, -0.15, 0.3]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} />
              </mesh>
              <mesh position={[-0.4, -0.15, -0.3]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} />
              </mesh>
              <mesh position={[0.4, -0.15, -0.3]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} />
              </mesh>

              {/* Formula board overlay */}
              <Html distanceFactor={6} position={[0, 0.7, 0]} center>
                <div className="rounded-xl bg-purple-950/90 border border-purple-500/30 px-3 py-1.5 text-[9px] text-purple-200 font-mono shadow-2xl font-bold whitespace-nowrap">
                  F = m × a = {(force).toFixed(0)}N
                </div>
              </Html>
            </group>
          )}

          {/* LAW 3: Rocket Launcher */}
          {activeLaw === 'action-reaction' && (
            <group position={[0, posY, 0]}>
              {/* Rocket Body */}
              <mesh castShadow>
                <cylinderGeometry args={[0.3, 0.3, 1.4, 16]} />
                <meshStandardMaterial 
                  color={selectedPart === 'Rocket Thruster' ? '#22d3ee' : '#f8fafc'} 
                  roughness={0.3} 
                />
              </mesh>
              {/* Nose Cone */}
              <mesh position={[0, 1.05, 0]}>
                <coneGeometry args={[0.3, 0.7, 16]} />
                <meshStandardMaterial color="#ef4444" roughness={0.3} />
              </mesh>
              {/* Fins */}
              <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[0.9, 0.4, 0.08]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
              <mesh position={[0, -0.5, 0]} rotation={[0, Math.PI/2, 0]}>
                <boxGeometry args={[0.9, 0.4, 0.08]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
              {/* Engine Nozzle bell */}
              <mesh position={[0, -0.85, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.2, 0.3, 16]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
              </mesh>

              {/* Flame exhaust particles */}
              <RocketParticles active={isPlaying} thrust={rocketThrust} />
            </group>
          )}

          {/* Vector Arrows for Law 1 and Law 2 (Horizontal) */}
          {activeLaw !== 'action-reaction' && (
            <group>
              {/* Action Force Arrow (Blue/cyan) */}
              <ForceArrow 
                position={posX}
                length={Math.abs(force) * 0.04}
                direction={force >= 0 ? 1 : -1}
                color="#06b6d4"
                label={`Applied Force = ${force} N`}
                isVisible={Math.abs(force) > 0.01}
                offset={[0, 0.9, 0]}
              />

              {/* Reaction/Friction Force Arrow (Pink/red) */}
              {activeLaw === 'inertia' && frictionEnabled && (
                <ForceArrow 
                  position={posX}
                  length={Math.min(Math.abs(force), mass * 9.81 * 0.28) * 0.04}
                  direction={force >= 0 ? -1 : 1}
                  color="#ec4899"
                  label={`Friction Force = ${(Math.abs(velocity) > 0.01 ? (0.18 * mass * 9.81) : Math.min(Math.abs(force), mass * 9.81 * 0.28)).toFixed(1)} N`}
                  isVisible={frictionEnabled && (Math.abs(force) > 0.1 || Math.abs(velocity) > 0.1)}
                  offset={[0, 0.9, 0.3]}
                />
              )}
            </group>
          )}

          {/* Vector Arrows for Law 3 (Vertical) */}
          {activeLaw === 'action-reaction' && (
            <group>
              {/* Action force: Gases expelled downward */}
              <VerticalForceArrow 
                positionY={posY - 0.95}
                length={rocketThrust * 0.0018}
                direction={-1}
                color="#f97316"
                label={`Action: Exhaust gas force = -${rocketThrust} N`}
                isVisible={isPlaying && rocketThrust > 0}
                offsetX={-0.4}
              />

              {/* Reaction force: Thrust driving rocket upward */}
              <VerticalForceArrow 
                positionY={posY}
                length={rocketThrust * 0.0018}
                direction={1}
                color="#06b6d4"
                label={`Reaction: Upward thrust = +${rocketThrust} N`}
                isVisible={isPlaying && rocketThrust > 0}
                offsetX={0.4}
              />

              {/* Gravity force pulling rocket downward */}
              <VerticalForceArrow 
                positionY={posY}
                length={(rocketMass * 9.81) * 0.0018}
                direction={-1}
                color="#ec4899"
                label={`Gravity Force = -${(rocketMass * 9.81).toFixed(0)} N`}
                isVisible={true}
                offsetX={0}
              />
            </group>
          )}

          {/* Live Mathematical Formula Board floating in 3D */}
          <Html position={[activeLaw === 'action-reaction' ? 1.5 : posX, 2.3, 0]} center distanceFactor={8}>
            <div className="glass-panel px-3 py-1.5 rounded-xl border-white/10 bg-[#050914]/90 text-[8px] font-mono font-extrabold text-brand-cyan shadow-2xl whitespace-nowrap">
              {getFmaLabel()}
            </div>
          </Html>

          {/* Camera Controller */}
          <CameraFollow activeLaw={activeLaw} posX={posX} posY={posY} />

          <OrbitControls 
            target={[activeLaw === 'action-reaction' ? 0 : posX, activeLaw === 'action-reaction' ? posY : 0.4, 0]}
            enableZoom={true}
            enablePan={false}
            maxDistance={25}
            minDistance={4}
          />

          <SimulationEngine 
            activeLaw={activeLaw}
            isPlaying={isPlaying}
            force={force}
            mass={mass}
            frictionEnabled={frictionEnabled}
            rocketThrust={rocketThrust}
            rocketMass={rocketMass}
            posRef={posRef}
            velRef={velRef}
            accRef={accRef}
            timeRef={timeRef}
            setIsPlaying={setIsPlaying}
          />
        </Canvas>

        {/* Canvas Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/80 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            Virtual Forces Lab Canvas
          </div>
        </div>

        {/* Help Tooltip */}
        <div className="absolute top-3 right-3 z-10">
          <div className="group relative">
            <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#050914]/80 text-gray-400 hover:text-white backdrop-blur-md transition-colors shadow">
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
            <div className="absolute right-0 top-7 w-48 scale-0 group-hover:scale-100 transition-all origin-top-right rounded-lg bg-slate-950/95 border border-slate-800 p-2.5 text-[9px] text-gray-300 leading-normal z-20 shadow-xl">
              Switch laws to run different experiments. Drag screen to rotate camera. Sliders modify values in real time!
            </div>
          </div>
        </div>
      </div>

      {/* Control sliders & Live Telemetry Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        
        {/* CONTROL SLIDERS PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Compass className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Experiment Control Panel
            </h3>
          </div>

          <div className="space-y-3 flex-1 mb-4">
            {activeLaw !== 'action-reaction' ? (
              <>
                {/* Force Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Applied Force (F)</span>
                    <span className="text-brand-cyan font-mono">{force} N</span>
                  </div>
                  <input 
                    type="range"
                    min={activeLaw === 'inertia' ? "0" : "-100"}
                    max="100"
                    step="5"
                    value={force}
                    onChange={(e) => setForce(parseInt(e.target.value))}
                    className="w-full accent-brand-cyan bg-slate-950/60 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>

                {/* Mass Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Object Mass (m)</span>
                    <span className="text-brand-purple font-mono">{mass} kg</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={mass}
                    onChange={(e) => setMass(parseInt(e.target.value))}
                    className="w-full accent-brand-purple bg-slate-950/60 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>

                {/* Static Friction Toggle for Law 1 */}
                {activeLaw === 'inertia' && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 mt-2">
                    <span className="text-[10px] font-bold text-gray-300">Surface Friction (μs = 0.28, μk = 0.18)</span>
                    <button
                      onClick={() => setFrictionEnabled(!frictionEnabled)}
                      className={`text-[9px] font-extrabold px-3 py-1.5 rounded-lg border transition-all ${
                        frictionEnabled 
                          ? 'bg-brand-pink/10 border-brand-pink/30 text-brand-pink' 
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {frictionEnabled ? 'FRICTION: ON' : 'FRICTIONLESS (ICE)'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Rocket Thrust Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Downward Fuel Thrust (Action Force)</span>
                    <span className="text-brand-cyan font-mono">{rocketThrust} N</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="2500"
                    step="100"
                    value={rocketThrust}
                    onChange={(e) => setRocketThrust(parseInt(e.target.value))}
                    className="w-full accent-brand-cyan bg-slate-950/60 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>

                {/* Rocket Mass Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Total Rocket Mass</span>
                    <span className="text-brand-purple font-mono">{rocketMass} kg</span>
                  </div>
                  <input 
                    type="range"
                    min="50"
                    max="200"
                    step="10"
                    value={rocketMass}
                    onChange={(e) => setRocketMass(parseInt(e.target.value))}
                    className="w-full accent-brand-purple bg-slate-950/60 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-500/5 border border-orange-500/10 text-[9.5px] text-orange-200 mt-2">
                  <Rocket className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>
                    Action: Expelling exhaust gases down. Reaction: Thrust pushes rocket up with equal & opposite force.
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Trigger Play Action Panel */}
          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                isPlaying 
                  ? 'bg-yellow-600 hover:bg-yellow-500' 
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" /> Pause Lab
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Start Experiment
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white transition-all"
              title="Reset experiment"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* LIVE TELEMETRY DASHBOARD */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Activity className="h-4 w-4 text-brand-purple" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Live Telemetry Panel
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">Net Force</span>
              <span className="text-sm font-mono font-bold text-brand-cyan">
                {activeLaw === 'action-reaction' 
                  ? `${(rocketThrust - rocketMass * 9.81).toFixed(1)} N`
                  : activeLaw === 'inertia' && frictionEnabled && Math.abs(velocity) < 0.01 && Math.abs(force) <= mass * 9.81 * 0.28
                    ? '0.0 N'
                    : `${(activeLaw === 'inertia' && frictionEnabled ? force - (Math.sign(velocity || force) * 0.18 * mass * 9.81) : force).toFixed(1)} N`
                }
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">Object Mass</span>
              <span className="text-sm font-mono font-bold text-brand-purple">
                {activeLaw === 'action-reaction' ? rocketMass : mass} kg
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">Acceleration</span>
              <span className="text-sm font-mono font-bold text-brand-pink">
                {acceleration.toFixed(2)} m/s²
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">Velocity</span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {velocity.toFixed(1)} m/s
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5 col-span-2">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">
                {activeLaw === 'action-reaction' ? 'Altitude (Displacement Y)' : 'Position (Displacement X)'}
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {(activeLaw === 'action-reaction' ? posY : posX).toFixed(1)} m
              </span>
            </div>
          </div>

          <div className="text-[9px] text-gray-500 font-mono text-right">
            Elapsed Time: {time.toFixed(2)} s
          </div>
        </div>
      </div>

      {/* Real-time Kinematic Graphs */}
      <div className="flex flex-wrap gap-4 w-full">
        <KinematicGraph 
          data={history} 
          valKey="force" 
          label="Applied Force" 
          color="#06b6d4" 
          unit="N" 
        />
        <KinematicGraph 
          data={history} 
          valKey="acceleration" 
          label="Acceleration" 
          color="#ec4899" 
          unit="m/s²" 
        />
        <KinematicGraph 
          data={history} 
          valKey="velocity" 
          label="Velocity" 
          color="#10b981" 
          unit="m/s" 
        />
      </div>
    </div>
  );
}
