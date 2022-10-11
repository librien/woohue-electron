import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { LightState } from 'renderer/types';

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
  store: {
    get(key: string) {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    set(property: string, val: any) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    // Other method you want to add like has(), reset(), etc.
  },
  hueApi: {
    getBridges: () => ipcRenderer.invoke('hue:getBridges'),
    getLights: () => ipcRenderer.invoke('hue:getLights'),
    getLightState: (ipAddress: string, username: string, light: number) => ipcRenderer.invoke('hue:getLightState', ipAddress, username, light),
    setLightColor: (ipAddress: string, username: string, light: number, color: Record<string, unknown>) => ipcRenderer.send('hue:setLightColor', ipAddress, username, light, color),
    setLightState: (ipAddress: string, username: string, light: number, state: LightState) => ipcRenderer.send('hue:setLightState', ipAddress, username, light, state),
    createUser: (ipAddress: string) => ipcRenderer.invoke('hue:createUser', ipAddress),
    onError: (callback: any) => ipcRenderer.on('hue-error', callback),
    getPassword(username: string) {
      return ipcRenderer.invoke('hue:getPassword', username);
    }
  },
});
