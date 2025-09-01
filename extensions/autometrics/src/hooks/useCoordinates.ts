import { useState, useRef } from 'react';

interface Coordinates {
  M1: { x: string; y: string; z: string };
  M5: { x: string; y: string; z: string };
  C: { x: string; y: string; z: string };
  T: { x: string; y: string; z: string };
}

export const useCoordinates = () => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates>({
    M1: { x: '', y: '', z: '' },
    M5: { x: '', y: '', z: '' },
    C: { x: '', y: '', z: '' },
    T: { x: '', y: '', z: '' },
  });

  const selectedGroupRef = useRef('');

  const updateCoordinates = (groupName: string, worldCoords: number[]) => {
    setCoordinates(prev => ({
      ...prev,
      [groupName]: {
        x: worldCoords[0].toFixed(2),
        y: worldCoords[1].toFixed(2),
        z: worldCoords[2].toFixed(2),
      },
    }));
  };

  const selectGroup = (groupName: string) => {
    setSelectedGroup(groupName);
    selectedGroupRef.current = groupName;
    document.body.style.cursor = 'crosshair';
  };

  const clearSelection = () => {
    setSelectedGroup('');
    selectedGroupRef.current = '';
    document.body.style.cursor = 'default';
  };

  return {
    selectedGroup,
    coordinates,
    selectedGroupRef,
    updateCoordinates,
    selectGroup,
    clearSelection,
  };
};

