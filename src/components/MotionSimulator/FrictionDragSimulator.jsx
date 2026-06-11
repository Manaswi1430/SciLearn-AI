import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { 
  Play, Pause, RotateCcw, Activity, HelpCircle, 
  ChevronRight, Compass, ShieldAlert, Sparkles, Wind, Gauge, AlertCircle
} from 'lucide-react';

// --- SVG REAL-TIME CHART COMPONENT ---
function KinematicGraph({ data, valKey, label, color, minVal, maxVal, unit }) {
  const width = 240;
  const height = 80;
  const padding = 10;

  if (!data || data.length === 0) return null;

  // Find bounds
  const xMax = Math.max(10, Math.max(...data.map(d => d.time)));
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
  const arrowX = position[0] + dirSign * (arrowLength / 2);

  return (
    <group position={[arrowX, position[1] + offset[1], position[2] + offset[2]]}>
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
      <Html distanceFactor={8} position={[0, 0.6, 0]} center>
        <div className="px-2 py-0.5 rounded bg-slate-950/90 border border-white/10 text-[8px] font-mono font-extrabold text-white whitespace-nowrap shadow-lg select-none">
          {label}
        </div>
      </Html>
    </group>
  );
}

// --- 3D VERTICAL FORCE ARROW ---
function VerticalForceArrow({ position, length, direction = 1, color, label, isVisible, offsetX = 0, offsetY = 0 }) {
  if (!isVisible || Math.abs(length) < 0.05) return null;

  const arrowLength = Math.max(0.4, Math.min(4, Math.abs(length)));
  const dirSign = direction >= 0 ? 1 : -1;
  const arrowY = position[1] + dirSign * (arrowLength / 2) + offsetY;

  return (
    <group position={[position[0] + offsetX, arrowY, position[2]]}>
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
      <Html distanceFactor={8} position={[0.6, 0, 0]} center>
        <div className="px-2 py-0.5 rounded bg-slate-950/90 border border-white/10 text-[8px] font-mono font-extrabold text-white whitespace-nowrap shadow-lg select-none">
          {label}
        </div>
      </Html>
    </group>
  );
}

// --- MOTION TRAIL COMPONENT ---
function MotionTrail({ positions }) {
  return (
    <group>
      {positions.map((pt, idx) => (
        <mesh key={idx} position={[pt, 0.4, 0]}>
          <sphereGeometry args={[0.08 - idx * 0.005, 8, 8]} />
          <meshStandardMaterial 
            color="#06b6d4" 
            transparent 
            opacity={Math.max(0, 0.9 - idx / positions.length)} 
            emissive="#06b6d4" 
            emissiveIntensity={0.5} 
          />
        </mesh>
      ))}
    </group>
  );
}

// --- PARACHUTIST 3D MESH ---
function ParachutistModel({ parachuteArea }) {
  const canopyRadius = Math.max(0.6, Math.min(2.5, Math.sqrt(parachuteArea) * 0.35));

  return (
    <group position={[0, 0, 0]}>
      {/* Parachute Canopy (Hollow dome representing canopy) */}
      <group position={[0, 2.2, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[canopyRadius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f43f5e" side={THREE.DoubleSide} roughness={0.4} />
        </mesh>
        {/* Parachute structural rib borders */}
        <lineSegments>
          <edgesGeometry args={[new THREE.SphereGeometry(canopyRadius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2)]} />
          <lineBasicMaterial color="#ffffff" opacity={0.4} transparent />
        </lineSegments>
      </group>

      {/* Suspension Lines */}
      <group position={[0, 0, 0]}>
        <mesh position={[-0.2, 1.2, 0]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 2.0, 6]} />
          <meshBasicMaterial color="#475569" />
        </mesh>
        <mesh position={[0.2, 1.2, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 2.0, 6]} />
          <meshBasicMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 1.2, -0.2]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 2.0, 6]} />
          <meshBasicMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 1.2, 0.2]} rotation={[-0.1, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 2.0, 6]} />
          <meshBasicMaterial color="#475569" />
        </mesh>
      </group>

      {/* Human Body */}
      <group position={[0, 0.2, 0]}>
        {/* Head */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffedd5" roughness={0.6} />
        </mesh>
        
        {/* Torso */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.5, 12]} />
          <meshStandardMaterial color="#fb923c" roughness={0.5} />
        </mesh>

        {/* Harness / Backpack */}
        <mesh position={[0, 0.1, -0.06]} castShadow>
          <boxGeometry args={[0.14, 0.35, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.15, 0.18, 0.05]} rotation={[0, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>
        <mesh position={[0.15, 0.18, 0.05]} rotation={[0, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.07, -0.3, 0.05]} rotation={[0.2, 0, 0.1]} castShadow>
          <cylinderGeometry args={[0.04, 0.035, 0.45, 8]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0.07, -0.3, 0.05]} rotation={[0.2, 0, -0.1]} castShadow>
          <cylinderGeometry args={[0.04, 0.035, 0.45, 8]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>
    </group>
  );
}

