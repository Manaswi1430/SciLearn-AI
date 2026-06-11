import { useState, useCallback } from 'react';

export function useModelInteraction() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);

  const selectPart = useCallback((name, position = null) => {
    if (selectedPart === name) {
      // Toggle off if clicked again
      setSelectedPart(null);
      setClickPosition(null);
    } else {
      setSelectedPart(name);
      setClickPosition(position);
    }
  }, [selectedPart]);

  const hoverPart = useCallback((name) => {
    setHoveredPart(name);
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedPart(null);
    setClickPosition(null);
    setHoveredPart(null);
  }, []);

  return {
    selectedPart,
    hoveredPart,
    clickPosition,
    selectPart,
    hoverPart,
    resetSelection,
    setClickPosition
  };
}
