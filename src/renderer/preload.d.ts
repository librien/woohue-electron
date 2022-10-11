import { Channels } from 'main/preload';
import { XyBri } from 'main/utils/colorConverter';
import { HueBridge, HueLight, LightState } from './types';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
      store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
        // any other methods you've defined...
      };
      hueApi: {
        setLightColor(bridgeIpAddress: string, username: string, light: number, arg3: XyBri): any;
        getBridges: () => HueBridge[];
        getLights: () => HueLight[];
        getLightState: (bridgeIpAddress: string, username: string, light: number) => any;
        setLightState: (bridgeIpAddress: string, username: string, light: number, state: LightState) => any;
        createUser: (ipAddress: string) => any;
        onError: (callback: any) => any;
      };
    };
  }
}

export {};
