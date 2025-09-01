import { useRef, useEffect } from 'react';
import { getEnabledElement } from '@cornerstonejs/core';

interface EventHandlersRef {
  handleRightClick: (event: MouseEvent) => void;
  handleMouseDown: (event: MouseEvent) => void;
  isProcessing: boolean;
}

export const useEventHandlers = (
  selectedGroupRef: React.RefObject<string>,
  updateCoordinates: (groupName: string, worldCoords: number[]) => void,
  clearSelection: () => void,
  onCoordinateCapture?: (groupName: string, worldCoords: number[], anatomicalName: string) => void
) => {
  const eventListenerRef = useRef<EventHandlersRef | null>(null);

  const removeClickListener = () => {
    if (eventListenerRef.current) {
      const viewportElements = document.querySelectorAll('.cornerstone-viewport-element');
      viewportElements.forEach(element => {
        element.removeEventListener(
          'contextmenu',
          eventListenerRef.current!.handleRightClick,
          true
        );
        element.removeEventListener('mousedown', eventListenerRef.current!.handleMouseDown, true);
      });
      eventListenerRef.current = null;
    }
    document.body.style.cursor = 'default';
  };

  const addClickListener = () => {
    // Always clear any previous listeners before adding
    removeClickListener();

    const viewportElements = document.querySelectorAll('.cornerstone-viewport-element');
    if (!viewportElements || viewportElements.length === 0) {
      console.warn('No cornerstone viewport elements found');
      return;
    }

    console.log(`Found ${viewportElements.length} viewport elements`);

    const handleRightClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const listenerRef = eventListenerRef.current;
      if (!listenerRef || listenerRef.isProcessing) return;

      listenerRef.isProcessing = true;

      console.log('Right click detected');

      const viewportElement = event.currentTarget as HTMLDivElement;
      const rect = viewportElement.getBoundingClientRect();

      const enabledElement = getEnabledElement(viewportElement);
      if (!enabledElement) {
        listenerRef.isProcessing = false;
        return;
      }

      const viewport = enabledElement.viewport;
      const pixelX = event.clientX - rect.left;
      const pixelY = event.clientY - rect.top;

      const worldCoords = viewport.canvasToWorld([pixelX, pixelY]);
      if (!worldCoords || worldCoords.length < 2) {
        listenerRef.isProcessing = false;
        return;
      }

      const validWorldCoords = [
        Number(worldCoords[0]) || 0,
        Number(worldCoords[1]) || 0,
        Number(worldCoords[2]) || 0,
      ];

      const currentGroup = selectedGroupRef.current;
      if (!currentGroup) {
        listenerRef.isProcessing = false;
        return;
      }

      updateCoordinates(currentGroup, validWorldCoords);

      const anatomicalNames = {
        M1: '1st Metatarsal',
        M5: '5th Metatarsal',
        C: 'Calcaneous',
        T: 'Talus',
      };
      const anatomicalName = anatomicalNames[currentGroup] || currentGroup;

      // Trigger callback if provided
      if (onCoordinateCapture) {
        onCoordinateCapture(currentGroup, validWorldCoords, anatomicalName);
      }

      console.log(`Coordinates captured for ${currentGroup}:`, {
        world: validWorldCoords,
      });

      clearSelection();
      listenerRef.isProcessing = false;
      removeClickListener();
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 2) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Store single instances to remove later
    eventListenerRef.current = { handleRightClick, handleMouseDown, isProcessing: false };

    // Attach the SAME handler instances to all viewports
    viewportElements.forEach((element, index) => {
      console.log(`Adding event listeners to viewport ${index}:`, element);
      element.addEventListener('contextmenu', handleRightClick, true);
      element.addEventListener('mousedown', handleMouseDown, true);
    });
  };

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      removeClickListener();
    };
  }, []);

  return {
    addClickListener,
    removeClickListener,
    eventListenerRef,
  };
};

