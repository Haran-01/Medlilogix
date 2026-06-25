require('tsx/cjs');

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');
const { USBDetector } = require('./usb/USBDetector.ts');
const { USB_EVENTS, USB_IPC_CHANNELS } = require('./usb/USBEvents.ts');

const rendererUrl = process.env.ELECTRON_RENDERER_URL;
const usbDetector = new USBDetector();

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
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  return mainWindow;
}

app.whenReady().then(() => {
  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app:get-platform', () => process.platform);
  ipcMain.handle(USB_IPC_CHANNELS.GET_STATUS, () => usbDetector.getStatus());

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
});
