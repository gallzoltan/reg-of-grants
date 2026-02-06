import { contextBridge, ipcRenderer } from 'electron';
import type { IpcChannelMap, IpcChannel } from '../shared/types/ipc-channels';

const electronAPI = {
  invoke<C extends IpcChannel>(
    channel: C,
    ...args: IpcChannelMap[C]['input'] extends void ? [] : [IpcChannelMap[C]['input']]
  ): Promise<IpcChannelMap[C]['output']> {
    return ipcRenderer.invoke(channel, ...args);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
