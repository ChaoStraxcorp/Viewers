import { CircleROITool } from '@cornerstonejs/tools';
import { getEnabledElement } from '@cornerstonejs/core';
import { annotation } from '@cornerstonejs/tools';

/**
 * Custom CircleROI tool that allows users to specify annotation text
 * Extends the standard CircleROI tool with text annotation capabilities
 * Disables statistics calculation to show only the anatomical name
 */
class CircleROIWithTextTool extends CircleROITool {
  static toolName = 'CircleROIWithText';

  constructor(toolProps = {}, defaultToolProps = {}) {
    super(toolProps, defaultToolProps);
  }

  /**
   * Creates a circle ROI annotation with custom text
   * @param evt - The cornerstone event
   * @param annotation - The annotation data
   * @param customText - The custom text to display
   */
  static createAnnotation(evt, annotation, customText = '') {
    const { element } = evt.detail;
    const enabledElement = getEnabledElement(element);

    if (!enabledElement) {
      console.warn('No enabled element found');
      return;
    }

    // Create a proper CircleROI annotation with custom text
    const circleAnnotation = {
      annotationUID: annotation.annotationUID,
      highlighted: false,
      isLocked: false,
      invalidated: false,
      metadata: {
        toolName: 'CircleROIWithText',
        label: annotation.metadata?.label || 'Circle ROI',
        FrameOfReferenceUID: enabledElement.viewport.getFrameOfReferenceUID(),
        referencedImageId: enabledElement.viewport.getCurrentImageId(),
      },
      data: {
        handles: annotation.data.handles,
        label: annotation.metadata?.label || 'Circle ROI',
        text: customText || annotation.metadata?.label || 'Circle ROI', // Use custom text
        cachedStats: {}, // Empty stats to prevent measurement display
      },
    };

    // Add the annotation using the annotation manager
    const annotationManager = annotation.state.getAnnotationManager();
    annotationManager.addAnnotation(circleAnnotation);

    // Trigger a re-render
    enabledElement.viewport.render();

    return circleAnnotation;
  }

  /**
   * Updates the text of an existing annotation
   * @param annotationUID - The annotation UID to update
   * @param newText - The new text to set
   */
  static updateAnnotationText(annotationUID, newText) {
    const annotationManager = annotation.state.getAnnotationManager();
    const existingAnnotation = annotationManager.getAnnotation(annotationUID);

    if (existingAnnotation) {
      existingAnnotation.data.text = newText;
      existingAnnotation.data.cachedStats = {}; // Clear stats
      existingAnnotation.invalidated = true;

      // Trigger a re-render
      const element = document.querySelector('.cornerstone-viewport-element') as HTMLDivElement;
      if (element) {
        const enabledElement = getEnabledElement(element);
        if (enabledElement) {
          enabledElement.viewport.render();
        }
      }
    }
  }

  /**
   * Gets the text from an annotation
   * @param annotationUID - The annotation UID
   * @returns The text of the annotation
   */
  static getAnnotationText(annotationUID) {
    const annotationManager = annotation.state.getAnnotationManager();
    const existingAnnotation = annotationManager.getAnnotation(annotationUID);

    return existingAnnotation?.data?.text || '';
  }
}

export default CircleROIWithTextTool;
