import { useEffect, useRef } from 'react';
import { getEnabledElement } from '@cornerstonejs/core';
import { AnnotationManager } from '../utils/annotationUtils';

export const useAnnotations = (commandsManager?: any) => {
  const annotationManagerRef = useRef<AnnotationManager>(new AnnotationManager());

  // Add viewport change listener to update annotation positions
  useEffect(() => {
    let animationFrameId: number;
    const annotationManager = annotationManagerRef.current;

    const updateAnnotationPositions = () => {
      annotationManager.updateAnnotationPositions();
    };

    const handleViewportChange = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(updateAnnotationPositions);
    };

    // Listen for various viewport change events on all viewports
    const allViewports = document.querySelectorAll(
      '.cornerstone-viewport-element'
    ) as NodeListOf<HTMLDivElement>;

    allViewports.forEach(element => {
      element.addEventListener('wheel', handleViewportChange, { passive: true });
      element.addEventListener(
        'mousemove',
        e => {
          if (e.buttons > 0) {
            // Only update during panning
            handleViewportChange();
          }
        },
        { passive: true }
      );
    });

    // Use a more frequent update for smooth positioning
    const intervalId = setInterval(updateAnnotationPositions, 100);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      clearInterval(intervalId);

      // Remove event listeners from all viewports
      allViewports.forEach(element => {
        element.removeEventListener('wheel', handleViewportChange);
        element.removeEventListener('mousemove', handleViewportChange);
      });
    };
  }, []);

  const createAnnotationsForAllViewports = (
    groupName: string,
    worldCoords: number[],
    anatomicalName: string
  ) => {
    annotationManagerRef.current.createAnnotationsForAllViewports(
      groupName,
      worldCoords,
      anatomicalName,
      commandsManager
    );
  };

  const updateCrosshairPosition = (worldCoords: number[]) => {
    try {
      const { toolGroupService } = commandsManager.services;
      const toolGroupIds = toolGroupService.getToolGroupIds();

      toolGroupIds.forEach(toolGroupId => {
        const toolGroup = toolGroupService.getToolGroup(toolGroupId);
        const crosshairTool = toolGroup.getToolInstance('Crosshairs');

        if (crosshairTool) {
          // Try to set the crosshair position using the tool's method
          if (crosshairTool.setCrosshairPosition) {
            crosshairTool.setCrosshairPosition(worldCoords);
          } else if (crosshairTool.setPosition) {
            crosshairTool.setPosition(worldCoords);
          } else {
            // Fallback: try to update the tool's center
            crosshairTool.computeToolCenter();
          }
        }
      });
    } catch (error) {
      console.warn('Could not update crosshair position:', error);
    }
  };

  return {
    createAnnotationsForAllViewports,
    updateCrosshairPosition,
    annotationManager: annotationManagerRef.current,
  };
};

