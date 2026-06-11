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
  // If this is the titration & neutralization lesson, render our custom 3D titration lab
  if (lessonId === 'acid-base-titrations') {
    return (
      <TitrationSimulator />
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
