import React from 'react';
import ModelViewer from './ModelViewer/ModelViewer';
import SketchfabViewer from './SketchfabViewer';
import PhysicsMotionSimulator from './MotionSimulator/PhysicsMotionSimulator';
import NewtonsLawsSimulator from './MotionSimulator/NewtonsLawsSimulator';
import FrictionDragSimulator from './MotionSimulator/FrictionDragSimulator';
import BohrModelSimulator from './MotionSimulator/BohrModelSimulator';
import ElectronConfigSimulator from './MotionSimulator/ElectronConfigSimulator';
import PHScaleSimulator from './MotionSimulator/PHScaleSimulator';
import TitrationSimulator from './MotionSimulator/TitrationSimulator';
import GravitySimulator from './MotionSimulator/GravitySimulator';
import WorkEnergySimulator from './MotionSimulator/WorkEnergySimulator';
import CircuitSimulator from './MotionSimulator/CircuitSimulator';
import KirchhoffSimulator from './MotionSimulator/KirchhoffSimulator';
import ChargedParticleSimulator from './MotionSimulator/ChargedParticleSimulator';
import WaveGenerator from './MotionSimulator/WaveGenerator';
import ChemicalBondingLab from './MotionSimulator/ChemicalBondingLab';
import ChemicalReactionsLab from './MotionSimulator/ChemicalReactionsLab';
import OrganicChemistryLab from './MotionSimulator/OrganicChemistryLab';








export default function Unified3DViewer({
  mode = 'sketchfab', // 'sketchfab' or 'r3f'
  modelPath,
  lessonId,
  sketchfabId,
  title,
  lessonName,

  // R3F specific interactive props (for forwards compatibility)
  selectedPart,
  onSelectPart,
  hoveredPart,
  onHoverPart,
  clickPosition,
  onClickPosition
}) {
  // Chemistry visual labs
  if (lessonId === 'ionic-vs-covalent') {
    return <ChemicalBondingLab />;
  }
  if (lessonId === 'balancing-equations') {
    return <ChemicalReactionsLab />;
  }
  if (lessonId === 'hydrocarbons') {
    return <OrganicChemistryLab />;
  }

  // If this is the titration & neutralization lesson, render our custom 3D titration lab
  if (lessonId === 'acid-base-titrations') {
    return (
      <TitrationSimulator />
    );
  }

  // If this is the Newtonian Universal Gravitation lesson, render our custom 3D space lab
  if (lessonId === 'newton-gravitation') {
    return (
      <GravitySimulator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }

  // If this is the Work-Energy Theorem lesson, render our custom 3D inclined ramp simulator
  if (lessonId === 'work-energy-theorem') {
    return (
      <WorkEnergySimulator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }

  // If this is the Ohm's Law & Circuit Schematics lesson, render our custom 3D interactive circuit builder
  if (lessonId === 'ohms-law') {
    return (
      <CircuitSimulator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }

  // If this is the Kirchhoff's Junction & Loop Rules lesson, render our custom 3D multi-loop circuit simulator
  if (lessonId === 'kirchhoffs-laws') {
    return (
      <KirchhoffSimulator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }

  // If this is the Lorentz Force & Wire Magnetic Fields lesson, render our custom 3D charged particle simulator
  if (lessonId === 'magnetic-fields') {
    return (
      <ChargedParticleSimulator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }

  // If this is the Amplitude, Frequency & Wavelength lesson, render our custom 3D Wave Generator
  if (lessonId === 'wave-properties') {
    return (
      <WaveGenerator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }









  // If this is the pH and acids/bases lesson, render our custom 3D virtual pH lab
  if (lessonId === 'ph-poh-scale') {
    return (
      <PHScaleSimulator />
    );
  }

  // If this is the s,p,d,f electron configuration chemistry lesson, render our custom 3D orbital viewer
  if (lessonId === 'electron-config') {
    return (
      <ElectronConfigSimulator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }

  // If this is the Bohr Model & Quantum Energy Levels chemistry lesson, render our custom 3D atomic lab
  if (lessonId === 'bohr-model') {
    return (
      <BohrModelSimulator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }

  // If this is the friction and drag force lesson, render our custom interactive physics lab
  if (lessonId === 'friction-drag') {
    return (
      <FrictionDragSimulator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }

  // If this is the kinematic motion lesson, render our custom interactive physics lab
  if (lessonId === 'velocity-accel') {
    return (
      <PhysicsMotionSimulator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }

  // If this is Newton's Laws of Motion lesson, render our custom interactive force lab
  if (lessonId === 'newtons-laws') {
    return (
      <NewtonsLawsSimulator
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
      />
    );
  }

  // Check global environment configuration or local mode overrides
  const renderR3F = mode === 'r3f' || import.meta.env.VITE_USE_R3F === 'true';

  if (renderR3F) {
    return (
      <ModelViewer
        modelPath={modelPath}
        lessonId={lessonId}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        hoveredPart={hoveredPart}
        onHoverPart={onHoverPart}
        clickPosition={clickPosition}
        onClickPosition={onClickPosition}
      />
    );
  }

  return (
    <SketchfabViewer
      sketchfabId={sketchfabId}
      title={title}
      lessonName={lessonName}
    />
  );
}