// --- ENVIRONMENT AND TRACK ---
function SimulatorEnvironment({ activeTab, surfaceType }) {
  const getSurfaceColor = () => {
    switch (surfaceType) {
      case 'ice': return '#7dd3fc'; // ice light blue
      case 'wood': return '#b45309'; // wood amber-brown
      case 'concrete': return '#64748b'; // concrete slate-gray
      case 'sand': return '#eab308'; // sand yellow
      default: return '#1e293b';
    }
  };

  const getSurfaceRoughness = () => {
    switch (surfaceType) {
      case 'ice': return 0.03;
      case 'wood': return 0.7;
      case 'concrete': return 0.8;
      case 'sand': return 0.95;
      default: return 0.5;
    }
  };

  const getSurfaceMetalness = () => {
    return surfaceType === 'ice' ? 0.8 : 0.1;
  };

  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[8, 15, 5]} 
        intensity={1.3} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      
      {activeTab === 'friction' ? (
        <group>
          {/* Runway Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[500, 10]} />
            <meshStandardMaterial 
              color={getSurfaceColor()} 
              roughness={getSurfaceRoughness()} 
              metalness={getSurfaceMetalness()} 
            />
          </mesh>
          {/* Grid markings */}
          <gridHelper args={[500, 100, '#06b6d4', '#475569']} position={[0, 0.002, 0]} />
        </group>
      ) : (
        <group>
          {/* Vertical descending guide line grid */}
          <gridHelper args={[60, 20, '#38bdf8', '#1e293b']} rotation={[Math.PI / 2, 0, 0]} position={[0, 25, -2]} />

          {/* Altitude markers */}
          {Array.from({ length: 11 }).map((_, idx) => {
            const y = idx * 5;
            return (
              <Html key={idx} position={[-2, y, -1]} distanceFactor={10} center>
                <span className="text-[7px] font-mono text-gray-500 font-bold select-none">{y}m</span>
              </Html>
            );
          })}

          {/* Sky background floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#15803d" roughness={0.9} /> {/* green landing ground */}
          </mesh>
          <gridHelper args={[100, 20, '#22c55e', '#1e3a1e']} position={[0, 0.002, 0]} />
        </group>
      )}
    </group>
  );
}

// --- CAMERA CONTROLLER ---
function CameraController({ activeTab, posX, posY }) {
  useFrame((state) => {
    let targetCamera = [0, 0, 0];
    let lookTarget = [0, 0, 0];

    if (activeTab === 'friction') {
      targetCamera = [posX, 1.8, 6.0];
      lookTarget = [posX, 0.5, 0];
    } else {
      targetCamera = [4.5, posY + 0.8, 4.5];
      lookTarget = [0, posY, 0];
    }

    state.camera.position.x += (targetCamera[0] - state.camera.position.x) * 0.06;
    state.camera.position.y += (targetCamera[1] - state.camera.position.y) * 0.06;
    state.camera.position.z += (targetCamera[2] - state.camera.position.z) * 0.06;

    state.camera.lookAt(...lookTarget);
  });
  return null;
}

