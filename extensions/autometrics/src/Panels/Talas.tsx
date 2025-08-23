import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@ohif/ui-next';
import { getEnabledElement } from '@cornerstonejs/core';
import { annotation } from '@cornerstonejs/tools';

function Talas({ setCurrentView, commandsManager }) {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [coordinates, setCoordinates] = useState({
    M1: { x: '', y: '', z: '' },
    M5: { x: '', y: '', z: '' },
    C: { x: '', y: '', z: '' },
    T: { x: '', y: '', z: '' },
  });
  const selectedGroupRef = useRef('');
  const eventListenerRef = useRef<{
    handleRightClick: (event: MouseEvent) => void;
    handleMouseDown: (event: MouseEvent) => void;
  } | null>(null);

  const handleBack = () => {
    setCurrentView('autometrics');
    setSelectedGroup(''); // Reset selected group
    selectedGroupRef.current = '';

    // Return to original viewport layout
    commandsManager.run({
      commandName: 'setHangingProtocol',
      commandOptions: {
        protocolId: 'default',
      },
    });

    // Remove event listeners
    removeClickListener();
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Coordinates submitted:', coordinates);
  };

  const handleSelect = groupName => {
    console.log(`Select button clicked for ${groupName}`);
    setSelectedGroup(groupName);
    selectedGroupRef.current = groupName;

    // Change cursor to crosshair
    document.body.style.cursor = 'crosshair';

    // Add click listener for coordinate capture
    addClickListener();
  };

  // Function to add click listener for coordinate capture
  const addClickListener = () => {
    const element = document.querySelector('.cornerstone-viewport-element');
    if (!element) {
      console.warn('No cornerstone viewport element found');
      return;
    }

    const handleRightClick = event => {
      event.preventDefault();
      event.stopPropagation();

      console.log('Right click detected');

      // Get the viewport element
      const viewportElement = event.currentTarget;
      const rect = viewportElement.getBoundingClientRect();

      // Get the viewport
      const enabledElement = getEnabledElement(viewportElement);
      if (!enabledElement) {
        console.warn('No enabled element found');
        return;
      }

      const viewport = enabledElement.viewport;

      // Calculate pixel coordinates relative to the viewport
      const pixelX = event.clientX - rect.left;
      const pixelY = event.clientY - rect.top;

      // Convert to normalized coordinates (0-1 range)
      const normalizedX = pixelX / rect.width;
      const normalizedY = pixelY / rect.height;

      // Convert pixel coordinates to world coordinates
      const worldCoords = viewport.canvasToWorld([pixelX, pixelY]);
      console.log('worldCoords:', worldCoords);

      // Validate world coordinates
      if (!worldCoords || !Array.isArray(worldCoords) || worldCoords.length < 2) {
        console.error('Invalid world coordinates:', worldCoords);
        return;
      }

      // Ensure world coordinates are numbers
      const validWorldCoords = [
        Number(worldCoords[0]) || 0,
        Number(worldCoords[1]) || 0,
        Number(worldCoords[2]) || 0,
      ];
      console.log('Validated world coordinates:', validWorldCoords);

      // Update coordinates for the selected group using the ref to avoid stale closure
      const currentGroup = selectedGroupRef.current;
      setCoordinates(prev => ({
        ...prev,
        [currentGroup]: {
          x: validWorldCoords[0].toFixed(2),
          y: validWorldCoords[1].toFixed(2),
          z: validWorldCoords[2].toFixed(2),
        },
      }));

      console.log(`Coordinates captured for ${currentGroup}:`, {
        normalized: [normalizedX, normalizedY, viewport.getSliceIndex()],
        pixel: [pixelX, pixelY],
        world: validWorldCoords,
      });

      // Draw a circle annotation at the clicked location with anatomical name as label
      drawCircleAnnotation(viewportElement, validWorldCoords, currentGroup);

      // Reset selection state
      setSelectedGroup('');
      selectedGroupRef.current = '';
      document.body.style.cursor = 'default';

      // Remove the click listener
      removeClickListener();
    };

    // Add event listeners
    element.addEventListener('contextmenu', handleRightClick, true);
    element.addEventListener(
      'mousedown',
      (event: MouseEvent) => {
        if (event.button === 2) {
          // Right mouse button
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true
    );

    // Store the listener for removal
    eventListenerRef.current = {
      handleRightClick,
      handleMouseDown: (event: MouseEvent) => {
        if (event.button === 2) {
          // Right mouse button
          event.preventDefault();
          event.stopPropagation();
        }
      },
    };
  };

  // Function to remove click listener
  const removeClickListener = () => {
    const element = document.querySelector('.cornerstone-viewport-element');
    if (element && eventListenerRef.current) {
      element.removeEventListener('contextmenu', eventListenerRef.current.handleRightClick, true);
      element.removeEventListener('mousedown', eventListenerRef.current.handleMouseDown, true);
      eventListenerRef.current = null;
    }
  };

  // Function to draw a circle annotation using CircleROI tool with anatomical name as label
  const drawCircleAnnotation = (element, worldCoords, groupName) => {
    try {
      const enabledElement = getEnabledElement(element);
      if (!enabledElement) {
        console.warn('No enabled element found for circle annotation');
        return;
      }

      // Additional validation for world coordinates
      if (!worldCoords || !Array.isArray(worldCoords) || worldCoords.length < 2) {
        console.error('Invalid world coordinates in drawCircleAnnotation:', worldCoords);
        return;
      }

      // Get the anatomical name based on the group
      const anatomicalNames = {
        M1: '1st Metatarsal',
        M5: '5th Metatarsal',
        C: 'Calcaneous',
        T: 'Talus',
      };

      const anatomicalName = anatomicalNames[groupName] || groupName;

      console.log('Creating annotation for:', anatomicalName);
      console.log('World coordinates:', worldCoords);
      console.log('Element:', element);

      // Ensure worldCoords is properly formatted with valid numbers
      const centerPoint = [
        Number(worldCoords[0]) || 0,
        Number(worldCoords[1]) || 0,
        Number(worldCoords[2]) || 0,
      ];

      console.log('Center point:', centerPoint);

      // For now, skip creating the CircleROI annotation to avoid coordinate processing errors
      // Just log the coordinates and anatomical name
      console.log(
        `Coordinate captured for ${groupName} at:`,
        worldCoords,
        'with label:',
        anatomicalName
      );

      // TODO: Implement a different annotation method that doesn't trigger coordinate processing errors
      // For now, we'll just capture the coordinates without drawing the annotation
    } catch (error) {
      console.error('Error in coordinate capture:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
  };

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      removeClickListener();
    };
  }, []);

  return (
    <div className="flex flex-col space-y-6 p-4">
      {/* Header with Back button and TALAS title */}
      <div className="mb-4 flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="text-sm"
        >
          Back
        </Button>
        <div className="text-lg font-semibold text-white">TALAS</div>
      </div>

      {/* TALAS content */}
      <div className="flex-1 space-y-4">
        {/* 1st Metatarsal (M1) Group */}
        <div className="space-y-2">
          <div className="border-b border-gray-600 pb-1 text-sm font-medium text-gray-300">
            1st Metatarsal (M1)
          </div>
          <div className="space-y-2 pl-2">
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">X:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.M1.x}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">Y:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.M1.y}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">Z:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.M1.z}
              />
            </div>
            <Button
              variant={selectedGroup === 'M1' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleSelect('M1')}
              className="w-full text-xs"
            >
              Select
            </Button>
          </div>
        </div>

        {/* 5th Metatarsal (M5) Group */}
        <div className="space-y-2">
          <div className="border-b border-gray-600 pb-1 text-sm font-medium text-gray-300">
            5th Metatarsal (M5)
          </div>
          <div className="space-y-2 pl-2">
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">X:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.M5.x}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">Y:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.M5.y}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">Z:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.M5.z}
              />
            </div>
            <Button
              variant={selectedGroup === 'M5' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleSelect('M5')}
              className="w-full text-xs"
            >
              Select
            </Button>
          </div>
        </div>

        {/* Calcaneous (C) Group */}
        <div className="space-y-2">
          <div className="border-b border-gray-600 pb-1 text-sm font-medium text-gray-300">
            Calcaneous (C)
          </div>
          <div className="space-y-2 pl-2">
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">X:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.C.x}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">Y:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.C.y}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">Z:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.C.z}
              />
            </div>
            <Button
              variant={selectedGroup === 'C' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleSelect('C')}
              className="w-full text-xs"
            >
              Select
            </Button>
          </div>
        </div>

        {/* Talus (T) Group */}
        <div className="space-y-2">
          <div className="border-b border-gray-600 pb-1 text-sm font-medium text-gray-300">
            Talus (T)
          </div>
          <div className="space-y-2 pl-2">
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">X:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.T.x}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">Y:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.T.y}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-4 text-xs text-gray-400">Z:</label>
              <input
                type="text"
                readOnly
                className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
                placeholder="0.00"
                value={coordinates.T.z}
              />
            </div>
            <Button
              variant={selectedGroup === 'T' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleSelect('T')}
              className="w-full text-xs"
            >
              Select
            </Button>
          </div>
        </div>
      </div>

      {/* Submit button at the bottom */}
      <div className="flex flex-col space-y-3 border-t border-gray-600 pt-4">
        <Button
          variant="default"
          className="w-full"
          onClick={handleSubmit}
        >
          How to...
        </Button>
        <Button
          variant="default"
          className="w-full"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default Talas;
