import React, { Component, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import ProgrammaticInteractiveModel from './ProgrammaticInteractiveModel';

// Error Boundary to catch GLB loading errors (e.g., file not found or network issues)
class GLBErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("GLB model failed to load, falling back to interactive programmatic rendering:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ProgrammaticInteractiveModel
          lessonId={this.props.lessonId}
          hoveredPart={this.props.hoveredPart}
          selectedPart={this.props.selectedPart}
          onPointerOver={this.props.onPointerOver}
          onPointerOut={this.props.onPointerOut}
          onClick={this.props.onClick}
        />
      );
    }

    return this.props.children;
  }
}

// Scene mesh loader and handler
function GLBMesh({ modelPath, hoveredPart, selectedPart, onPointerOver, onPointerOut, onClick }) {
  const { scene } = useGLTF(modelPath);

  // Dynamically highlight materials in the GLB scene depending on selection states
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Cache the original color in userData
        if (!child.userData.originalColor) {
          child.userData.originalColor = child.material.color ? child.material.color.clone() : null;
        }

        const isHovered = hoveredPart === child.name;
        const isSelected = selectedPart === child.name;

        // Apply interactive highlighting styles
        if (isSelected) {
          child.material.emissive?.set('#06b6d4');
          child.material.emissiveIntensity = 0.9;
        } else if (isHovered) {
          child.material.emissive?.set('#8b5cf6');
          child.material.emissiveIntensity = 0.4;
        } else {
          child.material.emissive?.set('#000000');
          child.material.emissiveIntensity = 0;
        }
      }
    });
  }, [scene, hoveredPart, selectedPart]);

  return (
    <primitive 
      object={scene} 
      scale={1.5}
      position={[0, -0.2, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.object && e.object.isMesh) {
          onPointerOver(e.object.name);
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerOut();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.object && e.object.isMesh) {
          onClick(e.object.name, e.point);
        }
      }}
    />
  );
}

export default function GLBLoader({ modelPath, lessonId, hoveredPart, selectedPart, onPointerOver, onPointerOut, onClick }) {
  return (
    <GLBErrorBoundary
      lessonId={lessonId}
      hoveredPart={hoveredPart}
      selectedPart={selectedPart}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      <GLBMesh
        modelPath={modelPath}
        hoveredPart={hoveredPart}
        selectedPart={selectedPart}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      />
    </GLBErrorBoundary>
  );
}