// --- HIGH FREQUENCY PHYSICS LOOP ENGINE ---
function SimulatorPhysicsLoop({
  activeTab,
  isPlaying,
  surfaceType,
  mass,
  appliedForce,
  airDensity,
  parachuteArea,
  posRef,
  velRef,
  accRef,
  timeRef,
  setIsPlaying,
  onRecordTrail
}) {
  const lastTrailTime = useRef(0);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    // Cap delta to prevent crazy glitches on browser tab freeze
    const dt = Math.min(delta, 0.03);
    timeRef.current += dt;

    if (activeTab === 'friction') {
      const g = 9.8; // Standard school value
      
      // Friction coefficients setup
      let mu_s = 0.4;
      let mu_k = 0.3;
      if (surfaceType === 'ice') { mu_s = 0.1; mu_k = 0.03; }
      else if (surfaceType === 'wood') { mu_s = 0.4; mu_k = 0.3; }
      else if (surfaceType === 'concrete') { mu_s = 0.7; mu_k = 0.5; }
      else if (surfaceType === 'sand') { mu_s = 0.9; mu_k = 0.8; }

      const normalForce = mass * g;
      const staticFrictionMax = mu_s * normalForce;
      const currentVel = velRef.current;
      
      let netForce = 0;

      if (Math.abs(currentVel) < 0.005) {
        // stationary
        if (Math.abs(appliedForce) > staticFrictionMax) {
          // overcome inertia
          const fFric = Math.sign(appliedForce) * mu_k * normalForce;
          netForce = appliedForce - fFric;
        } else {
          netForce = 0;
          velRef.current = 0;
        }
      } else {
        // moving
        const fFric = Math.sign(currentVel) * mu_k * normalForce;
        netForce = appliedForce - fFric;

        // stop the block if deceleration flips direction and there's not enough force to slide back
        const nextVel = currentVel + (netForce / mass) * dt;
        if (Math.sign(nextVel) !== Math.sign(currentVel) && Math.abs(appliedForce) <= Math.abs(fFric)) {
          netForce = 0;
          velRef.current = 0;
        }
      }

      const acc = netForce / mass;
      accRef.current = acc;
      velRef.current += acc * dt;
      posRef.current += velRef.current * dt;

      // Track trail
      if (timeRef.current - lastTrailTime.current > 0.08) {
        onRecordTrail(posRef.current);
        lastTrailTime.current = timeRef.current;
      }

      // Bound track length
      if (posRef.current > 35) {
        posRef.current = -15;
      } else if (posRef.current < -20) {
        posRef.current = 20;
      }

    } else {
      // Drag Lab
      const g = 9.8;
      const Cd = 1.5; // Drag Coefficient
      const gravityForce = mass * g;
      const currentSpeed = velRef.current; // Downward speed (positive downwards)

      const dragForce = 0.5 * airDensity * (currentSpeed * currentSpeed) * Cd * parachuteArea;
      
      let netForce = gravityForce - dragForce;
      const acc = netForce / mass; // Downward acceleration

      accRef.current = acc;
      velRef.current += acc * dt;
      if (velRef.current < 0) velRef.current = 0; // cannot fall upwards from drag

      posRef.current -= velRef.current * dt; // Decreasing altitude y

      // Check ground collision
      if (posRef.current <= 0.5) {
        posRef.current = 0.5;
        accRef.current = 0;
        setIsPlaying(false);
      }
    }
  });

  return null;
}

