import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  Gauge, 
  Compass, 
  Clock, 
  MapPin, 
  Eye, 
  HelpCircle 
} from 'lucide-react';

// --- 3D SCENE SUB-COMPONENTS ---

// Procedural 3D Sports Car Component
function SportsCar({ activePart, carPos, velocity }) {
  const wheelsRef = useRef([]);
  const carGroupRef = useRef();
  
  // Rotate wheels based on velocity in frame loop
  useFrame((state, delta) => {
    if (wheelsRef.current.length === 4 && velocity > 0) {
      // Rotate wheels: wheel rotation speed = linear velocity / wheel radius
      const radius = 0.3;
      const rotationAmount = (velocity * delta) / radius;
      wheelsRef.current.forEach(wheel => {
        if (wheel) {
          wheel.rotation.z -= rotationAmount;
        }
      });
    }
  });

  const isSelected = activePart === 'Sports Car';

  return (
    <group ref={carGroupRef} position={[carPos, 0, 0]}>
      {/* 3D Highlight Ring under the car if selected */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.8} side={2} />
        </mesh>
      )}

      {/* Car Body Group */}
      <group position={[0, 0.3, 0]}>
        {/* Lower Chassis */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.3, 1.2]} />
          <meshStandardMaterial 
            color={isSelected ? "#22d3ee" : "#3b82f6"} 
            metalness={0.8} 
            roughness={0.2} 
          />
        </mesh>

        {/* Front Wedge / Hood */}
        <mesh castShadow position={[0.9, -0.05, 0]}>
          <boxGeometry args={[0.7, 0.2, 1.18]} />
          <meshStandardMaterial 
            color={isSelected ? "#22d3ee" : "#1d4ed8"} 
            metalness={0.8} 
            roughness={0.2} 
          />
        </mesh>

        {/* Upper Cabin (Windshield & Glass roof) */}
        <mesh castShadow position={[-0.2, 0.3, 0]}>
          <boxGeometry args={[1.2, 0.38, 1.0]} />
          <meshStandardMaterial 
            color="#0f172a" 
            metalness={0.9} 
            roughness={0.1} 
            transparent 
            opacity={0.7} 
          />
        </mesh>

        {/* Spoiler Support */}
        <mesh castShadow position={[-1.0, 0.2, 0]}>
          <boxGeometry args={[0.1, 0.2, 0.8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        
        {/* Spoiler Wing */}
        <mesh castShadow position={[-1.1, 0.3, 0]} rotation={[0.05, 0, 0]}>
          <boxGeometry args={[0.2, 0.05, 1.2]} />
          <meshStandardMaterial color="#111827" metalness={0.7} />
        </mesh>

        {/* Headlights */}
        <mesh position={[1.25, -0.05, 0.4]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[1.25, -0.05, -0.4]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.5} />
        </mesh>

        {/* Taillights */}
        <mesh position={[-1.25, -0.05, 0.4]}>
          <boxGeometry args={[0.02, 0.08, 0.2]} />
          <meshStandardMaterial color="#fca5a5" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-1.25, -0.05, -0.4]}>
          <boxGeometry args={[0.02, 0.08, 0.2]} />
          <meshStandardMaterial color="#fca5a5" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Wheels */}
      {/* Front Left */}
      <mesh 
        ref={el => wheelsRef.current[0] = el}
        position={[0.7, 0.2, 0.62]} 
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.3, 0.3, 0.24, 24]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {/* Front Right */}
      <mesh 
        ref={el => wheelsRef.current[1] = el}
        position={[0.7, 0.2, -0.62]} 
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.3, 0.3, 0.24, 24]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {/* Rear Left */}
      <mesh 
        ref={el => wheelsRef.current[2] = el}
        position={[-0.7, 0.2, 0.62]} 
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.3, 0.3, 0.24, 24]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {/* Rear Right */}
      <mesh 
        ref={el => wheelsRef.current[3] = el}
        position={[-0.7, 0.2, -0.62]} 
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.3, 0.3, 0.24, 24]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
    </group>
  );
}

