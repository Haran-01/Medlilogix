const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('medilogix', {
  app: {
    getPlatform: () => ipcRenderer.invoke('app:get-platform'),
    getVersion: () => ipcRenderer.invoke('app:get-version'),
  },
});
