import React, { useState } from 'react';
import { Button } from '@ohif/ui-next';
import LogoSection from '../Components/LogoSection';
import TalasHeader from '../Components/TalasHeader';
import CoordinateGroup from '../Components/CoordinateGroup';
import PopupModal from '../Components/PopupModal';
import { useCoordinates } from '../hooks/useCoordinates';
import { useEventHandlers } from '../hooks/useEventHandlers';
import { useAnnotations } from '../hooks/useAnnotations';

interface TalasProps {
  setCurrentView: (view: string) => void;
  commandsManager: any;
}

const coordinateGroups = [
  { key: 'M1', title: '1st Metatarsal (M1)' },
  { key: 'M5', title: '5th Metatarsal (M5)' },
  { key: 'C', title: 'Calcaneous (C)' },
  { key: 'T', title: 'Talus (T)' },
];

function TalasRefactored({ setCurrentView, commandsManager }: TalasProps) {
  const [showPopup, setShowPopup] = useState(false);

  const {
    selectedGroup,
    coordinates,
    selectedGroupRef,
    updateCoordinates,
    selectGroup,
    clearSelection,
  } = useCoordinates();

  const { createAnnotationsForAllViewports, updateCrosshairPosition } =
    useAnnotations(commandsManager);

  const handleCoordinateCapture = (
    groupName: string,
    worldCoords: number[],
    anatomicalName: string
  ) => {
    // Create annotations for all viewports
    createAnnotationsForAllViewports(groupName, worldCoords, anatomicalName);

    // Update crosshair position across all viewports
    updateCrosshairPosition(worldCoords);
  };

  const { addClickListener, removeClickListener } = useEventHandlers(
    selectedGroupRef,
    updateCoordinates,
    clearSelection,
    handleCoordinateCapture
  );

  const handleBack = () => {
    setCurrentView('autometrics');
    clearSelection();

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
    console.log('Coordinates submitted:', coordinates);
    setShowPopup(true);
  };

  const handleSelect = (groupName: string) => {
    console.log(`Select button clicked for ${groupName}`);
    selectGroup(groupName);
    addClickListener();
  };

  return (
    <div className="flex flex-col space-y-6 p-4">
      <TalasHeader onBack={handleBack} />

      {/* TALAS content */}
      <div className="flex-1 space-y-4">
        {coordinateGroups.map(group => (
          <CoordinateGroup
            key={group.key}
            title={group.title}
            groupKey={group.key}
            coordinates={coordinates[group.key]}
            isSelected={selectedGroup === group.key}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Submit buttons */}
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

      <LogoSection />

      <PopupModal
        isVisible={showPopup}
        onClose={() => setShowPopup(false)}
        imageSrc="/talas_visualization.png"
        imageAlt="Talas Visualization"
      />
    </div>
  );
}

export default TalasRefactored;

