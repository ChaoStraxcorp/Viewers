import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@ohif/ui-next';
import { getEnabledElement, getEnabledElements } from '@cornerstonejs/core';
import { annotation } from '@cornerstonejs/tools';
import LogoSection from '../Components/LogoSection';

function Talas({ setCurrentView, commandsManager }) {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showPopup, setShowPopup] = useState(false);
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
  const annotationsRef = useRef<
    Map<
      string,
      { element: HTMLElement; worldCoords: number[]; sliceIndex: number; viewportId: string }
    >
  >(new Map());
  const viewportAnnotationsRef = useRef<
    Map<string, Map<string, { element: HTMLElement; worldCoords: number[]; sliceIndex: number }>>
  >(new Map());

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
    console.log('Setting showPopup to true');
    setShowPopup(true);
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

      // Create a simple div element to show the annotation
      const annotationDiv = document.createElement('div');
      annotationDiv.className = 'custom-annotation';
      annotationDiv.style.cssText = `
        position: absolute;
        color: #ff0000;
        font-size: 14px;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        transform: translate(-4px, -4px);
        display: flex;
        align-items: center;
        gap: 4px;
      `;

      // Create the red circle element
      const circleDiv = document.createElement('div');
      circleDiv.style.cssText = `
        width: 8px;
        height: 8px;
        border: 2px solid #ff0000;
        border-radius: 50%;
        background: transparent;
        flex-shrink: 0;
      `;

      // Create the text element
      const textDiv = document.createElement('span');
      textDiv.textContent = groupName; // Use short label (M1, M5, C, T)
      textDiv.style.cssText = `
        color: #ff0000;
        font-size: 14px;
        font-weight: bold;
      `;

      // Assemble the annotation
      annotationDiv.appendChild(circleDiv);
      annotationDiv.appendChild(textDiv);

      // Get the viewport element and calculate position
      const viewportElement = element;
      const rect = viewportElement.getBoundingClientRect();

      // Convert world coordinates back to screen coordinates
      const screenCoords = enabledElement.viewport.worldToCanvas([
        centerPoint[0],
        centerPoint[1],
        centerPoint[2] || 0,
      ]);

      if (screenCoords && screenCoords.length >= 2) {
        // Remove existing annotation for this group if it exists
        const existingAnnotation = annotationsRef.current.get(groupName);
        if (existingAnnotation) {
          existingAnnotation.element.remove();
          annotationsRef.current.delete(groupName);
          console.log(`Removed existing annotation for ${groupName}`);
        }

        annotationDiv.style.left = `${screenCoords[0]}px`;
        annotationDiv.style.top = `${screenCoords[1]}px`;

        // Add the annotation to the viewport
        viewportElement.appendChild(annotationDiv);

        // Store the annotation reference and world coordinates for position updates
        annotationsRef.current.set(groupName, {
          element: annotationDiv,
          worldCoords: centerPoint,
          sliceIndex: enabledElement.viewport.getSliceIndex(),
          viewportId: 'mpr-axial', // Axial viewport ID
        });

        // Create annotations for all viewports
        createAnnotationsForAllViewports(groupName, centerPoint, anatomicalName);

        console.log(
          `Custom annotation created for ${groupName} at screen coordinates:`,
          screenCoords
        );
      } else {
        console.warn('Could not convert world coordinates to screen coordinates');
      }
    } catch (annotationError) {
      console.error('Error creating custom annotation:', annotationError);
      console.log('Falling back to coordinate-only capture');

      // If all annotation methods fail, just log the coordinates
      console.log(
        `Coordinate captured for ${groupName} at:`,
        worldCoords,
        'with label:',
        groupName
      );
    }
  };

  // Function to create annotations for all viewports using Cornerstone's annotation system
  const createAnnotationsForAllViewports = (
    groupName: string,
    worldCoords: number[],
    anatomicalName: string
  ) => {
    try {
      // Try to get viewports from the services manager if available
      let viewportIds = [];

      if (commandsManager && commandsManager.services) {
        const servicesManager = commandsManager.services;
        console.log('Available services:', Object.keys(servicesManager));

        // Try different ways to get viewport IDs
        if (servicesManager.viewportGridService) {
          viewportIds = servicesManager.viewportGridService.getViewportIds();
          console.log('Found viewport IDs from viewportGridService:', viewportIds);
        }
      }

      if (viewportIds.length > 0) {
        // Use viewport grid service method
        viewportIds.forEach(viewportId => {
          try {
            // Get the viewport element
            const viewportElement = document.querySelector(
              `[data-viewport-id="${viewportId}"]`
            ) as HTMLDivElement;
            if (viewportElement) {
              console.log(`Creating annotation in viewport: ${viewportId}`);
              createAnnotationInViewportDirect(viewportElement, groupName, worldCoords);
            }
          } catch (error) {
            console.error(`Error creating annotation in viewport ${viewportId}:`, error);
          }
        });
      } else {
        console.warn('Viewport grid service not available, using direct DOM method');

        // Try multiple selectors to find MPR viewports
        const selectors = [
          '.cornerstone-viewport-element',
          '[data-viewport-id*="mpr"]',
          '[data-viewport-id*="MPR"]',
          '[data-viewport-uid*="mpr"]',
          '[data-viewport-uid*="MPR"]',
          '[data-viewportid*="mpr"]',
          '[data-viewportid*="MPR"]',
        ];

        let allViewports: NodeListOf<HTMLDivElement> | null = null;

        for (const selector of selectors) {
          const viewports = document.querySelectorAll(selector) as NodeListOf<HTMLDivElement>;
          if (viewports.length >= 3) {
            console.log(`Found ${viewports.length} viewports with selector: ${selector}`);
            allViewports = viewports;
            break;
          }
        }

        if (!allViewports) {
          // Fallback to the original method
          allViewports = document.querySelectorAll(
            '.cornerstone-viewport-element'
          ) as NodeListOf<HTMLDivElement>;
          console.log(`Fallback: Found ${allViewports.length} viewport elements directly`);
        }

        // Log all found viewports for debugging
        allViewports.forEach((viewport, index) => {
          console.log(`Viewport ${index}:`, {
            id: viewport.id,
            dataViewportId: viewport.getAttribute('data-viewport-id'),
            dataViewportUid: viewport.getAttribute('data-viewport-uid'),
            className: viewport.className,
          });
        });

        allViewports.forEach((viewportElement, index) => {
          try {
            const viewportId =
              viewportElement.getAttribute('data-viewport-id') ||
              viewportElement.getAttribute('data-viewport-uid') ||
              viewportElement.getAttribute('data-viewportid') ||
              viewportElement.id ||
              `viewport-${index}`;

            // Skip axial view to avoid duplicate annotation
            if (viewportId.includes('axial')) {
              console.log(`Skipping axial view to avoid duplicate annotation`);
              return;
            }

            console.log(`Creating annotation in viewport ${index}:`, viewportId);
            createAnnotationInViewportDirect(viewportElement, groupName, worldCoords);
          } catch (error) {
            console.error(`Error creating annotation in viewport ${index}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('Error creating annotations for all viewports:', error);
    }
  };

  // Direct method to create annotation in a specific viewport
  const createAnnotationInViewportDirect = (
    viewportElement: HTMLDivElement,
    groupName: string,
    worldCoords: number[]
  ) => {
    try {
      const enabledElement = getEnabledElement(viewportElement);
      if (!enabledElement) {
        console.warn('No enabled element found for viewport');
        return;
      }

      // Log viewport information for debugging
      const viewportId =
        viewportElement.getAttribute('data-viewport-id') ||
        viewportElement.getAttribute('data-viewport-uid') ||
        viewportElement.getAttribute('data-viewportid') ||
        viewportElement.id ||
        'viewport';
      console.log(`Processing viewport: ${viewportId}`);
      console.log(`Viewport element:`, viewportElement);
      console.log(`Enabled element:`, enabledElement);

      // Navigate sagittal and coronal views to the clicked position
      try {
        if (viewportId.includes('sagittal') || viewportId.includes('coronal')) {
          const viewport = enabledElement.viewport;

          // Use the jumpToWorld method to navigate to the world coordinates
          const point3: [number, number, number] = [
            worldCoords[0],
            worldCoords[1],
            worldCoords[2] || 0,
          ];
          viewport.jumpToWorld(point3);
          console.log(`Navigated ${viewportId} to world coordinates:`, point3);
        }
      } catch (navError) {
        console.warn(`Could not navigate ${viewportId}:`, navError);
      }

      // Create a simple div element to show the annotation
      const annotationDiv = document.createElement('div');
      annotationDiv.className = 'custom-annotation';
      annotationDiv.style.cssText = `
                  position: absolute;
                  color: #ff0000;
                  font-size: 14px;
                  font-weight: bold;
                  pointer-events: none;
                  z-index: 1000;
                  transform: translate(-4px, -4px);
                  display: flex;
                  align-items: center;
                  gap: 4px;
                `;

      // Create the red circle element
      const circleDiv = document.createElement('div');
      circleDiv.style.cssText = `
        width: 8px;
        height: 8px;
        border: 2px solid #ff0000;
        border-radius: 50%;
        background: transparent;
        flex-shrink: 0;
      `;

      // Create the text element
      const textDiv = document.createElement('span');
      textDiv.textContent = groupName;
      textDiv.style.cssText = `
        color: #ff0000;
        font-size: 14px;
        font-weight: bold;
      `;

      // Assemble the annotation
      annotationDiv.appendChild(circleDiv);
      annotationDiv.appendChild(textDiv);

      // Convert world coordinates to screen coordinates for this viewport
      const screenCoords = enabledElement.viewport.worldToCanvas([
        worldCoords[0],
        worldCoords[1],
        worldCoords[2] || 0,
      ]);

      console.log(`World coords for ${viewportId}:`, worldCoords);
      console.log(`Screen coords for ${viewportId}:`, screenCoords);

      if (screenCoords && screenCoords.length >= 2) {
        // Remove existing annotation for this group if it exists
        const annotationKey = `${groupName}-${viewportId}`;
        const existingAnnotation = annotationsRef.current.get(annotationKey);
        if (existingAnnotation) {
          existingAnnotation.element.remove();
          annotationsRef.current.delete(annotationKey);
          console.log(`Removed existing annotation for ${groupName} in viewport ${viewportId}`);
        }

        annotationDiv.style.left = `${screenCoords[0]}px`;
        annotationDiv.style.top = `${screenCoords[1]}px`;

        // Add the annotation to the viewport
        viewportElement.appendChild(annotationDiv);

        // Store the annotation reference and world coordinates for position updates
        annotationsRef.current.set(annotationKey, {
          element: annotationDiv,
          worldCoords: worldCoords,
          sliceIndex: enabledElement.viewport.getSliceIndex(),
          viewportId: viewportId, // Store viewport ID for slice checking
        });

        console.log(
          `Custom annotation created for ${groupName} in viewport ${viewportId} at screen coordinates:`,
          screenCoords
        );
        console.log(`Annotation element added to viewport ${viewportId}:`, annotationDiv);
      } else {
        console.warn(
          'Could not convert world coordinates to screen coordinates for viewport:',
          viewportId
        );
      }
    } catch (error) {
      console.error('Error creating annotation in viewport:', error);
    }
  };

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      removeClickListener();
    };
  }, []);

  useEffect(() => {
    console.log('showPopup changed to:', showPopup);
  }, [showPopup]);

  // Add viewport change listener to update annotation positions
  useEffect(() => {
    let animationFrameId: number;

    const updateAnnotationPositions = () => {
      // Get all viewport elements
      const allViewports = document.querySelectorAll(
        '.cornerstone-viewport-element'
      ) as NodeListOf<HTMLDivElement>;

      allViewports.forEach(viewportElement => {
        const enabledElement = getEnabledElement(viewportElement);
        if (!enabledElement) return;

        const viewportId =
          viewportElement.getAttribute('data-viewport-id') ||
          viewportElement.getAttribute('data-viewport-uid') ||
          viewportElement.getAttribute('data-viewportid') ||
          viewportElement.id ||
          'viewport';

        // Update annotations for this specific viewport
        annotationsRef.current.forEach((annotation, annotationKey) => {
          try {
            // Check if this annotation belongs to this viewport
            if (annotation.viewportId === viewportId) {
              // Check if we're on the correct slice for this annotation
              const currentSliceIndex = enabledElement.viewport.getSliceIndex();

              if (currentSliceIndex === annotation.sliceIndex) {
                // Show annotation and update position
                const screenCoords = enabledElement.viewport.worldToCanvas([
                  annotation.worldCoords[0],
                  annotation.worldCoords[1],
                  annotation.worldCoords[2] || 0,
                ]);

                if (screenCoords && screenCoords.length >= 2) {
                  annotation.element.style.left = `${screenCoords[0]}px`;
                  annotation.element.style.top = `${screenCoords[1]}px`;
                  annotation.element.style.display = 'flex'; // Show the annotation
                }
              } else {
                // Hide annotation if we're on a different slice
                annotation.element.style.display = 'none';
              }
            }
          } catch (error) {
            console.error(`Error updating annotation position for ${annotationKey}:`, error);
          }
        });
      });
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

      <LogoSection />

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg bg-white p-4 shadow-xl">
            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute right-2 top-2 z-10 rounded-full bg-gray-800 p-2 text-white hover:bg-gray-600"
            >
              ✕
            </button>

            {/* Image */}
            <img
              src="/talas_visualization.png"
              alt="Talas Visualization"
              className="h-auto w-full object-contain"
              onLoad={() => console.log('Image loaded successfully')}
              onError={e => console.error('Image failed to load:', e)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Talas;
