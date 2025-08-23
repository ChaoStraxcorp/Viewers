import { callInputDialog } from '@ohif/extension-default';

/**
 * Shows a text input dialog for annotation text
 * @param uiDialogService - The UI dialog service
 * @param defaultValue - Default text value
 * @param title - Dialog title
 * @param placeholder - Input placeholder text
 * @returns Promise that resolves to the entered text
 */
export async function showTextInputDialog({
  uiDialogService,
  defaultValue = '',
  title = 'Enter Annotation Text',
  placeholder = 'Enter text for annotation',
}: {
  uiDialogService: any;
  defaultValue?: string;
  title?: string;
  placeholder?: string;
}): Promise<string> {
  try {
    const text = await callInputDialog({
      uiDialogService,
      defaultValue,
      title,
      placeholder,
      submitOnEnter: true,
    });

    return text;
  } catch (error) {
    console.error('Error showing text input dialog:', error);
    return defaultValue;
  }
}

/**
 * Shows a text input dialog for editing existing annotation text
 * @param uiDialogService - The UI dialog service
 * @param currentText - Current annotation text
 * @param title - Dialog title
 * @param placeholder - Input placeholder text
 * @returns Promise that resolves to the new text
 */
export async function showEditTextDialog({
  uiDialogService,
  currentText = '',
  title = 'Edit Annotation Text',
  placeholder = 'Enter new text for annotation',
}: {
  uiDialogService: any;
  currentText?: string;
  title?: string;
  placeholder?: string;
}): Promise<string> {
  return showTextInputDialog({
    uiDialogService,
    defaultValue: currentText,
    title,
    placeholder,
  });
}
