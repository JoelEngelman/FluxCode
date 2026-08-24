const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('flux', {
  get: key => ipcRenderer.invoke('store:get').then(s => s[key]),
  set: (key, value) => ipcRenderer.invoke('store:set', key, value),
  secretSet: (key, value) => ipcRenderer.invoke('secret:set', key, value),
  secretGet: key => ipcRenderer.invoke('secret:get', key),
  openExternal: url => ipcRenderer.invoke('open-external', url),
  info: () => ipcRenderer.invoke('app-info')
});