// 3D Vector Arrow Component
function VectorArrow({ position, length, direction = 1, color, label, isVisible, isActive }) {
  if (!isVisible || length < 0.1) return null;

  const arrowLength = Math.min(6, length); // Cap visual length so it doesn't leave the screen
  const shaftRadius = isActive ? 0.08 : 0.05;
  const coneRadius = isActive ? 0.18 : 0.12;

  return (
    <group 
      position={[position, 0.8, 0]} 
      rotation={[0, 0, direction === 1 ? -Math.PI / 2 : Math.PI / 2]}
    >
      {/* Arrow Shaft */}
      <mesh castShadow position={[0, arrowLength / 2, 0]}>
        <cylinderGeometry args={[shaftRadius, shaftRadius, arrowLength, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 0.8 : 0.2} />
      </mesh>
      
      {/* Arrow Head (Cone) */}
      <mesh castShadow position={[0, arrowLength + 0.15, 0]}>
        <coneGeometry args={[coneRadius, 0.3, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 0.8 : 0.2} />
      </mesh>

      {/* Floating HTML Label */}
      <Html 
        position={[0, arrowLength / 2, direction === 1 ? 0.4 : -0.4]} 
        center 
        distanceFactor={12}
      >
        <div 
          className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white border select-none whitespace-nowrap shadow-lg backdrop-blur-sm transition-all duration-300 ${
            isActive 
              ? 'bg-slate-900 border-brand-cyan scale-110' 
              : 'bg-slate-950/80 border-slate-700'
          }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

// Road & Ground Grid Component
function Environment({ maxDistance }) {
  const markerIntervals = 50; // Place markers every 50 meters
  const totalMarkers = Math.ceil(2200 / markerIntervals); // Cover up to 2200 meters

  // Generate markers array
  const markers = useMemo(() => {
    const list = [];
    for (let i = 0; i <= totalMarkers; i++) {
      list.push(i * markerIntervals);
    }
    return list;
  }, [totalMarkers]);

  return (
    <group>
      {/* Ground Grid */}
      <gridHelper args={[6000, 300, '#1e293b', '#0b132b']} position={[1100, -0.01, 0]} />

      {/* Infinite-looking Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1100, 0, 0]} receiveShadow>
        <planeGeometry args={[3000, 6]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.9} />
      </mesh>

      {/* Road Shoulder Lines (White borders) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1100, 0.005, 2.9]}>
        <planeGeometry args={[3000, 0.08]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1100, 0.005, -2.9]}>
        <planeGeometry args={[3000, 0.08]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>

      {/* Road Center Dashed Line */}
      {Array.from({ length: 150 }).map((_, idx) => (
        <mesh 
          key={idx} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[idx * 20 - 100, 0.005, 0]}
        >
          <planeGeometry args={[8, 0.08]} />
          <meshStandardMaterial color="#fef08a" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Distance Markers Posts */}
      {markers.map((distance) => (
        <group key={distance} position={[distance, 0, -3.4]}>
          {/* Post */}
          <mesh castShadow position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.6} />
          </mesh>
          
          {/* Signboard */}
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[0.6, 0.3, 0.04]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>

          {/* Marker Label */}
          <Html position={[0, 1.1, 0.03]} center distanceFactor={18}>
            <div className="bg-slate-950/90 border border-slate-700 px-1 py-0.5 rounded text-[8px] font-extrabold text-brand-cyan whitespace-nowrap tracking-wide">
              {distance} m
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

// Camera tracking component
function CameraFollow({ carPos, prevCarX }) {
  useFrame((state) => {
    // Shift camera position along X by the difference in car position
    const carDeltaX = carPos - prevCarX.current;
    state.camera.position.x += carDeltaX;
    prevCarX.current = carPos;
  });
  return null;
}

// Motion Trail Component
function MotionTrail({ history, activePart }) {
  const isSelected = activePart === 'Motion Trail';
  // Sample history: render a dot every 5th entry to avoid clogging 3D canvas
  const trailPoints = useMemo(() => {
    return history.filter((_, idx) => idx % 4 === 0);
  }, [history]);

  return (
    <group>
      {trailPoints.map((pt, idx) => {
        const opacity = 0.15 + 0.45 * (idx / trailPoints.length);
        return (
          <mesh 
            key={idx} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[pt.position, 0.02, 0]}
          >
            <ringGeometry args={[0.15, 0.22, 16]} />
            <meshBasicMaterial 
              color="#06b6d4" 
              transparent 
              opacity={isSelected ? opacity * 2 : opacity} 
              side={2}
            />
          </mesh>
        );
      })}
    </group>
  );
}


// --- DYNAMIC SVG GRAPH COMPONENT ---
function KinematicGraphs({ history, currentTime }) {
  const width = 280;
  const height = 90;
  const padding = 15;

  const pointsCount = history.length;
  
  // 1. Position vs Time Path
  const positionPath = useMemo(() => {
    if (pointsCount === 0) return '';
    const maxPos = Math.max(...history.map(h => h.position), 10);
    return history.map((pt) => {
      const x = padding + (pt.time / 20) * (width - 2 * padding);
      const y = height - padding - (pt.position / maxPos) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' L ');
  }, [history, pointsCount]);

  // 2. Velocity vs Time Path
  const velocityPath = useMemo(() => {
    if (pointsCount === 0) return '';
    return history.map((pt) => {
      const x = padding + (pt.time / 20) * (width - 2 * padding);
      const y = height - padding - (pt.velocity / 100) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' L ');
  }, [history, pointsCount]);

  // 3. Acceleration vs Time Path
  const accelerationPath = useMemo(() => {
    if (pointsCount === 0) return '';
    return history.map((pt) => {
      const x = padding + (pt.time / 20) * (width - 2 * padding);
      // Map -20 to +20 m/s^2 onto the Y height (mid-point is 0 acceleration)
      const normAcc = (pt.acceleration + 20) / 40; // 0 to 1
      const xVal = x;
      const yVal = height - padding - normAcc * (height - 2 * padding);
      return `${xVal},${yVal}`;
    }).join(' L ');
  }, [history, pointsCount]);

  // Current time line coordinate
  const timeLineX = padding + (currentTime / 20) * (width - 2 * padding);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full bg-[#050914]/60 border border-white/5 p-4 rounded-2xl backdrop-blur-xl">
      
      {/* Position Graph */}
      <div className="glass-panel p-2.5 rounded-xl border-white/5 bg-[#090d1a]/55 flex flex-col gap-1.5 relative overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-gray-200">Position vs Time (x - t)</span>
          <span className="text-[9px] text-brand-cyan font-mono font-bold">x = f(t)</span>
        </div>
        <div className="w-full h-[90px] relative">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            {/* Grid Lines */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
            <line x1={width - padding} y1={padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />

            {/* Plot path */}
            {positionPath && (
              <path 
                d={`M ${positionPath}`} 
                fill="none" 
                stroke="#06b6d4" 
                strokeWidth="2" 
                className="drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]" 
              />
            )}

            {/* Time Indicator Line */}
            <line x1={timeLineX} y1={padding} x2={timeLineX} y2={height - padding} stroke="rgba(6,182,212,0.4)" strokeDasharray="2,2" />
          </svg>
        </div>
      </div>

      {/* Velocity Graph */}
      <div className="glass-panel p-2.5 rounded-xl border-white/5 bg-[#090d1a]/55 flex flex-col gap-1.5 relative overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-gray-200">Velocity vs Time (v - t)</span>
          <span className="text-[9px] text-brand-purple font-mono font-bold">v = dx/dt</span>
        </div>
        <div className="w-full h-[90px] relative">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            {/* Grid Lines */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
            <line x1={width - padding} y1={padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />

            {/* Plot path */}
            {velocityPath && (
              <path 
                d={`M ${velocityPath}`} 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="2" 
                className="drop-shadow-[0_0_4px_rgba(139,92,246,0.5)]" 
              />
            )}

            {/* Time Indicator Line */}
            <line x1={timeLineX} y1={padding} x2={timeLineX} y2={height - padding} stroke="rgba(139,92,246,0.4)" strokeDasharray="2,2" />
          </svg>
        </div>
      </div>

      {/* Acceleration Graph */}
      <div className="glass-panel p-2.5 rounded-xl border-white/5 bg-[#090d1a]/55 flex flex-col gap-1.5 relative overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-gray-200">Acceleration vs Time (a - t)</span>
          <span className="text-[9px] text-brand-pink font-mono font-bold">a = dv/dt</span>
        </div>
        <div className="w-full h-[90px] relative">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            {/* Grid Lines */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
            <line x1={width - padding} y1={padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.07)" strokeDasharray="2,2" title="Zero Acceleration line" />

            {/* Plot path */}
            {accelerationPath && (
              <path 
                d={`M ${accelerationPath}`} 
                fill="none" 
                stroke="#ec4899" 
                strokeWidth="2" 
                className="drop-shadow-[0_0_4px_rgba(236,72,153,0.5)]" 
              />
            )}

            {/* Time Indicator Line */}
            <line x1={timeLineX} y1={padding} x2={timeLineX} y2={height - padding} stroke="rgba(236,72,153,0.4)" strokeDasharray="2,2" />
          </svg>
        </div>
      </div>

    </div>
  );
}


// --- MAIN PHYSICS MOTION SIMULATOR COMPONENT ---
export default function PhysicsMotionSimulator({ selectedPart, onSelectPart, hoveredPart, onHoverPart }) {
  // Simulator State
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(20); // starts at 20 m/s
  const [acceleration, setAcceleration] = useState(2); // starts at 2 m/s^2
  const [initialVelocitySetting, setInitialVelocitySetting] = useState(20);
  const [accelerationSetting, setAccelerationSetting] = useState(2);
  const [distanceTravelled, setDistanceTravelled] = useState(0);
  const [history, setHistory] = useState([{ time: 0, position: 0, velocity: 20, acceleration: 2 }]);

  // High frequency update variables (via Refs to keep 60fps buttery-smooth)
  const carPosRef = useRef(0);
  const carVelRef = useRef(20);
  const carAccRef = useRef(2);
  const simTimeRef = useRef(0);
  const distTravelledRef = useRef(0);
  const prevCarX = useRef(0);

  // Sync Slider values immediately with refs
  useEffect(() => {
    if (!isPlaying) {
      if (time === 0) {
        carVelRef.current = initialVelocitySetting;
        setVelocity(initialVelocitySetting);
      }
    }
  }, [initialVelocitySetting, isPlaying, time]);

  useEffect(() => {
    carAccRef.current = accelerationSetting;
    setAcceleration(accelerationSetting);
  }, [accelerationSetting]);

  // Main game loop sync interval (run at ~20Hz to update graphs & telemetries)
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentSimTime = simTimeRef.current;
        const currentCarPos = carPosRef.current;
        const currentCarVel = carVelRef.current;
        const currentCarAcc = carAccRef.current;
        const currentDist = distTravelledRef.current;

        // Update React states
        setTime(currentSimTime);
        setPosition(currentCarPos);
        setVelocity(currentCarVel);
        setDistanceTravelled(currentDist);

        // Append to history
        setHistory(prev => {
          // Prevent duplicating matching times
          if (prev.length > 0 && prev[prev.length - 1].time === currentSimTime) return prev;
          
          const newHistory = [...prev, {
            time: currentSimTime,
            position: currentCarPos,
            velocity: currentCarVel,
            acceleration: currentCarAcc
          }];

          // Cap history array size if needed
          return newHistory;
        });
      }, 50); // 20 frames per second for graphs
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Play Pause
  const handlePlayPause = () => {
    if (time >= 20) {
      // If we finished the 20s run, reset first
      handleReset();
      setTimeout(() => setIsPlaying(true), 50);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Handle Reset
  const handleReset = () => {
    setIsPlaying(false);
    
    // Clear refs
    carPosRef.current = 0;
    carVelRef.current = initialVelocitySetting;
    carAccRef.current = accelerationSetting;
    simTimeRef.current = 0;
    distTravelledRef.current = 0;
    prevCarX.current = 0;

    // Reset states
    setTime(0);
    setPosition(0);
    setVelocity(initialVelocitySetting);
    setAcceleration(accelerationSetting);
    setDistanceTravelled(0);
    setHistory([{ 
      time: 0, 
      position: 0, 
      velocity: initialVelocitySetting, 
      acceleration: accelerationSetting 
    }]);
  };

  // Handle Time scrub
  const handleTimeScrub = (targetTime) => {
    if (isPlaying) return; // Only scrub when paused
    
    const target = parseFloat(targetTime);
    setTime(target);
    simTimeRef.current = target;

    // Recalculate analytical state if history doesn't exist
    // Check if we have an entry close in history
    const historyMatch = history.find(h => Math.abs(h.time - target) < 0.1);
    if (historyMatch) {
      setPosition(historyMatch.position);
      setVelocity(historyMatch.velocity);
      setAcceleration(historyMatch.acceleration);
      carPosRef.current = historyMatch.position;
      carVelRef.current = historyMatch.velocity;
      carAccRef.current = historyMatch.acceleration;
    } else {
      // Analytical calculation based on constant parameters:
      // x(t) = v0*t + 0.5*a*t^2
      // v(t) = v0 + a*t
      const t = target;
      const v0 = initialVelocitySetting;
      const a = accelerationSetting;
      
      let finalV = v0 + a * t;
      finalV = Math.max(0, Math.min(100, finalV));
      
      // If velocity hit zero, distance equation changes (deceleration stops at 0)
      let finalX = 0;
      if (a === 0) {
        finalX = v0 * t;
      } else {
        const timeToStop = -v0 / a;
        if (a < 0 && t > timeToStop && timeToStop > 0) {
          // Stopped before target time
          finalX = v0 * timeToStop + 0.5 * a * timeToStop * timeToStop;
          finalV = 0;
        } else {
          finalX = v0 * t + 0.5 * a * t * t;
        }
      }

      setPosition(finalX);
      setVelocity(finalV);
      carPosRef.current = finalX;
      carVelRef.current = finalV;
      distTravelledRef.current = Math.abs(finalX); // approximate
      setDistanceTravelled(Math.abs(finalX));
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 3D Canvas Box */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02050f] overflow-hidden h-[300px] shadow-xl">
        <Canvas 
          camera={{ position: [-6, 2, 4.5], fov: 45 }} 
          shadows
          className="h-full w-full"
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 15, 10]} intensity={1.5} castShadow />
          <directionalLight position={[-10, 20, 10]} intensity={1.0} castShadow />

          {/* Core physics engine runner */}
          <SimulationEngine
            isPlaying={isPlaying}
            carPosRef={carPosRef}
            carVelRef={carVelRef}
            carAccRef={carAccRef}
            simTimeRef={simTimeRef}
            distTravelledRef={distTravelledRef}
            setIsPlaying={setIsPlaying}
          />

          {/* Core scene components */}
          <Environment maxDistance={2200} />
          
          <SportsCar 
            activePart={selectedPart} 
            carPos={position} 
            velocity={velocity} 
          />

          <MotionTrail history={history} activePart={selectedPart} />

          {/* Velocity Vector Arrow */}
          <VectorArrow 
            position={position}
            length={velocity * 0.05} // Scale length visually
            direction={1}
            color="#06b6d4" // Cyan for velocity
            label={`v = ${velocity.toFixed(1)} m/s`}
            isVisible={velocity > 0}
            isActive={selectedPart === 'Velocity Arrow'}
          />

          {/* Acceleration Vector Arrow */}
          <VectorArrow 
            position={position}
            length={Math.abs(acceleration) * 0.25} // Scale length visually
            direction={acceleration >= 0 ? 1 : -1}
            color="#ec4899" // Pink/red for acceleration
            label={`a = ${acceleration.toFixed(1)} m/s²`}
            isVisible={Math.abs(acceleration) > 0.01}
            isActive={selectedPart === 'Acceleration Arrow'}
          />

          {/* Camera controller tracking the car */}
          <CameraFollow carPos={position} prevCarX={prevCarX} />

          <OrbitControls 
            target={[position, 0.4, 0]}
            enableZoom={true} 
            enablePan={false}
            maxDistance={15}
            minDistance={3}
            makeDefault
          />
        </Canvas>

        {/* 3D Scene Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/80 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            Virtual Physics Lab Canvas
          </div>
        </div>

        {/* Help tooltip */}
        <div className="absolute top-3 right-3 z-10">
          <div className="group relative">
            <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#050914]/80 text-gray-400 hover:text-white backdrop-blur-md transition-colors shadow">
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
            <div className="absolute right-0 top-7 w-48 scale-0 group-hover:scale-100 transition-all origin-top-right rounded-lg bg-slate-950/95 border border-slate-800 p-2.5 text-[9px] text-gray-300 leading-normal z-20 shadow-xl">
              Drag to orbit camera. Scroll to zoom. The camera tracks the car automatically. Highlights occur when checklist items are selected.
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Live Telemetry Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        
        {/* CONTROLS PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Compass className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Controls Panel
            </h3>
          </div>

          <div className="space-y-3 flex-1 mb-4">
            {/* Initial Velocity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400">Velocity Slider (v₀)</span>
                <span className="text-brand-cyan font-mono">{initialVelocitySetting} m/s</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                step="5"
                value={initialVelocitySetting}
                onChange={(e) => {
                  setInitialVelocitySetting(parseInt(e.target.value));
                  if (time === 0) setVelocity(parseInt(e.target.value));
                }}
                disabled={isPlaying || time > 0}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan disabled:opacity-40"
              />
              <span className="text-[8px] text-gray-600 block">Sets starting speed (v₀) at t = 0s. Locked once running.</span>
            </div>

            {/* Acceleration Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400">Acceleration Slider (a)</span>
                <span className={`font-mono ${accelerationSetting >= 0 ? 'text-emerald-400' : 'text-brand-pink'}`}>
                  {accelerationSetting > 0 ? '+' : ''}{accelerationSetting} m/s²
                </span>
              </div>
              <input 
                type="range"
                min="-20"
                max="20"
                step="1"
                value={accelerationSetting}
                onChange={(e) => setAccelerationSetting(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-purple"
              />
              <span className="text-[8px] text-gray-600 block">Adjusts rate of speed change dynamically. Can be modified on-the-fly!</span>
            </div>

            {/* Time Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400">Time Slider (t)</span>
                <span className="text-gray-200 font-mono">{time.toFixed(1)} / 20.0 s</span>
              </div>
              <input 
                type="range"
                min="0"
                max="20"
                step="0.1"
                value={time}
                onChange={(e) => handleTimeScrub(e.target.value)}
                disabled={isPlaying}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400 disabled:opacity-60"
              />
              <span className="text-[8px] text-gray-600 block">Drag to scrub through recorded timeline (available when paused).</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePlayPause}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                isPlaying 
                  ? 'bg-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-600/35'
                  : 'bg-gradient-to-r from-brand-purple to-brand-cyan hover:brightness-110'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" /> Play
                </>
              )}
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all"
              title="Reset Simulation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* LIVE DATA PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Gauge className="h-4 w-4 text-brand-purple" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Live Telemetry Panel
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1 items-center">
            {/* Position */}
            <div className="flex flex-col p-2 bg-[#090d1a]/55 border border-white/5 rounded-xl">
              <div className="flex items-center gap-1 text-[8.5px] font-bold text-gray-500 uppercase">
                <MapPin className="h-2.5 w-2.5 text-brand-cyan" /> Position
              </div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5 leading-none">
                {position.toFixed(1)} <span className="text-[10px] text-gray-400">m</span>
              </div>
            </div>

            {/* Velocity */}
            <div className="flex flex-col p-2 bg-[#090d1a]/55 border border-white/5 rounded-xl">
              <div className="flex items-center gap-1 text-[8.5px] font-bold text-gray-500 uppercase">
                <Gauge className="h-2.5 w-2.5 text-brand-cyan" /> Velocity
              </div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5 leading-none">
                {velocity.toFixed(1)} <span className="text-[10px] text-gray-400">m/s</span>
              </div>
            </div>

            {/* Acceleration */}
            <div className="flex flex-col p-2 bg-[#090d1a]/55 border border-white/5 rounded-xl">
              <div className="flex items-center gap-1 text-[8.5px] font-bold text-gray-500 uppercase">
                <TrendingUp className="h-2.5 w-2.5 text-brand-pink" /> Acceleration
              </div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5 leading-none">
                {acceleration.toFixed(1)} <span className="text-[10px] text-gray-400">m/s²</span>
              </div>
            </div>

            {/* Distance Travelled */}
            <div className="flex flex-col p-2 bg-[#090d1a]/55 border border-white/5 rounded-xl">
              <div className="flex items-center gap-1 text-[8.5px] font-bold text-gray-500 uppercase">
                <Eye className="h-2.5 w-2.5 text-brand-purple" /> Distance
              </div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5 leading-none">
                {distanceTravelled.toFixed(1)} <span className="text-[10px] text-gray-400">m</span>
              </div>
            </div>
          </div>

          {/* Time & Running Indicator */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400">Time Elapsed:</span>
              <span className="text-sm font-extrabold text-white font-mono">{time.toFixed(2)} s</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-[9px] font-extrabold uppercase text-gray-400 tracking-widest">
                {isPlaying ? 'Simulating' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Graph telemetry panel */}
      <KinematicGraphs history={history} currentTime={time} />
    </div>
  );
}

// A 3D component that performs the physics integration inside the Canvas useFrame loop
function SimulationEngine({ 
  isPlaying, 
  carPosRef, 
  carVelRef, 
  carAccRef, 
  simTimeRef, 
  distTravelledRef, 
  setIsPlaying 
}) {
  useFrame((state, delta) => {
    if (!isPlaying) return;

    // Cap delta to prevent huge jumps when tab is inactive or frame drops
    const dt = Math.min(0.05, delta);

    if (simTimeRef.current + dt >= 20) {
      const remainingDt = 20 - simTimeRef.current;
      simTimeRef.current = 20;

      carVelRef.current += carAccRef.current * remainingDt;
      carVelRef.current = Math.max(0, Math.min(100, carVelRef.current));
      carPosRef.current += carVelRef.current * remainingDt;
      distTravelledRef.current += Math.abs(carVelRef.current * remainingDt);

      setIsPlaying(false); // Stop simulation
    } else {
      simTimeRef.current += dt;

      // Update velocity
      carVelRef.current += carAccRef.current * dt;
      carVelRef.current = Math.max(0, Math.min(100, carVelRef.current));

      // Update position
      carPosRef.current += carVelRef.current * dt;
      distTravelledRef.current += Math.abs(carVelRef.current * dt);
    }
  });

  return null;
}
