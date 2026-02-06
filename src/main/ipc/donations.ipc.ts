import { ipcMain } from 'electron';
import * as donationsRepo from '../database/donations.repo';

export function registerDonationHandlers(): void {
  ipcMain.handle('donations:create', (_event, input) => {
    return donationsRepo.create(input);
  });

  ipcMain.handle('donations:get', (_event, id: number) => {
    return donationsRepo.findById(id);
  });

  ipcMain.handle('donations:list', () => {
    return donationsRepo.findAll();
  });

  ipcMain.handle('donations:update', (_event, input) => {
    return donationsRepo.update(input);
  });

  ipcMain.handle('donations:delete', (_event, id: number) => {
    return donationsRepo.remove(id);
  });

  ipcMain.handle('donations:bySupporter', (_event, supporterId: number) => {
    return donationsRepo.findBySupporterId(supporterId);
  });

  ipcMain.handle('donations:byDateRange', (_event, input) => {
    return donationsRepo.findByDateRange(input.from, input.to);
  });
}
