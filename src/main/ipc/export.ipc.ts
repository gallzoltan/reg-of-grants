import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as donationsRepo from '../database/donations.repo';
import { exportToCSV } from '../services/csv-export';
import { exportToXLSX } from '../services/xlsx-export';
import type { DonationWithSupporter } from '@shared/types/donation';
import type { ExportResult } from '@shared/types/export';

interface ExportOptions {
  from?: string;
  to?: string;
  supporterId?: number;
}

function fetchDonations(opts: ExportOptions): DonationWithSupporter[] {
  let donations: DonationWithSupporter[];
  if (opts.from && opts.to) {
    donations = donationsRepo.findByDateRange(opts.from, opts.to);
  } else {
    donations = donationsRepo.findAll();
  }
  if (opts.supporterId) {
    donations = donations.filter((d) => d.supporter_id === opts.supporterId);
  }
  return donations;
}

export function registerExportHandlers(): void {
  ipcMain.handle('export:csv', async (_event, opts: ExportOptions): Promise<ExportResult | null> => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return null;

    const donations = fetchDonations(opts);

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

  ipcMain.handle('export:xlsx', async (_event, opts: ExportOptions): Promise<ExportResult | null> => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return null;

    const donations = fetchDonations(opts);

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