// --- MAIN DUAL LAB SIMULATOR ---
export default function FrictionDragSimulator({ selectedPart, onSelectPart, hoveredPart, onHoverPart }) {
  const [activeTab, setActiveTab] = useState('friction'); // 'friction', 'drag'
  const [isPlaying, setIsPlaying] = useState(false);

  // --- FRICTION CONTROLS ---
  const [massFriction, setMassFriction] = useState(8); // kg
  const [appliedForce, setAppliedForce] = useState(30); // N
  const [surfaceType, setSurfaceType] = useState('wood'); // 'ice', 'wood', 'concrete', 'sand'
  const [trail, setTrail] = useState([]);

  // --- DRAG CONTROLS ---
  const [massDrag, setMassDrag] = useState(80); // kg
  const [airDensity, setAirDensity] = useState(1.2); // kg/m^3
  const [parachuteArea, setParachuteArea] = useState(10); // m^2

  // --- LIVE INTERACTIVE VALUES ---
  const [time, setTime] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(50); // falling height start
  const [velocity, setVelocity] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  const [history, setHistory] = useState([]);
  const [impactMessage, setImpactMessage] = useState(null);

  // High freq references
  const posRef = useRef(0);
  const velRef = useRef(0);
  const accRef = useRef(0);
  const timeRef = useRef(0);

  // Constants
  const g = 9.8;
  const Cd = 1.5;

  // Sync / Reset on Tab Change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsPlaying(false);
    setImpactMessage(null);
    setTrail([]);

    timeRef.current = 0;
    velRef.current = 0;
    accRef.current = 0;

    if (tab === 'friction') {
      posRef.current = 0;
      setPosX(0);
      setPosY(0);
      setVelocity(0);
      setAcceleration(0);
      setTime(0);
      setHistory([{ time: 0, force: appliedForce, acceleration: 0, velocity: 0 }]);
    } else {
      posRef.current = 50;
      setPosX(0);
      setPosY(50);
      setVelocity(0);
      setAcceleration(9.8);
      setTime(0);
      setHistory([{ time: 0, force: massDrag * 9.8, acceleration: 9.8, velocity: 0 }]);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setImpactMessage(null);
    timeRef.current = 0;
    velRef.current = 0;
    accRef.current = 0;
    setTrail([]);

    if (activeTab === 'friction') {
      posRef.current = 0;
      setPosX(0);
      setVelocity(0);
      setAcceleration(0);
      setTime(0);
      
      let mu_s = 0.4;
      if (surfaceType === 'ice') mu_s = 0.1;
      else if (surfaceType === 'concrete') mu_s = 0.7;
      else if (surfaceType === 'sand') mu_s = 0.9;
      
      const FsMax = mu_s * massFriction * g;
      const initialAcc = Math.abs(appliedForce) > FsMax 
        ? (appliedForce - Math.sign(appliedForce) * (surfaceType === 'ice' ? 0.03 : surfaceType === 'concrete' ? 0.5 : surfaceType === 'sand' ? 0.8 : 0.3) * massFriction * g) / massFriction 
        : 0;

      setHistory([{ time: 0, force: appliedForce, acceleration: initialAcc, velocity: 0 }]);
    } else {
      posRef.current = 50;
      setPosY(50);
      setVelocity(0);
      setAcceleration(9.8);
      setTime(0);
      setHistory([{ time: 0, force: massDrag * 9.8, acceleration: 9.8, velocity: 0 }]);
    }
  };

  // Record motion trail points safely
  const handleRecordTrail = (pos) => {
    setTrail(prev => [pos, ...prev].slice(0, 16));
  };

  // Main ticker interval at 20Hz (updates history/telemetry UI states)
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentSimTime = timeRef.current;
        const currentPos = posRef.current;
        const currentVel = velRef.current;
        const currentAcc = accRef.current;

        setTime(currentSimTime);
        setVelocity(currentVel);
        setAcceleration(currentAcc);

        if (activeTab === 'friction') {
          setPosX(currentPos);
          // Friction force magnitude
          let mu_k = 0.3;
          if (surfaceType === 'ice') mu_k = 0.03;
          else if (surfaceType === 'concrete') mu_k = 0.5;
          else if (surfaceType === 'sand') mu_k = 0.8;
          
          let curFric = Math.abs(currentVel) > 0.005 
            ? mu_k * massFriction * g 
            : Math.min(Math.abs(appliedForce), (surfaceType === 'ice' ? 0.1 : surfaceType === 'concrete' ? 0.7 : surfaceType === 'sand' ? 0.9 : 0.4) * massFriction * g);
          
          setHistory(prev => {
            if (prev.length > 0 && prev[prev.length - 1].time === currentSimTime) return prev;
            return [...prev, {
              time: currentSimTime,
              force: curFric,
              acceleration: currentAcc,
              velocity: currentVel
            }].slice(-80);
          });
        } else {
          setPosY(currentPos);
          // Drag force magnitude
          const curDrag = 0.5 * airDensity * (currentVel * currentVel) * Cd * parachuteArea;
          
          setHistory(prev => {
            if (prev.length > 0 && prev[prev.length - 1].time === currentSimTime) return prev;
            return [...prev, {
              time: currentSimTime,
              force: curDrag,
              acceleration: currentAcc,
              velocity: currentVel
            }].slice(-80);
          });

          // Check if landed
          if (currentPos <= 0.51) {
            clearInterval(interval);
            const landingSpeed = currentVel;
            if (landingSpeed < 6.0) {
              setImpactMessage({
                type: 'success',
                text: `Safe Landing! speed at impact: ${landingSpeed.toFixed(2)} m/s (Perfect parachute config)`
              });
            } else {
              setImpactMessage({
                type: 'fail',
                text: `Hard Impact landing! Speed: ${landingSpeed.toFixed(2)} m/s (Danger, increase Parachute Size or Air Density!)`
              });
            }
          }
        }
      }, 50);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTab, appliedForce, massFriction, surfaceType, massDrag, airDensity, parachuteArea]);

  // Live Math calculations
  const getFrictionCoeffs = () => {
    switch (surfaceType) {
      case 'ice': return { s: 0.10, k: 0.03 };
      case 'wood': return { s: 0.40, k: 0.30 };
      case 'concrete': return { s: 0.70, k: 0.50 };
      case 'sand': return { s: 0.90, k: 0.80 };
      default: return { s: 0.40, k: 0.30 };
    }
  };

  const frictionCoeffs = getFrictionCoeffs();
  const normalForce = massFriction * g;
  const staticFrictionLimit = frictionCoeffs.s * normalForce;
  const kineticFrictionValue = frictionCoeffs.k * normalForce;

  const currentFrictionForce = Math.abs(velocity) > 0.005 
    ? kineticFrictionValue 
    : Math.min(Math.abs(appliedForce), staticFrictionLimit);

  // Drag Math
  const gravityForceDrag = massDrag * g;
  const terminalVelocityVal = Math.sqrt((2 * massDrag * g) / (airDensity * Cd * parachuteArea));
  const currentDragForce = 0.5 * airDensity * (velocity * velocity) * Cd * parachuteArea;

  const getFormulaLabel = () => {
    if (activeTab === 'friction') {
      if (Math.abs(velocity) < 0.005 && Math.abs(appliedForce) <= staticFrictionLimit) {
        return `At Rest: Applied Force (${appliedForce}N) <= Static Limit (${staticFrictionLimit.toFixed(1)}N)`;
      }
      const frictionDir = Math.sign(velocity || appliedForce || 1);
      const netForceVal = appliedForce - frictionDir * kineticFrictionValue;
      return `a = (F_app - F_k) / m = (${appliedForce}N - ${kineticFrictionValue.toFixed(1)}N) / ${massFriction}kg = ${acceleration.toFixed(2)} m/s²`;
    }
    return `a = (F_gravity - F_drag) / m = (${gravityForceDrag.toFixed(1)}N - ${currentDragForce.toFixed(1)}N) / ${massDrag}kg = ${acceleration.toFixed(2)} m/s²`;
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Tabs selector */}
      <div className="flex items-center p-1 rounded-2xl bg-[#050914]/60 border border-white/5 backdrop-blur-xl">
        <button
          onClick={() => handleTabChange('friction')}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 ${
            activeTab === 'friction'
              ? 'bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-cyan/35 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wide">Friction Lab</span>
          <span className="text-[9px] text-gray-500 font-medium">Sliding Block Surface Analysis</span>
        </button>

        <button
          onClick={() => handleTabChange('drag')}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 ${
            activeTab === 'drag'
              ? 'bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-cyan/35 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wide">Drag Force Lab</span>
          <span className="text-[9px] text-gray-500 font-medium">Parachutist Terminal Velocity</span>
        </button>
      </div>

      {/* R3F Canvas Container */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02050f] overflow-hidden h-[300px] shadow-xl">
        <Canvas camera={{ position: activeTab === 'friction' ? [0, 2, 7] : [4.5, 25, 4.5], fov: 45 }}>
          <SimulatorEnvironment activeTab={activeTab} surfaceType={surfaceType} />

          {/* Friction Lab - Block */}
          {activeTab === 'friction' && (
            <group position={[posX, 0.4, 0]}>
              {/* Sliding block */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial 
                  color={selectedPart === 'sliding-block' ? '#eab308' : '#3b82f6'} 
                  roughness={0.4}
                  metalness={0.2}
                />
              </mesh>
              {/* Box Edges */}
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(0.81, 0.81, 0.81)]} />
                <lineBasicMaterial color="#ffffff" opacity={0.3} transparent />
              </lineSegments>
            </group>
          )}

          {/* Friction Lab - Motion Trail */}
          {activeTab === 'friction' && <MotionTrail positions={trail} />}

          {/* Drag Lab - Parachutist */}
          {activeTab === 'drag' && (
            <group position={[0, posY, 0]}>
              <ParachutistModel parachuteArea={parachuteArea} />
            </group>
          )}

          {/* Vector Arrows - Friction Lab */}
          {activeTab === 'friction' && (
            <group>
              {/* Applied Force Arrow */}
              <ForceArrow 
                position={[posX, 0, 0]}
                length={Math.abs(appliedForce) * 0.05}
                direction={appliedForce >= 0 ? 1 : -1}
                color="#06b6d4"
                label={`Applied Force: ${appliedForce} N`}
                isVisible={Math.abs(appliedForce) > 0.01}
                offset={[0, 0.9, 0]}
              />

              {/* Friction Force Arrow */}
              <ForceArrow 
                position={[posX, 0, 0]}
                length={currentFrictionForce * 0.05}
                direction={velocity >= 0.005 ? -1 : (appliedForce >= 0 ? -1 : 1)}
                color="#ec4899"
                label={`Friction Force: ${currentFrictionForce.toFixed(1)} N`}
                isVisible={currentFrictionForce > 0.05}
                offset={[0, 0.9, 0.3]}
              />
            </group>
          )}

          {/* Vector Arrows - Drag Lab */}
          {activeTab === 'drag' && (
            <group>
              {/* Gravity Arrow (Downward) */}
              <VerticalForceArrow 
                position={[0, posY, 0]}
                length={gravityForceDrag * 0.0035}
                direction={-1}
                color="#06b6d4"
                label={`Gravity Force (Fg) = -${gravityForceDrag.toFixed(0)} N`}
                isVisible={true}
                offsetX={-0.6}
              />

              {/* Drag Arrow (Upward) */}
              <VerticalForceArrow 
                position={[0, posY, 0]}
                length={currentDragForce * 0.0035}
                direction={1}
                color="#ec4899"
                label={`Drag Force (Fd) = +${currentDragForce.toFixed(0)} N`}
                isVisible={currentDragForce > 1}
                offsetX={0.6}
                offsetY={0.8}
              />
            </group>
          )}

          {/* Formula Float Overlay */}
          <Html position={[0, activeTab === 'friction' ? 2.3 : posY + 2.8, 0]} center distanceFactor={8}>
            <div className="glass-panel px-3 py-1.5 rounded-xl border-white/10 bg-[#050914]/90 text-[8px] font-mono font-extrabold text-brand-cyan shadow-2xl whitespace-nowrap">
              {getFormulaLabel()}
            </div>
          </Html>

          {/* Camera Follow Controller */}
          <CameraController activeTab={activeTab} posX={posX} posY={posY} />

          <OrbitControls 
            target={activeTab === 'friction' ? [posX, 0.4, 0] : [0, posY, 0]}
            enableZoom={true}
            enablePan={false}
            maxDistance={25}
            minDistance={4}
          />
        </Canvas>

        {/* Canvas Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/80 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            {activeTab === 'friction' ? 'Friction Coefficient Lab' : 'Fluid Drag Terminal Lab'}
          </div>
        </div>

        {/* Help Tooltip */}
        <div className="absolute top-3 right-3 z-10">
          <div className="group relative">
            <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#050914]/80 text-gray-400 hover:text-white backdrop-blur-md transition-colors shadow">
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
            <div className="absolute right-0 top-7 w-48 scale-0 group-hover:scale-100 transition-all origin-top-right rounded-lg bg-slate-950/95 border border-slate-800 p-2.5 text-[9px] text-gray-300 leading-normal z-20 shadow-xl">
              {activeTab === 'friction' 
                ? "Select a surface material to change coefficients. Adjust sliders to overcome static friction." 
                : "Tweak Mass, Air Density, and Parachute Size. Try to achieve a landing speed under 6 m/s!"}
            </div>
          </div>
        </div>

        {/* Impact Message Overlay */}
        {impactMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 p-4">
            <div className={`glass-panel p-4 rounded-2xl border text-center space-y-3 max-w-sm ${
              impactMessage.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-red-500/20 bg-red-500/10'
            }`}>
              <div className={`inline-flex p-2 rounded-full ${impactMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {activeTab === 'drag' && <Wind className="h-5 w-5" />}
              </div>
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Descent Status</h4>
              <p className="text-[10px] text-gray-300 leading-relaxed font-semibold">{impactMessage.text}</p>
              <button 
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 text-[9px] font-bold text-white transition-colors"
              >
                Reset and Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control sliders & Live Telemetry Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* CONTROL SLIDERS PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Compass className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Simulation Parameters
            </h3>
          </div>

          <div className="space-y-3.5 flex-1 mb-4">
            {activeTab === 'friction' ? (
              <>
                {/* Surface Material Selection */}
                <div className="space-y-1.5">
                  <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wide">Surface Material</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['ice', 'wood', 'concrete', 'sand'].map(surf => (
                      <button
                        key={surf}
                        onClick={() => { setSurfaceType(surf); handleReset(); }}
                        className={`py-1.5 rounded-lg border text-[9px] font-extrabold uppercase transition-all duration-200 ${
                          surfaceType === surf 
                            ? 'bg-brand-cyan/20 border-brand-cyan/45 text-white shadow' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {surf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mass Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Block Mass (m)</span>
                    <span className="text-brand-purple font-mono">{massFriction} kg</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={massFriction}
                    onChange={(e) => setMassFriction(parseInt(e.target.value))}
                    className="w-full accent-brand-purple bg-slate-950/60 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>

                {/* Applied Force Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Applied Force (F_app)</span>
                    <span className="text-brand-cyan font-mono">{appliedForce} N</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="2"
                    value={appliedForce}
                    onChange={(e) => setAppliedForce(parseInt(e.target.value))}
                    className="w-full accent-brand-cyan bg-slate-950/60 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>

                {/* Coefficients list display */}
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-mono text-gray-400">
                  <div>Static friction (μ_s): <span className="text-brand-cyan font-bold">{frictionCoeffs.s}</span></div>
                  <div>Kinetic friction (μ_k): <span className="text-brand-pink font-bold">{frictionCoeffs.k}</span></div>
                  <div>Max Static resistance: <span className="text-white font-bold">{staticFrictionLimit.toFixed(1)} N</span></div>
                  <div>Normal Force (F_N): <span className="text-white font-bold">{normalForce.toFixed(1)} N</span></div>
                </div>
              </>
            ) : (
              <>
                {/* Mass Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Parachutist Mass (m)</span>
                    <span className="text-brand-purple font-mono">{massDrag} kg</span>
                  </div>
                  <input 
                    type="range"
                    min="50"
                    max="120"
                    step="5"
                    value={massDrag}
                    onChange={(e) => setMassDrag(parseInt(e.target.value))}
                    className="w-full accent-brand-purple bg-slate-950/60 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>

                {/* Air Density Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Air Density (ρ)</span>
                    <span className="text-brand-cyan font-mono">{airDensity.toFixed(2)} kg/m³</span>
                  </div>
                  <input 
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.05"
                    value={airDensity}
                    onChange={(e) => setAirDensity(parseFloat(e.target.value))}
                    className="w-full accent-brand-cyan bg-slate-950/60 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>

                {/* Parachute Size Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Parachute Canopy Area (A)</span>
                    <span className="text-brand-pink font-mono">{parachuteArea} m²</span>
                  </div>
                  <input 
                    type="range"
                    min="2"
                    max="25"
                    step="1"
                    value={parachuteArea}
                    onChange={(e) => setParachuteArea(parseInt(e.target.value))}
                    className="w-full accent-brand-pink bg-slate-950/60 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>

                {/* Drag info details */}
                <div className="p-2 rounded-xl bg-sky-500/5 border border-sky-500/10 text-[9px] font-mono text-gray-400 leading-normal">
                  <div className="flex justify-between">
                    <span>Terminal Velocity (v_t):</span>
                    <span className="text-brand-cyan font-bold">{terminalVelocityVal.toFixed(1)} m/s ({(terminalVelocityVal * 3.6).toFixed(0)} km/h)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight Gravity Force (Fg):</span>
                    <span className="text-white font-bold">{gravityForceDrag.toFixed(1)} N</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Simulation controls buttons */}
          <div className="flex items-center gap-2 mt-auto pt-2">
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
                  <Play className="h-3.5 w-3.5" /> Run Simulation
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white transition-all"
              title="Reset simulation"
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
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">
                {activeTab === 'friction' ? 'Friction Force' : 'Air Drag Force'}
              </span>
              <span className="text-sm font-mono font-bold text-brand-pink">
                {activeTab === 'friction' ? `${currentFrictionForce.toFixed(1)} N` : `${currentDragForce.toFixed(1)} N`}
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">
                {activeTab === 'friction' ? 'Normal Force' : 'Gravity Weight'}
              </span>
              <span className="text-sm font-mono font-bold text-brand-cyan">
                {activeTab === 'friction' ? `${normalForce.toFixed(1)} N` : `${gravityForceDrag.toFixed(1)} N`}
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">Acceleration</span>
              <span className="text-sm font-mono font-bold text-brand-purple">
                {acceleration.toFixed(2)} m/s²
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">
                {activeTab === 'friction' ? 'Sliding Velocity' : 'Descent Speed'}
              </span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {velocity.toFixed(2)} m/s
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5 col-span-2">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">
                {activeTab === 'friction' ? 'Position (x)' : 'Altitude (y)'}
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {activeTab === 'friction' ? `${posX.toFixed(1)} m` : `${posY.toFixed(1)} m`}
              </span>
            </div>
          </div>

          <div className="text-[9px] text-gray-500 font-mono text-right">
            Elapsed Time: {time.toFixed(2)} s
          </div>
        </div>
      </div>

      {/* SVG Real-time Telemetry Charts */}
      <div className="flex flex-wrap gap-4 w-full">
        <KinematicGraph 
          data={history} 
          valKey="force" 
          label={activeTab === 'friction' ? 'Friction Resistance Force' : 'Air Drag Resistance Force'} 
          color="#ec4899" 
          unit="N" 
        />
        <KinematicGraph 
          data={history} 
          valKey="acceleration" 
          label="Net Acceleration" 
          color="#a855f7" 
          unit="m/s²" 
        />
        <KinematicGraph 
          data={history} 
          valKey="velocity" 
          label={activeTab === 'friction' ? 'Horizontal Velocity' : 'Falling Speed'} 
          color="#10b981" 
          unit="m/s" 
        />
      </div>

      <Canvas style={{ display: 'none' }}>
        {/* Invisible simulation runner mounted in tree to drive state updates */}
        <SimulatorPhysicsLoop 
          activeTab={activeTab}
          isPlaying={isPlaying}
          surfaceType={surfaceType}
          mass={activeTab === 'friction' ? massFriction : massDrag}
          appliedForce={appliedForce}
          airDensity={airDensity}
          parachuteArea={parachuteArea}
          posRef={posRef}
          velRef={velRef}
          accRef={accRef}
          timeRef={timeRef}
          setIsPlaying={setIsPlaying}
          onRecordTrail={handleRecordTrail}
        />
      </Canvas>
    </div>
  );
}
