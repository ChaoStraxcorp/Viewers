import React, { useState } from 'react';
import { Button } from '@ohif/ui-next';
import CircleROIWithTextTool from '../tools/CircleROIWithText';

interface CircleROIWithTextExampleProps {
  commandsManager: any;
  servicesManager: any;
}

/**
 * Example component demonstrating how to use the CircleROI with Text tool programmatically
 */
function CircleROIWithTextExample({
  commandsManager,
  servicesManager,
}: CircleROIWithTextExampleProps) {
  const [customText, setCustomText] = useState('');
  const [annotationUID, setAnnotationUID] = useState('');

  const handleCreateAnnotation = async () => {
    try {
      // Get the active viewport element
      const viewportElement = document.querySelector('.cornerstone-viewport-element');
      if (!viewportElement) {
        console.warn('No viewport element found');
        return;
      }

      // Create a sample annotation data structure
      const sampleAnnotation = {
        annotationUID: `example_${Date.now()}`,
        metadata: {
          toolName: 'CircleROIWithText',
          label: 'Example Annotation',
        },
        data: {
          handles: {
            points: [
              [100, 100, 0], // center point
              [150, 100, 0], // radius point
            ],
            textBox: {
              hasMoved: false,
              worldPosition: [100, 100, 0],
              worldBoundingBox: {
                topLeft: [90, 90, 0],
                bottomRight: [110, 110, 0],
              },
            },
          },
          cachedStats: {},
        },
      };

      // Create the annotation with custom text
      const createdAnnotation = await commandsManager.run('createCircleROIWithText', {
        element: viewportElement,
        annotation: sampleAnnotation,
        defaultText: customText || 'Example annotation',
        title: 'Create Circle ROI with Text',
        placeholder: 'Enter annotation text',
      });

      if (createdAnnotation) {
        setAnnotationUID(createdAnnotation.annotationUID);
        console.log('Annotation created:', createdAnnotation);
      }
    } catch (error) {
      console.error('Error creating annotation:', error);
    }
  };

  const handleEditAnnotation = async () => {
    if (!annotationUID) {
      console.warn('No annotation UID available');
      return;
    }

    try {
      const currentText = CircleROIWithTextTool.getAnnotationText(annotationUID);
      const newText = await commandsManager.run('editCircleROIText', {
        annotationUID,
        currentText,
        title: 'Edit Annotation Text',
        placeholder: 'Enter new text',
      });

      console.log('Annotation text updated to:', newText);
    } catch (error) {
      console.error('Error editing annotation:', error);
    }
  };

  const handleGetAnnotationText = () => {
    if (!annotationUID) {
      console.warn('No annotation UID available');
      return;
    }

    const text = CircleROIWithTextTool.getAnnotationText(annotationUID);
    console.log('Current annotation text:', text);
  };

  const handleShowTextDialog = async () => {
    try {
      const text = await commandsManager.run('showTextInputDialog', {
        defaultValue: 'Sample text',
        title: 'Enter Text',
        placeholder: 'Enter your text here',
      });

      console.log('Text entered:', text);
      setCustomText(text);
    } catch (error) {
      console.error('Error showing text dialog:', error);
    }
  };

  return (
    <div className="space-y-4 rounded-lg bg-gray-800 p-4">
      <h3 className="mb-4 text-lg font-semibold text-white">CircleROI with Text Tool Example</h3>

      <div className="space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Custom Text:</label>
          <input
            type="text"
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400"
            placeholder="Enter custom text for annotation"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="default"
            onClick={handleCreateAnnotation}
            className="w-full"
          >
            Create Annotation
          </Button>

          <Button
            variant="secondary"
            onClick={handleEditAnnotation}
            disabled={!annotationUID}
            className="w-full"
          >
            Edit Annotation
          </Button>

          <Button
            variant="outline"
            onClick={handleGetAnnotationText}
            disabled={!annotationUID}
            className="w-full"
          >
            Get Text
          </Button>

          <Button
            variant="outline"
            onClick={handleShowTextDialog}
            className="w-full"
          >
            Show Text Dialog
          </Button>
        </div>

        {annotationUID && (
          <div className="mt-4 rounded-md bg-gray-700 p-3">
            <p className="text-sm text-gray-300">
              <strong>Annotation UID:</strong> {annotationUID}
            </p>
          </div>
        )}

        <div className="mt-4 rounded-md bg-blue-900 p-3">
          <h4 className="mb-2 text-sm font-medium text-blue-200">Instructions:</h4>
          <ul className="space-y-1 text-xs text-blue-100">
            <li>• Enter custom text in the input field</li>
            <li>• Click "Create Annotation" to create a circle ROI with text</li>
            <li>• Use "Edit Annotation" to modify existing annotation text</li>
            <li>• "Get Text" retrieves the current text from the annotation</li>
            <li>• "Show Text Dialog" demonstrates the text input dialog</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CircleROIWithTextExample;
