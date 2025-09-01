import { getEnabledElement } from '@cornerstonejs/core';

interface AnnotationData {
  element: HTMLElement;
  worldCoords: number[];
  sliceIndex: number;
  viewportId: string;
}

export class AnnotationManager {
  private annotationsRef: Map<string, AnnotationData> = new Map();

  private createAnnotationElement(groupName: string): HTMLDivElement {
    const annotationDiv = document.createElement('div');
    annotationDiv.className = 'custom-annotation';
    annotationDiv.setAttribute('data-annotation-group', groupName);
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

    annotationDiv.appendChild(circleDiv);
    annotationDiv.appendChild(textDiv);

    return annotationDiv;
  }

  private getViewportInfo(viewportElement: HTMLDivElement) {
    return (
      viewportElement.getAttribute('data-viewport-id') ||
      viewportElement.getAttribute('data-viewport-uid') ||
      viewportElement.getAttribute('data-viewportid') ||
      viewportElement.id ||
      'viewport'
    );
  }

  public createAnnotationInViewport(
    viewportElement: HTMLDivElement,
    groupName: string,
    worldCoords: number[]
  ): void {
    // Remove existing annotation for this group in this viewport
    const existingAnnotation = viewportElement.querySelector(
      `[data-annotation-group="${groupName}"]`
    );
    if (existingAnnotation) {
      existingAnnotation.remove();
      console.log(`Removed existing annotation for ${groupName} in this viewport`);
    }

    try {
      const enabledElement = getEnabledElement(viewportElement);
      if (!enabledElement) {
        console.warn('No enabled element found for viewport');
        return;
      }

      const viewportId = this.getViewportInfo(viewportElement);
      console.log(`Processing viewport: ${viewportId}`);

      // Navigate viewport to the clicked position
      try {
        const viewport = enabledElement.viewport;
        const point3: [number, number, number] = [
          worldCoords[0],
          worldCoords[1],
          worldCoords[2] || 0,
        ];
        viewport.jumpToWorld(point3);
        console.log(`Navigated ${viewportId} to world coordinates:`, point3);
      } catch (navError) {
        console.warn(`Could not navigate ${viewportId}:`, navError);
      }

      const annotationDiv = this.createAnnotationElement(groupName);

      // Convert world coordinates to screen coordinates for this viewport
      const screenCoords = enabledElement.viewport.worldToCanvas([
        worldCoords[0],
        worldCoords[1],
        worldCoords[2] || 0,
      ]);

      if (screenCoords && screenCoords.length >= 2) {
        // Remove existing annotation for this group if it exists
        const annotationKey = `${groupName}-${viewportId}`;
        const existingAnnotation = this.annotationsRef.get(annotationKey);
        if (existingAnnotation) {
          existingAnnotation.element.remove();
          this.annotationsRef.delete(annotationKey);
          console.log(`Removed existing annotation for ${groupName} in viewport ${viewportId}`);
        }

        annotationDiv.style.left = `${screenCoords[0]}px`;
        annotationDiv.style.top = `${screenCoords[1]}px`;

        // Add the annotation to the viewport
        viewportElement.appendChild(annotationDiv);

        // Store the annotation reference and world coordinates for position updates
        this.annotationsRef.set(annotationKey, {
          element: annotationDiv,
          worldCoords: worldCoords,
          sliceIndex: enabledElement.viewport.getSliceIndex(),
          viewportId: viewportId,
        });

        console.log(
          `Custom annotation created for ${groupName} in viewport ${viewportId} at screen coordinates:`,
          screenCoords
        );
      } else {
        console.warn(
          'Could not convert world coordinates to screen coordinates for viewport:',
          viewportId
        );
      }
    } catch (error) {
      console.error('Error creating annotation in viewport:', error);
    }
  }

  public createAnnotationsForAllViewports(
    groupName: string,
    worldCoords: number[],
    anatomicalName: string,
    commandsManager?: any
  ): void {
    try {
      // Remove all group annotations globally first
      const allViewportElements = document.querySelectorAll('.cornerstone-viewport-element');
      allViewportElements.forEach(viewportElement => {
        viewportElement
          .querySelectorAll(`[data-annotation-group="${groupName}"]`)
          .forEach(el => el.remove());
      });

      let viewportIds: string[] = [];
      if (commandsManager?.services?.viewportGridService) {
        viewportIds = commandsManager.services.viewportGridService.getViewportIds();
      }

      if (viewportIds.length > 0) {
        viewportIds.forEach(viewportId => {
          const viewportElement = document.querySelector(
            `[data-viewport-id="${viewportId}"]`
          ) as HTMLDivElement;
          if (viewportElement) {
            this.createAnnotationInViewport(viewportElement, groupName, worldCoords);
          }
        });
        return;
      }

      // Fallback: DOM
      const viewports = document.querySelectorAll(
        '.cornerstone-viewport-element'
      ) as NodeListOf<HTMLDivElement>;
      viewports.forEach(vp => this.createAnnotationInViewport(vp, groupName, worldCoords));
    } catch (error) {
      console.error('Error creating annotations for all viewports:', error);
    }
  }

  public updateAnnotationPositions(): void {
    const allViewports = document.querySelectorAll(
      '.cornerstone-viewport-element'
    ) as NodeListOf<HTMLDivElement>;

    allViewports.forEach(viewportElement => {
      const enabledElement = getEnabledElement(viewportElement);
      if (!enabledElement) return;

      const viewportId = this.getViewportInfo(viewportElement);

      // Update annotations for this specific viewport
      this.annotationsRef.forEach((annotation, annotationKey) => {
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
                annotation.element.style.display = 'flex';
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
  }

  public getAnnotations(): Map<string, AnnotationData> {
    return this.annotationsRef;
  }
}
