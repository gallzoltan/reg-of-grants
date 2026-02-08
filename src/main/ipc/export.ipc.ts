import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as donationsRepo from '../database/donations.repo';
import { exportToCSV } from '../services/csv-export';
import { exportToXLSX } from '../services/xlsx-export';
import type { DonationWithSupporter } from '@shared/types/donation';
import type { ExportResult } from '@shared/types/export';

function fetchDonations(from?: string, to?: string): DonationWithSupporter[] {
  if (from && to) {
    return donationsRepo.findByDateRange(from, to);
  }
  return donationsRepo.findAll();
}

export function registerExportHandlers(): void {
  ipcMain.handle('export:csv', async (_event, opts: { from?: string; to?: string }): Promise<ExportResult | null> => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return null;

    const donations = fetchDonations(opts.from, opts.to);

    const result = await dialog.showSaveDialog(window, {
      title: 'CSV exportálás',
      defaultPath: `tamogatasok_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [
        { name: 'CSV fájlok', extensions: ['csv'] },
        { name: 'Minden fájl', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) return null;

    exportToCSV(donations, result.filePath);
    return { filePath: result.filePath, count: donations.length };
  });

  ipcMain.handle('export:xlsx', async (_event, opts: { from?: string; to?: string }): Promise<ExportResult | null> => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return null;

    const donations = fetchDonations(opts.from, opts.to);

    const result = await dialog.showSaveDialog(window, {
      title: 'XLSX exportálás',
      defaultPath: `tamogatasok_${new Date().toISOString().slice(0, 10)}.xlsx`,
      filters: [
        { name: 'Excel fájlok', extensions: ['xlsx'] },
        { name: 'Minden fájl', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) return null;

    await exportToXLSX(donations, result.filePath);
    return { filePath: result.filePath, count: donations.length };
  });
}
