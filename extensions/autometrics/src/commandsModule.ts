import { CommandsManager, ExtensionManager } from '@ohif/core';
import { showTextInputDialog, showEditTextDialog } from './utils/textInputDialog';
import CircleROIWithTextTool from './tools/CircleROIWithText';

export default function getCommandsModule({
  servicesManager,
  commandsManager,
  extensionManager,
}: {
  servicesManager: AppTypes.ServicesManager;
  commandsManager: CommandsManager;
  extensionManager: ExtensionManager;
}) {
  const { uiDialogService, viewportGridService } = servicesManager.services;

  const actions = {
    /**
     * Creates a circle ROI annotation with custom text
     */
    createCircleROIWithText: async ({
      element,
      annotation,
      defaultText = '',
      title = 'Enter Annotation Text',
      placeholder = 'Enter text for annotation',
    }) => {
      try {
        // Show text input dialog
        const customText = await showTextInputDialog({
          uiDialogService,
          defaultValue: defaultText,
          title,
          placeholder,
        });

        // Create the annotation with custom text
        const createdAnnotation = CircleROIWithTextTool.createAnnotation(
          { detail: { element } },
          annotation,
          customText
        );

        return createdAnnotation;
      } catch (error) {
        console.error('Error creating circle ROI with text:', error);
        throw error;
      }
    },

    /**
     * Edits the text of an existing circle ROI annotation
     */
    editCircleROIText: async ({
      annotationUID,
      currentText = '',
      title = 'Edit Annotation Text',
      placeholder = 'Enter new text for annotation',
    }) => {
      try {
        // Show edit text dialog
        const newText = await showEditTextDialog({
          uiDialogService,
          currentText,
          title,
          placeholder,
        });

        // Update the annotation text
        CircleROIWithTextTool.updateAnnotationText(annotationUID, newText);

        return newText;
      } catch (error) {
        console.error('Error editing circle ROI text:', error);
        throw error;
      }
    },

    /**
     * Gets the text from a circle ROI annotation
     */
    getCircleROIText: ({ annotationUID }) => {
      try {
        return CircleROIWithTextTool.getAnnotationText(annotationUID);
      } catch (error) {
        console.error('Error getting circle ROI text:', error);
        return '';
      }
    },

    /**
     * Shows a text input dialog for annotation text (generic)
     */
    showTextInputDialog: async ({
      defaultValue = '',
      title = 'Enter Text',
      placeholder = 'Enter text',
    }) => {
      try {
        return await showTextInputDialog({
          uiDialogService,
          defaultValue,
          title,
          placeholder,
        });
      } catch (error) {
        console.error('Error showing text input dialog:', error);
        return defaultValue;
      }
    },
  };

  const definitions = {
    createCircleROIWithText: {
      commandFn: actions.createCircleROIWithText,
      storeContexts: [],
      options: {},
    },
    editCircleROIText: {
      commandFn: actions.editCircleROIText,
      storeContexts: [],
      options: {},
    },
    getCircleROIText: {
      commandFn: actions.getCircleROIText,
      storeContexts: [],
      options: {},
    },
    showTextInputDialog: {
      commandFn: actions.showTextInputDialog,
      storeContexts: [],
      options: {},
    },
  };

  return {
    actions,
    definitions,
    defaultContext: 'AUTOMETRICS',
  };
}
