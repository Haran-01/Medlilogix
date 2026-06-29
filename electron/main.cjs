const path = require('node:path');
const { createRequire } = require('node:module');

const appRoot = path.join(__dirname, '..');
const frontendRoot = path.join(appRoot, 'frontend');
const backendRoot = path.join(appRoot, 'backend');
const frontendRequire = createRequire(path.join(frontendRoot, 'package.json'));

frontendRequire('tsx/cjs');

const { app, BrowserWindow, ipcMain, shell } = frontendRequire('electron');
const { ImportQueue } = require('../backend/src/parser/ImportQueue.ts');
const { MedilogixApiServer } = require('../backend/src/server/ApiServer.ts');
const { loadEnvFile } = require('../backend/src/server/Env.ts');
const { USBDetector } = require('./usb/USBDetector.ts');
const { USB_EVENTS, USB_IPC_CHANNELS } = require('./usb/USBEvents.ts');

const rendererUrl = process.env.ELECTRON_RENDERER_URL;
const usbDetector = new USBDetector();
const importQueue = new ImportQueue();
let apiServer;

function broadcastToRenderer(channel, payload) {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) {
      window.webContents.send(channel, payload);
    }
  });
}

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    minHeight: 720,
    minWidth: 1180,
    show: false,
    title: 'MediLogiX',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (rendererUrl) {
    mainWindow.loadURL(rendererUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(frontendRoot, 'dist', 'index.html'));
  }

  return mainWindow;
}

app.whenReady().then(async () => {
  loadEnvFile(path.join(frontendRoot, '.env'));
  loadEnvFile(path.join(backendRoot, '.env'));
  apiServer = new MedilogixApiServer();
  await apiServer.start();

  ipcMain.handle('api:get-base-url', () => apiServer.getBaseUrl());
  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app:get-platform', () => process.platform);
  ipcMain.handle(USB_IPC_CHANNELS.GET_STATUS, () => usbDetector.getStatus());
  ipcMain.handle(USB_IPC_CHANNELS.IMPORT_TXT_FILES, async () => {
    const status = usbDetector.getStatus();

    if (!status.device?.driveLetter) {
      return {
        errors: [{ fileName: 'USB Device', message: 'No removable USB drive connected' }],
        records: [],
        txtFilesFound: 0,
      };
    }

    return importQueue.importFromDrive(status.device.driveLetter);
  });

  usbDetector.on(USB_EVENTS.CONNECTED, (device) => {
    broadcastToRenderer(USB_EVENTS.CONNECTED, device);
  });

  usbDetector.on(USB_EVENTS.DISCONNECTED, (device) => {
    broadcastToRenderer(USB_EVENTS.DISCONNECTED, device);
  });

  usbDetector.on(USB_EVENTS.STATUS, (status) => {
    broadcastToRenderer(USB_EVENTS.STATUS, status);
  });

  usbDetector.start();

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  usbDetector.stop();
  void apiServer?.stop();
});
