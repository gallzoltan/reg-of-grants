import { ipcMain, dialog, BrowserWindow } from 'electron';
import { parseTransactionCSV } from '../services/csv-parser';

export function registerImportHandlers(): void {
  ipcMain.handle('import:selectFile', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return null;

    const result = await dialog.showOpenDialog(window, {
      title: 'CSV fájl kiválasztása',
      filters: [
        { name: 'CSV fájlok', extensions: ['csv'] },
        { name: 'Minden fájl', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle('import:parseCSV', (_event, filePath: string) => {
    return parseTransactionCSV(filePath);
  });
}
