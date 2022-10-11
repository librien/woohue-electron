/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import createHueUser from './utils/createHueUser';
import setLightColor from './utils/setLightColor';
import getAllLights from './utils/getAllLights';
import getLightState from './utils/getLightState';
import setLightState from './utils/setLightState';

const store = new Store();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

// IPC listener
ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = store.get(val);
});
ipcMain.on('electron-store-set', async (event, key, val) => {
  store.set(key, val);
});
ipcMain.on('hue:getBridges', async (event) => {
  const bridges = await require('node-hue-api').discovery.mdnsSearch();
  return bridges.catch((err: Error) => { mainWindow?.webContents.send('hue-error', err); console.error(err); })
});
ipcMain.handle('hue:createUser', async (event, ipAddress) => {
  return createHueUser(ipAddress).catch((err: Error) => { mainWindow?.webContents.send('hue-error', err) })
});
ipcMain.handle('hue:getLights', async (event) => {
  const ipAddress: string = store.get('hueSettings.bridgeIpAddress') as string;
  const username: string = store.get('hueSettings.username') as string;
  return getAllLights(ipAddress, username).catch((err: Error) => { mainWindow?.webContents.send('hue-error', err) })
});
ipcMain.handle('hue:getLightState', async (event, ipAddress, username, light) => {
  return getLightState(ipAddress, username, light)
});
ipcMain.on('hue:setLightColor', async (event, ipAddress, username, light, color) => {
  setLightColor(ipAddress, username, light, color);
});
ipcMain.on('hue:setLightState', async (event, ipAddress, username, light, state) => {
  setLightState(ipAddress, username, light, state);
});
ipcMain.handle('hue:getPassword', async (event, username) => {
  const keytar = require('keytar')
  return keytar.getPassword('woohue', username).catch((err: Error) => { mainWindow?.webContents.send('hue-error', err); console.error(err)})
  // event.returnValue = password;
});

ipcMain.on('error', (event: Electron.IpcMainEvent, val) => {
  event.returnValue = val;
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
