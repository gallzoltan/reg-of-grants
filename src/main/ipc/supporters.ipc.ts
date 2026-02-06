import { ipcMain } from 'electron';
import * as supportersRepo from '../database/supporters.repo';

export function registerSupporterHandlers(): void {
  ipcMain.handle('supporters:create', (_event, input) => {
    return supportersRepo.create(input);
  });

  ipcMain.handle('supporters:get', (_event, id: number) => {
    return supportersRepo.findById(id);
  });

  ipcMain.handle('supporters:list', () => {
    return supportersRepo.findAll();
  });

  ipcMain.handle('supporters:update', (_event, input) => {
    return supportersRepo.update(input);
  });

  ipcMain.handle('supporters:delete', (_event, id: number) => {
    return supportersRepo.remove(id);
  });

  ipcMain.handle('supporters:addEmail', (_event, input) => {
    return supportersRepo.addEmail(input.supporter_id, input.email, input.is_primary);
  });

  ipcMain.handle('supporters:removeEmail', (_event, id: number) => {
    return supportersRepo.removeEmail(id);
  });

  ipcMain.handle('supporters:addPhone', (_event, input) => {
    return supportersRepo.addPhone(input.supporter_id, input.phone, input.is_primary);
  });

  ipcMain.handle('supporters:removePhone', (_event, id: number) => {
    return supportersRepo.removePhone(id);
  });
}
